// app/api/subscription/create/route.js
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Plan from '@/models/Plan';
import Subscription from '@/models/Subscription';
import Coupon from '@/models/Coupon';
import ReferralSignup from '@/models/ReferralSignup';
import { createSubscription, createOrder } from '@/lib/razorpay';
import { isTrialEligible, createTrialSubscription } from '@/lib/subscription';

export async function POST(request) {
    try {
        // Authenticate user
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const { planId, startTrial = true, couponCode } = await request.json();

        if (!planId) {
            return NextResponse.json(
                { error: 'Plan ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Get plan details
        const plan = await Plan.findOne({ planId });
        if (!plan || !plan.isActive) {
            return NextResponse.json(
                { error: 'Invalid or inactive plan' },
                { status: 400 }
            );
        }

        // Check trial eligibility
        const trialEligible = await isTrialEligible(userId);

        const userEmail = user.emailAddresses[0]?.emailAddress || '';
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${userId}`;
        const username = user.username || userEmail.split('@')[0] || userName;

        // If user wants trial and is eligible, create trial subscription
        if (startTrial && trialEligible) {
            const trialSubscription = await createTrialSubscription(userId, planId, username);

            return NextResponse.json({
                success: true,
                isTrial: true,
                subscription: {
                    id: trialSubscription._id,
                    status: trialSubscription.status,
                    planType: trialSubscription.planType,
                    trialEndDate: trialSubscription.trialEndDate,
                    daysRemaining: trialSubscription.daysRemaining()
                },
                message: 'Trial subscription activated successfully'
            });
        }

        // Check if user already has active subscription (ignore 'created' status - payment not completed)
        /* ALLOW NEW SUBSCRIPTION CREATION FOR UPGRADES
        const existingSubscription = await Subscription.findOne({
            userId,
            status: { $in: ['trial', 'active'] }
        });

        if (existingSubscription) {
            return NextResponse.json(
                { error: 'User already has an active subscription' },
                { status: 400 }
            );
        }
        */

        // Clean up any abandoned 'created' subscriptions (older than 1 hour)
        await Subscription.deleteMany({
            userId,
            status: 'created',
            createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) }
        });

        // Check if user has an existing trial subscription to upgrade
        const existingTrial = await Subscription.findOne({
            userId,
            status: 'trial',
            isTrialActive: true
        });

        // Match total count calculation
        // Monthly (1): 120 counts
        // 6 Months (6): 20 counts
        // Yearly (12): 10 counts
        const totalCount = Math.floor(120 / (plan.billingPeriod || 1));

        // Check if user is a referral user for the 10% discount
        const referralRecord = await ReferralSignup.findOne({ userId, status: 'RECORDED' }).lean();
        const isReferralUser = !!referralRecord;

        let finalAmount = plan.amount;
        
        // Apply 10% referral discount
        if (isReferralUser) {
            finalAmount = Math.floor(finalAmount * 0.9);
        }

        let appliedCoupon = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon && coupon.isActive) {
                const now = new Date();
                const isValidDate = (!coupon.validFrom || new Date(coupon.validFrom) <= now) &&
                                    (!coupon.validUntil || new Date(coupon.validUntil) >= now);
                const isUnderUsage = coupon.maxUses === 0 || coupon.usedCount < coupon.maxUses;
                const isApplicablePlan = !coupon.applicablePlanId || coupon.applicablePlanId === planId;
                const isValidMinAmount = coupon.minPurchaseAmount === 0 || finalAmount >= coupon.minPurchaseAmount;

                if (isValidDate && isUnderUsage && isApplicablePlan && isValidMinAmount) {
                    let discountAmount = Math.floor((finalAmount * coupon.discountPercent) / 100);
                    if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
                        discountAmount = coupon.maxDiscountAmount;
                    }
                    finalAmount = Math.max(0, finalAmount - discountAmount);
                    appliedCoupon = coupon;
                }
            }
            if (!appliedCoupon) {
                return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 400 });
            }
        }

        let razorpaySubscription = null;
        let razorpayOrder = null;

        if (appliedCoupon || isReferralUser || planId === '1_MONTH') {
            // For 1 month plan, when a coupon is applied, or user has referral discount, use a one-time order
            razorpayOrder = await createOrder({
                amount: finalAmount,
                currency: 'INR',
                receipt: `rcpt_${userId.slice(-10)}_${Date.now()}`.slice(0, 40),
                notes: {
                    userId,
                    planType: planId,
                    userEmail,
                    userName: userName,
                    username: username,
                    couponApplied: appliedCoupon ? appliedCoupon.code : ''
                }
            });
        } else {
            // Create standard Razorpay subscription
            razorpaySubscription = await createSubscription({
                planId: plan.razorpayPlanId,
                totalCount: totalCount,
                startTrial: false, // Start immediately without Razorpay trial
                notes: {
                    userId,
                    planType: planId,
                    createdAt: new Date().toISOString(),
                    userEmail,
                    userName: userName,
                    username: username
                }
            });
        }

        // Calculate period dates
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + plan.billingPeriod);

        let subscription;

        if (existingTrial) {
            // UPDATE existing trial record
            if (razorpayOrder) {
                existingTrial.razorpayOrderId = razorpayOrder.id;
                existingTrial.razorpaySubscriptionId = undefined; // clear out if it was a subscription
                existingTrial.isRecurring = false;
                existingTrial.paymentType = 'onetime';
            } else {
                existingTrial.razorpaySubscriptionId = razorpaySubscription.id;
                existingTrial.isRecurring = true;
                existingTrial.paymentType = 'subscription';
            }

            existingTrial.razorpayPlanId = plan.razorpayPlanId;
            existingTrial.planType = planId;
            existingTrial.planAmount = finalAmount;
            existingTrial.billingCycle = plan.billingCycle;
            existingTrial.status = 'created'; // Will be activated by webhook
            existingTrial.isTrialActive = false;
            existingTrial.startDate = currentPeriodStart;
            existingTrial.currentPeriodStart = currentPeriodStart;
            existingTrial.currentPeriodEnd = currentPeriodEnd;
            existingTrial.billingPeriod = plan.billingPeriod;
            existingTrial.bonusMonths = plan.bonusMonths;
            existingTrial.totalMonths = plan.totalMonths;
            existingTrial.autoPayEnabled = !appliedCoupon; // Disable autopay for orders

            await existingTrial.save();
            subscription = existingTrial;
        } else {
            // No existing trial, create new subscription record
            const subscriptionData = {
                userId,
                username,
                userEmail: userEmail?.toLowerCase(),
                razorpayPlanId: plan.razorpayPlanId,
                planType: planId,
                planAmount: finalAmount,
                billingCycle: plan.billingCycle,
                status: 'created', // Start as 'created', webhook will activate
                isTrialActive: false,
                isTrialUsed: !trialEligible,
                startDate: currentPeriodStart,
                currentPeriodStart,
                currentPeriodEnd,
                billingPeriod: plan.billingPeriod,
                bonusMonths: plan.bonusMonths,
                totalMonths: plan.totalMonths,
                autoPayEnabled: !appliedCoupon
            };

            if (razorpayOrder) {
                subscriptionData.razorpayOrderId = razorpayOrder.id;
                subscriptionData.isRecurring = false;
                subscriptionData.paymentType = 'onetime';
            } else {
                subscriptionData.razorpaySubscriptionId = razorpaySubscription.id;
                subscriptionData.isRecurring = true;
                subscriptionData.paymentType = 'subscription';
            }

            subscription = await Subscription.create(subscriptionData);
        }

        if (appliedCoupon) {
            await Coupon.updateOne({ _id: appliedCoupon._id }, { $inc: { usedCount: 1 } });
        }

        return NextResponse.json({
            success: true,
            isTrial: false,
            subscription: {
                id: subscription._id,
                razorpaySubscriptionId: razorpaySubscription?.id,
                razorpayOrderId: razorpayOrder?.id,
                status: subscription.status,
                planType: subscription.planType,
                planAmount: subscription.planAmount,
                shortUrl: razorpaySubscription?.short_url, // Payment link
                currentPeriodEnd: subscription.currentPeriodEnd
            },
            message: 'Subscription created successfully'
        });

    } catch (error) {
        console.error('Error creating subscription:', error?.message || error, error?.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to create subscription', details: process.env.NODE_ENV === 'development' ? error?.stack : undefined },
            { status: 500 }
        );
    }
}

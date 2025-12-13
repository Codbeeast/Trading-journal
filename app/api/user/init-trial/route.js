import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isTrialEligible } from '@/lib/subscription';
import { getRazorpayInstance } from '@/lib/razorpay';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import Plan from '@/models/Plan';

/**
 * Create Razorpay subscription with trial for new users
 * Returns subscription details for Razorpay modal
 */
export async function POST(request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body to get planId
        const body = await request.json().catch(() => ({}));
        const planId = body.planId || '1_MONTH';

        await connectDB();

        // Check if user already has an active subscription
        const existingActive = await Subscription.findOne({
            userId,
            status: { $in: ['trial', 'active'] }
        });

        if (existingActive) {
            return NextResponse.json({
                success: false,
                message: 'You already have an active subscription'
            });
        }

        // Check if user is eligible for trial (first time user)
        const eligible = await isTrialEligible(userId);

        // Check if user has an expired/cancelled subscription (returning user)
        const hasExpiredSubscription = await Subscription.findOne({
            userId,
            status: { $in: ['expired', 'cancelled'] }
        });

        // If not trial eligible and no expired subscription, something is wrong
        if (!eligible && !hasExpiredSubscription) {
            // Check if there's a 'created' subscription that was abandoned
            const abandonedSub = await Subscription.findOne({
                userId,
                status: 'created'
            });

            if (abandonedSub) {
                // Delete the abandoned subscription to allow fresh start
                await Subscription.deleteOne({ _id: abandonedSub._id });
                console.log('Deleted abandoned subscription:', abandonedSub._id);
            }
        }

        // Allow subscription creation for both new users (trial) and returning users (no trial)

        // Get plan details from database
        const plan = await Plan.findOne({ planId });
        if (!plan || !plan.isActive) {
            return NextResponse.json(
                { error: 'Invalid or inactive plan' },
                { status: 400 }
            );
        }

        // Get Razorpay plan ID from environment
        const razorpayPlanIdMap = {
            '1_MONTH': process.env.RAZORPAY_PLAN_1_MONTH,
            '6_MONTHS': process.env.RAZORPAY_PLAN_6_MONTHS,
            '12_MONTHS': process.env.RAZORPAY_PLAN_12_MONTHS
        };

        const razorpayPlanId = razorpayPlanIdMap[planId];

        if (!razorpayPlanId) {
            return NextResponse.json(
                {
                    error: 'Razorpay plan not configured',
                    message: `Please add ${planId} plan ID to .env.local`
                },
                { status: 500 }
            );
        }

        // Extract user details
        const userEmail = user.emailAddresses[0]?.emailAddress || '';
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${userId}`;
        const username = user.username || userEmail.split('@')[0] || userName;

        // Create Razorpay subscription
        const razorpay = getRazorpayInstance();

        const subscriptionData = {
            plan_id: razorpayPlanId,
            total_count: 1, // Single billing cycle
            customer_notify: 1,
            notes: {
                userId,
                planType: planId,
                userEmail,
                userName,
                username,
                createdAt: new Date().toISOString(),
                isReturningUser: !eligible
            }
        };

        const razorpaySubscription = await razorpay.subscriptions.create(subscriptionData);

        // Calculate period end based on plan
        const periodStart = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + plan.billingPeriod);

        // Create subscription record in database with 'created' status
        const subscription = await Subscription.create({
            userId,
            username,
            razorpaySubscriptionId: razorpaySubscription.id,
            razorpayPlanId,
            planType: planId,
            planAmount: plan.amount,
            billingCycle: plan.billingCycle,
            billingPeriod: plan.billingPeriod,
            bonusMonths: plan.bonusMonths || 0,
            totalMonths: plan.totalMonths || plan.billingPeriod,
            status: 'created',
            isTrialActive: false,
            isTrialUsed: true, // Mark as used
            autoPayEnabled: true,
            startDate: periodStart,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd
        });

        // Return subscription details for Razorpay modal
        const message = eligible
            ? 'Please complete card authorization to start your 7-day trial'
            : 'Please complete payment to activate your subscription';

        return NextResponse.json({
            success: true,
            isReturningUser: !eligible,
            subscription: {
                id: subscription._id,
                razorpaySubscriptionId: razorpaySubscription.id,
                shortUrl: razorpaySubscription.short_url,
                status: razorpaySubscription.status,
                planType: planId
            },
            message
        });

    } catch (error) {
        console.error('Trial initialization error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to initialize trial',
                message: error.message || 'An unexpected error occurred',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

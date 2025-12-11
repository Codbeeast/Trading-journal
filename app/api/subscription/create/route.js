// app/api/subscription/create/route.js
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Plan from '@/models/Plan';
import Subscription from '@/models/Subscription';
import { createSubscription } from '@/lib/razorpay';
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
        const { planId, startTrial = true } = await request.json();

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

        // If user wants trial and is eligible, create trial subscription
        if (startTrial && trialEligible) {
            const trialSubscription = await createTrialSubscription(userId, planId);

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

        // Check if user already has active subscription
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

        const userEmail = user.emailAddresses[0]?.emailAddress || '';
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${userId}`;

        // Create Razorpay subscription
        const razorpaySubscription = await createSubscription({
            planId: plan.razorpayPlanId,
            totalCount: 0, // Unlimited billing cycles
            customer: {
                name: userName,
                email: userEmail,
                contact: ''
            },
            startTrial: false, // Start immediately without Razorpay trial
            notes: {
                userId,
                planType: planId,
                createdAt: new Date().toISOString(),
                userEmail,
                userName: userName
            }
        });

        // Calculate period dates
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + plan.totalMonths);

        // Create subscription record in database
        const subscription = await Subscription.create({
            userId,
            razorpaySubscriptionId: razorpaySubscription.id,
            razorpayPlanId: plan.razorpayPlanId,
            planType: planId,
            planAmount: plan.amount,
            billingCycle: plan.billingCycle,
            status: 'active',
            isTrialActive: false,
            isTrialUsed: !trialEligible, // Mark as used if trial was already used
            startDate: currentPeriodStart,
            currentPeriodStart,
            currentPeriodEnd,
            autoPayEnabled: true
        });

        return NextResponse.json({
            success: true,
            isTrial: false,
            subscription: {
                id: subscription._id,
                razorpaySubscriptionId: razorpaySubscription.id,
                status: subscription.status,
                planType: subscription.planType,
                planAmount: subscription.planAmount,
                shortUrl: razorpaySubscription.short_url, // Payment link
                currentPeriodEnd: subscription.currentPeriodEnd
            },
            message: 'Subscription created successfully'
        });

    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create subscription' },
            { status: 500 }
        );
    }
}

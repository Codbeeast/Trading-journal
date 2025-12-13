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

        // Check if user is eligible for trial
        const eligible = await isTrialEligible(userId);

        if (!eligible) {
            return NextResponse.json({
                success: false,
                message: 'Trial already used or subscription exists'
            });
        }

        await connectDB();

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

        // Create Razorpay subscription with 7-day trial
        const razorpay = getRazorpayInstance();

        const subscriptionData = {
            plan_id: razorpayPlanId,
            total_count: 1, // Single charge after trial
            customer_notify: 1,
            notes: {
                userId,
                planType: planId,
                userEmail,
                userName,
                username,
                createdAt: new Date().toISOString()
            }
        };

        const razorpaySubscription = await razorpay.subscriptions.create(subscriptionData);

        // Create subscription record in database with 'created' status
        // Will be activated to 'trial' by webhook when card is authorized
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
            status: 'created', // Webhook will change to 'trial'
            isTrialActive: false, // Will be set to true by webhook
            isTrialUsed: true, // Mark as used immediately
            autoPayEnabled: true, // Will auto-charge after trial
            startDate: new Date(),
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date() // Placeholder, updated on activation
        });

        // Return subscription details for Razorpay modal
        return NextResponse.json({
            success: true,
            subscription: {
                id: subscription._id,
                razorpaySubscriptionId: razorpaySubscription.id,
                shortUrl: razorpaySubscription.short_url,
                status: razorpaySubscription.status,
                planType: planId
            },
            message: 'Please complete card authorization to start your 7-day trial'
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

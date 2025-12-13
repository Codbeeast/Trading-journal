// app/api/subscription/end-trial/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import Plan from '@/models/Plan';

export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // Find active trial subscription
        const subscription = await Subscription.findOne({
            userId,
            status: 'trial',
            isTrialActive: true
        });

        if (!subscription) {
            return NextResponse.json(
                { error: 'No active trial found' },
                { status: 404 }
            );
        }

        // Get plan details for billing period calculation
        const plan = await Plan.findOne({ planId: subscription.planType });
        if (!plan) {
            return NextResponse.json(
                { error: 'Plan not found' },
                { status: 404 }
            );
        }

        // Calculate new subscription period (starting now)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (plan.billingPeriod || subscription.billingPeriod));

        // Update subscription to active
        subscription.isTrialActive = false;
        subscription.status = 'active';
        subscription.currentPeriodStart = startDate;
        subscription.currentPeriodEnd = endDate;
        subscription.startDate = startDate;
        subscription.trialEndedEarly = true;
        subscription.trialEndedAt = startDate;

        await subscription.save();

        return NextResponse.json({
            success: true,
            message: 'Trial ended successfully. Your subscription is now active.',
            subscription: {
                id: subscription._id,
                status: subscription.status,
                currentPeriodStart: subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd
            }
        });

    } catch (error) {
        console.error('Error ending trial:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to end trial' },
            { status: 500 }
        );
    }
}

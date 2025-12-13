// app/api/subscription/upgrade/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Plan from '@/models/Plan';
import Subscription from '@/models/Subscription';
import { cancelSubscription as cancelRazorpaySubscription, createSubscription } from '@/lib/razorpay';

export async function POST(request) {
    try {
        // Authenticate user
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const { newPlanId } = await request.json();

        if (!newPlanId) {
            return NextResponse.json(
                { error: 'New plan ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Get new plan details
        const newPlan = await Plan.findOne({ planId: newPlanId });
        if (!newPlan || !newPlan.isActive) {
            return NextResponse.json(
                { error: 'Invalid or inactive plan' },
                { status: 400 }
            );
        }

        // Find current active subscription
        const currentSubscription = await Subscription.findOne({
            userId,
            status: { $in: ['trial', 'active'] }
        });

        if (!currentSubscription) {
            return NextResponse.json(
                { error: 'No active subscription found to upgrade' },
                { status: 404 }
            );
        }

        // Check if user is trying to switch to same plan
        if (currentSubscription.planType === newPlanId) {
            return NextResponse.json(
                { error: 'User is already on this plan' },
                { status: 400 }
            );
        }

        // Cancel current Razorpay subscription if exists
        if (currentSubscription.razorpaySubscriptionId) {
            try {
                await cancelRazorpaySubscription(
                    currentSubscription.razorpaySubscriptionId,
                    false // Cancel immediately
                );
            } catch (error) {
                console.error('Error cancelling old subscription:', error);
                // Continue even if cancellation fails
            }
        }

        // Mark current subscription as cancelled
        currentSubscription.status = 'cancelled';
        currentSubscription.cancelledAt = new Date();
        currentSubscription.cancelReason = `Upgraded to ${newPlanId}`;
        await currentSubscription.save();

        // Create new Razorpay subscription
        const razorpaySubscription = await createSubscription({
            planId: newPlan.razorpayPlanId,
            totalCount: 0,
            customer: {
                name: `User ${userId}`,
                email: '',
                contact: ''
            },
            startTrial: false,
            notes: {
                userId,
                planType: newPlanId,
                upgradedFrom: currentSubscription.planType,
                createdAt: new Date().toISOString()
            }
        });

        // Calculate period dates
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + newPlan.billingPeriod);

        // Create new subscription record
        // Update existing subscription record instad of creating new one
        currentSubscription.razorpaySubscriptionId = razorpaySubscription.id;
        currentSubscription.razorpayPlanId = newPlan.razorpayPlanId;
        currentSubscription.planType = newPlanId;
        currentSubscription.planAmount = newPlan.amount;
        currentSubscription.billingCycle = newPlan.billingCycle;
        currentSubscription.status = 'active'; // Assume active immediately for upgrade
        currentSubscription.isTrialActive = false;
        // isTrialUsed remains as is
        currentSubscription.startDate = currentPeriodStart; // Reset start date for new plan? Or keep original? Usually reset for new sub ID.
        currentSubscription.currentPeriodStart = currentPeriodStart;
        currentSubscription.currentPeriodEnd = currentPeriodEnd;
        currentSubscription.autoPayEnabled = true;
        // paymentMethod remains as is

        // Clear cancellation fields if any
        currentSubscription.cancelledAt = null;
        currentSubscription.cancelReason = null;

        // Clear one-time fields if switching from one-time
        currentSubscription.razorpayOrderId = null;
        currentSubscription.paymentType = 'subscription';
        currentSubscription.isRecurring = true;

        await currentSubscription.save();

        // Use the updated document as the new subscription
        const newSubscription = currentSubscription;

        return NextResponse.json({
            success: true,
            oldSubscription: {
                id: currentSubscription._id,
                planType: currentSubscription.planType,
                status: currentSubscription.status
            },
            newSubscription: {
                id: newSubscription._id,
                razorpaySubscriptionId: razorpaySubscription.id,
                planType: newSubscription.planType,
                planAmount: newSubscription.planAmount,
                shortUrl: razorpaySubscription.short_url,
                currentPeriodEnd: newSubscription.currentPeriodEnd
            },
            message: 'Plan upgraded successfully'
        });

    } catch (error) {
        console.error('Error upgrading subscription:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upgrade subscription' },
            { status: 500 }
        );
    }
}

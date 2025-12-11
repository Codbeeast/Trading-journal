// app/api/subscription/sync/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import { fetchSubscription } from '@/lib/razorpay';

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

        // Find user's subscription
        const subscription = await Subscription.findOne({
            userId,
            razorpaySubscriptionId: { $exists: true, $ne: null }
        }).sort({ createdAt: -1 });

        if (!subscription) {
            return NextResponse.json(
                { error: 'No subscription found' },
                { status: 404 }
            );
        }

        // Fetch current status from Razorpay
        const razorpaySubscription = await fetchSubscription(subscription.razorpaySubscriptionId);

        // Update local subscription based on Razorpay status
        const statusMapping = {
            'created': 'created',
            'authenticated': 'active',
            'active': 'active',
            'pending': 'active',
            'halted': 'past_due',
            'cancelled': 'cancelled',
            'completed': 'expired',
            'expired': 'expired'
        };

        const newStatus = statusMapping[razorpaySubscription.status] || razorpaySubscription.status;
        const oldStatus = subscription.status;

        subscription.status = newStatus;

        // Update period dates if available
        if (razorpaySubscription.current_start) {
            subscription.currentPeriodStart = new Date(razorpaySubscription.current_start * 1000);
        }
        if (razorpaySubscription.current_end) {
            subscription.currentPeriodEnd = new Date(razorpaySubscription.current_end * 1000);
        }
        if (razorpaySubscription.charge_at) {
            subscription.nextBillingDate = new Date(razorpaySubscription.charge_at * 1000);
        }

        // Handle cancellation
        if (newStatus === 'cancelled' && !subscription.cancelledAt) {
            subscription.cancelledAt = new Date();
            subscription.cancelReason = 'Manually synced from Razorpay - Admin cancellation';
        }

        await subscription.save();

        return NextResponse.json({
            success: true,
            message: 'Subscription synced successfully',
            oldStatus,
            newStatus,
            razorpayStatus: razorpaySubscription.status,
            subscription: {
                id: subscription._id,
                status: subscription.status,
                planType: subscription.planType,
                currentPeriodEnd: subscription.currentPeriodEnd
            }
        });

    } catch (error) {
        console.error('Error syncing subscription:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to sync subscription' },
            { status: 500 }
        );
    }
}

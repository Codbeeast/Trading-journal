// app/api/subscription/verify-onetime/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = body;

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return NextResponse.json(
                { error: 'Invalid payment signature', verified: false },
                { status: 400 }
            );
        }

        await connectDB();

        // Find and update subscription
        const subscription = await Subscription.findOne({
            userId,
            razorpayOrderId: razorpay_order_id
        });

        if (!subscription) {
            return NextResponse.json(
                { error: 'Subscription not found', verified: false },
                { status: 404 }
            );
        }

        // Update subscription with payment details
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 6); // 6 months access

        subscription.razorpayPaymentId = razorpay_payment_id;
        subscription.status = 'active';
        subscription.currentPeriodStart = startDate;
        subscription.currentPeriodEnd = endDate;
        subscription.isTrialUsed = true; // Mark trial as used since they paid

        await subscription.save();

        return NextResponse.json({
            success: true,
            verified: true,
            subscription: {
                id: subscription._id,
                status: subscription.status,
                validUntil: endDate
            }
        });

    } catch (error) {
        console.error('Error verifying one-time payment:', error);
        return NextResponse.json(
            { error: error.message || 'Payment verification failed', verified: false },
            { status: 500 }
        );
    }
}

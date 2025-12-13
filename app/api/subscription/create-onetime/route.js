// app/api/subscription/create-onetime/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

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

        // Check if user already has an active subscription
        const existingSubscription = await Subscription.findOne({
            userId,
            status: { $in: ['trial', 'active'] }
        });

        if (existingSubscription) {
            return NextResponse.json(
                { error: 'You already have an active subscription' },
                { status: 400 }
            );
        }

        // Create Razorpay Order for one-time payment
        const orderOptions = {
            amount: 179900, // ₹1799 in paise
            currency: 'INR',
            receipt: `sp_${userId.slice(-10)}_${Date.now()}`, // Max 40 chars for Razorpay
            notes: {
                userId,
                offerType: 'launch_special',
                duration: '6_months'
            }
        };

        const razorpayOrder = await razorpay.orders.create(orderOptions);

        // Create subscription record with pending status
        // Note: currentPeriodStart/End are placeholders, will be updated after payment verification
        const now = new Date();
        const subscription = await Subscription.create({
            userId,
            planType: '6_MONTHS',
            planAmount: 1799,
            billingCycle: 'half_yearly',
            billingPeriod: 6,
            bonusMonths: 0,
            totalMonths: 6,
            isRecurring: false,
            paymentType: 'onetime',
            razorpayOrderId: razorpayOrder.id,
            status: 'created',
            currentPeriodStart: now,
            currentPeriodEnd: now // Placeholder, will be set after payment
        });

        return NextResponse.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: 1799,
            subscription: {
                id: subscription._id,
                planType: subscription.planType
            }
        });

    } catch (error) {
        console.error('Error creating one-time payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create order' },
            { status: 500 }
        );
    }
}

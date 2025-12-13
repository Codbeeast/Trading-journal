// app/api/subscription/create-onetime/route.js
import { auth, currentUser } from '@clerk/nextjs/server';
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
        const user = await currentUser();
        const { userId } = await auth();

        if (!userId || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // Check if user already has an active subscription
        /* 
        // Commenting out to allow upgrades/extensions or correcting sync states
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
        */

        const userEmail = user.emailAddresses[0]?.emailAddress || '';
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${userId}`;
        const username = user.username || userEmail.split('@')[0] || userName;

        // Create Razorpay order
        const options = {
            amount: 179900, // ₹1799.00
            currency: 'INR',
            receipt: `rcpt_${userId.slice(-10)}_${Date.now()}`.slice(0, 40),
            notes: {
                userId,
                planType: 'SPECIAL_OFFER',
                userEmail,
                userName: userName,
                username: username
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Calculate validity (6 months)
        const now = new Date();
        const validUntil = new Date(now);
        validUntil.setMonth(validUntil.getMonth() + 6);

        // Create or update subscription record
        // This will be updated to "active" upon successful payment verification

        // Find latest subscription for this user
        let subscription = await Subscription.findOne({ userId }).sort({ createdAt: -1 });

        const subscriptionData = {
            userId,
            username,
            planType: '6_MONTHS',
            razorpayOrderId: razorpayOrder.id,
            planAmount: 1799,
            billingCycle: 'half_yearly',
            billingPeriod: 6,
            bonusMonths: 0,
            totalMonths: 6,
            isRecurring: false,
            paymentType: 'onetime',
            status: 'created', // Will be active after payment
            currentPeriodStart: now,
            currentPeriodEnd: now,
            // Clear old values if updating
            razorpaySubscriptionId: null,
            razorpayPlanId: null,
            cancelledAt: null,
            cancelReason: null
        };

        if (subscription) {
            // Update existing document
            Object.assign(subscription, subscriptionData);
            await subscription.save();
        } else {
            // Create new document
            subscription = await Subscription.create(subscriptionData);
        }

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

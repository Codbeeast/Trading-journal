// app/api/subscription/create-onetime/route.js
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import { createOrder } from '@/lib/razorpay';
// ... other imports ...

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

        // Check if user already has an active PAID subscription (allow upgrades from trial)
        const existingSubscription = await Subscription.findOne({
            userId,
            status: 'active',
            // Ensure we don't block if it's just a trial (which might be marked active in some contexts, but here we explicitly checked for 'trial' status before)
            // Actually, if we just check for 'active', we might miss some edge cases if trial uses 'active'. 
            // Better to explicitly exclude trial.
            isTrialActive: { $ne: true }
        });

        if (existingSubscription) {
            return NextResponse.json(
                { error: 'You already have an active subscription' },
                { status: 400 }
            );
        }

        const userEmail = user.emailAddresses[0]?.emailAddress || '';
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${userId}`;
        const username = user.username || userEmail.split('@')[0] || userName;

        // Create Razorpay order
        const razorpayOrder = await createOrder({
            amount: 1799, // 1799 INR (will be converted to paise by createOrder)
            currency: 'INR',
            receipt: `rcpt_${userId.slice(-10)}_${Date.now()}`.slice(0, 40),
            notes: {
                userId,
                planType: 'SPECIAL_OFFER',
                userEmail,
                userName: userName,
                username: username
            }
        });

        // Calculate validity (6 months)
        const now = new Date();
        const validUntil = new Date(now);
        validUntil.setMonth(validUntil.getMonth() + 6);

        // Create "pending" subscription record
        // This will be updated to "active" upon successful payment verification
        const subscription = await Subscription.create({
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

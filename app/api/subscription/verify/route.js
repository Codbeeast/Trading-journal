// app/api/subscription/verify/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import Payment from '@/models/Payment';
import { verifyPaymentSignature, fetchPayment } from '@/lib/razorpay';

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
        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature
        } = await request.json();

        if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing payment verification parameters' },
                { status: 400 }
            );
        }

        // Verify payment signature
        const isValid = verifyPaymentSignature({
            razorpayPaymentId: razorpay_payment_id,
            razorpaySubscriptionId: razorpay_subscription_id,
            razorpaySignature: razorpay_signature
        });

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find subscription
        const subscription = await Subscription.findOne({
            razorpaySubscriptionId: razorpay_subscription_id,
            userId
        });

        if (!subscription) {
            return NextResponse.json(
                { error: 'Subscription not found' },
                { status: 404 }
            );
        }

        // Fetch payment details from Razorpay
        const paymentDetails = await fetchPayment(razorpay_payment_id);

        // Create payment record
        const payment = await Payment.create({
            userId,
            subscriptionId: subscription._id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySubscriptionId: razorpay_subscription_id,
            razorpaySignature: razorpay_signature,
            amount: paymentDetails.amount / 100, // Convert from paise to rupees
            currency: paymentDetails.currency,
            status: paymentDetails.status === 'captured' ? 'captured' : 'authorized',
            method: paymentDetails.method,
            methodDetails: {
                cardType: paymentDetails.card?.type,
                cardNetwork: paymentDetails.card?.network,
                cardLast4: paymentDetails.card?.last4,
                upiId: paymentDetails.vpa,
                bank: paymentDetails.bank,
                wallet: paymentDetails.wallet
            },
            capturedAt: paymentDetails.status === 'captured' ? new Date() : null
        });

        // Update subscription with payment
        subscription.paymentIds.push(payment._id);

        // If this is the first payment, activate subscription
        if (subscription.status === 'trial' || !subscription.autoPayEnabled) {
            subscription.status = 'active';
            subscription.autoPayEnabled = true;
            subscription.isTrialActive = false;
            subscription.paymentMethod = paymentDetails.method;
        }

        await subscription.save();

        return NextResponse.json({
            success: true,
            verified: true,
            payment: {
                id: payment._id,
                status: payment.status,
                amount: payment.amount,
                method: payment.method
            },
            subscription: {
                id: subscription._id,
                status: subscription.status,
                currentPeriodEnd: subscription.currentPeriodEnd
            },
            message: 'Payment verified successfully'
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify payment' },
            { status: 500 }
        );
    }
}

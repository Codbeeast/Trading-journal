// app/api/subscription/webhook/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import Payment from '@/models/Payment';
import { verifyWebhookSignature } from '@/lib/razorpay';

export async function POST(request) {
    try {
        // Get raw body for signature verification
        const body = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        if (!signature) {
            console.error('Missing webhook signature');
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 400 }
            );
        }

        // Verify webhook signature
        const isValid = verifyWebhookSignature(body, signature);
        if (!isValid) {
            console.error('Invalid webhook signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        // Parse webhook payload
        const payload = JSON.parse(body);
        const { event, payload: eventPayload } = payload;

        console.log('Received Razorpay webhook:', event);

        await connectDB();

        // Handle different webhook events
        switch (event) {
            case 'subscription.activated':
                await handleSubscriptionActivated(eventPayload);
                break;

            case 'subscription.charged':
                await handleSubscriptionCharged(eventPayload);
                break;

            case 'subscription.completed':
                await handleSubscriptionCompleted(eventPayload);
                break;

            case 'subscription.cancelled':
                await handleSubscriptionCancelled(eventPayload);
                break;

            case 'subscription.paused':
                await handleSubscriptionPaused(eventPayload);
                break;

            case 'subscription.resumed':
                await handleSubscriptionResumed(eventPayload);
                break;

            case 'payment.failed':
                await handlePaymentFailed(eventPayload);
                break;

            default:
                console.log('Unhandled webhook event:', event);
        }

        return NextResponse.json({ success: true, received: true });

    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Handle subscription activated
async function handleSubscriptionActivated(data) {
    const { subscription } = data;

    const dbSubscription = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (dbSubscription) {
        dbSubscription.status = 'active';
        dbSubscription.currentPeriodStart = new Date(subscription.current_start * 1000);
        dbSubscription.currentPeriodEnd = new Date(subscription.current_end * 1000);
        if (subscription.charge_at) {
            dbSubscription.nextBillingDate = new Date(subscription.charge_at * 1000);
        }
        await dbSubscription.save();
        console.log('Subscription activated:', subscription.id);
    }
}

// Handle subscription charged
async function handleSubscriptionCharged(data) {
    const { payment, subscription } = data;

    // Find subscription
    const dbSubscription = await Subscription.findOne({
        razorpaySubscriptionId: subscription.entity.id
    });

    if (!dbSubscription) {
        console.error('Subscription not found:', subscription.entity.id);
        return;
    }

    // Create payment record
    const paymentRecord = await Payment.create({
        userId: dbSubscription.userId,
        subscriptionId: dbSubscription._id,
        razorpayPaymentId: payment.entity.id,
        razorpaySubscriptionId: subscription.entity.id,
        amount: payment.entity.amount / 100,
        currency: payment.entity.currency,
        status: payment.entity.status === 'captured' ? 'captured' : 'authorized',
        method: payment.entity.method,
        methodDetails: {
            cardType: payment.entity.card?.type,
            cardNetwork: payment.entity.card?.network,
            cardLast4: payment.entity.card?.last4,
            upiId: payment.entity.vpa,
            bank: payment.entity.bank,
            wallet: payment.entity.wallet
        },
        webhookEvent: 'subscription.charged',
        webhookData: data,
        capturedAt: payment.entity.status === 'captured' ? new Date() : null
    });

    // Update subscription
    dbSubscription.paymentIds.push(paymentRecord._id);
    dbSubscription.status = 'active';
    dbSubscription.currentPeriodStart = new Date(subscription.entity.current_start * 1000);
    dbSubscription.currentPeriodEnd = new Date(subscription.entity.current_end * 1000);
    if (subscription.entity.charge_at) {
        dbSubscription.nextBillingDate = new Date(subscription.entity.charge_at * 1000);
    }

    await dbSubscription.save();
    console.log('Subscription charged successfully:', payment.entity.id);
}

// Handle subscription completed
async function handleSubscriptionCompleted(data) {
    const { subscription } = data;

    const dbSubscription = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (dbSubscription) {
        dbSubscription.status = 'expired';
        await dbSubscription.save();
        console.log('Subscription completed:', subscription.id);
    }
}

// Handle subscription cancelled
async function handleSubscriptionCancelled(data) {
    const { subscription } = data;

    const dbSubscription = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (dbSubscription) {
        dbSubscription.status = 'cancelled';
        dbSubscription.cancelledAt = new Date();
        await dbSubscription.save();
        console.log('Subscription cancelled:', subscription.id);
    }
}

// Handle subscription paused
async function handleSubscriptionPaused(data) {
    const { subscription } = data;

    const dbSubscription = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (dbSubscription) {
        dbSubscription.status = 'past_due';
        await dbSubscription.save();
        console.log('Subscription paused:', subscription.id);
    }
}

// Handle subscription resumed
async function handleSubscriptionResumed(data) {
    const { subscription } = data;

    const dbSubscription = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (dbSubscription) {
        dbSubscription.status = 'active';
        await dbSubscription.save();
        console.log('Subscription resumed:', subscription.id);
    }
}

// Handle payment failed
async function handlePaymentFailed(data) {
    const { payment } = data;

    // Extract subscription ID from payment notes if available
    const subscriptionId = payment.entity.notes?.razorpay_subscription_id;

    if (subscriptionId) {
        const dbSubscription = await Subscription.findOne({
            razorpaySubscriptionId: subscriptionId
        });

        if (dbSubscription) {
            // Create failed payment record
            await Payment.create({
                userId: dbSubscription.userId,
                subscriptionId: dbSubscription._id,
                razorpayPaymentId: payment.entity.id,
                razorpaySubscriptionId: subscriptionId,
                amount: payment.entity.amount / 100,
                currency: payment.entity.currency,
                status: 'failed',
                method: payment.entity.method,
                webhookEvent: 'payment.failed',
                webhookData: data,
                errorCode: payment.entity.error_code,
                errorDescription: payment.entity.error_description,
                errorReason: payment.entity.error_reason,
                failedAt: new Date()
            });

            // Update subscription status to past_due
            dbSubscription.status = 'past_due';
            await dbSubscription.save();

            console.log('Payment failed, subscription marked as past_due:', payment.entity.id);
        }
    }
}

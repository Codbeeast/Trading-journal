// lib/razorpay.js
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
let razorpayInstance = null;

export function getRazorpayInstance() {
    if (!razorpayInstance) {
        const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            throw new Error('Razorpay credentials not configured. Please add RAZORPAY_KEY_ID (or NEXT_PUBLIC_RAZORPAY_KEY_ID) and RAZORPAY_KEY_SECRET to .env.local');
        }

        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    }

    return razorpayInstance;
}

/**
 * Create a Razorpay subscription
 * @param {Object} params - Subscription parameters
 * @param {string} params.planId - Razorpay plan ID
 * @param {number} params.totalCount - Total billing cycles
 * @param {Object} params.customer - Customer details
 * @param {boolean} params.startTrial - Whether to start with trial
 * @returns {Promise<Object>} Razorpay subscription object
 */
export async function createSubscription({
    planId,
    totalCount = 120, // Default to 10 years
    customer,
    startTrial = true,
    addons = [],
    notes = {}
}) {
    try {
        const razorpay = getRazorpayInstance();

        const subscriptionData = {
            plan_id: planId,
            total_count: totalCount,
            customer_notify: 1, // Send notifications to customer
            notes: {
                ...notes,
                created_via: 'trading_journal_app'
            }
        };

        // Add trial period if required
        if (startTrial) {
            subscriptionData.start_at = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // Start after 7 days
        }

        // Add customer details if provided
        if (customer) {
            subscriptionData.customer = {
                name: customer.name,
                email: customer.email,
                contact: customer.contact || '',
            };
        }

        // Add addons if any
        if (addons && addons.length > 0) {
            subscriptionData.addons = addons;
        }

        const subscription = await razorpay.subscriptions.create(subscriptionData);
        return subscription;
    } catch (error) {
        const errMsg = error.error?.description || error.description || error.message || JSON.stringify(error);
        console.error('Error creating Razorpay subscription:', errMsg, error);
        throw new Error(`Failed to create subscription: ${errMsg}`);
    }
}

/**
 * Fetch subscription details from Razorpay
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<Object>} Subscription details
 */
export async function fetchSubscription(subscriptionId) {
    try {
        const razorpay = getRazorpayInstance();
        const subscription = await razorpay.subscriptions.fetch(subscriptionId);
        return subscription;
    } catch (error) {
        const errMsg = error.error?.description || error.description || error.message || JSON.stringify(error);
        console.error('Error fetching subscription:', errMsg, error);
        throw new Error(`Failed to fetch subscription: ${errMsg}`);
    }
}

/**
 * Cancel a Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {boolean} cancelAtCycleEnd - Whether to cancel at end of current cycle
 * @returns {Promise<Object>} Cancelled subscription object
 */
export async function cancelSubscription(subscriptionId, cancelAtCycleEnd = true) {
    try {
        const razorpay = getRazorpayInstance();
        const subscription = await razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);
        return subscription;
    } catch (error) {
        const errMsg = error.error?.description || error.description || error.message || JSON.stringify(error);
        console.error('Error cancelling subscription:', errMsg, error);
        throw new Error(`Failed to cancel subscription: ${errMsg}`);
    }
}

/**
 * Verify payment signature from Razorpay
 * @param {Object} params - Payment parameters
 * @param {string} params.razorpayPaymentId - Payment ID
 * @param {string} params.razorpaySubscriptionId - Subscription ID
 * @param {string} params.razorpaySignature - Signature to verify
 * @returns {boolean} True if signature is valid
 */
export function verifyPaymentSignature({
    razorpayPaymentId,
    razorpaySubscriptionId,
    razorpaySignature
}) {
    try {
        const text = `${razorpayPaymentId}|${razorpaySubscriptionId}`;
        const secret = process.env.RAZORPAY_KEY_SECRET;

        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(text)
            .digest('hex');

        return generatedSignature === razorpaySignature;
    } catch (error) {
        console.error('Error verifying payment signature:', error);
        return false;
    }
}

/**
 * Verify webhook signature from Razorpay
 * @param {string} webhookBody - Raw webhook body
 * @param {string} webhookSignature - X-Razorpay-Signature header
 * @returns {boolean} True if webhook is authentic
 */
export function verifyWebhookSignature(webhookBody, webhookSignature) {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!secret) {
            console.error('Razorpay webhook secret not configured');
            return false;
        }

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(webhookBody)
            .digest('hex');

        return expectedSignature === webhookSignature;
    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        return false;
    }
}

/**
 * Create a Razorpay order for one-time payment
 * @param {Object} params - Order parameters
 * @param {number} params.amount - Amount in rupees
 * @param {string} params.currency - Currency code
 * @param {string} params.receipt - Receipt ID
 * @returns {Promise<Object>} Razorpay order object
 */
export async function createOrder({
    amount,
    currency = 'INR',
    receipt,
    notes = {}
}) {
    try {
        const razorpay = getRazorpayInstance();

        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency,
            receipt,
            notes: {
                ...notes,
                created_via: 'trading_journal_app'
            }
        });

        return order;
    } catch (error) {
        const errMsg = error.error?.description || error.description || error.message || JSON.stringify(error);
        console.error('Error creating Razorpay order:', errMsg, error);
        throw new Error(`Failed to create order: ${errMsg}`);
    }
}

/**
 * Fetch payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
export async function fetchPayment(paymentId) {
    try {
        const razorpay = getRazorpayInstance();
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        const errMsg = error.error?.description || error.description || error.message || JSON.stringify(error);
        console.error('Error fetching payment:', errMsg, error);
        throw new Error(`Failed to fetch payment: ${errMsg}`);
    }
}

/**
 * Refund a payment
 * @param {string} paymentId - Payment ID to refund
 * @param {number} amount - Amount to refund (optional, full refund if not specified)
 * @returns {Promise<Object>} Refund object
 */
export async function refundPayment(paymentId, amount = null) {
    try {
        const razorpay = getRazorpayInstance();

        const refundData = {};
        if (amount) {
            refundData.amount = amount * 100; // Convert to paise
        }

        const refund = await razorpay.payments.refund(paymentId, refundData);
        return refund;
    } catch (error) {
        const errMsg = error.error?.description || error.description || error.message || JSON.stringify(error);
        console.error('Error refunding payment:', errMsg, error);
        throw new Error(`Failed to refund payment: ${errMsg}`);
    }
}

/**
 * Update a Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {Object} updates - Fields to update (e.g., start_at)
 * @returns {Promise<Object>} Updated subscription object
 */
export async function updateSubscription(subscriptionId, updates) {
    try {
        const razorpay = getRazorpayInstance();
        // The SDK might not have a direct 'update' method on 'subscriptions' resource in some versions,
        // but typically it follows standard REST conventions.
        // If razorpay-node sdk supports it:
        const subscription = await razorpay.subscriptions.edit(subscriptionId, updates);
        return subscription;
    } catch (error) {
        const errMsg = error.error?.description || error.description || error.message || JSON.stringify(error);
        console.error('Error updating subscription:', errMsg, error);
        throw new Error(`Failed to update subscription: ${errMsg}`);
    }
}

const razorpayUtils = {
    getRazorpayInstance,
    createSubscription,
    fetchSubscription,
    updateSubscription,
    cancelSubscription,
    verifyPaymentSignature,
    verifyWebhookSignature,
    createOrder,
    fetchPayment,
    refundPayment
};

export default razorpayUtils;

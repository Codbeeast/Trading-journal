// lib/subscription.js
import { connectDB } from './db';
import Subscription from '@/models/Subscription';
import Plan from '@/models/Plan';

/**
 * Check if user has an active subscription or trial
 * @param {string} userId - User ID (Clerk ID)
 * @returns {Promise<Object|null>} Active subscription or null
 */
export async function getActiveSubscription(userId) {
    try {
        await connectDB();
        const subscription = await Subscription.findActiveSubscription(userId);
        return subscription;
    } catch (error) {
        console.error('Error fetching active subscription:', error);
        return null;
    }
}

/**
 * Check if user has access to premium features
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user has access
 */
export async function hasActiveAccess(userId) {
    try {
        const subscription = await getActiveSubscription(userId);

        if (!subscription) {
            // Check for 'created' status (payment done, webhook pending)
            const pendingSubscription = await Subscription.findOne({
                userId,
                status: 'created'
            });

            // Grant access if payment was completed (even if webhook hasn't fired yet)
            return !!pendingSubscription;
        }

        // Check if trial is active and not expired
        if (subscription.isTrialActive) {
            return !subscription.isTrialExpired();
        }

        // Check if subscription is active and not expired
        return subscription.status === 'active' && subscription.currentPeriodEnd > new Date();
    } catch (error) {
        console.error('Error checking access:', error);
        return false;
    }
}

/**
 * Create a new trial subscription for user
 * @param {string} userId - User ID
 * @param {string} planType - Plan type (1_MONTH, 6_MONTHS, 12_MONTHS)
 * @returns {Promise<Object>} Created subscription
 */
export async function createTrialSubscription(userId, planType = '1_MONTH') {
    try {
        await connectDB();

        // Check if user already used trial
        const existingSubscription = await Subscription.findOne({ userId, isTrialUsed: true });
        if (existingSubscription) {
            throw new Error('Trial already used for this user');
        }

        // Get plan details
        const plan = await Plan.findOne({ planId: planType });
        if (!plan) {
            throw new Error('Invalid plan type');
        }

        // Calculate trial dates
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days trial

        // Create subscription
        const subscription = await Subscription.create({
            userId,
            planType,
            planAmount: plan.amount,
            billingCycle: plan.billingCycle,
            isTrialActive: true,
            isTrialUsed: true,
            trialStartDate,
            trialEndDate,
            status: 'trial',
            startDate: trialStartDate,
            currentPeriodStart: trialStartDate,
            currentPeriodEnd: trialEndDate,
            autoPayEnabled: false
        });

        return subscription;
    } catch (error) {
        console.error('Error creating trial subscription:', error);
        throw error;
    }
}

/**
 * Activate paid subscription after trial
 * @param {string} subscriptionId - MongoDB subscription ID
 * @param {Object} razorpayData - Razorpay subscription data
 * @returns {Promise<Object>} Updated subscription
 */
export async function activatePaidSubscription(subscriptionId, razorpayData) {
    try {
        await connectDB();

        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Calculate period dates
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date();

        // Set end date based on plan
        const plan = await Plan.findOne({ planId: subscription.planType });
        if (plan) {
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + plan.totalMonths);
        }

        // Update subscription
        subscription.razorpaySubscriptionId = razorpayData.id;
        subscription.razorpayPlanId = razorpayData.plan_id;
        subscription.isTrialActive = false;
        subscription.status = 'active';
        subscription.currentPeriodStart = currentPeriodStart;
        subscription.currentPeriodEnd = currentPeriodEnd;
        subscription.autoPayEnabled = true;
        subscription.paymentMethod = razorpayData.payment_method || null;

        // Set next billing date
        if (razorpayData.charge_at) {
            subscription.nextBillingDate = new Date(razorpayData.charge_at * 1000);
        }

        await subscription.save();
        return subscription;
    } catch (error) {
        console.error('Error activating paid subscription:', error);
        throw error;
    }
}

/**
 * Check if user is eligible for trial
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if eligible
 */
export async function isTrialEligible(userId) {
    try {
        await connectDB();
        // const subscription = await Subscription.findOne({ userId, isTrialUsed: true });
        // return !subscription; // Eligible if no trial used yet
        return false; // TEMPORARY: Force payment for testing
    } catch (error) {
        console.error('Error checking trial eligibility:', error);
        return false;
    }
}

/**
 * Get subscription status summary for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Subscription status summary
 */
export async function getSubscriptionStatus(userId) {
    try {
        // First check for active/trial subscriptions
        const subscription = await getActiveSubscription(userId);

        if (!subscription) {
            // Check for pending 'created' subscriptions (payment done, waiting for webhook)
            const pendingSubscription = await Subscription.findOne({
                userId,
                status: 'created'
            }).sort({ createdAt: -1 });

            if (pendingSubscription) {
                return {
                    hasAccess: true, // Grant access immediately after payment
                    status: 'created',
                    planType: pendingSubscription.planType,
                    planAmount: pendingSubscription.planAmount,
                    message: 'Payment received - Activating subscription...',
                    isPending: true
                };
            }

            // No subscription at all
            const isEligible = await isTrialEligible(userId);
            return {
                hasAccess: false,
                isTrialEligible: isEligible,
                status: 'no_subscription',
                message: isEligible ? 'Start your 7-day free trial' : 'No active subscription'
            };
        }

        const daysRemaining = subscription.daysRemaining();
        const isInTrial = subscription.isTrialActive;

        return {
            hasAccess: true,
            isInTrial,
            status: subscription.status,
            planType: subscription.planType,
            planAmount: subscription.planAmount,
            daysRemaining,
            currentPeriodEnd: subscription.currentPeriodEnd,
            nextBillingDate: subscription.nextBillingDate,
            autoPayEnabled: subscription.autoPayEnabled,
            message: isInTrial
                ? `${daysRemaining} days left in trial`
                : `Active until ${subscription.currentPeriodEnd.toLocaleDateString()}`
        };
    } catch (error) {
        console.error('Error getting subscription status:', error);
        return {
            hasAccess: false,
            status: 'error',
            message: 'Unable to fetch subscription status'
        };
    }
}

/**
 * Cancel user subscription
 * @param {string} userId - User ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Updated subscription
 */
export async function cancelUserSubscription(userId, reason = null) {
    try {
        await connectDB();

        const subscription = await Subscription.findOne({
            userId,
            status: { $in: ['trial', 'active'] }
        });

        if (!subscription) {
            throw new Error('No active subscription found');
        }

        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        subscription.cancelReason = reason;

        await subscription.save();
        return subscription;
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        throw error;
    }
}

/**
 * Update subscription status from webhook
 * @param {string} razorpaySubscriptionId - Razorpay subscription ID
 * @param {string} status - New status
 * @param {Object} webhookData - Webhook payload
 * @returns {Promise<Object>} Updated subscription
 */
export async function updateSubscriptionFromWebhook(razorpaySubscriptionId, status, webhookData) {
    try {
        await connectDB();

        const subscription = await Subscription.findOne({ razorpaySubscriptionId });
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Map Razorpay status to our status
        const statusMapping = {
            'authenticated': 'active',
            'active': 'active',
            'pending': 'active',
            'halted': 'past_due',
            'cancelled': 'cancelled',
            'completed': 'expired',
            'expired': 'expired'
        };

        subscription.status = statusMapping[status] || status;

        // Update period dates if available
        if (webhookData.current_start) {
            subscription.currentPeriodStart = new Date(webhookData.current_start * 1000);
        }
        if (webhookData.current_end) {
            subscription.currentPeriodEnd = new Date(webhookData.current_end * 1000);
        }
        if (webhookData.charge_at) {
            subscription.nextBillingDate = new Date(webhookData.charge_at * 1000);
        }

        await subscription.save();
        return subscription;
    } catch (error) {
        console.error('Error updating subscription from webhook:', error);
        throw error;
    }
}

const subscriptionUtils = {
    getActiveSubscription,
    hasActiveAccess,
    createTrialSubscription,
    activatePaidSubscription,
    isTrialEligible,
    getSubscriptionStatus,
    cancelUserSubscription,
    updateSubscriptionFromWebhook
};

export default subscriptionUtils;

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
            // No active subscription found
            // DO NOT grant access to 'created' status - payment not confirmed
            return false;
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
export async function createTrialSubscription(userId, planType = '1_MONTH', username = null) {
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
        // TEST MODE: 40 Minutes Trial (was 7 days)
        trialEndDate.setMinutes(trialEndDate.getMinutes() + 40);

        // Create subscription with ALL plan fields to preserve duration
        const subscription = await Subscription.create({
            userId,
            username,
            planType,
            planAmount: plan.amount,
            billingCycle: plan.billingCycle,
            billingPeriod: plan.billingPeriod, // CRITICAL: Save billing period
            bonusMonths: plan.bonusMonths || 0,
            totalMonths: plan.totalMonths || plan.billingPeriod, // CRITICAL: Save total months
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
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + plan.billingPeriod);
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
        const subscription = await Subscription.findOne({ userId, isTrialUsed: true });
        return !subscription; // Eligible if no trial used yet
    } catch (error) {
        console.error('Error checking trial eligibility:', error);
        return false;
    }
}

/**
 * Check if user has access to a specific premium feature
 * @param {string} userId - User ID
 * @param {string} featureName - Feature name (fono, notesSummary, etc.)
 * @returns {Promise<Object>} Access status and reason
 */
export async function hasFeatureAccess(userId, featureName) {
    try {
        const subscription = await getActiveSubscription(userId);

        // No active subscription - DO NOT check 'created' status
        // 'created' means payment not completed yet
        if (!subscription) {
            return { hasAccess: false, reason: 'no_subscription', isTrialEligible: await isTrialEligible(userId) };
        }

        // Features locked during trial period
        const trialLockedFeatures = ['fono', 'notesSummary', 'bestTimes', 'confluences'];

        // If user is on trial and feature is locked
        if (subscription.isTrialActive && trialLockedFeatures.includes(featureName)) {
            return {
                hasAccess: false,
                reason: 'trial_limitation',
                daysRemaining: subscription.daysRemaining()
            };
        }

        // Active paid subscription
        if (subscription.status === 'active' && subscription.currentPeriodEnd > new Date()) {
            return { hasAccess: true, reason: 'active_subscription' };
        }

        // Trial active for non-locked features
        if (subscription.isTrialActive && !subscription.isTrialExpired()) {
            return { hasAccess: true, reason: 'trial_active', daysRemaining: subscription.daysRemaining() };
        }

        return { hasAccess: false, reason: 'expired_subscription' };
    } catch (error) {
        console.error('Error checking feature access:', error);
        return { hasAccess: false, reason: 'error' };
    }
}

import { fetchSubscription } from '@/lib/razorpay';

/**
 * Get subscription status summary for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Subscription status summary
 */
export async function getSubscriptionStatus(userId) {
    try {
        // First check for active/trial subscriptions
        let subscription = await getActiveSubscription(userId);

        // Auto-start trial if eligible and no active subscription found
        if (!subscription) {
            const isEligible = await isTrialEligible(userId);
            if (isEligible) {
                try {
                    console.log(`Starting automatic 40-minute trial for user ${userId}`);
                    subscription = await createTrialSubscription(userId, '1_MONTH', 40);
                } catch (err) {
                    console.error('Failed to auto-create trial:', err);
                    // Fallthrough to standard no-subscription response
                }
            }
        }

        // TEMP: Auto-migrate to 40-min test trial
        if (subscription && subscription.isTrialActive && subscription.trialStartDate) {
            const now = new Date();
            const trialStart = new Date(subscription.trialStartDate);
            const currentEndDate = new Date(subscription.trialEndDate);

            // If trial end date is more than 3 hours away, it's the old 7-day trial
            // Force update it to Start + 40 mins
            if ((currentEndDate - now) > (1000 * 60 * 60 * 3)) {
                console.log('Migrating user to 40-min test trial...');
                const newEndDate = new Date(trialStart);
                newEndDate.setMinutes(newEndDate.getMinutes() + 40);

                subscription.trialEndDate = newEndDate;
                // If now > newEndDate, it will expire naturally
                await subscription.save();
                console.log('Migration complete. New end date:', newEndDate);
            }
        }

        if (subscription && subscription.razorpaySubscriptionId) {
            // Verify status with Razorpay (Active Check)
            try {
                const remoteSub = await fetchSubscription(subscription.razorpaySubscriptionId);

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

                const mappedStatus = statusMapping[remoteSub.status] || remoteSub.status;

                // If status changed or period updated, sync DB
                let needsSave = false;

                if (subscription.status !== mappedStatus) {
                    // Special case: Don't override 'trial' with 'active' if we are tracking trial locally
                    // UNLESS remote says cancelled/expired/halted
                    const criticalStates = ['cancelled', 'expired', 'past_due', 'halted'];
                    if (subscription.status !== 'trial' || criticalStates.includes(mappedStatus)) {
                        console.log(`Syncing status for ${subscription.razorpaySubscriptionId}: ${subscription.status} -> ${mappedStatus}`);
                        subscription.status = mappedStatus;
                        needsSave = true;
                    }
                }

                if (remoteSub.current_end && new Date(remoteSub.current_end * 1000).getTime() !== subscription.currentPeriodEnd.getTime()) {
                    subscription.currentPeriodEnd = new Date(remoteSub.current_end * 1000);
                    needsSave = true;
                }

                if (needsSave) {
                    if (mappedStatus === 'cancelled' && !subscription.cancelledAt) {
                        subscription.cancelledAt = new Date();
                        subscription.cancelReason = 'Cancelled externally (Sync)';
                    }
                    await subscription.save();
                }

            } catch (err) {
                console.warn('Failed to sync with Razorpay:', err.message);
                // Continue with local data if sync fails
            }
        }

        // Re-check validity after potential updates
        if (!subscription || subscription.status === 'cancelled' || subscription.status === 'expired') {
            // If strictly no access (e.g. expired/cancelled and period over)
            if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trial' && (!subscription.currentPeriodEnd || subscription.currentPeriodEnd < new Date()))) {
                const isEligible = await isTrialEligible(userId);

                // If subscription exists but expired, check if it was our 25-min trial
                if (subscription && subscription.status === 'trial' && subscription.isTrialActive === true) {
                    // It's an expired trial
                    return {
                        hasAccess: false,
                        isTrialEligible: false,
                        status: 'expired',
                        message: 'Your 25-minute test trial has ended.'
                    };
                }

                return {
                    hasAccess: false,
                    isTrialEligible: isEligible,
                    status: subscription ? subscription.status : 'no_subscription',
                    message: isEligible ? 'Start your 7-day free trial' : 'No active subscription'
                };
            }
        }

        // Calculate precise remaining time
        const daysRemaining = subscription.daysRemaining();
        const isInTrial = subscription.isTrialActive;

        // Custom time formatting for granular display
        let timeRemainingString = `${daysRemaining} days`;

        if (isInTrial) {
            const endDate = subscription.trialEndDate;
            const now = new Date();
            const diff = endDate - now;

            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                if (days > 0) {
                    timeRemainingString = `${days}d ${hours}h`;
                } else if (hours > 0) {
                    timeRemainingString = `${hours}h ${minutes}m`;
                } else {
                    timeRemainingString = `${minutes}m`;
                }
            } else {
                timeRemainingString = "Ended";
            }
        }

        return {
            hasAccess: true,
            isInTrial,
            status: subscription.status,
            planType: subscription.planType,
            planAmount: subscription.planAmount,
            billingPeriod: subscription.billingPeriod,
            bonusMonths: subscription.bonusMonths,
            totalMonths: subscription.totalMonths,
            daysRemaining,
            timeRemainingString, // New precise field
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            nextBillingDate: subscription.nextBillingDate,
            autoPayEnabled: subscription.autoPayEnabled,
            message: isInTrial
                ? `Trial ends in ${timeRemainingString}`
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
    hasFeatureAccess,
    createTrialSubscription,
    activatePaidSubscription,
    isTrialEligible,
    getSubscriptionStatus,
    cancelUserSubscription,
    updateSubscriptionFromWebhook
};

export default subscriptionUtils;

'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SubscriptionStatus = () => {
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchSubscriptionStatus();
    }, []);

    const fetchSubscriptionStatus = async () => {
        try {
            const response = await fetch('/api/subscription/status');
            const data = await response.json();

            if (data.success) {
                setSubscription(data);
            } else {
                setError(data.error || 'Failed to load subscription details');
            }
        } catch (err) {
            console.error('Error fetching subscription:', err);
            setError('Failed to load subscription details');
        } finally {
            setLoading(false);
        }
    };

    const syncSubscription = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/subscription/sync', {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success) {
                // Refresh subscription status after sync
                await fetchSubscriptionStatus();
            } else {
                setError(data.error || 'Failed to sync subscription');
            }
        } catch (err) {
            console.error('Error syncing subscription:', err);
            setError('Failed to sync subscription');
        }
    };

    if (loading) {
        return (
            <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 animate-pulse">
                <div className="h-6 bg-gray-800 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/3"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full bg-red-900/10 border border-red-500/20 rounded-xl p-6 mb-6">
                <p className="text-red-400">Unable to load subscription details. Please try again later.</p>
            </div>
        )
    }

    const isTrialing = subscription?.isInTrial;
    const isActive = subscription?.hasAccess;
    const isPending = subscription?.isPending || subscription?.status === 'created';
    const daysRemaining = subscription?.daysRemaining;
    const planName = subscription?.planType ? subscription.planType.replace('_', ' ') + ' PLAN' : 'FREE PLAN';
    const statusMessage = subscription?.message;

    // Fallback: Calculate bonus months if not present (for existing subscriptions)
    let bonusMonths = subscription?.bonusMonths || 0;
    let billingPeriod = subscription?.billingPeriod || 1;
    let totalMonths = subscription?.totalMonths || 1;

    // Derive from planType if bonus data is missing
    if (!subscription?.bonusMonths && subscription?.planType) {
        if (subscription.planType === '6_MONTHS') {
            bonusMonths = 1;
            billingPeriod = 6;
            totalMonths = 7;
        } else if (subscription.planType === '12_MONTHS') {
            bonusMonths = 2;
            billingPeriod = 12;
            totalMonths = 14;
        } else if (subscription.planType === '1_MONTH') {
            bonusMonths = 0;
            billingPeriod = 1;
            totalMonths = 1;
        }
    }

    // Calculate the correct end date including bonus months
    let actualEndDate = subscription?.currentPeriodEnd;
    if (subscription?.currentPeriodStart && bonusMonths > 0) {
        // Recalculate end date to include bonus months
        const startDate = new Date(subscription.currentPeriodStart);
        const correctedEndDate = new Date(startDate);
        correctedEndDate.setMonth(correctedEndDate.getMonth() + totalMonths);
        actualEndDate = correctedEndDate;
    }

    // Calculate dynamic days remaining based on the corrected actualEndDate
    let displayDays = daysRemaining;
    if (actualEndDate && !isTrialing) {
        const now = new Date();
        const diffTime = new Date(actualEndDate) - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Use the calculated days if valid, otherwise fallback
        if (!isNaN(diffDays)) {
            displayDays = diffDays > 0 ? diffDays : 0;
        }
    }

    return (
        <div className="w-full bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 mb-8 shadow-xl relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Subscription Details</h2>
                        <p className="text-gray-400 text-sm">Manage your plan and billing information</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={syncSubscription}
                            disabled={loading}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Refresh subscription status"
                        >
                            <svg className={`w-5 h-5 text-gray-400 hover:text-white ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${isPending
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse'
                            : isActive
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-gray-800 text-gray-400 border-gray-700'
                            }`}>
                            {isPending ? 'ACTIVATING...' : (isActive ? (isTrialing ? 'TRIAL ACTIVE' : 'ACTIVE') : 'INACTIVE')}
                        </span>
                        {(isActive || isPending) && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {planName}
                            </span>
                        )}
                    </div>
                </div>

                {isPending ? (
                    <div className="text-center py-6 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <svg className="animate-spin h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-yellow-400 font-medium">Payment Received!</p>
                        </div>
                        <p className="text-gray-300 text-sm">{statusMessage || 'Activating your subscription...'}</p>
                        <p className="text-gray-500 text-xs mt-2">This usually takes a few seconds</p>
                    </div>
                ) : isActive ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Plan</p>
                            <p className="text-white font-semibold text-lg">{planName}</p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                                {isTrialing ? 'Trial Ends In' : 'Renews In'}
                            </p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-white font-semibold text-lg">
                                    {displayDays} Days
                                </p>
                                <span className="text-gray-500 text-xs">
                                    {new Date(actualEndDate).toLocaleDateString()}
                                </span>
                            </div>
                            {/* Show bonus months info in renewal */}
                            {!isTrialing && bonusMonths > 0 && (
                                <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {billingPeriod * 30} days paid + {bonusMonths * 30} bonus = {totalMonths * 30} total days
                                </p>
                            )}
                        </div>

                        {/* Bonus Months Display */}
                        {bonusMonths > 0 && (
                            <div className="md:col-span-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-green-300 font-semibold text-sm">
                                            +{bonusMonths} {bonusMonths === 1 ? 'Month' : 'Months'} FREE Bonus
                                        </p>
                                        <p className="text-gray-400 text-xs mt-0.5">
                                            You're getting {totalMonths} months for the price of {billingPeriod}!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-gray-800/30 rounded-lg border border-gray-700/30 border-dashed">
                        <p className="text-gray-300 mb-4">You are currently on the free plan.</p>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-600/20"
                        >
                            Upgrade to Pro
                        </Link>
                    </div>
                )}
            </div>
        </div >
    );
};

export default SubscriptionStatus;

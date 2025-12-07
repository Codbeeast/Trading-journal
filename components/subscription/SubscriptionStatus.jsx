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

    const isTrailing = subscription?.isInTrial;
    const isActive = subscription?.hasAccess;
    const daysRemaining = subscription?.daysRemaining;
    const planName = subscription?.planType ? subscription.planType.replace('_', ' ') + ' PLAN' : 'FREE PLAN';

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
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${isActive
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                            }`}>
                            {isActive ? (isTrailing ? 'TRIAL ACTIVE' : 'ACTIVE') : 'INACTIVE'}
                        </span>
                        {isActive && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {planName}
                            </span>
                        )}
                    </div>
                </div>

                {isActive ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Plan</p>
                            <p className="text-white font-semibold text-lg">{planName}</p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                                {isTrailing ? 'Trial Ends In' : 'Renews In'}
                            </p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-white font-semibold text-lg">{daysRemaining} Days</p>
                                <span className="text-gray-500 text-xs">
                                    {new Date(subscription?.currentPeriodEnd).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
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
        </div>
    );
};

export default SubscriptionStatus;

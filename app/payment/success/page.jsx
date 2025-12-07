'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Success Card */}
                <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-8 md:p-12 border border-green-500/30 shadow-2xl">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl"></div>
                            <div className="relative bg-green-500/10 rounded-full p-6 border border-green-500/30">
                                <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Welcome Aboard! 🎉
                        </h1>
                        <p className="text-xl text-gray-300 mb-2">
                            Your subscription is now active
                        </p>
                        <p className="text-gray-400">
                            You now have full access to all premium features
                        </p>
                    </div>

                    {/* Trial Info */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-500/20 rounded-full p-3">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">7-Day Free Trial Started</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Explore all features without any charges for the next 7 days. Your payment method will be charged automatically after the trial period ends.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What's Next */}
                    <div className="bg-black/50 rounded-xl p-6 mb-8 border border-blue-500/20">
                        <h3 className="text-lg font-semibold text-white mb-4">What&apos;s Next?</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-gray-300">Access your trading journal and start logging trades</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-gray-300">Explore AI-powered trade analysis and insights</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-gray-300">Track your performance with advanced analytics</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/dashboard"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg text-center"
                            style={{
                                backgroundColor: 'rgb(41, 52, 255)',
                                boxShadow: 'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px'
                            }}
                        >
                            Go to Dashboard
                        </Link>
                        <Link
                            href="/profile"
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 text-center border border-gray-700"
                        >
                            View Subscription
                        </Link>
                    </div>

                    {/* Support Link */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400">
                            Need help? <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">Contact Support</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

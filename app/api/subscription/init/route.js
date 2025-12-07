// app/api/subscription/init/route.js
// This endpoint auto-initializes plans on first access
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Plan from '@/models/Plan';

export async function GET(request) {
    try {
        await connectDB();

        // Check if plans exist
        const existingPlans = await Plan.countDocuments();

        if (existingPlans === 0) {
            // Auto-initialize plans if they don't exist
            const plansData = [
                {
                    planId: '1_MONTH',
                    name: 'Monthly Plan',
                    description: 'Perfect for traders who want to try our platform month by month',
                    razorpayPlanId: process.env.RAZORPAY_PLAN_1_MONTH || 'plan_monthly_placeholder',
                    amount: 599,
                    currency: 'INR',
                    billingCycle: 'monthly',
                    billingPeriod: 1,
                    bonusMonths: 0,
                    totalMonths: 1,
                    monthlyEquivalent: 599,
                    savingsPercentage: 0,
                    features: [
                        { name: 'Full trading journal access', included: true },
                        { name: 'Advanced analytics & insights', included: true },
                        { name: 'AI-powered trade assistant', included: true },
                        { name: 'Performance tracking', included: true },
                        { name: 'Psychology analysis', included: true },
                        { name: '7-day free trial', included: true },
                    ],
                    isPopular: false,
                    displayOrder: 1,
                    isActive: true,
                    trialDays: 7
                },
                {
                    planId: '6_MONTHS',
                    name: '6 Months Plan',
                    description: 'Best for committed traders - get 1 month free!',
                    razorpayPlanId: process.env.RAZORPAY_PLAN_6_MONTHS || 'plan_6months_placeholder',
                    amount: 2999,
                    currency: 'INR',
                    billingCycle: 'half_yearly',
                    billingPeriod: 6,
                    bonusMonths: 1,
                    totalMonths: 7,
                    monthlyEquivalent: 428,
                    savingsPercentage: 28,
                    features: [
                        { name: 'Full trading journal access', included: true },
                        { name: 'Advanced analytics & insights', included: true },
                        { name: 'AI-powered trade assistant', included: true },
                        { name: 'Performance tracking', included: true },
                        { name: 'Psychology analysis', included: true },
                        { name: '1 bonus month FREE', included: true },
                        { name: '7-day free trial', included: true },
                    ],
                    isPopular: true,
                    displayOrder: 2,
                    isActive: true,
                    trialDays: 7
                },
                {
                    planId: '12_MONTHS',
                    name: 'Yearly Plan',
                    description: 'Maximum value for serious traders - get 2 months free!',
                    razorpayPlanId: process.env.RAZORPAY_PLAN_12_MONTHS || 'plan_12months_placeholder',
                    amount: 5990,
                    currency: 'INR',
                    billingCycle: 'yearly',
                    billingPeriod: 12,
                    bonusMonths: 2,
                    totalMonths: 14,
                    monthlyEquivalent: 428,
                    savingsPercentage: 29,
                    features: [
                        { name: 'Full trading journal access', included: true },
                        { name: 'Advanced analytics & insights', included: true },
                        { name: 'AI-powered trade assistant', included: true },
                        { name: 'Performance tracking', included: true },
                        { name: 'Psychology analysis', included: true },
                        { name: 'Priority support', included: true },
                        { name: '2 bonus months FREE', included: true },
                        { name: '7-day free trial', included: true },
                    ],
                    isPopular: false,
                    displayOrder: 3,
                    isActive: true,
                    trialDays: 7
                }
            ];

            await Plan.insertMany(plansData);

            return NextResponse.json({
                success: true,
                initialized: true,
                message: 'Plans auto-initialized successfully'
            });
        }

        return NextResponse.json({
            success: true,
            initialized: false,
            message: 'Plans already exist'
        });

    } catch (error) {
        console.error('Auto-init error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

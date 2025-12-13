// app/api/subscription/init-plans/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Plan from '@/models/Plan';

// Plan configurations
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
            { name: 'Full trading journal access', description: 'Track unlimited trades', included: true },
            { name: 'Advanced analytics & insights', description: 'Detailed performance metrics', included: true },
            { name: 'AI-powered trade assistant', description: 'Get intelligent trade suggestions', included: true },
            { name: 'Performance tracking', description: 'Monitor your progress over time', included: true },
            { name: 'Psychology analysis', description: 'Understand your trading mindset', included: true },
            { name: '7-day free trial', description: 'Try before you subscribe', included: true },
        ],
        isPopular: false,
        displayOrder: 1,
        isActive: true,
        trialDays: 7
    },
    {
        planId: '6_MONTHS',
        name: '6 Months Plan',
        description: 'Best for committed traders',
        razorpayPlanId: process.env.RAZORPAY_PLAN_6_MONTHS || 'plan_6months_dev',
        amount: 2999,
        currency: 'INR',
        billingCycle: 'half_yearly',
        billingPeriod: 6,
        bonusMonths: 0,
        totalMonths: 6,
        monthlyEquivalent: 499,
        savingsPercentage: 17,
        features: [
            { name: 'Full trading journal access', description: 'Track all your trades in one place', included: true },
            { name: 'Advanced analytics & insights', description: 'Understand your trading patterns', included: true },
            { name: 'AI-powered trade assistant', description: 'Get intelligent trading suggestions', included: true },
            { name: 'Performance tracking', description: 'Monitor your progress over time', included: true },
            { name: 'Psychology analysis', description: 'Understand your trading psychology', included: true },
            { name: '7-day free trial', description: 'Try before you commit', included: true },
        ],
        isPopular: true,
        displayOrder: 2,
        isActive: true,
        trialDays: 7
    },
    {
        planId: '12_MONTHS',
        name: 'Yearly Plan',
        description: 'Maximum value for serious traders',
        razorpayPlanId: process.env.RAZORPAY_PLAN_12_MONTHS || 'plan_12months_dev',
        amount: 5990,
        currency: 'INR',
        billingCycle: 'yearly',
        billingPeriod: 12,
        bonusMonths: 0,
        totalMonths: 12,
        monthlyEquivalent: 499,
        savingsPercentage: 17,
        features: [
            { name: 'Full trading journal access', description: 'Track all your trades in one place', included: true },
            { name: 'Advanced analytics & insights', description: 'Understand your trading patterns', included: true },
            { name: 'AI-powered trade assistant', description: 'Get intelligent trading suggestions', included: true },
            { name: 'Performance tracking', description: 'Monitor your progress over time', included: true },
            { name: 'Psychology analysis', description: 'Understand your trading psychology', included: true },
            { name: 'Priority support', description: 'Get help when you need it', included: true },
            { name: '7-day free trial', description: 'Try before you commit', included: true },
        ],
        isPopular: false,
        displayOrder: 3,
        isActive: true,
        trialDays: 7
    }
];

export async function POST(request) {
    try {
        await connectDB();

        const results = [];

        for (const planData of plansData) {
            // Check if plan already exists
            const existingPlan = await Plan.findOne({ planId: planData.planId });

            if (existingPlan) {
                // Update existing plan
                const updatedPlan = await Plan.findOneAndUpdate(
                    { planId: planData.planId },
                    planData,
                    { new: true }
                );
                results.push({ planId: planData.planId, action: 'updated', plan: updatedPlan });
            } else {
                // Create new plan
                const newPlan = await Plan.create(planData);
                results.push({ planId: planData.planId, action: 'created', plan: newPlan });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Plans initialized successfully',
            results,
            summary: {
                monthly: `₹${plansData[0].amount}`,
                sixMonths: `₹${plansData[1].amount} (₹${plansData[1].monthlyEquivalent}/month + 1 free month)`,
                yearly: `₹${plansData[2].amount} (₹${plansData[2].monthlyEquivalent}/month + 2 free months)`
            }
        });

    } catch (error) {
        console.error('Error initializing plans:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to initialize plans'
            },
            { status: 500 }
        );
    }
}

// GET endpoint to check if plans are initialized
export async function GET(request) {
    try {
        await connectDB();

        const plans = await Plan.find({}).sort({ displayOrder: 1 });

        return NextResponse.json({
            success: true,
            initialized: plans.length > 0,
            plansCount: plans.length,
            plans: plans.map(p => ({
                planId: p.planId,
                name: p.name,
                amount: p.amount,
                isActive: p.isActive
            }))
        });

    } catch (error) {
        console.error('Error checking plans:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}

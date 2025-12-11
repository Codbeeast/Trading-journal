// app/api/user/init-trial/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createTrialSubscription, isTrialEligible } from '@/lib/subscription';

/**
 * Auto-create trial subscription for new users
 * This endpoint should be called once after user signs up
 */
export async function POST(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is eligible for trial
        const eligible = await isTrialEligible(userId);

        if (!eligible) {
            return NextResponse.json({
                success: false,
                message: 'Trial already used or subscription exists'
            });
        }

        // Create trial subscription
        try {
            const trialSubscription = await createTrialSubscription(userId);

            return NextResponse.json({
                success: true,
                message: '7-day free trial activated',
                subscription: {
                    status: trialSubscription.status,
                    trialEndDate: trialSubscription.trialEndDate,
                    daysRemaining: 7
                }
            });
        } catch (createError) {
            // If trial creation fails (e.g., already used), return gracefully
            if (createError.message.includes('Trial already used')) {
                return NextResponse.json({
                    success: false,
                    message: 'Trial already activated'
                });
            }
            throw createError;
        }

    } catch (error) {
        console.error('Trial initialization error:', error);
        return NextResponse.json(
            {
                error: 'Failed to initialize trial',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

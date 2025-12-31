// app/api/chat/usage/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

const MONTHLY_LIMIT = 50;

/**
 * Helper function to get current month string
 */
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Helper function to get next reset date (1st of next month)
 */
function getNextResetDate() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth;
}

/**
 * Reset user's chat usage if we're in a new month
 */
async function resetIfNewMonth(user) {
    const currentMonth = getCurrentMonth();

    if (!user.chatUsage || user.chatUsage.currentMonth !== currentMonth) {
        const now = new Date();
        user.chatUsage = {
            monthlyPromptCount: 0,
            lastResetDate: new Date(now.getFullYear(), now.getMonth(), 1),
            currentMonth: currentMonth
        };
        await user.save();
        console.log(`[Chat Limit] Reset usage for user ${user._id} for month ${currentMonth}`);
    }

    return user;
}

/**
 * GET endpoint to fetch user's chat usage statistics
 * Query params: userId (required)
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId is required' },
                { status: 400 }
            );
        }

        await connectDB();

        let user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if we need to reset for new month
        user = await resetIfNewMonth(user);

        const promptsUsed = user.chatUsage?.monthlyPromptCount || 0;
        const promptsRemaining = Math.max(0, MONTHLY_LIMIT - promptsUsed);
        const resetDate = getNextResetDate();

        return NextResponse.json({
            success: true,
            data: {
                promptsUsed,
                promptsRemaining,
                monthlyLimit: MONTHLY_LIMIT,
                resetDate: resetDate.toISOString(),
                currentMonth: getCurrentMonth(),
                limitReached: promptsUsed >= MONTHLY_LIMIT
            }
        });

    } catch (error) {
        console.error('[Chat Usage API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

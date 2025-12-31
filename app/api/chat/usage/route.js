import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ChatLimit from '@/models/ChatLimit';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        await connectDB();

        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        let limitDoc = await ChatLimit.findOne({ userId });

        if (!limitDoc) {
            // Return default values if no document exists yet (don't create one just for a read, unless we want to being strict)
            // Usually better to just show defaults or create if likely to use.
            // Let's return defaults that match a fresh user.
            return NextResponse.json({
                success: true,
                data: {
                    promptsUsed: 0,
                    promptsRemaining: 50,
                    monthlyLimit: 50,
                    limitReached: false
                }
            });
        }

        // Check if month needs reset (visual only, actual reset happens on write)
        // Or we should mimic the logic in verify
        let promptsUsed = limitDoc.promptsUsed;
        if (limitDoc.currentMonth !== currentMonthStr) {
            promptsUsed = 0;
        }

        const promptsRemaining = Math.max(0, limitDoc.monthlyLimit - promptsUsed);

        console.log(`[Usage API] User: ${userId} | Used: ${promptsUsed} | Limit: ${limitDoc.monthlyLimit} | Remaining: ${promptsRemaining}`);

        return NextResponse.json({
            success: true,
            data: {
                promptsUsed: promptsUsed,
                promptsRemaining: promptsRemaining,
                monthlyLimit: limitDoc.monthlyLimit,
                limitReached: promptsRemaining <= 0
            }
        });

    } catch (error) {
        console.error('Error fetching chat usage:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

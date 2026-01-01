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
            // Return default values if no document exists yet
            return NextResponse.json({
                success: true,
                data: {
                    promptsUsed: 0,
                    promptsRemaining: 60,
                    monthlyLimit: 60,
                    limitReached: false
                }
            });
        }

        // AUTO-MIGRATION: Upgrade users from old limit (50) to new limit (60)
        const NEW_MONTHLY_LIMIT = 60;
        if (limitDoc.monthlyLimit < NEW_MONTHLY_LIMIT) {
            console.log(`[Usage API] Migrating user ${userId} from limit ${limitDoc.monthlyLimit} to ${NEW_MONTHLY_LIMIT}`);
            limitDoc.monthlyLimit = NEW_MONTHLY_LIMIT;
            await limitDoc.save();
        }

        // Check if month needs reset
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
                // Safety check: only mark as reached if remaining is actually 0 or less
                limitReached: promptsRemaining <= 0 && promptsUsed >= limitDoc.monthlyLimit
            }
        });

    } catch (error) {
        console.error('Error fetching chat usage:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

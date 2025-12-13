// app/api/subscription/status/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getSubscriptionStatus } from '@/lib/subscription';

export async function GET(request) {
    try {
        // Authenticate user
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get subscription status
        const status = await getSubscriptionStatus(userId);

        return NextResponse.json(
            {
                success: true,
                ...status
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }
        );

    } catch (error) {
        console.error('Error fetching subscription status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch subscription status' },
            { status: 500 }
        );
    }
}

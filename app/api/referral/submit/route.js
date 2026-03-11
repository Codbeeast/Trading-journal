// app/api/referral/submit/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Referral from '@/models/Referral';

export const runtime = 'nodejs';

/**
 * POST /api/referral/submit
 * Called by the frontend when a user submits a referral code.
 * Creates a PENDING Referral record and updates the referrer's stats.
 */
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { referralCode } = body;

        if (!referralCode || referralCode.trim().length < 4) {
            return NextResponse.json(
                { success: false, message: 'Please enter a valid referral code.' },
                { status: 400 }
            );
        }

        const code = referralCode.trim();

        await connectDB();

        // 1. Check if this user already has a referrer (prevent duplicate submissions)
        const currentUser = await User.findById(userId).lean();
        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: 'Your account is not yet synced. Please try again in a moment.' },
                { status: 404 }
            );
        }

        if (currentUser.referredBy?.clerkUserId) {
            return NextResponse.json(
                { success: false, message: 'You have already submitted a referral code.' },
                { status: 409 }
            );
        }

        // 2. Find the referrer by their referral code
        const referrer = await User.findOne({ referralCode: code }).lean();
        if (!referrer) {
            return NextResponse.json(
                { success: false, message: 'Referral code not found. Please check and try again.' },
                { status: 404 }
            );
        }

        // 3. Prevent self-referral
        if (referrer._id === userId) {
            return NextResponse.json(
                { success: false, message: 'You cannot use your own referral code.' },
                { status: 400 }
            );
        }

        // 4. Check if a referral record already exists (edge case)
        const existingReferral = await Referral.findOne({
            referrerId: referrer._id,
            referredUserId: userId,
        }).lean();

        if (existingReferral) {
            return NextResponse.json(
                { success: false, message: 'This referral has already been recorded.' },
                { status: 409 }
            );
        }

        // 5. Link the referrer on the current user
        await User.findByIdAndUpdate(userId, {
            $set: {
                referredBy: {
                    clerkUserId: referrer._id,
                    referralCode: code
                }
            }
        });

        // 6. Create a PENDING referral record
        await Referral.create({
            referrerId: referrer._id,
            referredUserId: userId,
            referralCode: code,
            status: 'PENDING'
        });

        // 7. Increment the referrer's stats
        await User.findByIdAndUpdate(referrer._id, {
            $inc: {
                'referralStats.total': 1,
                'referralStats.pending': 1
            }
        });

        console.log(`✅ Referral submitted: ${userId} referred by ${referrer._id} (code: ${code})`);

        return NextResponse.json({
            success: true,
            message: 'Referral code applied successfully!',
            referrerName: referrer.firstName || 'Your referrer',
        });

    } catch (error) {
        console.error('POST /api/referral/submit error:', error);
        return NextResponse.json(
            { success: false, message: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/referral/submit
 * Check if the current user has already submitted a referral code.
 */
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(userId).select('referredBy').lean();

        return NextResponse.json({
            hasReferrer: !!user?.referredBy?.clerkUserId,
        });

    } catch (error) {
        console.error('GET /api/referral/submit error:', error);
        return NextResponse.json({ hasReferrer: false });
    }
}

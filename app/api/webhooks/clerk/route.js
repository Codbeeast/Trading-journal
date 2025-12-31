// app/api/webhooks/clerk/route.js

import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { connectDB } from '@/lib/db';

import Leaderboard from '@/models/Leaderboard';
import User from '@/models/User';

export const runtime = 'nodejs';

// Helper to pick the primary email
function getPrimaryEmail(data) {
  const primaryId = data.primary_email_address_id;
  const emails = data.email_addresses || [];
  const primary = emails.find(e => e.id === primaryId)?.email_address;
  return (primary || emails[0]?.email_address || '').toLowerCase();
}

export async function POST(req) {
  try {
    // 1. Validate Headers & Payload immediately
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ success: false, message: 'Missing CLERK_WEBHOOK_SECRET' }, { status: 500 });
    }

    const svixId = req.headers.get('svix-id');
    const svixTs = req.headers.get('svix-timestamp');
    const svixSig = req.headers.get('svix-signature');

    if (!svixId || !svixTs || !svixSig) {
      return NextResponse.json({ success: false, message: 'Missing Svix signature headers' }, { status: 400 });
    }

    const payload = await req.text();
    const wh = new Webhook(secret);

    try {
      wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTs,
        'svix-signature': svixSig,
      });
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Invalid Svix signature' }, { status: 400 });
    }

    // 2. Parse Event & Connect DB
    const { type, data } = JSON.parse(payload);
    await connectDB();

    // 3. Handle Events with Parallel Execution
    const userId = data.id;

    if (type === 'user.created' || type === 'user.updated') {
      const email = getPrimaryEmail(data);
      const username = data.username || `user_${userId.slice(-8)}`;
      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      const fullName = data.full_name || `${firstName} ${lastName}`.trim() || username;
      const imageUrl = data.image_url || '';

      // Prepare User update (upsert)
      const userUpdate = {
        $set: {
          email,
          username,
          firstName,
          lastName,
          imageUrl,
        },
        $setOnInsert: {
          chatUsage: {
            monthlyPromptCount: 0,
            lastResetDate: new Date(), // Will be adjusted by default function if needed, but passing explicit date is safer
            currentMonth: new Date().toISOString().slice(0, 7)
          }
        }
      };

      // Prepare Leaderboard update (upsert)
      const leaderboardUpdate = {
        $set: {
          username: fullName,
          imageUrl: imageUrl,
        },
        $setOnInsert: {
          currentStreak: 0,
          highestStreak: 0,
          lastLogin: new Date(),
          streakHistory: [],
          milestones: [],
          achievedMilestones: []
        }
      };

      // Execute in parallel
      await Promise.all([
        User.findByIdAndUpdate(userId, userUpdate, { upsert: true, new: true }),
        Leaderboard.findOneAndUpdate({ userId }, leaderboardUpdate, { upsert: true, new: true })
      ]);

      console.log(`✅ Synced User & Leaderboard for: ${userId} (${type})`);
      return NextResponse.json({ success: true, message: `Synced user ${userId}` });
    }

    if (type === 'user.deleted') {
      // Execute deletions in parallel
      await Promise.all([
        User.findByIdAndDelete(userId),
        Leaderboard.findOneAndDelete({ userId })
      ]);

      console.log(`🗑️ Deleted User & Leaderboard for: ${userId}`);
      return NextResponse.json({ success: true, message: `Deleted user ${userId}` });
    }

    // Ignore other events
    return NextResponse.json({ success: true, message: `Ignored event: ${type}` });

  } catch (err) {
    console.error('❌ Clerk webhook error:', err);
    // Return 500 to trigger Clerk retry
    return NextResponse.json({ success: false, message: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}

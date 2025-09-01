// app/api/webhooks/clerk/route.js

import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { connectDB } from '@/lib/db';
import Leaderboard from '@/models/Leaderboard';

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
    await connectDB();

    // Retrieve and verify Svix headers
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    const svixId = req.headers.get('svix-id');
    const svixTs = req.headers.get('svix-timestamp');
    const svixSig = req.headers.get('svix-signature');

    if (!secret) {
      return NextResponse.json(
        { success: false, message: 'Missing CLERK_WEBHOOK_SECRET' },
        { status: 500 }
      );
    }
    if (!svixId || !svixTs || !svixSig) {
      return NextResponse.json(
        { success: false, message: 'Missing Svix signature headers' },
        { status: 400 }
      );
    }

    // Read raw body for signature verification
    const payload = await req.text();
    new Webhook(secret).verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTs,
      'svix-signature': svixSig,
    });

    const { type, data } = JSON.parse(payload);

    switch (type) {
      case 'user.created': {
        const userData = {
          userId: data.id,
          username: data.full_name || `${data.first_name} ${data.last_name}` || data.username || `Trader ${data.id.slice(-4)}`,
          imageUrl: data.image_url || '',
          currentStreak: 0,
          highestStreak: 0,
          lastLogin: new Date(),
          streakHistory: [],
          milestones: [],
          achievedMilestones: []
        };
        
        // Use upsert to avoid duplicate key errors
        await Leaderboard.findOneAndUpdate(
          { userId: data.id },
          userData,
          { upsert: true, new: true }
        );
        
        console.log(`User created in leaderboard: ${data.id}`);
        return NextResponse.json({
          success: true,
          message: 'User created and synced to leaderboard',
          userId: data.id,
        });
      }

      case 'user.updated': {
        const updateData = {
          username: data.full_name || `${data.first_name} ${data.last_name}` || data.username || `Trader ${data.id.slice(-4)}`,
          imageUrl: data.image_url || '',
        };
        
        await Leaderboard.findOneAndUpdate(
          { userId: data.id },
          updateData,
          { new: true, upsert: true }
        );
        
        console.log(`User updated in leaderboard: ${data.id}`);
        return NextResponse.json({
          success: true,
          message: 'User updated and synced to leaderboard',
          userId: data.id,
        });
      }

      case 'user.deleted': {
        await Leaderboard.findOneAndDelete({ userId: data.id });
        console.log(`User deleted from leaderboard: ${data.id}`);
        return NextResponse.json({
          success: true,
          message: 'User deleted from leaderboard',
          userId: data.id,
        });
      }

      default: {
        // Ignore other events
        return NextResponse.json({
          success: true,
          message: `Event ignored: ${type}`,
        });
      }
    }
  } catch (err) {
    console.error('Clerk webhook error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Webhook processing failed' },
      { status: 400 }
    );
  }
}

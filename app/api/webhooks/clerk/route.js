// app/api/webhooks/clerk/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Webhook } from 'svix';
import User from '@/models/User';

// Optional: ensure Node runtime (not edge) if needed
export const runtime = 'nodejs';

// Simple cached DB connect (adjust URI var name as needed)
let cached = global.mongooseConn;
async function dbConnect() {
  if (!cached) {
    cached = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || undefined,
    });
    global.mongooseConn = cached;
  }
  await cached;
}

function getPrimaryEmail(data) {
  const primaryId = data.primary_email_address_id;
  const emails = data.email_addresses || [];
  const primary = emails.find(e => e.id === primaryId)?.email_address;
  const fallback = emails[0]?.email_address;
  return (primary || fallback || '').toLowerCase();
}

async function upsertUserFromClerk(data) {
  const doc = {
    _id: data.id,
    email: getPrimaryEmail(data),
    username: data.username ?? null,        // schema setter turns empty strings into null
    firstName: data.first_name ?? '',
    lastName: data.last_name ?? '',
    imageUrl: data.image_url ?? '',
  };

  try {
    return await User.findByIdAndUpdate(
      data.id,
      { $set: doc },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
  } catch (err) {
    // Handle duplicate username gracefully by nulling it and retrying once
    if (err?.code === 11000 && err?.keyPattern?.username) {
      return await User.findByIdAndUpdate(
        data.id,
        { $set: { ...doc, username: null } },
        { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
      );
    }
    throw err;
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, message: 'Missing CLERK_WEBHOOK_SECRET' },
        { status: 500 }
      );
    }

    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { success: false, message: 'Missing Svix signature headers' },
        { status: 400 }
      );
    }

    const payload = await req.text(); // raw body string is required for verification
    const webhook = new Webhook(secret);

    // Verify signature
    webhook.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });

    // Parse the event
    const evt = JSON.parse(payload);
    const { type, data } = evt;

    switch (type) {
      case 'user.created': {
        const user = await upsertUserFromClerk(data);
        return NextResponse.json({
          success: true,
          message: 'User created/synced',
          userId: user._id,
        });
      }
      case 'user.updated': {
        const user = await upsertUserFromClerk(data);
        return NextResponse.json({
          success: true,
          message: 'User updated/synced',
          userId: user._id,
        });
      }
      case 'user.deleted': {
        await User.findByIdAndDelete(data.id);
        return NextResponse.json({
          success: true,
          message: 'User deleted',
          userId: data.id,
        });
      }
      default: {
        // No-op for events you don't care about
        return NextResponse.json({
          success: true,
          message: `Event ignored: ${type}`,
        });
      }
    }
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
// app/api/webhooks/clerk/route.js

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Webhook } from 'svix';
import User from '@/models/User';

export const runtime = 'nodejs';

// Simple cached DB connect
let cached = global.mongooseConn;
async function dbConnect() {
  if (!cached) {
    cached = mongoose.connect(process.env.MONGODB_URI, {
      dbName: "ForeNotes",
    });
    global.mongooseConn = cached;
  }
  await cached;
}

// Helper to pick the primary email
function getPrimaryEmail(data) {
  const primaryId = data.primary_email_address_id;
  const emails = data.email_addresses || [];
  const primary = emails.find(e => e.id === primaryId)?.email_address;
  return (primary || emails[0]?.email_address || '').toLowerCase();
}

export async function POST(req) {
  try {
    await dbConnect();

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
          _id: data.id,
          email: getPrimaryEmail(data),
          username: `${data.first_name} ${data.last_name}`,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        return NextResponse.json({
          success: true,
          message: 'User created and synced',
          userId: data.id,
        });
      }

      case 'user.updated': {
        const userData = {
          email: getPrimaryEmail(data),
          username: `${data.first_name} ${data.last_name}`,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData, {
          new: true,
          runValidators: true,
        });
        return NextResponse.json({
          success: true,
          message: 'User updated and synced',
          userId: data.id,
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

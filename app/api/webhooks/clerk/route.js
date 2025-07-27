// app/api/webhooks/clerk/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  await connectDB();
  const payload = await req.json();

  const eventType = payload.type;
  const user = payload.data;

  try {
    if (eventType === 'user.created') {
      await User.create({
        clerkId: user.id,
        email: user.email_addresses?.[0]?.email_address,
        firstName: user.first_name,
        lastName: user.last_name,
        imageUrl: user.image_url,
      });
    }

    if (eventType === 'user.deleted') {
      await User.findOneAndDelete({ clerkId: user.id });
    }

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
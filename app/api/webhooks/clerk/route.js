// app/api/webhooks/clerk/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { verifyWebhookSignature } from '@clerk/clerk-sdk-node';

export async function POST(req) {
  await connectDB();

  const rawBody = await req.text(); 
  const signature = req.headers.get('Clerk-Signature');

  try {
    const payload = verifyWebhookSignature({
      secret: process.env.CLERK_WEBHOOK_SECRET,
      payload: rawBody,
      signature,
    });

    const eventType = payload.type;
    const user = payload.data;

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

    return NextResponse.json({ message: 'Webhook verified and processed' }, { status: 200 });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 403 });
  }
}
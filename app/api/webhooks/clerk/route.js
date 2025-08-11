import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req) {
  if (!webhookSecret) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // --- STANDARD WEBHOOK VERIFICATION ---
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(webhookSecret);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 });
  }
  // --- END WEBHOOK VERIFICATION ---

  const eventType = evt.type;
  console.log(`Received webhook event: ${eventType}`);

  // --- HANDLE THE WEBHOOK EVENT WITH MONGOOSE ---

  try {
    // Connect to the database
    await dbConnect();

    if (eventType === 'user.created') {
      const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

      await User.create({
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
      });

      return NextResponse.json({ message: 'User created' }, { status: 201 });
    }

    if (eventType === 'user.updated') {
      const { id, image_url, first_name, last_name, username } = evt.data;

      await User.findOneAndUpdate(
        { clerkId: id },
        {
          username: username,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        }
      );

       return NextResponse.json({ message: 'User updated' }, { status: 200 });
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      
      await User.findOneAndDelete({ clerkId: id });

      return NextResponse.json({ message: 'User deleted' }, { status: 200 });
    }

  } catch(error) {
      console.error("Error processing webhook:", error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Webhook received but not handled' }, { status: 200 });
}
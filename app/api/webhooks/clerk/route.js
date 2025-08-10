import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/lib/models/user.model'; // Make sure this path points to your user model

// --- DATABASE CONNECTION ---
// A reusable function to connect to MongoDB.
const connectToDB = async () => {
  // If a connection is already established, reuse it.
  if (mongoose.connection.readyState >= 1) {
    console.log('Reusing existing database connection.');
    return;
  }

  try {
    // Attempt to connect to the database using the URI from environment variables.
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'your_db_name', // IMPORTANT: Replace with your actual database name!
    });
    console.log('New database connection established.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // In a real-world app, you might want to throw the error or handle it more gracefully.
    throw new Error('Failed to connect to the database.');
  }
};

/**
 * This is the main function that handles incoming POST requests from Clerk's webhooks.
 * @param {Request} req The incoming request object from Next.js.
 */
export async function POST(req) {
  // You can find this in the Clerk Dashboard -> Webhooks -> your endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to your .env or .env.local file');
  }

  // --- 1. VERIFY THE INCOMING REQUEST ---

  // Get the headers required for verification
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If the required headers are missing, it's a bad request.
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the request body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers. If verification fails, an error will be thrown.
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // --- 2. PROCESS THE WEBHOOK EVENT ---

  // Get the type of event (e.g., "user.created", "user.updated")
  const eventType = evt.type;
  console.log(`Received webhook event: ${eventType}`);

  try {
    // Connect to the database before performing any operations
    await connectToDB();

    // --- Handle User Creation and Updates ---
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

      // This is the "UPSERT" operation. It's highly efficient.
      // It finds a document by `clerkId` and updates it.
      // If no document is found, it creates a new one (`upsert: true`).
      const user = await User.findOneAndUpdate(
        { clerkId: id },
        {
          $set: {
            clerkId: id,
            email: email_addresses[0].email_address,
            username: username,
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`${eventType === 'user.created' ? 'Created' : 'Updated'} user in DB: ${user._id}`);
      return NextResponse.json({ message: 'User processed successfully', user: user }, { status: 200 });
    }

    // --- Handle User Deletion ---
    if (eventType === 'user.deleted') {
      // For deleted users, we expect the full user object to be passed, but
      // Clerk might only send the ID. We only need the ID to delete.
      const { id } = evt.data;

      if (!id) {
        return NextResponse.json({ message: 'User ID missing for deletion' }, { status: 400 });
      }
      
      const deletedUser = await User.findOneAndDelete({ clerkId: id });

      if (deletedUser) {
        console.log(`Deleted user from DB: ${deletedUser._id}`);
        return NextResponse.json({ message: 'User deleted successfully', user: deletedUser }, { status: 200 });
      } else {
        // This can happen if the user was never created in your DB in the first place.
        console.log(`User with clerkId ${id} not found for deletion.`);
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
    }

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }

  // If the event type is not one we handle, we still return a 200 OK
  // to let Clerk know we received it successfully.
  return NextResponse.json({ message: 'Webhook received but not processed' }, { status: 200 });
}

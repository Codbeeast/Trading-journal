import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

/**
 * GET /api/profile
 * Fetches the logged-in user's profile from your MongoDB database.
 */
export async function GET(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const userProfile = await User.findOne({ clerkId: userId });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found in DB.' }, { status: 404 });
    }

    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/profile
 * Updates the logged-in user's profile in your MongoDB database.
 * This handles both Clerk fields and your custom schema fields.
 */
export async function PATCH(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const data = await req.json();

    // Find the user in your database and update it with the new data.
    // The `findOneAndUpdate` method is perfect for this.
    // The `new: true` option returns the document after the update.
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: data }, // Use $set to update only the fields provided in the request
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    // Handle potential validation errors from Mongoose
    if (error.name === 'ValidationError') {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/profile
 * Deletes the user from Clerk and from your MongoDB database.
 */
export async function DELETE(req) {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        // First, delete the user from your database
        const deletedDbUser = await User.findOneAndDelete({ clerkId: userId });

        if (!deletedDbUser) {
            // Even if not in DB, proceed to delete from Clerk
            console.warn(`User ${userId} not found in local DB, but proceeding to delete from Clerk.`);
        }

        // Then, delete the user from Clerk's systems
        await clerkClient.users.deleteUser(userId);

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

    } catch(error) {
        console.error("Error deleting account:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

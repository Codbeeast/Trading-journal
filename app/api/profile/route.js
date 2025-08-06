import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Profile from '@/models/Profile';
import Strategy from '@/models/Strategy'; // Import Strategy model for cascading delete
import { auth, clerkClient } from '@clerk/nextjs/server';

// --- PATCH (Update) a user's profile in MongoDB ---
export async function PATCH(req) {
  try {
    await connectDB();
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, username, imageUrl } = body;

    // Use `findOneAndUpdate` with `upsert: true` to create the profile if it doesn't exist, or update it if it does.
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { $set: { firstName, lastName, username, imageUrl } },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(updatedProfile);

  } catch (err) {
    console.error('PATCH /api/profile error:', err.message);
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
  }
}

// --- DELETE a user's account and all associated data ---
export async function DELETE(req) {
  try {
    await connectDB();
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Start a transaction for atomic deletion ---
    // This ensures all or none of the operations complete.
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Delete user's profile from MongoDB
      const deletedProfile = await Profile.findOneAndDelete({ userId }).session(session);
      if (!deletedProfile) {
        // Even if no local profile, proceed to delete from Clerk
        console.warn(`No local profile found for userId: ${userId}, but proceeding with Clerk deletion.`);
      }

      // 2. Delete all associated data (e.g., Strategies)
      await Strategy.deleteMany({ userId }).session(session);
      // Add other data models to delete here (e.g., Trades, Journals)
      // await Trade.deleteMany({ userId }).session(session);

      // 3. Delete the user from Clerk's system (this is irreversible)
      await clerkClient.users.deleteUser(userId);

      // If all operations succeed, commit the transaction
      await session.commitTransaction();

      return NextResponse.json({ success: true, message: 'Account deleted successfully' });

    } catch (transactionError) {
      // If any operation fails, abort the transaction
      await session.abortTransaction();
      throw transactionError; // Re-throw the error to be caught by the outer catch block
    } finally {
      session.endSession();
    }

  } catch (err) {
    console.error('DELETE /api/profile error:', err.message);
    return NextResponse.json({ message: 'Failed to delete account' }, { status: 500 });
  }
}

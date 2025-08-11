import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// Allowed profile fields for PATCH
const editableFields = ['bio', 'location', 'websiteUrl'];

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const userProfile = await User.findById(userId);
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found in DB.' }, { status: 404 });
    }

    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const updateData = await req.json();

    // Only update safe fields
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([key]) => editableFields.includes(key))
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: filteredData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    const status = error.name === 'ValidationError' ? 400 : 500;
    return NextResponse.json({ error: error.message || 'Server Error' }, { status });
  }
}

export async function DELETE() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const deletedDbUser = await User.findByIdAndDelete(userId);
    if (!deletedDbUser) {
      console.warn(`User ${userId} not found in DB, deleting from Clerk regardless.`);
    }

    await clerkClient.users.deleteUser(userId);

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
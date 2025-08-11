import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import User from '@/models/User';

// Runtime config
export const runtime = 'nodejs';

// Cached DB connection
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

// Validate URL format
function isValidUrl(string) {
  if (!string) return true;
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// GET: Fetch profile
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const user = await User.findById(userId).lean();
    if (!user) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    return NextResponse.json(user);
  } catch (err) {
    console.error('GET /profile error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update profile
export async function PATCH(req) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    await dbConnect();

    const updateData = {};

    // Clerk fields
    if (typeof body.firstName === 'string') updateData.firstName = body.firstName.trim();
    if (typeof body.lastName === 'string') updateData.lastName = body.lastName.trim();
    if (typeof body.imageUrl === 'string') updateData.imageUrl = body.imageUrl.trim();
    if ('username' in body) {
      updateData.username =
        typeof body.username === 'string' && body.username.trim() !== ''
          ? body.username.trim()
          : null;
    }

    // Custom fields
    if ('bio' in body) {
      const bio = typeof body.bio === 'string' ? body.bio.trim() : '';
      if (bio.length > 300)
        return NextResponse.json({ error: 'Bio must be 300 characters or less' }, { status: 400 });
      updateData.bio = bio;
    }

    if ('location' in body && typeof body.location === 'string')
      updateData.location = body.location.trim();

    if ('websiteUrl' in body) {
      const url = typeof body.websiteUrl === 'string' ? body.websiteUrl.trim() : '';
      if (url && !isValidUrl(url))
        return NextResponse.json({ error: 'Invalid website URL' }, { status: 400 });
      updateData.websiteUrl = url;
    }

    if ('email' in body && typeof body.email === 'string') {
      const email = body.email.toLowerCase().trim();
      if (!email.includes('@'))
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      updateData.email = email;
    }

    if (Object.keys(updateData).length === 0)
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });

    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        {
          new: true,
          runValidators: true,
          upsert: false,
        }
      ).lean();

      if (!updatedUser) {
        const newUser = new User({
          _id: userId,
          ...updateData,
          email: updateData.email || 'placeholder@example.com',
        });
        const savedUser = await newUser.save();
        return NextResponse.json(savedUser.toObject());
      }

      return NextResponse.json(updatedUser);
    } catch (err) {
      if (err?.code === 11000 && err?.keyPattern?.username) {
        return NextResponse.json(
          { error: 'Username already taken. Choose another.' },
          { status: 409 }
        );
      }

      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return NextResponse.json({ error: messages.join('. ') }, { status: 400 });
      }

      throw err;
    }
  } catch (error) {
    console.error('PATCH /profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

// DELETE: Remove profile
export async function DELETE() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true, message: 'Profile deleted successfully' });
  } catch (err) {
    console.error('DELETE /profile error:', err);
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }
}

// POST/PUT: Method not allowed
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed. Use PATCH.' }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed. Use PATCH.' }, { status: 405 });
}
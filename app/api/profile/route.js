// app/api/profile/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import User from '@/models/User';

// Ensure Node runtime
export const runtime = 'nodejs';

// Database connection with caching
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

// Helper function to validate URL format
function isValidUrl(string) {
  if (!string) return true; // Allow empty URLs
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// GET /api/profile - Fetch user profile
export async function GET(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId).lean();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Return the user profile data
    return NextResponse.json(user);

  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('PATCH /api/profile received data:', body);

    await dbConnect();

    // Validate the incoming data
    const updateData = {};

    // Handle Clerk-managed fields
    if (typeof body.firstName === 'string') {
      updateData.firstName = body.firstName.trim();
    }
    
    if (typeof body.lastName === 'string') {
      updateData.lastName = body.lastName.trim();
    }

    if ('username' in body) {
      // Convert empty string to null (as per schema)
      updateData.username = body.username && typeof body.username === 'string' 
        ? body.username.trim() 
        : null;
    }

    if (typeof body.imageUrl === 'string') {
      updateData.imageUrl = body.imageUrl.trim();
    }

    // Handle custom fields
    if ('bio' in body) {
      const bio = typeof body.bio === 'string' ? body.bio.trim() : '';
      if (bio.length > 300) {
        return NextResponse.json(
          { error: 'Bio must be 300 characters or less' },
          { status: 400 }
        );
      }
      updateData.bio = bio;
    }

    if ('location' in body) {
      updateData.location = typeof body.location === 'string' ? body.location.trim() : '';
    }

    if ('websiteUrl' in body) {
      const url = typeof body.websiteUrl === 'string' ? body.websiteUrl.trim() : '';
      if (url && !isValidUrl(url)) {
        return NextResponse.json(
          { error: 'Please provide a valid website URL' },
          { status: 400 }
        );
      }
      updateData.websiteUrl = url;
    }

    // Validate email if provided (should come from webhook, but just in case)
    if (body.email && typeof body.email === 'string') {
      const email = body.email.toLowerCase().trim();
      if (!email.includes('@')) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
      updateData.email = email;
    }

    console.log('Processed update data:', updateData);

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    try {
      // Update the user profile
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { 
          new: true, 
          runValidators: true,
          upsert: false // Don't create if doesn't exist
        }
      ).lean();

      if (!updatedUser) {
        // If user doesn't exist in database, create it with the update data
        // This handles the case where webhook hasn't created the user yet
        const newUser = new User({
          _id: userId,
          ...updateData,
          // Set required fields if not provided
          email: updateData.email || 'pending@update.com', // Temporary, webhook will update
        });

        const savedUser = await newUser.save();
        console.log('Created new user profile:', savedUser._id);
        
        return NextResponse.json(savedUser.toObject());
      }

      console.log('Updated user profile:', updatedUser._id);
      return NextResponse.json(updatedUser);

    } catch (mongoError) {
      console.error('MongoDB update error:', mongoError);

      // Handle duplicate username error
      if (mongoError.code === 11000 && mongoError.keyPattern?.username) {
        return NextResponse.json(
          { error: 'Username is already taken. Please choose a different one.' },
          { status: 409 }
        );
      }

      // Handle validation errors
      if (mongoError.name === 'ValidationError') {
        const errorMessages = Object.values(mongoError.errors).map(err => err.message);
        return NextResponse.json(
          { error: errorMessages.join('. ') },
          { status: 400 }
        );
      }

      throw mongoError; // Re-throw if not handled
    }

  } catch (error) {
    console.error('PATCH /api/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/profile - Delete user profile and account
export async function DELETE(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Delete the user from the database
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      console.warn(`Attempted to delete non-existent user: ${userId}`);
      // Don't return error - user might have been already deleted
    }

    console.log('User profile deleted:', userId);

    // Note: We don't delete from Clerk here because:
    // 1. The frontend handles Clerk account deletion via signOut()
    // 2. If we tried to delete from Clerk here, it would trigger the webhook
    //    which would try to delete from our DB again (already deleted)
    // 3. Clerk deletion should be handled on the frontend for better UX

    return NextResponse.json({ 
      success: true, 
      message: 'Profile deleted successfully' 
    });

  } catch (error) {
    console.error('DELETE /api/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}

// POST method not supported for this endpoint
export async function POST(request) {
  return NextResponse.json(
    { error: 'Method not allowed. Use PATCH to update profile.' },
    { status: 405 }
  );
}

// PUT method not supported for this endpoint  
export async function PUT(request) {
  return NextResponse.json(
    { error: 'Method not allowed. Use PATCH to update profile.' },
    { status: 405 }
  );
}
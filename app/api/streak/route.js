import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Leaderboard from '@/models/Leaderboard';
import { getAuth } from '@clerk/nextjs/server'; // ✅ Use getAuth for Route Handlers

// --- GET (Fetch) the leaderboard data ---
export async function GET(req) { // ✅ Add req parameter
  try {
    await connectDB();
    
    // ✅ FIX: Use getAuth(req) to reliably get the session from the incoming request.
    // This is the recommended way for Route Handlers.
    const { userId } = getAuth(req);
    if (!userId) {
      // This part is for securing the GET route if you only want logged-in users to see the leaderboard.
      // If the leaderboard should be public, you can remove this check.
      return NextResponse.json({ error: 'Unauthorized to view leaderboard' }, { status: 401 });
    }
    
    const leaderboardData = await Leaderboard.find({}).sort({ currentStreak: -1 });

    return NextResponse.json(leaderboardData);

  } catch (err) {
    console.error('GET /api/streak error:', err.message);
    return NextResponse.json({ message: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

// --- POST (Update) a user's streak ---
export async function POST(req) {
  try {
    await connectDB();
    
    // ✅ FIX: Use getAuth(req) instead of auth(). This is more reliable in API routes.
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { username, imageUrl } = await req.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day

    const user = await Leaderboard.findOne({ userId });

    if (user) {
      // User exists, update their streak
      const lastLogin = new Date(user.lastLogin);
      lastLogin.setHours(0, 0, 0, 0); // Normalize last login date

      const diffTime = today - lastLogin;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Logged in yesterday, increment streak
        user.currentStreak += 1;
      } else if (diffDays > 1) {
        // Missed a day, reset streak
        user.currentStreak = 1;
      }
      // If diffDays is 0, they already logged in today, do nothing.

      user.lastLogin = new Date();
      if (user.currentStreak > user.highestStreak) {
        user.highestStreak = user.currentStreak;
      }
      // Also update username and image in case they changed in Clerk
      user.username = username;
      user.imageUrl = imageUrl;
      
      await user.save();
      return NextResponse.json(user);

    } else {
      // New user, create their leaderboard entry
      const newUser = await Leaderboard.create({
        userId,
        username,
        imageUrl,
        currentStreak: 1,
        highestStreak: 1,
        lastLogin: new Date(),
      });
      return NextResponse.json(newUser, { status: 201 });
    }

  } catch (err) {
    console.error('POST /api/streak error:', err.message);
    return NextResponse.json({ message: 'Failed to update streak' }, { status: 500 });
  }
}

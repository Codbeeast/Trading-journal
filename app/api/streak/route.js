// app/api/streak/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Leaderboard from '@/models/Leaderboard';
import { auth } from '@clerk/nextjs/server';

// Convert days to weeks for achievement milestones
const convertDaysToWeeks = (days) => Math.floor(days / 5); // 5 trading days per week

// Weekly streak ranks (converted from days to weeks)
const weeklyStreakRanks = [
  { name: 'Trader Elite', minWeeks: 20, icon: '👑', theme: 'text-yellow-400' },
  { name: 'Market Surgeon', minWeeks: 15, icon: '🏆', theme: 'text-purple-400' },
  { name: 'Edge Builder', minWeeks: 10, icon: '⭐', theme: 'text-blue-400' },
  { name: 'Discipline Beast', minWeeks: 6, icon: '🔥', theme: 'text-red-400' },
  { name: 'Setup Sniper', minWeeks: 4, icon: '🎯', theme: 'text-orange-400' },
  { name: 'R-Master', minWeeks: 3, icon: '📊', theme: 'text-green-400' },
  { name: 'Breakout Seeker', minWeeks: 2, icon: '🚀', theme: 'text-teal-400' },
  { name: 'Zone Scout', minWeeks: 1, icon: '🔍', theme: 'text-cyan-400' },
  { name: 'Wick Watcher', minWeeks: 0, icon: '🕯️', theme: 'text-gray-400' },
  { name: 'Chart Rookie', minWeeks: 0, icon: '📈', theme: 'text-gray-500' },
];

// GET - Fetch the leaderboard data
export async function GET(req) {
  try {
    await connectDB();
    
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized to view leaderboard' }, { status: 401 });
    }
    
    const leaderboardData = await Leaderboard.find({})
      .sort({ currentStreak: -1 })
      .limit(100); // Limit to top 100 for performance

    // Add weekly streak rank to each user
    const enrichedData = leaderboardData.map(user => ({
      ...user.toObject(),
      weeklyStreakRank: getWeeklyStreakRank(user.currentWeekStreak || 0)
    }));

    return NextResponse.json({
      users: enrichedData,
      totalUsers: enrichedData.length
    });

  } catch (err) {
    console.error('GET /api/streak error:', err.message);
    return NextResponse.json({ 
      error: 'Failed to fetch leaderboard',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}

// POST - Update a user's streak
export async function POST(req) {
  try {
    await connectDB();
    
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { username, imageUrl } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day

    let user = await Leaderboard.findOne({ userId });

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

      // Update weekly streak achievements
      const currentWeekStreak = convertDaysToWeeks(user.currentStreak);
      user.currentWeekStreak = currentWeekStreak;
      if (currentWeekStreak > user.highestWeekStreak) {
        user.highestWeekStreak = currentWeekStreak;
      }

      user.lastLogin = new Date();
      if (user.currentStreak > user.highestStreak) {
        user.highestStreak = user.currentStreak;
      }
      
      // Update username and image in case they changed in Clerk
      user.username = username;
      user.imageUrl = imageUrl || user.imageUrl || '';
      
      await user.save();
      
      // Return user data with weekly streak rank
      const userWithRank = {
        ...user.toObject(),
        weeklyStreakRank: getWeeklyStreakRank(user.currentWeekStreak)
      };
      
      return NextResponse.json(userWithRank);

    } else {
      // New user, create their leaderboard entry
      const newUser = new Leaderboard({
        userId,
        username,
        imageUrl: imageUrl || '',
        currentStreak: 1,
        highestStreak: 1,
        currentWeekStreak: 0, // 0 weeks initially
        highestWeekStreak: 0,
        lastLogin: new Date(),
      });
      
      await newUser.save();
      
      // Return user data with weekly streak rank
      const userWithRank = {
        ...newUser.toObject(),
        weeklyStreakRank: getWeeklyStreakRank(newUser.currentWeekStreak)
      };
      
      return NextResponse.json(userWithRank, { status: 201 });
    }

  } catch (err) {
    console.error('POST /api/streak error:', err.message);
    return NextResponse.json({ 
      error: 'Failed to update streak',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}

// Helper function to get weekly streak rank
export function getWeeklyStreakRank(weekStreak) {
  return weeklyStreakRanks.find(rank => weekStreak >= rank.minWeeks) || weeklyStreakRanks[weeklyStreakRanks.length - 1];
}
'use client';

import { useEffect } from 'react';
// import { useUser } from '@clerk/nextjs'; // This is the real import for your project
import axios from 'axios';

// --- Mock Authentication Hook for Preview ---
// This placeholder allows the component to run in a preview environment.
const useUser = () => {
    return {
        isLoaded: true,
        user: {
            fullName: 'John Doe',
            username: 'johndoe',
            imageUrl: 'https://img.clerk.com/preview.png',
        },
        // FIX: Added getToken to the mock for consistency.
        getToken: async () => 'mock_jwt_token_for_preview',
    };
};

// Weekly streak ranks (converted from days to weeks)
const weeklyStreakRanks = [
  { name: 'Trader Elite', minWeeks: 20, icon: '👑', theme: 'text-yellow-400' }, // 100 days
  { name: 'Market Surgeon', minWeeks: 15, icon: '🏆', theme: 'text-purple-400' }, // 75 days
  { name: 'Edge Builder', minWeeks: 10, icon: '⭐', theme: 'text-blue-400' }, // 50 days
  { name: 'Discipline Beast', minWeeks: 6, icon: '🔥', theme: 'text-red-400' }, // 30 days
  { name: 'Setup Sniper', minWeeks: 4, icon: '🎯', theme: 'text-orange-400' }, // 20 days
  { name: 'R-Master', minWeeks: 3, icon: '📊', theme: 'text-green-400' }, // 15 days
  { name: 'Breakout Seeker', minWeeks: 2, icon: '🚀', theme: 'text-teal-400' }, // 10 days
  { name: 'Zone Scout', minWeeks: 1, icon: '🔍', theme: 'text-cyan-400' }, // 5 days
  { name: 'Wick Watcher', minWeeks: 0, icon: '🕯️', theme: 'text-gray-400' }, // 2+ days
  { name: 'Chart Rookie', minWeeks: 0, icon: '📈', theme: 'text-gray-500' }, // 0-1 days
];

const StreakUpdater = () => {
  // FIX: Destructure getToken from the useUser hook.
  const { user, isLoaded, getToken } = useUser();

  useEffect(() => {
    const updateStreak = async () => {
      if (user) {
        try {
          // FIX: Get the session token from Clerk.
          const token = await getToken();

          // FIX: Send the token in the Authorization header with the request.
          await axios.post('/api/streak', {
            username: user.fullName || user.username,
            imageUrl: user.imageUrl,
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (error) {
          console.error("Failed to update streak:", error);
        }
      }
    };

    // Only run this logic once when the user data is loaded
    if (isLoaded) {
      updateStreak();
    }
  }, [isLoaded, user, getToken]); // Added getToken to dependency array

  // This component doesn't render anything to the UI
  return null;
};

// Helper function to get weekly streak rank
export function getWeeklyStreakRank(weekStreak) {
  return weeklyStreakRanks.find(rank => weekStreak >= rank.minWeeks) || weeklyStreakRanks[weeklyStreakRanks.length - 1];
}

export default StreakUpdater;

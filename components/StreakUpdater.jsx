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
        // ✅ FIX: Added getToken to the mock for consistency.
        getToken: async () => 'mock_jwt_token_for_preview',
    };
};


const StreakUpdater = () => {
  // ✅ FIX: Destructure getToken from the useUser hook.
  const { user, isLoaded, getToken } = useUser();

  useEffect(() => {
    const updateStreak = async () => {
      if (user) {
        try {
          // ✅ FIX: Get the session token from Clerk.
          const token = await getToken();

          // ✅ FIX: Send the token in the Authorization header with the request.
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

export default StreakUpdater;

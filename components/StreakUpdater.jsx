'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { Calendar, Trophy, Target, Flame, Award, Star, TrendingUp, Search, Zap, BarChart3, Loader2, AlertCircle } from 'lucide-react';

// Daily streak ranks with proper icons and reasonable milestones
const dailyStreakRanks = [
  { name: 'Trader Elite', minDays: 100, icon: Trophy, theme: 'text-yellow-400', bgGradient: 'from-yellow-400 to-orange-500' },
  { name: 'Market Surgeon', minDays: 75, icon: Award, theme: 'text-purple-400', bgGradient: 'from-purple-400 to-pink-500' },
  { name: 'Edge Builder', minDays: 50, icon: Star, theme: 'text-blue-400', bgGradient: 'from-blue-400 to-cyan-500' },
  { name: 'Discipline Beast', minDays: 30, icon: Flame, theme: 'text-red-400', bgGradient: 'from-red-400 to-pink-500' },
  { name: 'Setup Sniper', minDays: 21, icon: Target, theme: 'text-orange-400', bgGradient: 'from-orange-400 to-red-500' },
  { name: 'R-Master', minDays: 14, icon: BarChart3, theme: 'text-green-400', bgGradient: 'from-green-400 to-emerald-500' },
  { name: 'Breakout Seeker', minDays: 10, icon: TrendingUp, theme: 'text-teal-400', bgGradient: 'from-teal-400 to-blue-500' },
  { name: 'Zone Scout', minDays: 7, icon: Search, theme: 'text-cyan-400', bgGradient: 'from-cyan-400 to-teal-500' },
  { name: 'Wick Watcher', minDays: 3, icon: Zap, theme: 'text-gray-400', bgGradient: 'from-gray-400 to-gray-600' },
  { name: 'Chart Rookie', minDays: 0, icon: Calendar, theme: 'text-gray-500', bgGradient: 'from-gray-500 to-gray-700' },
];

// Streak milestones with rewards and achievements
const streakMilestones = [
  { days: 3, title: 'First Steps', description: 'Building the habit', reward: 'Consistency Badge' },
  { days: 7, title: 'Week Warrior', description: 'One week strong!', reward: 'Weekly Streak Badge' },
  { days: 14, title: 'Fortnight Fighter', description: 'Two weeks of dedication', reward: 'Discipline Badge' },
  { days: 21, title: 'Habit Master', description: 'Habit formation complete', reward: 'Habit Badge' },
  { days: 30, title: 'Monthly Champion', description: 'One month milestone', reward: 'Champion Badge' },
  { days: 50, title: 'Halfway Hero', description: 'Halfway to 100!', reward: 'Hero Badge' },
  { days: 75, title: 'Diamond Dedication', description: 'Elite consistency', reward: 'Diamond Badge' },
  { days: 100, title: 'Century Club', description: 'Ultimate achievement', reward: 'Century Badge' },
  { days: 150, title: 'Legend Status', description: 'Trading legend', reward: 'Legend Badge' },
  { days: 200, title: 'Immortal Trader', description: 'Immortal dedication', reward: 'Immortal Badge' },
];

const StreakUpdater = () => {
  const { user, isLoaded, getToken } = useUser();
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStreakData = async () => {
      if (user) {
        try {
          setLoading(true);
          const token = await getToken();
          const response = await axios.get('/api/streak', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStreakData(response.data);
        } catch (err) {
          console.error("Failed to fetch streak data:", err);
          setError('Failed to load streak data.');
        } finally {
          setLoading(false);
        }
      }
    };

    if (isLoaded) {
      fetchStreakData();
    }
  }, [isLoaded, user, getToken]);

  if (loading) {
    return (
      <div className="p-4 rounded-lg shadow-md bg-gray-800 border border-gray-700 flex items-center justify-center h-40">
        <Loader2 className="animate-spin text-gray-400" size={32} />
        <p className="ml-3 text-gray-400">Loading Streak...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg shadow-md bg-red-900/20 border border-red-700 flex items-center justify-center h-40">
        <AlertCircle className="text-red-500" size={32} />
        <p className="ml-3 text-red-400">{error}</p>
      </div>
    );
  }

  if (!streakData) return null;

  const { currentStreak, dailyStreakRank, nextMilestone, milestoneProgress } = streakData;
  const RankIcon = dailyStreakRank?.icon ? dailyStreakRanks.find(r => r.name === dailyStreakRank.name)?.icon : Calendar;

  return (
    <div className={`p-4 rounded-lg shadow-lg text-white bg-gradient-to-br ${dailyStreakRank?.bgGradient || 'from-gray-700 to-gray-800'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {RankIcon && <RankIcon className={`mr-3 ${dailyStreakRank?.theme}`} size={28} />}
          <div>
            <p className="font-bold text-lg">{dailyStreakRank?.name || 'Chart Rookie'}</p>
            <p className="text-sm opacity-80">Current Streak: {currentStreak} Days</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{currentStreak}</p>
          <p className="text-xs opacity-80">DAYS</p>
        </div>
      </div>
      {nextMilestone && (
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Next Milestone: {nextMilestone.title} ({nextMilestone.days} days)</span>
            <span>{Math.round(milestoneProgress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div className="bg-white h-2.5 rounded-full" style={{ width: `${milestoneProgress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get daily streak rank
export function getDailyStreakRank(dayStreak) {
  return dailyStreakRanks.find(rank => dayStreak >= rank.minDays) || dailyStreakRanks[dailyStreakRanks.length - 1];
}

// Helper function to get next milestone
export function getNextMilestone(currentStreak) {
  return streakMilestones.find(milestone => milestone.days > currentStreak) || null;
}

// Helper function to get achieved milestones
export function getAchievedMilestones(currentStreak) {
  return streakMilestones.filter(milestone => milestone.days <= currentStreak);
}

// Helper function to calculate days until next milestone
export function getDaysUntilNextMilestone(currentStreak) {
  const nextMilestone = getNextMilestone(currentStreak);
  return nextMilestone ? nextMilestone.days - currentStreak : 0;
}

// Helper function to calculate milestone progress percentage
export function getMilestoneProgress(currentStreak) {
  const nextMilestone = getNextMilestone(currentStreak);
  if (!nextMilestone) return 100;
  
  const previousMilestone = streakMilestones
    .filter(m => m.days <= currentStreak)
    .pop();
  
  const startPoint = previousMilestone ? previousMilestone.days : 0;
  const progress = ((currentStreak - startPoint) / (nextMilestone.days - startPoint)) * 100;
  
  return Math.min(100, Math.max(0, progress));
}

export { dailyStreakRanks, streakMilestones };

export default StreakUpdater;

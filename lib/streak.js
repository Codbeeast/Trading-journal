import Trade from '@/models/Trade';
import { Trophy, Award, Star, Flame, Target, BarChart3, TrendingUp, Binoculars, Zap, ClubIcon } from 'lucide-react';

// Daily streak ranks with proper icons and reasonable milestones
export const dailyStreakRanks = [
  { name: 'Legend Status', minDays: 200, icon: Trophy, theme: 'text-yellow-400', bgGradient: 'from-yellow-400 to-orange-500' },
  { name: 'Trader Elite', minDays: 150, icon: Award, theme: 'text-purple-400', bgGradient: 'from-purple-400 to-pink-500' },
  { name: 'Century Club', minDays: 100, icon: Star, theme: 'text-blue-400', bgGradient: 'from-blue-400 to-cyan-500' },
  { name: 'Discipline Beast', minDays: 75, icon: Flame, theme: 'text-red-400', bgGradient: 'from-red-400 to-pink-500' },
  { name: 'Setup Sniper', minDays: 50, icon: Target, theme: 'text-orange-400', bgGradient: 'from-orange-400 to-red-500' },
  { name: 'R-Master', minDays: 30, icon: BarChart3, theme: 'text-green-400', bgGradient: 'from-green-400 to-emerald-500' },
  { name: 'Fortnight Fighter', minDays: 21, icon: TrendingUp, theme: 'text-teal-400', bgGradient: 'from-teal-400 to-blue-500' },
  { name: 'Zone Scout', minDays: 14, icon: Binoculars, theme: 'text-cyan-400', bgGradient: 'from-cyan-400 to-teal-500' },
  { name: 'Wick Watcher', minDays: 7, icon: Zap, theme: 'text-gray-400', bgGradient: 'from-gray-400 to-gray-600' },
  { name: 'Chart Rookie', minDays: 0, icon: ClubIcon, theme: 'text-gray-500', bgGradient: 'from-gray-500 to-gray-700' },
];

// Streak milestones with rewards and achievements
export const streakMilestones =[
  {
    days: 0,
    title: 'Chart Rookie',
    description: 'You’ve spawned. Let the grind begin!',
    reward: 'Consistency Badge',
  },
  {
    days: 7,
    title: 'Wick Watcher',
    description: 'First boss defeated. Weekly streak unlocked!',
    reward: 'Weekly Streak Badge',
  },
  {
    days: 14,
    title: 'Zone Scout',
    description: 'Two weeks in—your radar’s dialed in.',
    reward: 'Discipline Badge',
  },
  {
    days: 21,
    title: 'Fortnight Fighter',
    description: 'You’ve evolved. Habit mode: activated.',
    reward: 'Habit Badge',
  },
  {
    days: 30,
    title: 'R-Master',
    description: 'One-month mastery. Risk is your weapon.',
    reward: 'Champion Badge',
  },
  {
    days: 50,
    title: 'Setup Sniper',
    description: 'Mid-game unlocked. Precision is your power.',
    reward: 'Hero Badge',
  },
  {
    days: 75,
    title: 'Discipline Beast',
    description: 'You’re a machine. No mercy for missed trades.',
    reward: 'Diamond Badge',
  },
  {
    days: 100,
    title: 'Century Club',
    description: 'Triple digits. You’re now trading royalty.',
    reward: 'Century Badge',
  },
  {
    days: 150,
    title: 'Trader Elite',
    description: 'Legend status approaching. You’re feared.',
    reward: 'Legend Badge',
  },
  {
    days: 200,
    title: 'Legend Status',
    description: 'Immortal grind. You’ve entered myth.',
    reward: 'Immortal Badge',
  },
];

// Helper function to calculate streak based on trade consistency
export async function calculateConsistencyStreak(userId) {
  const trades = await Trade.find({ userId }).sort({ date: -1 }).select('date').lean();
  if (trades.length === 0) {
    return 0;
  }

  const uniqueDates = [...new Set(trades.map(t => new Date(t.date).setHours(0, 0, 0, 0)))];
  uniqueDates.sort((a, b) => b - a); // Sort descending

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecentDate = new Date(uniqueDates[0]);
  const dayDifference = (today.getTime() - mostRecentDate.getTime()) / (1000 * 3600 * 24);

  if (dayDifference > 1) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const previousDate = new Date(uniqueDates[i + 1]);
    const diff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 3600 * 24);

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

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

// Helper function to get newly achieved milestones
export function getNewMilestones(previousStreak, currentStreak) {
  return streakMilestones.filter(m => m.days > previousStreak && m.days <= currentStreak);
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

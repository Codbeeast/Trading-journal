// app/api/leaderboard/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Trade from '@/models/Trade';
import Leaderboard from '@/models/Leaderboard';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'composite';

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    await connectDB();

    const leaderboardData = await calculateLeaderboard(page, limit, sortBy);
    
    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

async function calculateLeaderboard(page, limit, sortBy) {
  try {
    // Get all users who have made trades in the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    // Get active user IDs from trades
    const activeUserIds = await Trade.distinct('userId', {
      createdAt: { $gte: ninetyDaysAgo }
    });
    
    if (activeUserIds.length === 0) {
      return {
        users: [],
        totalUsers: 0,
        currentPage: page,
        totalPages: 0
      };
    }

    // Get leaderboard entries for active users
    const leaderboardUsers = await Leaderboard.find({
      userId: { $in: activeUserIds }
    });

    // Create a map for quick lookup
    const leaderboardMap = new Map();
    leaderboardUsers.forEach(user => {
      leaderboardMap.set(user.userId, user);
    });

    // Get all Clerk user data in batch for better performance
    const clerkUsers = new Map();
    try {
      const { clerkClient } = await import('@clerk/nextjs/server');
      
      // Fetch all users in batches to avoid rate limiting
      for (const userId of activeUserIds) {
        try {
          const clerkUser = await clerkClient.users.getUser(userId);
          clerkUsers.set(userId, {
            username: clerkUser.fullName || clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0] || `Trader ${userId.slice(-4)}`,
            imageUrl: clerkUser.imageUrl || ''
          });
        } catch (userError) {
          console.error(`Failed to fetch Clerk user ${userId}:`, userError);
          clerkUsers.set(userId, {
            username: `Trader ${userId.slice(-4)}`,
            imageUrl: ''
          });
        }
      }
    } catch (clerkError) {
      console.error('Failed to initialize Clerk client:', clerkError);
    }

    // Calculate performance metrics for each user
    const userPerformances = await Promise.all(
      activeUserIds.map(async (userId) => {
        try {
          const trades = await Trade.find({ userId }).sort({ createdAt: -1 });
          
          // Skip users with fewer than 5 trades
          if (trades.length < 5) return null;

          const leaderboardEntry = leaderboardMap.get(userId);
          const clerkUser = clerkUsers.get(userId);
          const metrics = calculatePerformanceMetrics(trades);
          
          // Prioritize leaderboard data, fallback to Clerk data
          const username = leaderboardEntry?.username || clerkUser?.username || `Trader ${userId.slice(-4)}`;
          const imageUrl = leaderboardEntry?.imageUrl || clerkUser?.imageUrl || '';
          
          return {
            userId,
            username,
            imageUrl,
            joinDate: leaderboardEntry?.createdAt || new Date(),
            currentWeekStreak: leaderboardEntry?.currentWeekStreak || 0,
            weeklyActive: await isWeeklyActive(userId),
            ...metrics
          };
        } catch (error) {
          console.error(`Error processing user ${userId}:`, error);
          return null;
        }
      })
    );

    // Filter out null results and add composite scores with league info
    const validUsers = userPerformances
      .filter(user => user !== null)
      .map(user => {
        const compositeScore = calculateCompositeScore(user);
        const leagueInfo = getUserLeagueInfo(compositeScore);
        
        return {
          ...user,
          compositeScore,
          league: leagueInfo.name,
          leagueSubLevel: leagueInfo.subLevel,
          leagueProgress: leagueInfo.progress,
          leagueIcon: leagueInfo.icon,
          leagueColor: leagueInfo.color,
          leagueTextColor: leagueInfo.textColor,
          weeklyStreakRank: getWeeklyStreakRank(user.currentWeekStreak || 0)
        };
      });

    // Sort users based on criteria
    const sortedUsers = sortUsers(validUsers, sortBy);

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      totalUsers: sortedUsers.length,
      currentPage: page,
      totalPages: Math.ceil(sortedUsers.length / limit),
      sortBy
    };
  } catch (error) {
    console.error('Error calculating leaderboard:', error);
    throw error;
  }
}

function sortUsers(users, sortBy) {
  return [...users].sort((a, b) => {
    switch (sortBy) {
      case 'winRate':
        return b.winRate - a.winRate;
      case 'consistency':
        return b.consistency - a.consistency;
      case 'riskManagement':
        return b.riskManagement - a.riskManagement;
      case 'totalTrades':
        return b.totalTrades - a.totalTrades;
      case 'profitFactor':
        return b.profitFactor - a.profitFactor;
      case 'streak':
        return b.currentWeekStreak - a.currentWeekStreak;
      default: // composite
        return b.compositeScore - a.compositeScore;
    }
  });
}

async function isWeeklyActive(userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentTrades = await Trade.countDocuments({
    userId,
    createdAt: { $gte: sevenDaysAgo }
  });
  
  return recentTrades > 0;
}

function calculatePerformanceMetrics(trades) {
  if (trades.length === 0) {
    return {
      winRate: 0,
      consistency: 0,
      riskManagement: 0,
      totalTrades: 0,
      profitFactor: 0,
      monthlyPnl: 0
    };
  }

  // Calculate win rate
  const winningTrades = trades.filter(trade => trade.pnl > 0);
  const losingTrades = trades.filter(trade => trade.pnl < 0);
  const winRate = Math.round((winningTrades.length / trades.length) * 100);

  // Calculate profit factor
  const totalGain = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
  const profitFactor = totalLoss > 0 ? +(totalGain / totalLoss).toFixed(2) : totalGain > 0 ? 99 : 0;

  // Calculate monthly P&L (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthlyTrades = trades.filter(trade => new Date(trade.createdAt) >= thirtyDaysAgo);
  const monthlyPnl = Math.round(monthlyTrades.reduce((sum, trade) => sum + trade.pnl, 0));

  // Calculate consistency and risk management
  const consistency = calculateConsistency(trades);
  const riskManagement = calculateRiskManagement(trades);

  return {
    winRate,
    consistency: Math.round(consistency),
    riskManagement: Math.round(riskManagement),
    totalTrades: trades.length,
    profitFactor,
    monthlyPnl
  };
}

function calculateConsistency(trades) {
  if (trades.length === 0) return 0;

  const factors = [];

  // Factor 1: Rules followed percentage (40% weight)
  const rulesFollowedTrades = trades.filter(trade => trade.rulesFollowed === 'Yes');
  if (trades.length > 0) {
    const rulesScore = (rulesFollowedTrades.length / trades.length) * 100;
    factors.push(rulesScore * 0.4);
  }

  // Factor 2: Risk consistency - standard deviation of risk percentages (30% weight)
  const risks = trades.filter(trade => trade.risk && trade.risk > 0).map(trade => trade.risk);
  if (risks.length > 1) {
    const avgRisk = risks.reduce((a, b) => a + b, 0) / risks.length;
    const variance = risks.reduce((sum, risk) => sum + Math.pow(risk - avgRisk, 2), 0) / risks.length;
    const stdDev = Math.sqrt(variance);
    const riskConsistency = Math.max(0, 100 - (stdDev * 10));
    factors.push(riskConsistency * 0.3);
  }

  // Factor 3: Emotional control based on ratings (30% weight)
  const emotionalTrades = trades.filter(trade => 
    trade.fearToGreed && trade.fomoRating && trade.executionRating
  );
  if (emotionalTrades.length > 0) {
    const avgEmotionalControl = emotionalTrades.reduce((sum, trade) => {
      const fearGreedScore = Math.max(0, 10 - Math.abs(trade.fearToGreed - 5.5));
      const fomoScore = Math.max(0, 10 - Math.abs(trade.fomoRating - 3));
      const executionScore = trade.executionRating;
      return sum + (fearGreedScore + fomoScore + executionScore) / 3;
    }, 0) / emotionalTrades.length;
    factors.push((avgEmotionalControl * 10) * 0.3);
  }

  return factors.length === 0 ? 50 : factors.reduce((sum, factor) => sum + factor, 0);
}

function calculateRiskManagement(trades) {
  if (trades.length === 0) return 0;

  const factors = [];

  // Factor 1: Risk per trade optimization (40% weight)
  const riskyTrades = trades.filter(trade => trade.risk && trade.risk > 0);
  if (riskyTrades.length > 0) {
    const avgRisk = riskyTrades.reduce((sum, trade) => sum + trade.risk, 0) / riskyTrades.length;
    let riskOptimality;
    if (avgRisk >= 1 && avgRisk <= 2) {
      riskOptimality = 100;
    } else if (avgRisk >= 0.5 && avgRisk <= 3) {
      riskOptimality = 80;
    } else if (avgRisk >= 0.1 && avgRisk <= 5) {
      riskOptimality = 60;
    } else {
      riskOptimality = 40;
    }
    factors.push(riskOptimality * 0.4);
  }

  // Factor 2: R-Factor management (30% weight)
  const rFactorTrades = trades.filter(trade => trade.rFactor && trade.rFactor > 0);
  if (rFactorTrades.length > 0) {
    const avgRFactor = rFactorTrades.reduce((sum, trade) => sum + trade.rFactor, 0) / rFactorTrades.length;
    let rFactorScore;
    if (avgRFactor >= 2) {
      rFactorScore = 100;
    } else if (avgRFactor >= 1.5) {
      rFactorScore = 80;
    } else if (avgRFactor >= 1) {
      rFactorScore = 60;
    } else {
      rFactorScore = 40;
    }
    factors.push(rFactorScore * 0.3);
  }

  // Factor 3: Stop loss discipline (30% weight)
  const losingTrades = trades.filter(trade => trade.pnl < 0);
  if (losingTrades.length > 0) {
    const disciplinedLosses = losingTrades.filter(trade => {
      if (!trade.risk) return false;
      const expectedLoss = trade.risk * 100;
      const actualLoss = Math.abs(trade.pnl);
      return actualLoss <= expectedLoss * 1.2;
    });
    
    const stopLossDiscipline = (disciplinedLosses.length / losingTrades.length) * 100;
    factors.push(stopLossDiscipline * 0.3);
  }

  return factors.length === 0 ? 50 : factors.reduce((sum, factor) => sum + factor, 0);
}

function calculateCompositeScore(user) {
  const weights = {
    winRate: 0.25,
    consistency: 0.30,
    riskManagement: 0.25,
    profitFactor: 0.15,
    experience: 0.05,
    weeklyActive: 0.05
  };
  
  const experienceFactor = Math.min(user.totalTrades / 100, 1) * 100;
  const normalizedProfitFactor = Math.min(user.profitFactor * 20, 100);
  const weeklyActivityBonus = user.weeklyActive ? 100 : 0;
  
  const baseScore = (
    user.winRate * weights.winRate +
    user.consistency * weights.consistency +
    user.riskManagement * weights.riskManagement +
    normalizedProfitFactor * weights.profitFactor +
    experienceFactor * weights.experience +
    weeklyActivityBonus * weights.weeklyActive
  );
  
  return Math.min(100, Math.max(0, baseScore));
}

// League sub-levels configuration
const leagueSubLevels = {
  Obsidian: { levels: 3, icon: '💎', color: 'from-purple-900 to-black', textColor: 'text-purple-300' },
  Diamond: { levels: 3, icon: '🔷', color: 'from-blue-400 to-cyan-300', textColor: 'text-cyan-300' },
  Platinum: { levels: 3, icon: '🔶', color: 'from-gray-300 to-gray-500', textColor: 'text-gray-300' },
  Gold: { levels: 3, icon: '🥇', color: 'from-yellow-400 to-orange-400', textColor: 'text-yellow-300' },
  Silver: { levels: 3, icon: '🥈', color: 'from-gray-400 to-gray-600', textColor: 'text-gray-400' },
  Bronze: { levels: 3, icon: '🥉', color: 'from-orange-600 to-red-600', textColor: 'text-orange-400' },
};

// Determine league sub-level based on composite score
function determineLeagueSubLevel(compositeScore, leagueName) {
  const league = leagueSubLevels[leagueName];
  if (!league) return { subLevel: 1, progress: 0 };
  
  const leagueRanges = {
    Obsidian: { min: 95, max: 100 },
    Diamond: { min: 85, max: 94.9 },
    Platinum: { min: 75, max: 84.9 },
    Gold: { min: 65, max: 74.9 },
    Silver: { min: 45, max: 64.9 },
    Bronze: { min: 0, max: 44.9 }
  };
  
  const range = leagueRanges[leagueName];
  const scoreInRange = Math.max(0, compositeScore - range.min);
  const rangeSize = range.max - range.min;
  const progress = (scoreInRange / rangeSize) * 100;
  
  const subLevel = Math.min(league.levels, Math.ceil((progress / 100) * league.levels));
  
  return {
    subLevel,
    progress: Math.min(100, Math.max(0, progress))
  };
}

function getUserLeagueInfo(compositeScore) {
  const leagues = [
    { name: 'Obsidian', minScore: 95 },
    { name: 'Diamond', minScore: 85 },
    { name: 'Platinum', minScore: 75 },
    { name: 'Gold', minScore: 65 },
    { name: 'Silver', minScore: 45 },
    { name: 'Bronze', minScore: 0 }
  ];
  
  const league = leagues.find(l => compositeScore >= l.minScore) || leagues[leagues.length - 1];
  const subLevelInfo = determineLeagueSubLevel(compositeScore, league.name);
  const leagueConfig = leagueSubLevels[league.name];
  
  return {
    name: league.name,
    subLevel: subLevelInfo.subLevel,
    progress: subLevelInfo.progress,
    icon: leagueConfig?.icon || '📊',
    color: leagueConfig?.color || 'from-gray-400 to-gray-600',
    textColor: leagueConfig?.textColor || 'text-gray-400'
  };
}

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

// Helper function to get weekly streak rank
function getWeeklyStreakRank(weekStreak) {
  return weeklyStreakRanks.find(rank => weekStreak >= rank.minWeeks) || weeklyStreakRanks[weeklyStreakRanks.length - 1];
}
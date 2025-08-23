// app/api/leaderboard/route.js
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Trade from '@/models/Trade';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'composite';

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 50) {
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
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function calculateLeaderboard(page, limit, sortBy) {
  try {
    // Get all users who have made trades in the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const activeUserIds = await Trade.distinct('userId', {
      date: { $gte: ninetyDaysAgo }
    });
    
    if (activeUserIds.length === 0) {
      return {
        users: [],
        totalUsers: 0,
        currentPage: page,
        totalPages: 0
      };
    }

    // Calculate performance metrics for each user
    const userPerformances = await Promise.all(
      activeUserIds.map(async (userId) => {
        try {
          const user = await User.findById(userId);
          if (!user) return null;

          const trades = await Trade.find({ userId }).sort({ date: -1 });
          if (trades.length < 5) return null; // Minimum trades required

          const metrics = calculatePerformanceMetrics(trades);
          
          return {
            userId,
            username: user.username,
            imageUrl: user.imageUrl,
            joinDate: user.createdAt,
            weeklyActive: await isWeeklyActive(userId),
            ...metrics
          };
        } catch (error) {
          console.error(`Error processing user ${userId}:`, error);
          return null;
        }
      })
    );

    // Filter out null results and add composite scores
    const validUsers = userPerformances
      .filter(user => user !== null)
      .map(user => ({
        ...user,
        compositeScore: calculateCompositeScore(user)
      }));

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
    date: { $gte: sevenDaysAgo }
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
  const monthlyTrades = trades.filter(trade => new Date(trade.date) >= thirtyDaysAgo);
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

  let consistencyScore = 0;
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
    const riskConsistency = Math.max(0, 100 - (stdDev * 10)); // Lower std dev = higher consistency
    factors.push(riskConsistency * 0.3);
  }

  // Factor 3: Emotional control based on ratings (30% weight)
  const emotionalTrades = trades.filter(trade => 
    trade.fearToGreed && trade.fomoRating && trade.executionRating
  );
  if (emotionalTrades.length > 0) {
    const avgEmotionalControl = emotionalTrades.reduce((sum, trade) => {
      // Ideal emotional state is around 5-6 (slightly confident but not overconfident)
      const fearGreedScore = Math.max(0, 10 - Math.abs(trade.fearToGreed - 5.5));
      const fomoScore = Math.max(0, 10 - Math.abs(trade.fomoRating - 3)); // Lower FOMO is better
      const executionScore = trade.executionRating;
      return sum + (fearGreedScore + fomoScore + executionScore) / 3;
    }, 0) / emotionalTrades.length;
    factors.push((avgEmotionalControl * 10) * 0.3);
  }

  // Calculate weighted average
  if (factors.length === 0) return 50; // Default neutral score
  
  return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
}

function calculateRiskManagement(trades) {
  if (trades.length === 0) return 0;

  let riskScore = 0;
  const factors = [];

  // Factor 1: Risk per trade optimization (40% weight)
  const riskyTrades = trades.filter(trade => trade.risk && trade.risk > 0);
  if (riskyTrades.length > 0) {
    const avgRisk = riskyTrades.reduce((sum, trade) => sum + trade.risk, 0) / riskyTrades.length;
    // Optimal risk range is 1-2%, penalize going outside this range
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
    // Check if losing trades stayed within expected loss bounds
    const disciplinedLosses = losingTrades.filter(trade => {
      if (!trade.risk) return false;
      const expectedLoss = trade.risk * 100; // Assuming account size normalization
      const actualLoss = Math.abs(trade.pnl);
      return actualLoss <= expectedLoss * 1.2; // Allow 20% buffer for slippage
    });
    
    const stopLossDiscipline = (disciplinedLosses.length / losingTrades.length) * 100;
    factors.push(stopLossDiscipline * 0.3);
  }

  // Calculate weighted average
  if (factors.length === 0) return 50; // Default neutral score
  
  return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
}

function calculateCompositeScore(user) {
  // Enhanced weighted composite score for ranking
  const weights = {
    winRate: 0.25,          // 25% - Profitability
    consistency: 0.30,      // 30% - Most important for long-term success
    riskManagement: 0.25,   // 25% - Risk control
    profitFactor: 0.15,     // 15% - Risk-adjusted returns
    experience: 0.05        // 5% - Number of trades (experience bonus)
  };
  
  // Experience factor (bonus for having more trades, capped)
  const experienceFactor = Math.min(user.totalTrades / 100, 1) * 100;
  
  // Profit factor normalization (cap the impact)
  const normalizedProfitFactor = Math.min(user.profitFactor * 20, 100);
  
  return (
    user.winRate * weights.winRate +
    user.consistency * weights.consistency +
    user.riskManagement * weights.riskManagement +
    normalizedProfitFactor * weights.profitFactor +
    experienceFactor * weights.experience
  );
}
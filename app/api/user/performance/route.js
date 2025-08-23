// app/api/user/performance/route.js
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Trade from '@/models/Trade';

export async function GET(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user's trades
    const trades = await Trade.find({ userId }).sort({ date: -1 });
    
    if (trades.length === 0) {
      return NextResponse.json({
        winRate: 0,
        consistency: 0,
        riskManagement: 0,
        totalTrades: 0,
        profitFactor: 0,
        rank: 'Bronze',
        monthlyPnl: 0
      });
    }

    const metrics = calculatePerformanceMetrics(trades);
    const rank = determineRank(metrics.winRate, metrics.consistency, metrics.riskManagement);

    return NextResponse.json({
      ...metrics,
      rank: rank.name
    });
  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

function determineRank(winRate, consistency, riskManagement) {
  const ranks = [
    { name: 'Obsidian', minWinRate: 85, minConsistency: 90, minRiskManagement: 95 },
    { name: 'Diamond', minWinRate: 75, minConsistency: 80, minRiskManagement: 85 },
    { name: 'Platinum', minWinRate: 65, minConsistency: 70, minRiskManagement: 75 },
    { name: 'Gold', minWinRate: 55, minConsistency: 60, minRiskManagement: 65 },
    { name: 'Silver', minWinRate: 45, minConsistency: 50, minRiskManagement: 55 },
    { name: 'Bronze', minWinRate: 0, minConsistency: 0, minRiskManagement: 0 }
  ];

  return ranks.find(rank => 
    winRate >= rank.minWinRate && 
    consistency >= rank.minConsistency && 
    riskManagement >= rank.minRiskManagement
  ) || ranks[ranks.length - 1];
}
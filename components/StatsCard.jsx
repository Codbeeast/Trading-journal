"use client"
import React, { useCallback } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Calculator } from 'lucide-react';
import { useTrades } from '../context/TradeContext'; // Import the custom hook

const StatsCards = () => {
  // Destructure trades, loading, and error from the custom hook
  const { trades, loading, error } = useTrades();

  // Calculate overall statistics

 const calculateOverallStats = useCallback(() => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return {
        totalPnL: 0,
        totalTrades: 0,
        winRate: 0,
        totalPips: 0,
        wins: 0,
        losses: 0,
        currentYearPnL: 0,
        currentYearTrades: 0,
        currentYearWins: 0,
        currentYearLosses: 0
      };
    }



    let totalPnL = 0;
    let totalTrades = 0;
    let wins = 0;
    let losses = 0;
    
    // Calculate total pips using reduce method like WeeklySummary
    const totalPips = trades.reduce((sum, trade) => {
      if (typeof trade.pipsLost === 'number') {
        return sum + trade.pipsLost;
      }
      return sum;
    }, 0);
    
    // Current year stats
    let currentYearPnL = 0;
    let currentYearTrades = 0;
    let currentYearWins = 0;
    let currentYearLosses = 0;
    const currentYear = new Date().getFullYear();



    trades.forEach(trade => {
      // Use parseFloat to handle both string and number P&L values
      const pnl = parseFloat(trade.pnl) || 0;
      
      // Count each trade (not days)
      totalTrades += 1;
      totalPnL += pnl;
      
      if (pnl > 0) {
        wins += 1;
      } else if (pnl < 0) {
        losses += 1;
      }
      
      // Calculate current year stats
      if (trade.date) {
        const tradeDate = new Date(trade.date);
        if (!isNaN(tradeDate.getTime()) && tradeDate.getFullYear() === currentYear) {
          currentYearTrades += 1;
          currentYearPnL += pnl;
          
          if (pnl > 0) {
            currentYearWins += 1;
          } else if (pnl < 0) {
            currentYearLosses += 1;
          }
        }
      }
    });
    


    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;



    return {
      totalPnL,
      totalTrades,
      winRate,
      totalPips,
      wins,
      losses,
      currentYearPnL,
      currentYearTrades,
      currentYearWins,
      currentYearLosses
    };
  }, [trades]);



  const overallStats = calculateOverallStats();

  // Generate stats cards with overall data
  const statsCards = [
    {
      label: 'Total P&L (YTD)',
      value: `$${overallStats.currentYearPnL.toFixed(2)}`,
      change: overallStats.currentYearPnL >= 0 ? 'Profit' : 'Loss',
      subInfo: `${overallStats.currentYearWins} Wins / ${overallStats.currentYearLosses} Losses (YTD)`,
      icon: DollarSign,
      color: overallStats.currentYearPnL >= 0 ? 'from-emerald-500 to-green-400' : 'from-red-500 to-pink-400',
      positive: overallStats.currentYearPnL >= 0
    },
    {
      label: 'Total Trades',
      value: overallStats.totalTrades,
      change: overallStats.totalTrades === 0 ? 'No trades yet' : 'Total Trades',
      subInfo: `Avg. P&L: $${(overallStats.totalTrades > 0 ? overallStats.totalPnL / overallStats.totalTrades : 0).toFixed(2)}`, // Added average P&L
      icon: Activity, // Retained Activity icon
      color: 'from-blue-500 to-cyan-400',
      positive: true // Always positive for total count
    },
    {
      label: 'Win Rate',
      value: `${overallStats.winRate.toFixed(1)}%`,
      change: overallStats.winRate >= 50 ? 'Above 50%' : 'Below 50%',
      subInfo: `${overallStats.wins} Wins out of ${overallStats.totalTrades} Trades`,
      icon: TrendingUp, // Retained TrendingUp icon
      color: overallStats.winRate >= 50 ? 'from-purple-500 to-indigo-400' : 'from-red-500 to-pink-400',
      positive: overallStats.winRate >= 50
    },
    {
      label: 'Total Pip Count',
      value: `${overallStats.totalPips.toFixed(1)} Pips`,
      change: overallStats.totalPips >= 0 ? 'Net gain' : 'Net loss',
      subInfo: `${overallStats.totalPips > 0 ? 'Gained' : 'Lost'} across all trades`,
      icon: Calculator, // Changed icon for pip count
      color: overallStats.totalPips >= 0 ? 'from-yellow-500 to-orange-400' : 'from-red-500 to-pink-400',
      positive: overallStats.totalPips >= 0
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-500 opacity-20 rounded-xl blur-xl"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-600 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-600 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-600 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full text-center text-red-400 p-6">
          Error loading stats: {error}. Using demo data.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <div key={index} className="relative group rounded-xl">
          <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300`}></div>
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className={`text-sm font-medium mt-1 ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.change}
                </p>
                {stat.subInfo && (
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.subInfo}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;

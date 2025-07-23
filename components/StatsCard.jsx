"use client"
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

const StatsCards = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trades data
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/trades');
        if (!response.ok) {
          throw new Error('Failed to fetch trades');
        }
        const data = await response.json();
        setTrades(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching trades:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  // Calculate time-based statistics
  const calculateTimeStats = () => {
    if (!trades.length) return null;

    // Group trades by time
    const timeGroups = {};
    trades.forEach(trade => {
      const time = trade.time || 'N/A';
      if (!timeGroups[time]) {
        timeGroups[time] = {
          trades: [],
          totalPnL: 0,
          count: 0
        };
      }
      timeGroups[time].trades.push(trade);
      timeGroups[time].totalPnL += (trade.pnl || 0);
      timeGroups[time].count += 1;
    });

    // Find best time (highest total PnL)
    let bestTime = null;
    let bestPnL = -Infinity;
    
    // Find worst time (lowest total PnL)
    let worstTime = null;
    let worstPnL = Infinity;
    
    // Find most trades time
    let mostTradesTime = null;
    let maxTrades = 0;
    
    // Find least trades time
    let leastTradesTime = null;
    let minTrades = Infinity;

    Object.entries(timeGroups).forEach(([time, data]) => {
      if (data.totalPnL > bestPnL) {
        bestPnL = data.totalPnL;
        bestTime = time;
      }
      
      if (data.totalPnL < worstPnL) {
        worstPnL = data.totalPnL;
        worstTime = time;
      }
      
      if (data.count > maxTrades) {
        maxTrades = data.count;
        mostTradesTime = time;
      }
      
      if (data.count < minTrades) {
        minTrades = data.count;
        leastTradesTime = time;
      }
    });

    return {
      bestTime: {
        time: bestTime || 'N/A',
        pnl: bestPnL === -Infinity ? 0 : bestPnL,
        trades: bestTime ? timeGroups[bestTime].count : 0
      },
      worstTime: {
        time: worstTime || 'N/A',
        pnl: worstPnL === Infinity ? 0 : worstPnL,
        trades: worstTime ? timeGroups[worstTime].count : 0
      },
      mostTrades: {
        time: mostTradesTime || 'N/A',
        count: maxTrades === 0 ? 0 : maxTrades,
        pnl: mostTradesTime ? timeGroups[mostTradesTime].totalPnL : 0
      },
      leastTrades: {
        time: leastTradesTime || 'N/A',
        count: minTrades === Infinity ? 0 : minTrades,
        pnl: leastTradesTime ? timeGroups[leastTradesTime].totalPnL : 0
      }
    };
  };

  const timeStats = calculateTimeStats();

  // Generate stats cards with time-based data
  const statsCards = timeStats ? [
    {
      label: 'Best Time',
      value: timeStats.bestTime.time,
      change: `$${timeStats.bestTime.pnl.toFixed(2)}`,
      subInfo: `${timeStats.bestTime.trades} trades`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-400',
      positive: timeStats.bestTime.pnl >= 0
    },
    {
      label: 'Worst Time',
      value: timeStats.worstTime.time,
      change: `$${timeStats.worstTime.pnl.toFixed(2)}`,
      subInfo: `${timeStats.worstTime.trades} trades`,
      icon: TrendingDown,
      color: 'from-red-500 to-pink-400',
      positive: timeStats.worstTime.pnl >= 0
    },
    {
      label: 'Most Trades',
      value: timeStats.mostTrades.time,
      change: `${timeStats.mostTrades.count} Trades`,
      subInfo: `$${timeStats.mostTrades.pnl.toFixed(2)}`,
      icon: Activity,
      color: 'from-blue-500 to-cyan-400',
      positive: timeStats.mostTrades.pnl >= 0
    },
    {
      label: 'Least Trades',
      value: timeStats.leastTrades.time === 'N/A' ? 'N/A' : timeStats.leastTrades.time,
      change: timeStats.leastTrades.time === 'N/A' ? 'Duration: N/A' : `${timeStats.leastTrades.count} Trades`,
      subInfo: timeStats.leastTrades.time === 'N/A' ? '' : `$${timeStats.leastTrades.pnl.toFixed(2)}`,
      icon: Clock,
      color: 'from-purple-500 to-indigo-400',
      positive: timeStats.leastTrades.pnl >= 0
    }
  ] : [];

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
          Error loading stats: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <div key={index} className="relative group">
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
"use client"

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { useTrades } from '@/context/TradeContext';

const TradingStatsCards = () => {
  const { trades, loading, error, fetchTrades } = useTrades();

  React.useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Calculate statistics from trades data
  const stats = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        bestTime: { time: '-', avgPnl: 0, count: 0 },
        worstTime: { time: '-', avgPnl: 0, count: 0 },
        mostTradesSession: { session: '-', count: 0, totalPnl: 0 },
        leastTradesSession: { session: '-', count: 0, totalPnl: 0 }
      };
    }

    // Group trades by time (hour) for best/worst time analysis
    const timeStats = trades.reduce((acc, trade) => {
      const time = trade.time || 'Unknown';
      const hour = time.split(':')[0] || 'Unknown'; // Extract hour from time
      if (!acc[hour]) {
        acc[hour] = { trades: [], totalPnl: 0, count: 0 };
      }
      acc[hour].trades.push(trade);
      acc[hour].totalPnl += trade.pnl || 0;
      acc[hour].count += 1;
      return acc;
    }, {});

    // Group trades by session for most/least trades analysis
    const sessionStats = trades.reduce((acc, trade) => {
      const session = trade.session || 'Unknown';
      if (!acc[session]) {
        acc[session] = { trades: [], totalPnl: 0, count: 0 };
      }
      acc[session].trades.push(trade);
      acc[session].totalPnl += trade.pnl || 0;
      acc[session].count += 1;
      return acc;
    }, {});

    // Calculate averages for time-based analysis
    const timeSummary = Object.entries(timeStats).map(([hour, data]) => ({
      time: `${hour}:00`,
      count: data.count,
      totalPnl: data.totalPnl,
      avgPnl: data.totalPnl / data.count
    }));

    // Calculate session summary for trade count analysis
    const sessionSummary = Object.entries(sessionStats).map(([session, data]) => ({
      session,
      count: data.count,
      totalPnl: data.totalPnl,
      avgPnl: data.totalPnl / data.count
    }));

    // Sort by different criteria
    const sortedByAvgPnl = [...timeSummary].sort((a, b) => b.avgPnl - a.avgPnl);
    const sortedByCount = [...sessionSummary].sort((a, b) => b.count - a.count);

    return {
      bestTime: sortedByAvgPnl[0] || { time: '-', avgPnl: 0, count: 0 },
      worstTime: sortedByAvgPnl[sortedByAvgPnl.length - 1] || { time: '-', avgPnl: 0, count: 0 },
      mostTradesSession: sortedByCount[0] || { session: '-', count: 0, totalPnl: 0 },
      leastTradesSession: sortedByCount[sortedByCount.length - 1] || { session: '-', count: 0, totalPnl: 0 }
    };
  }, [trades]);

  if (loading) {
    return (
      <div className="min-h-auto  p-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Trading Statistics
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-xl blur-xl"></div>
              <div 
                className="relative border border-gray-800 rounded-xl p-6 h-40"
                style={{
                  background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-600 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-auto  flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Best Time',
      value: stats.bestTime.time,
      subtitle: `Avg: $${stats.bestTime.avgPnl.toFixed(2)}`,
      detail: `${stats.bestTime.count} trades`,
      icon: TrendingUp,
      color: '#10b981', // Green
      glowColor: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Worst Time',
      value: stats.worstTime.time,
      subtitle: `Avg: $${stats.worstTime.avgPnl.toFixed(2)}`,
      detail: `${stats.worstTime.count} trades`,
      icon: TrendingDown,
      color: '#ef4444', // Red
      glowColor: 'from-red-500 to-rose-500'
    },
    {
      title: 'Most Trades',
      value: stats.mostTradesSession.count.toString(),
      subtitle: stats.mostTradesSession.session,
      detail: `Total: $${stats.mostTradesSession.totalPnl.toFixed(2)}`,
      icon: BarChart3,
      color: '#3b82f6', // Blue
      glowColor: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Least Trades',
      value: stats.leastTradesSession.count.toString(),
      subtitle: stats.leastTradesSession.session,
      detail: `Total: $${stats.leastTradesSession.totalPnl.toFixed(2)}`,
      icon: Activity,
      color: '#a78bfa', // Purple
      glowColor: 'from-purple-500 to-violet-500'
    }
  ];

  return (
    <div className="min-h-auto  p-4">
     
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div key={index} className="relative group">
              {/* Glowing background effect matching confluence theme */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.glowColor} opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300`}></div>
              
              <div
                className="relative border border-gray-800 rounded-xl p-6 transform hover:scale-[1.02] transition-all duration-300 ease-out"
                style={{
                  background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Card header with icon and title */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="p-2 rounded-lg mr-3 border border-gray-700/50"
                      style={{ 
                        background: `linear-gradient(135deg, ${card.color}15, ${card.color}08)`,
                      }}
                    >
                      <IconComponent 
                        size={20} 
                        style={{ color: card.color }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    {card.title}
                  </div>
                </div>

                {/* Main value */}
                <div className="mb-4">
                  <div 
                    className="text-3xl font-bold mb-1 bg-gradient-to-b bg-clip-text text-transparent"
                    style={{ 
                      backgroundImage: `linear-gradient(to bottom, ${card.color}, ${card.color}80)`
                    }}
                  >
                    {card.value}
                  </div>
                  <div className="text-lg bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent font-medium">
                    {card.subtitle}
                  </div>
                </div>

                {/* Detail information */}
                <div className="text-sm text-gray-400 border-t border-gray-700/50 pt-3">
                  {card.detail}
                </div>

                {/* Subtle background pattern matching confluence theme */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-5 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 70% 30%, ${card.color}, transparent 50%)`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TradingStatsCards;

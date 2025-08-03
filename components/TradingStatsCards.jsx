import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';

// Mock context hook for demo - replace with your actual useTrades hook
const useTrades = () => {
  // Sample data matching your Trade schema structure
  const trades = [
    { session: 'London', pnl: 150, date: '2024-01-15', time: '08:30' },
    { session: 'New York', pnl: -50, date: '2024-01-15', time: '13:00' },
    { session: 'Asian', pnl: 200, date: '2024-01-16', time: '02:00' },
    { session: 'London', pnl: 80, date: '2024-01-16', time: '09:15' },
    { session: 'New York', pnl: 100, date: '2024-01-17', time: '14:30' },
    { session: 'Asian', pnl: -30, date: '2024-01-17', time: '01:45' },
    { session: 'London', pnl: 60, date: '2024-01-18', time: '07:20' },
    { session: 'New York', pnl: -25, date: '2024-01-18', time: '15:00' },
    { session: 'Asian', pnl: 90, date: '2024-01-19', time: '03:30' },
    { session: 'London', pnl: 45, date: '2024-01-19', time: '08:45' },
    { session: 'New York', pnl: 120, date: '2024-01-20', time: '13:15' },
    { session: 'Asian', pnl: -10, date: '2024-01-20', time: '02:20' },
  ];
  
  return { trades, loading: false, error: null };
};

const TradingStatsCards = () => {
  const { trades, loading, error } = useTrades();

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div 
              className="rounded-lg p-6 shadow-2xl h-40"
              style={{
                background: 'linear-gradient(to bottom right, #020617, #172554, #0F172A)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="rounded-lg p-6 shadow-2xl text-center text-red-400"
          style={{
            background: 'linear-gradient(to bottom right, #020617, #172554, #0F172A)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          Error loading trades data
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Best Time',
      value: stats.bestTime.time,
      subtitle: `Avg: ${stats.bestTime.avgPnl.toFixed(2)}`,
      detail: `${stats.bestTime.count} trades`,
      icon: TrendingUp,
      color: '#10b981', // Green
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))'
    },
    {
      title: 'Worst Time',
      value: stats.worstTime.time,
      subtitle: `Avg: ${stats.worstTime.avgPnl.toFixed(2)}`,
      detail: `${stats.worstTime.count} trades`,
      icon: TrendingDown,
      color: '#ef4444', // Red
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))'
    },
    {
      title: 'Most Trades',
      value: stats.mostTradesSession.count.toString(),
      subtitle: stats.mostTradesSession.session,
      detail: `Total: $${stats.mostTradesSession.totalPnl.toFixed(2)}`,
      icon: BarChart3,
      color: '#3b82f6', // Blue
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))'
    },
    {
      title: 'Least Trades',
      value: stats.leastTradesSession.count.toString(),
      subtitle: stats.leastTradesSession.session,
      detail: `Total: $${stats.leastTradesSession.totalPnl.toFixed(2)}`,
      icon: Activity,
      color: '#a78bfa', // Purple
      bgGradient: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(167, 139, 250, 0.05))'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className="rounded-lg p-6 shadow-2xl font-sans text-gray-200 transform hover:scale-105 transition-all duration-300 ease-out border border-gray-800/50"
            style={{
              background: `linear-gradient(to bottom right, #020617, #172554, #0F172A)`,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Card header with icon and title */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div 
                  className="p-2 rounded-lg mr-3"
                  style={{ 
                    background: card.bgGradient,
                    border: `1px solid ${card.color}30`
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
            <div className="mb-2">
              <div 
                className="text-3xl font-bold mb-1"
                style={{ color: card.color }}
              >
                {card.value}
              </div>
              <div className="text-lg text-gray-300 font-medium">
                {card.subtitle}
              </div>
            </div>

            {/* Detail information */}
            <div className="text-sm text-gray-400 border-t border-gray-700/50 pt-3">
              {card.detail}
            </div>

            {/* Subtle background pattern */}
            <div 
              className="absolute inset-0 rounded-lg opacity-5 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 70% 30%, ${card.color}, transparent 50%)`
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TradingStatsCards;
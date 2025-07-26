import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, Calendar, DollarSign, Target } from 'lucide-react';

const WeeklySummary = ({ currentDate, tradeHistory }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get weeks data based on current month
  const getWeeksData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get the first Sunday of the first week that contains any day of the month
    const firstWeekStart = new Date(firstDayOfMonth);
    const firstWeekStartDay = firstWeekStart.getDay();
    firstWeekStart.setDate(firstWeekStart.getDate() - firstWeekStartDay);
    
    const weeks = [];
    let weekStart = new Date(firstWeekStart);
    let weekNumber = 1;
    
    // Generate weeks that overlap with the current month
    while (weekStart <= lastDayOfMonth) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // Check if this week overlaps with the current month
      const weekOverlapsMonth = weekStart <= lastDayOfMonth && weekEnd >= firstDayOfMonth;
      
      if (weekOverlapsMonth) {
        weeks.push({
          weekNumber,
          startDate: new Date(weekStart),
          endDate: new Date(weekEnd),
          label: `Week ${weekNumber}`
        });
        weekNumber++;
      }
      
      weekStart.setDate(weekStart.getDate() + 7);
    }
    
    return weeks;
  }, [currentDate]);

  // Calculate week statistics
  const getWeekStats = (weekStart, weekEnd) => {
    const weekTrades = tradeHistory.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate >= weekStart && tradeDate <= weekEnd;
    });
    
    const totalPnl = weekTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalPips = weekTrades.reduce((sum, trade) => sum + (trade.pipsLostCaught || 0), 0);
    const winningTrades = weekTrades.filter(trade => (trade.pnl || 0) > 0);
    const winRate = weekTrades.length > 0 ? (winningTrades.length / weekTrades.length) * 100 : 0;
    
    return {
      trades: weekTrades,
      totalTrades: weekTrades.length,
      totalPnl,
      totalPips,
      winRate,
      isProfit: totalPnl > 0
    };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-2xl rounded-2xl p-3 lg:p-4 border-2 border-gray-700/50 shadow-xl shadow-gray-900/50 h-fit">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-green-500/5 via-transparent to-blue-500/5"></div>
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-green-500/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-blue-500/10 rounded-full blur-xl"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center space-x-2 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg blur-md opacity-50"></div>
            <div className="relative bg-gradient-to-r from-green-500 to-blue-600 p-1.5 rounded-lg">
              <Calendar className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Weekly Summary
            </h3>
            <p className="text-xs text-gray-400">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="relative z-10 space-y-2">{/* Compact spacing */}
          {getWeeksData.map((week, index) => {
            const stats = getWeekStats(week.startDate, week.endDate);
            
            return (
              <div
                key={`week-${index}`}
                className={`
                  relative p-3 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 cursor-pointer
                  ${stats.totalTrades > 0
                    ? stats.isProfit
                      ? 'bg-gradient-to-br from-green-600/20 via-gray-900/90 to-gray-800/80 border-green-500/40 shadow-lg shadow-green-400/20'
                      : 'bg-gradient-to-br from-red-600/20 via-gray-900/90 to-gray-800/80 border-red-500/40 shadow-lg shadow-red-400/20'
                    : 'bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-gray-700/30'
                  }
                `}
                style={{
                  backdropFilter: 'blur(10px)',
                  animation: mounted ? `fadeInUp 0.4s ease-out ${index * 0.1}s both` : 'none',
                }}
              >
                {/* Week Header */}
                <div className="flex items-center justify-between mb-2">{/* Reduced margin */}
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 font-bold text-sm">
                      {week.label}
                    </span>
                    {stats.totalTrades > 0 && (
                      <div className="flex items-center space-x-1">
                        <Activity className={`w-3 h-3 ${stats.isProfit ? 'text-green-400' : 'text-red-400'}`} />
                        <span className="text-xs text-gray-400">
                          {stats.totalTrades} Trade{stats.totalTrades !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {stats.totalTrades > 0 && (
                    <div className={`w-2 h-2 rounded-full ${stats.isProfit ? 'bg-green-400' : 'bg-red-500'}`}></div>
                  )}
                </div>

                {/* Week Stats */}
                {stats.totalTrades > 0 ? (
                  <div className="space-y-1.5">{/* Compact spacing */}
                    {/* P&L */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm font-medium">P&L</span>
                      </div>
                      <span className={`font-bold text-base ${stats.isProfit ? 'text-green-400' : 'text-red-400'}`}>{/* Smaller text */}
                        {formatCurrency(stats.totalPnl)}
                      </span>
                    </div>

                    {/* Additional Stats Row */}
                    <div className="grid grid-cols-2 gap-1.5">{/* Tighter grid */}
                      {/* Pips */}
                      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-sm p-1.5 rounded-md border border-blue-700/30">{/* Smaller padding */}
                        <div className="flex items-center space-x-1 mb-1">
                          {stats.totalPips >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          )}
                          <span className="text-xs text-blue-300 font-medium">Pips</span>
                        </div>
                        <div className={`text-sm font-bold ${stats.totalPips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stats.totalPips > 0 ? '+' : ''}{stats.totalPips}
                        </div>
                      </div>

                      {/* Win Rate */}
                      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm p-1.5 rounded-md border border-purple-700/30">{/* Smaller padding */}
                        <div className="flex items-center space-x-1 mb-1">
                          <Target className="w-3 h-3 text-purple-400" />
                          <span className="text-xs text-purple-300 font-medium">Win Rate</span>
                        </div>
                        <div className="text-sm font-bold text-purple-400">
                          {stats.winRate.toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="text-xs text-gray-500 text-center pt-1.5 border-t border-gray-700/30">{/* Smaller padding */}
                      {week.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {week.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">{/* Smaller padding */}
                    <Activity className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                    <span className="text-gray-500 text-sm">No trades this week</span>
                    <div className="text-xs text-gray-600 mt-1">
                      {week.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {week.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default WeeklySummary;
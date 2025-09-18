"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { useTrades } from '../context/TradeContext';

// Weekly Trades Bar Chart Component
const DailyTrades = () => {
  const { trades, loading, error } = useTrades();
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  // Effect to determine if it's a mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Initialize to current week's Monday
    const today = new Date();
    const currentMonday = getMonday(today);
    setCurrentWeekStart(currentMonday);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to get Monday of any given date
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Helper function to format date as YYYY-MM-DD
  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Helper function to format date for display
  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Process trades to get weekly trade data
  const weeklyTradesData = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const weekData = [];

    // Generate the 5 weekdays starting from currentWeekStart
    for (let i = 0; i < 5; i++) {
      const currentDay = new Date(currentWeekStart);
      currentDay.setDate(currentWeekStart.getDate() + i);
      
      const dayKey = formatDateKey(currentDay);
      
      // Count trades for this specific date
      const dayTrades = trades.filter(trade => {
        if (!trade.date) return false;
        const tradeDate = new Date(trade.date);
        return formatDateKey(tradeDate) === dayKey;
      });

      weekData.push({
        day: weekDays[i],
        trades: dayTrades.length,
        date: currentDay,
        dateDisplay: formatDateDisplay(currentDay)
      });
    }

    return weekData;
  }, [trades, currentWeekStart]);

  // Navigation functions
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  // Format week range for display
  const getWeekRange = () => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 4); // Friday
    
    const startDisplay = currentWeekStart.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
    const endDisplay = weekEnd.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    return `${startDisplay} - ${endDisplay}`;
  };

  const days = weeklyTradesData.map(d => d.day);
  const maxValue = Math.max(7, Math.max(...weeklyTradesData.map(d => d.trades)) + 1);
  const limitValue = 3;

  const svgWidth = 700;
  const svgHeight = 400;
  const padding = { top: 40, right: 20, bottom: 80, left: 60 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const barSpacing = 0.2;

  const barWidth = chartWidth / (days.length * (1 + barSpacing));

  // Loading state
  if (loading) {
    return (
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-blue-800/30 to-slate-900/30 rounded-2xl blur-3xl shadow-blue-500/50 animate-pulse"></div>
        <div className="relative backdrop-blur-2xl bg-slate-900/80 border border-blue-500/30 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
            Overtrading Analysis
          </h2>
          <div className="flex items-center justify-center h-[400px]">
            <div className="relative">
              <div className="rounded-full h-20 w-20 border-4 border-blue-500/30 border-t-blue-400 shadow-blue-400/50 animate-spin"></div>
              <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-blue-400/20 shadow-blue-400/50 animate-ping"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 via-slate-800/30 to-blue-900/30 rounded-2xl blur-3xl shadow-red-500/50"></div>
        <div className="relative backdrop-blur-2xl bg-slate-900/80 border border-red-500/30 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl md:text-2xl font-bold text-white mb-5 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
            Overtrading Analysis
          </h2>
          <div className="text-red-400 text-center">
            <div className="text-6xl mb-6 drop-shadow-lg animate-shake">
              ⚠️
            </div>
            <div className="text-xl">Error: {error.message || 'Failed to fetch data'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group w-full">
      {/* Blue-themed outer glow effect */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-cyan-500/40 to-slate-800/40 rounded-2xl blur-3xl group-hover:from-blue-500/60 group-hover:via-cyan-400/60 group-hover:to-slate-700/60 transition-all duration-1000 shadow-blue-500/50 animate-pulse-light"
      />

      {/* Main container with blue-black glassy effect */}
      <div className="relative backdrop-blur-2xl bg-slate-900/85 border border-blue-500/40 rounded-2xl p-6 md:p-8 w-full overflow-hidden shadow-2xl">

        {/* Header with blue glowing text */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
            Overtrading Analysis
          </h2>
          
          {/* Legend for the chart */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-blue-500 shadow-lg shadow-blue-500/30"></div>
              <span className="text-gray-300">Trades ≤ 3</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-red-500 shadow-lg shadow-red-500/30"></div>
              <span className="text-gray-300">{`Trades > 3`}</span>
            </div>
          </div>
        </div>

        {/* Chart with blue-themed background */}
        <div className="flex justify-center items-center mb-5">
          <div className="w-full backdrop-blur-xl bg-slate-900/60 rounded-xl border border-blue-500/30 shadow-blue-400/30 p-6">
            {/* Navigation Controls */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-300 text-lg font-medium bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {getWeekRange()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousWeek}
                  className="p-2 rounded-lg backdrop-blur-lg bg-slate-800/50 border border-blue-600/30 hover:bg-slate-800/70 hover:border-blue-500/50 transition-all duration-200 text-gray-300 hover:text-white shadow-lg hover:shadow-blue-400/30"
                  title="Previous Week"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={goToNextWeek}
                  className="p-2 rounded-lg backdrop-blur-lg bg-slate-800/50 border border-blue-600/30 hover:bg-slate-800/70 hover:border-blue-500/50 transition-all duration-200 text-gray-300 hover:text-white shadow-lg hover:shadow-blue-400/30"
                  title="Next Week"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
              width="100%"
              height="100%"
              style={{ display: "block" }}
              className="overflow-visible"
            >
              {/* Subtle background grid */}
              <defs>
                <pattern id="grid-trades" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1"/>
                </pattern>
                
                {/* Gradient definitions for bars */}
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              <rect width="100%" height="100%" fill="url(#grid-trades)" />

              {/* Y-axis labels */}
              {[...Array(maxValue + 1)].map((_, i) => {
                const value = i;
                const y = padding.top + chartHeight - ((value / maxValue) * chartHeight);
                
                return (
                  <g key={`y-axis-${value}`}>
                    <text
                      x={padding.left - 20}
                      y={y + 5}
                      fill="#9ca3af"
                      fontSize="14"
                      textAnchor="end"
                      fontFamily="system-ui"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis label */}
              <text
                x={padding.left - 50}
                y={svgHeight / 2}
                fill="#d1d5db"
                fontSize="16"
                textAnchor="middle"
                fontFamily="system-ui"
                fontWeight="500"
                transform={`rotate(-90 ${padding.left - 50},${svgHeight / 2})`}
              >
                Daily Trades
              </text>

              {/* X-axis labels (Days with dates) */}
              {weeklyTradesData.map((dayData, index) => {
                const x = padding.left + (index * (barWidth * (1 + barSpacing))) + (barWidth / 2);
                return (
                  <g key={dayData.day}>
                    <text
                      x={x}
                      y={padding.top + chartHeight + 25}
                      fill="#9ca3af"
                      fontSize="14"
                      textAnchor="middle"
                      fontFamily="system-ui"
                      fontWeight="500"
                    >
                      {dayData.day}
                    </text>
                    <text
                      x={x}
                      y={padding.top + chartHeight + 45}
                      fill="#6b7280"
                      fontSize="12"
                      textAnchor="middle"
                      fontFamily="system-ui"
                    >
                      {dayData.dateDisplay}
                    </text>
                  </g>
                );
              })}

              {/* Bars with segmented colors */}
              {weeklyTradesData.map((dayData, index) => {
                const barX = padding.left + (index * (barWidth * (1 + barSpacing)));
                const totalBarHeight = (dayData.trades / maxValue) * chartHeight;
                const totalBarY = padding.top + chartHeight - totalBarHeight;
                const isExceedingLimit = dayData.trades > limitValue;

                // Calculate blue and red portions
                const blueHeight = isExceedingLimit 
                  ? (limitValue / maxValue) * chartHeight 
                  : totalBarHeight;
                const redHeight = isExceedingLimit 
                  ? ((dayData.trades - limitValue) / maxValue) * chartHeight 
                  : 0;

                return (
                  <g key={dayData.day}>
                    {/* Blue portion (trades within limit) */}
                    {blueHeight > 0 && (
                      <rect
                        x={barX}
                        y={padding.top + chartHeight - blueHeight}
                        width={barWidth}
                        height={blueHeight}
                        fill="url(#blueGradient)"
                        className="transition-all duration-300 ease-out hover:opacity-80"
                        rx="6"
                        ry="6"
                        style={{
                          filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))'
                        }}
                      />
                    )}

                    {/* Red portion (exceeding trades) */}
                    {redHeight > 0 && (
                      <rect
                        x={barX}
                        y={totalBarY}
                        width={barWidth}
                        height={redHeight}
                        fill="url(#redGradient)"
                        className="transition-all duration-300 ease-out hover:opacity-80"
                        rx="6"
                        ry="6"
                        style={{
                          filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3))'
                        }}
                      />
                    )}
                    
                    {/* Value label on top of bar */}
                    {dayData.trades > 0 && (
                      <text
                        x={barX + barWidth / 2}
                        y={totalBarY - 10}
                        fill="#e5e7eb"
                        fontSize="12"
                        textAnchor="middle"
                        fontFamily="system-ui"
                        fontWeight="600"
                        style={{
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                        }}
                      >
                        {dayData.trades}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Detailed Analysis Section with blue theme */}
        <div className="relative group/card">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-cyan-500/30 rounded-xl blur-lg group-hover/card:from-blue-500/50 group-hover/card:to-cyan-400/50 transition-all duration-300 shadow-blue-400/30" />
          <div className="relative backdrop-blur-xl bg-slate-900/70 border border-blue-500/40 rounded-xl p-4 shadow-xl">
            <h3 className="text-xl lg:text-xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-blue-400/50 animate-pulse-slow" />
              Weekly Trading Summary
            </h3>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="group/item p-3 backdrop-blur-lg bg-slate-800/50 rounded-lg border border-blue-600/30 hover:bg-slate-800/70 hover:border-blue-500/50 transition-all duration-200 shadow-lg hover:shadow-blue-400/30">
                <div className="text-gray-400 mb-1 text-sm">Total Weekly Trades</div>
                <div className="text-white font-semibold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {weeklyTradesData.reduce((sum, day) => sum + day.trades, 0)}
                </div>
              </div>
              
              <div className="group/item p-3 backdrop-blur-lg bg-slate-800/50 rounded-lg border border-blue-600/30 hover:bg-slate-800/70 hover:border-blue-500/50 transition-all duration-200 shadow-lg hover:shadow-blue-400/30">
                <div className="text-gray-400 mb-1 text-sm">Average Daily Trades</div>
                <div className="text-white font-semibold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {weeklyTradesData.reduce((sum, day) => sum + day.trades, 0) > 0 ? 
                    (weeklyTradesData.reduce((sum, day) => sum + day.trades, 0) / weeklyTradesData.filter(day => day.trades > 0).length).toFixed(1) :
                    '0.0'
                  }
                </div>
              </div>
              
              <div className="group/item p-3 backdrop-blur-lg bg-slate-800/50 rounded-lg border border-blue-600/30 hover:bg-slate-800/70 hover:border-blue-500/50 transition-all duration-200 shadow-lg hover:shadow-blue-400/30">
                <div className="text-gray-400 mb-1 text-sm">Days Overtrading</div>
                <div className={`font-semibold text-lg ${
                  weeklyTradesData.filter(day => day.trades > limitValue).length > 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {weeklyTradesData.filter(day => day.trades > limitValue).length}/5
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blue-themed Custom Scrollbar Styles */}
      <style>{`
        @keyframes pulse-light {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.02); }
        }
        .animate-pulse-light {
          animation: pulse-light 4s infinite ease-in-out;
        }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        .animate-shake {
          animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default DailyTrades;
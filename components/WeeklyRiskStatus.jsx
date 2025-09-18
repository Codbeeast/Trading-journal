"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { useTrades } from '../context/TradeContext';

// Weekly Risk Status Bar Chart Component with NewsChart UI styling
const WeeklyRiskStatus = () => {
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

  // Process trades to get weekly risk data
  const weeklyRiskData = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const weekData = [];

    // Generate the 5 weekdays starting from currentWeekStart
    for (let i = 0; i < 5; i++) {
      const currentDay = new Date(currentWeekStart);
      currentDay.setDate(currentWeekStart.getDate() + i);
      
      const dayKey = formatDateKey(currentDay);
      
      // Get all trades for this specific date
      const dayTrades = trades.filter(trade => {
        if (!trade.date) return false;
        const tradeDate = new Date(trade.date);
        return formatDateKey(tradeDate) === dayKey;
      });

      // Calculate daily risk for this specific date
      let dailyRisk = 0;
      
      if (dayTrades.length > 0) {
        // If trades have a risk field, use it; otherwise use a default risk calculation
        const totalRisk = dayTrades.reduce((sum, trade) => {
          // If trade.risk exists, use it; otherwise calculate risk as percentage
          let tradeRisk = trade.risk;
          
          // If no risk field, calculate based on trade size or use default
          if (tradeRisk === undefined || tradeRisk === null) {
            // Option 1: Use a default risk per trade (e.g., 1% per trade)
            tradeRisk = 1.0;
          }
          
          return sum + tradeRisk;
        }, 0);
        
        // Ensure minimum display value for visualization
        dailyRisk = Math.max(0.1, Math.min(totalRisk, 5.0));
      }

      weekData.push({
        day: weekDays[i],
        risk: dailyRisk,
        tradeCount: dayTrades.length,
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

  const days = weeklyRiskData.map(d => d.day);
  const maxValue = 5.0; // Max value for the Y-axis
  const riskNominal = 2.0; // The first limit line
  const riskLimit = 4.0;   // The second limit line

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
            Weekly Risk Status
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
            Weekly Risk Status
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
            Weekly Risk Status
          </h2>
          
          {/* Legend for the chart */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-blue-500 shadow-lg shadow-blue-500/30"></div>
              <span className="text-gray-300">Within Limits ≤ {riskNominal}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-amber-500 shadow-lg shadow-amber-500/30"></div>
              <span className="text-gray-300">Elevated Risk ≤ {riskLimit}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-red-500 shadow-lg shadow-red-500/30"></div>
              <span className="text-gray-300">{`High Risk >`} {riskLimit}%</span>
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
                <pattern id="grid-risk" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1"/>
                </pattern>
                
                {/* Gradient definitions for bars */}
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="amberGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              <rect width="100%" height="100%" fill="url(#grid-risk)" />

              {/* Y-axis labels */}
              {[0.0, 1.0, 2.0, 3.0, 4.0, 5.0].map(value => {
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
                      {value.toFixed(1)}
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
                Risk %
              </text>

              {/* X-axis labels (Days with dates) */}
              {weeklyRiskData.map((dayData, index) => {
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
              {weeklyRiskData.map((dayData, index) => {
                const barX = padding.left + (index * (barWidth * (1 + barSpacing)));
                const totalBarHeight = (dayData.risk / maxValue) * chartHeight;
                const totalBarY = padding.top + chartHeight - totalBarHeight;

                // Calculate heights for different segments
                let nominalHeight = 0;
                let elevatedHeight = 0;
                let highRiskHeight = 0;

                if (dayData.risk > 0) {
                  if (dayData.risk <= riskNominal) {
                    // All risk is within nominal limits
                    nominalHeight = totalBarHeight;
                  } else if (dayData.risk <= riskLimit) {
                    // Risk spans nominal and elevated
                    nominalHeight = (riskNominal / maxValue) * chartHeight;
                    elevatedHeight = totalBarHeight - nominalHeight;
                  } else {
                    // Risk spans all three levels
                    nominalHeight = (riskNominal / maxValue) * chartHeight;
                    elevatedHeight = ((riskLimit - riskNominal) / maxValue) * chartHeight;
                    highRiskHeight = totalBarHeight - nominalHeight - elevatedHeight;
                  }
                }

                return (
                  <g key={dayData.day}>
                    {/* Blue segment (base/safe level) */}
                    {nominalHeight > 0 && (
                      <rect
                        x={barX}
                        y={padding.top + chartHeight - nominalHeight}
                        width={barWidth}
                        height={nominalHeight}
                        fill="url(#blueGradient)"
                        className="transition-all duration-300 ease-out hover:opacity-80"
                        rx="6"
                        ry="6"
                        style={{
                          filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))'
                        }}
                      />
                    )}

                    {/* Yellow segment (elevated risk) */}
                    {elevatedHeight > 0 && (
                      <rect
                        x={barX}
                        y={padding.top + chartHeight - nominalHeight - elevatedHeight}
                        width={barWidth}
                        height={elevatedHeight}
                        fill="url(#amberGradient)"
                        className="transition-all duration-300 ease-out hover:opacity-80"
                        rx="6"
                        ry="6"
                        style={{
                          filter: 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3))'
                        }}
                      />
                    )}

                    {/* Red segment (high risk) */}
                    {highRiskHeight > 0 && (
                      <rect
                        x={barX}
                        y={totalBarY}
                        width={barWidth}
                        height={highRiskHeight}
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
                    {dayData.risk > 0 && (
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
                        {dayData.risk.toFixed(1)}%
                      </text>
                    )}

                    {/* Trade count indicator */}
                    {dayData.tradeCount > 0 && (
                      <text
                        x={barX + barWidth / 2}
                        y={padding.top + chartHeight + 65}
                        fill="#6b7280"
                        fontSize="10"
                        textAnchor="middle"
                        fontFamily="system-ui"
                      >
                        {dayData.tradeCount} trade{dayData.tradeCount !== 1 ? 's' : ''}
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
              Weekly Risk Summary
            </h3>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="group/item p-3 backdrop-blur-lg bg-slate-800/50 rounded-lg border border-blue-600/30 hover:bg-slate-800/70 hover:border-blue-500/50 transition-all duration-200 shadow-lg hover:shadow-blue-400/30">
                <div className="text-gray-400 mb-1 text-sm">Total Weekly Risk</div>
                <div className="text-white font-semibold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {weeklyRiskData.reduce((sum, day) => sum + day.risk, 0).toFixed(1)}%
                </div>
              </div>
              
              <div className="group/item p-3 backdrop-blur-lg bg-slate-800/50 rounded-lg border border-blue-600/30 hover:bg-slate-800/70 hover:border-blue-500/50 transition-all duration-200 shadow-lg hover:shadow-blue-400/30">
                <div className="text-gray-400 mb-1 text-sm">Average Daily Risk</div>
                <div className="text-white font-semibold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {weeklyRiskData.reduce((sum, day) => sum + day.risk, 0) > 0 ? 
                    (weeklyRiskData.reduce((sum, day) => sum + day.risk, 0) / weeklyRiskData.filter(day => day.risk > 0).length).toFixed(1) :
                    '0.0'
                  }%
                </div>
              </div>
              
              <div className="group/item p-3 backdrop-blur-lg bg-slate-800/50 rounded-lg border border-blue-600/30 hover:bg-slate-800/70 hover:border-blue-500/50 transition-all duration-200 shadow-lg hover:shadow-blue-400/30">
                <div className="text-gray-400 mb-1 text-sm">Days Over Limit</div>
                <div className={`font-semibold text-lg ${
                  weeklyRiskData.filter(day => day.risk > riskLimit).length > 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {weeklyRiskData.filter(day => day.risk > riskLimit).length}/5
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

export default WeeklyRiskStatus;
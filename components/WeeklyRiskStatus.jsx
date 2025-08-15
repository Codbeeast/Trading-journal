import React, { useMemo, useState } from 'react';
import { useTrades } from '../context/TradeContext'; // Adjust path as needed

// Weekly Risk Status Bar Chart Component
const WeeklyRiskStatus = () => {
  const { trades, loading, error } = useTrades();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Process trades to get monthly risk data
  const weeklyRiskData = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    // Get all trades for the selected month
    const selectedYear = currentDate.getFullYear();
    const selectedMonth = currentDate.getMonth();
    
    // Filter trades for the selected month
    const monthTrades = trades.filter(trade => {
      if (!trade.date) return false;
      
      const tradeDate = new Date(trade.date);
      return (
        tradeDate.getFullYear() === selectedYear &&
        tradeDate.getMonth() === selectedMonth
      );
    });

    // Group trades by day of week and calculate risk for the entire month
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const weeklyData = weekDays.map((day, dayIndex) => {
      // dayIndex: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
      // JavaScript getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
      const jsDay = dayIndex + 1; // Convert to JavaScript day (1=Mon, 2=Tue, etc.)
      
      // Get all trades for this day of week in the selected month
      const dayTrades = monthTrades.filter(trade => {
        const tradeDate = new Date(trade.date);
        return tradeDate.getDay() === jsDay;
      });

      // Calculate monthly risk for this day of week
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
            
            // Option 2: Calculate based on trade amount if available
            // if (trade.amount && trade.accountSize) {
            //   tradeRisk = (Math.abs(trade.amount) / trade.accountSize) * 100;
            // }
            
            // Option 3: Use trade count as risk indicator
            // tradeRisk = 0.5; // 0.5% per trade
          }
          
          return sum + tradeRisk;
        }, 0);
        
        // Ensure minimum display value for visualization
        dailyRisk = Math.max(0.1, Math.min(totalRisk, 5.0));
      }

      return {
        day,
        risk: dailyRisk,
        tradeCount: dayTrades.length,
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01` // Just for reference
      };
    });

    return weeklyData;
  }, [trades, currentDate]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Format current month/year for display
  const currentMonthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const days = weeklyRiskData.map(d => d.day);
  const maxValue = 5.0; // Max value for the Y-axis
  const riskNominal = 2.0; // The first limit line
  const riskLimit = 4.0;   // The second limit line

  const svgWidth = 700;
  const svgHeight = 400;
  const padding = { top: 40, right: 20, bottom: 60, left: 60 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const barSpacing = 0.2;

  const barWidth = chartWidth / (days.length * (1 + barSpacing));

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div
          className="bg-black border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl"
          style={{
            background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Header skeleton */}
          <div className="text-center mb-8">
            <div className="h-8 w-64 bg-gray-700/50 rounded-lg mx-auto mb-4 animate-pulse"></div>
            <div className="flex justify-center gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-700/50 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-700/50 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart skeleton */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 md:p-8">
            <div className="flex items-end justify-center gap-8 h-64">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
                <div key={day} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-16 bg-gray-700/50 rounded-t-lg animate-pulse"
                    style={{ 
                      height: `${Math.random() * 150 + 50}px`,
                      animationDelay: `${index * 100}ms`
                    }}
                  ></div>
                  <div className="h-4 w-8 bg-gray-700/50 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="h-4 w-24 bg-gray-700/50 rounded mb-2 animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-700/50 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-black border border-red-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="text-center text-red-400">
            <p className="mb-2">Error loading weekly risk data:</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div
        className="bg-black border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl"
        style={{
          background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Card Header */}
        <div className="text-center mb-8">
          <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-4">
            Monthly Risk Status
          </h3>
          
          {/* Legend for the chart */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
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

        {/* Chart Area */}
        <div
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 md:p-8 relative"
          style={{
            background: 'linear-gradient(to bottom right, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.4))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          {/* Navigation Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-gray-300 text-sm font-medium mr-3">
              {currentMonthYear}
            </span>
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-200 text-gray-300 hover:text-white"
              title="Previous Month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-200 text-gray-300 hover:text-white"
              title="Next Month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
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
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(75, 85, 99, 0.1)" strokeWidth="1"/>
              </pattern>
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

            {/* X-axis labels (Days) */}
            {days.map((day, index) => {
              const x = padding.left + (index * (barWidth * (1 + barSpacing))) + (barWidth / 2);
              return (
                <text
                  key={day}
                  x={x}
                  y={padding.top + chartHeight + 30}
                  fill="#9ca3af"
                  fontSize="14"
                  textAnchor="middle"
                  fontFamily="system-ui"
                  fontWeight="500"
                >
                  {day}
                </text>
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
                      fill="#3b82f6" // Blue
                      className="transition-all duration-300 ease-out hover:opacity-80"
                      rx="6"
                      ry="6"
                    />
                  )}

                  {/* Yellow segment (elevated risk) */}
                  {elevatedHeight > 0 && (
                    <rect
                      x={barX}
                      y={padding.top + chartHeight - nominalHeight - elevatedHeight}
                      width={barWidth}
                      height={elevatedHeight}
                      fill="#f59e0b" // Yellow/Amber
                      className="transition-all duration-300 ease-out hover:opacity-80"
                      rx="6"
                      ry="6"
                    />
                  )}

                  {/* Red segment (high risk) */}
                  {highRiskHeight > 0 && (
                    <rect
                      x={barX}
                      y={totalBarY}
                      width={barWidth}
                      height={highRiskHeight}
                      fill="#ef4444" // Red
                      className="transition-all duration-300 ease-out hover:opacity-80"
                      rx="6"
                      ry="6"
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
                    >
                      {dayData.risk.toFixed(1)}%
                    </text>
                  )}

                  {/* Trade count indicator */}
                  {dayData.tradeCount > 0 && (
                    <text
                      x={barX + barWidth / 2}
                      y={padding.top + chartHeight + 15}
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

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="text-gray-400 mb-1">Total Monthly Risk</div>
            <div className="text-white font-semibold text-lg">
              {weeklyRiskData.reduce((sum, day) => sum + day.risk, 0).toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="text-gray-400 mb-1">Average Daily Risk</div>
            <div className="text-white font-semibold text-lg">
              {weeklyRiskData.reduce((sum, day) => sum + day.risk, 0) > 0 ? 
                (weeklyRiskData.reduce((sum, day) => sum + day.risk, 0) / weeklyRiskData.filter(day => day.risk > 0).length).toFixed(1) :
                '0.0'
              }%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="text-gray-400 mb-1">Days Over Limit</div>
            <div className="text-white font-semibold text-lg">
              {weeklyRiskData.filter(day => day.risk > riskLimit).length}/5
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyRiskStatus;
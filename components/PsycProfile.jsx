"use client"

import React, { useMemo, useEffect } from 'react';
import { useTrades } from '@/context/TradeContext';

// Weekly Psychology Profile Component (2D Line Chart)
const WeeklyPsychProfile = () => {
  const { trades, loading, error, fetchTrades } = useTrades();

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Calculate dynamic data from trades
  const data = useMemo(() => {
    if (!trades || trades.length === 0) {
      return [
        { day: 'Monday', 'FOMO control': 0, 'Execution Rate': 0, 'Patience Level': 0, 'Confidence Index': 0, 'Fear and Greed': 0 },
        { day: 'Tuesday', 'FOMO control': 0, 'Execution Rate': 0, 'Patience Level': 0, 'Confidence Index': 0, 'Fear and Greed': 0 },
        { day: 'Wednesday', 'FOMO control': 0, 'Execution Rate': 0, 'Patience Level': 0, 'Confidence Index': 0, 'Fear and Greed': 0 },
        { day: 'Thursday', 'FOMO control': 0, 'Execution Rate': 0, 'Patience Level': 0, 'Confidence Index': 0, 'Fear and Greed': 0 },
        { day: 'Friday', 'FOMO control': 0, 'Execution Rate': 0, 'Patience Level': 0, 'Confidence Index': 0, 'Fear and Greed': 0 }
      ];
    }

    // Group trades by day of week
    const dayStats = {
      Monday: { trades: [], fomoSum: 0, executionSum: 0, fearGreedSum: 0, winCount: 0, totalCount: 0 },
      Tuesday: { trades: [], fomoSum: 0, executionSum: 0, fearGreedSum: 0, winCount: 0, totalCount: 0 },
      Wednesday: { trades: [], fomoSum: 0, executionSum: 0, fearGreedSum: 0, winCount: 0, totalCount: 0 },
      Thursday: { trades: [], fomoSum: 0, executionSum: 0, fearGreedSum: 0, winCount: 0, totalCount: 0 },
      Friday: { trades: [], fomoSum: 0, executionSum: 0, fearGreedSum: 0, winCount: 0, totalCount: 0 }
    };

    trades.forEach(trade => {
      // Use createdAt if date field is not set
      const dateStr = trade.date || trade.createdAt;
      if (dateStr) {
        const tradeDate = new Date(dateStr);
        const dayName = tradeDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        if (dayStats[dayName]) {
          dayStats[dayName].trades.push(trade);
          dayStats[dayName].fomoSum += trade.fomoRating || 0;
          dayStats[dayName].executionSum += trade.executionRating || 0;
          dayStats[dayName].fearGreedSum += trade.fearToGreed || 0;
          dayStats[dayName].totalCount += 1;
          
          if ((trade.pnl || 0) > 0) {
            dayStats[dayName].winCount += 1;
          }
        }
      }
    });

    // Calculate averages and return formatted data
    return Object.entries(dayStats).map(([day, stats]) => {
      const count = stats.totalCount;
      
      // If no trades for this day, return zeros (will show as flat line at bottom)
      if (count === 0) {
        return {
          day,
          'FOMO control': 0,
          'Execution Rate': 0,
          'Patience Level': 0,
          'Confidence Index': 0,
          'Fear and Greed': 0
        };
      }

      const avgFomo = stats.fomoSum / count;
      const avgExecution = stats.executionSum / count;
      const avgFearGreed = stats.fearGreedSum / count;
      const winRate = stats.winCount / count;
      
      return {
        day,
        'FOMO control': Math.min(10, Math.max(0, 10 - (avgFomo * 2))), // Invert FOMO, clamp 0-10
        'Execution Rate': Math.min(10, Math.max(0, avgExecution * 2)), // Scale to 0-10, clamp
        'Patience Level': Math.min(10, Math.max(0, (avgExecution * 1.5) + (winRate * 3))), // Composite score, clamp
        'Confidence Index': Math.min(10, Math.max(0, winRate * 10)), // Win rate as confidence, clamp
        'Fear and Greed': Math.min(10, Math.max(0, avgFearGreed)) // Direct fear/greed rating, clamp
      };
    });
  }, [trades]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const maxValue = 10;
  const svgWidth = 900;
  const svgHeight = 550;
  const padding = { top: 60, right: 60, bottom: 100, left: 80 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Function to get path data for a line
  const getPathData = (values) => {
    const points = values.map((value, index) => {
      const x = padding.left + (index / (days.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((value / maxValue) * chartHeight);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Metrics with their corresponding colors (matching speedometer)
  const metrics = [
    { key: 'FOMO control', label: 'FOMO Control', color: '#ef4444' }, // Red (matches speedometer)
    { key: 'Execution Rate', label: 'Execution Rate', color: '#10b981' }, // Green (matches speedometer)
    { key: 'Patience Level', label: 'Patience Level', color: '#3b82f6' }, // Blue (matches speedometer)
    { key: 'Confidence Index', label: 'Confidence Index', color: '#f59e0b' }, // Orange (matches speedometer)
    { key: 'Fear and Greed', label: 'Fear & Greed', color: '#8b5cf6' } // Purple (matches speedometer)
  ];

  if (loading) {
    return (
      <div className="min-h-screen  p-4">
        
        <div className="w-full max-w-7xl mx-auto">
          <div
            className="bg-black border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl animate-pulse"
            style={{
              background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="text-center mb-8">
              <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
              <div className="flex justify-center gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-2 bg-gray-700 rounded-full"></div>
                    <div className="w-16 h-4 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 md:p-8 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-4">
      
      
      <div className="w-full max-w-7xl mx-auto">
        {/* Main container with landing page theme */}
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
              Weekly Psych Profile
            </h3>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {metrics.map(metric => (
                <div key={metric.key} className="flex items-center gap-2">
                  <div
                    className="w-4 h-2 rounded-full shadow-md"
                    style={{ backgroundColor: metric.color }}
                  ></div>
                  <span className="text-gray-300">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Area */}
          <div
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 md:p-8"
            style={{
              background: 'linear-gradient(to bottom right, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.4))',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
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
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(75, 85, 99, 0.1)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Y-axis labels and horizontal grid lines */}
              {[...Array(6)].map((_, i) => { // 0, 2, 4, 6, 8, 10
                const value = i * 2;
                const y = padding.top + chartHeight - ((value / maxValue) * chartHeight);
                return (
                  <g key={`y-axis-${value}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + chartWidth}
                      y2={y}
                      stroke="#4b5563" // Darker grid lines
                      strokeWidth="1"
                      opacity="0.7"
                    />
                    <text
                      x={padding.left - 20}
                      y={y + 5}
                      fill="#9ca3af" // Light gray text
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
                x={padding.left - 55}
                y={svgHeight / 2}
                fill="#d1d5db" // Lighter gray text
                fontSize="16"
                textAnchor="middle"
                fontFamily="system-ui"
                fontWeight="500"
                transform={`rotate(-90 ${padding.left - 55},${svgHeight / 2})`}
              >
                Score (0-10)
              </text>

              {/* X-axis labels (Days) */}
              {days.map((day, index) => {
                const x = padding.left + (index / (days.length - 1)) * chartWidth;
                return (
                  <g key={`x-axis-${day}`}>
                    <text
                      x={x}
                      y={padding.top + chartHeight + 30}
                      fill="#9ca3af" // Light gray text
                      fontSize="14"
                      textAnchor="middle"
                      fontFamily="system-ui"
                      fontWeight="500"
                    >
                      {day}
                    </text>
                  </g>
                );
              })}

              {/* X-axis label */}
              <text
                x={svgWidth / 2}
                y={svgHeight - 20}
                fill="#d1d5db"
                fontSize="16"
                textAnchor="middle"
                fontFamily="system-ui"
                fontWeight="500"
              >
                Day
              </text>

              {/* Draw lines */}
              {metrics.map(metric => (
                <path
                  key={metric.key}
                  d={getPathData(data.map(d => d[metric.key]))}
                  fill="none"
                  stroke={metric.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Data points */}
              {data.map((item, dayIndex) => (
                <g key={dayIndex}>
                  {metrics.map(metric => {
                    const x = padding.left + (dayIndex / (days.length - 1)) * chartWidth;
                    const y = padding.top + chartHeight - ((item[metric.key] / maxValue) * chartHeight);
                    return (
                      <circle
                        key={metric.key}
                        cx={x}
                        cy={y}
                        r="5"
                        fill={metric.color}
                        stroke="#1f2937"
                        strokeWidth="2"
                        className="hover:r-6 transition-all cursor-pointer"
                      />
                    );
                  })}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPsychProfile;

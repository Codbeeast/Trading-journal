import React from 'react';

// Daily Trades Bar Chart Component
const DailyTrades = () => {
  // Sample data for daily trades, including a limit for Friday
  const data = [
    { day: 'Mon', trades: 60 },
    { day: 'Tue', trades: 55 },
    { day: 'Wed', trades: 48 },
    { day: 'Thu', trades: 45 },
    { day: 'Fri', trades: 70 } // Friday exceeds the limit visually
  ];

  const days = data.map(d => d.day);
  const maxValue = 100; // Max value for the Y-axis
  const limitValue = 60; // The limit line value

  const svgWidth = 700; // Width of the SVG canvas
  const svgHeight = 400; // Height of the SVG canvas
  const padding = { top: 60, right: 40, bottom: 80, left: 80 }; // Padding around the chart area
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const barSpacing = 0.2; // Percentage of bar width for spacing

  // Calculate bar width dynamically based on number of days and spacing
  const barWidth = chartWidth / (days.length * (1 + barSpacing));

  return (
    <div className="w-full max-w-6xl mx-auto">
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
            Daily Trades
          </h3>

          {/* Legend for the chart */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-blue-500 shadow-lg shadow-blue-500/30"></div>
              <span className="text-gray-300">Trades</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="4" className="mr-1">
                <line x1="0" y1="2" x2="20" y2="2" stroke="#60a5fa" strokeWidth="2" strokeDasharray="5,5" />
              </svg>
              <span className="text-gray-300">Limit</span>
            </div>
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

            {/* Y-axis labels and reference lines */}
            {[0, 20, 40, 60, 80, 100].map(value => {
              const y = padding.top + chartHeight - ((value / maxValue) * chartHeight);
              const isLimitLine = value === limitValue;
              
              return (
                <g key={`y-axis-${value}`}>
                  {/* Reference line for the limit */}
                  {isLimitLine && (
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + chartWidth}
                      y2={y}
                      stroke="#60a5fa"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.7"
                    />
                  )}
                  
                  {/* Y-axis labels */}
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
              x={padding.left - 55}
              y={svgHeight / 2}
              fill="#d1d5db"
              fontSize="16"
              textAnchor="middle"
              fontFamily="system-ui"
              fontWeight="500"
              transform={`rotate(-90 ${padding.left - 55},${svgHeight / 2})`}
            >
              Daily Trades
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

            {/* Bars with enhanced styling */}
            {data.map((dayData, index) => {
              const barX = padding.left + (index * (barWidth * (1 + barSpacing)));
              const barHeight = (dayData.trades / maxValue) * chartHeight;
              const barY = padding.top + chartHeight - barHeight;

              // Determine the color of the bar
              const isExceedingLimit = dayData.trades > limitValue;
              const barFillColor = isExceedingLimit ? '#ef4444' : '#3b82f6';
              const shadowColor = isExceedingLimit ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';

              return (
                <g key={dayData.day}>
                  {/* Bar shadow for depth */}
                  <rect
                    x={barX + 2}
                    y={barY + 2}
                    width={barWidth}
                    height={barHeight}
                    fill="rgba(0, 0, 0, 0.3)"
                    rx="6"
                    ry="6"
                  />
                  
                  {/* Main bar */}
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={barFillColor}
                    className="transition-all duration-300 ease-out hover:opacity-80"
                    rx="6"
                    ry="6"
                  />
                  
                  {/* Value label on top of bar */}
                  <text
                    x={barX + barWidth / 2}
                    y={barY - 10}
                    fill="#e5e7eb"
                    fontSize="12"
                    textAnchor="middle"
                    fontFamily="system-ui"
                    fontWeight="600"
                  >
                    {dayData.trades}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Status indicators at bottom */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-300">Within Limits</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-gray-300">Exceeds Limit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTrades;
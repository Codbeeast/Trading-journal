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
    <div
      className="rounded-lg p-2 md:p-8 lg:p-8 sm:p-6 shadow-2xl font-sans text-gray-200"
      style={{
        // Applied the black-blue gradient to the outer container
        background: 'linear-gradient(to bottom right, #020617, #172554, #0F172A)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)', // Dark shadow
        backdropFilter: 'blur(24px)', // Consistency
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Card Header */}
      <div className="flex flex-col items-center justify-center mb-4"> {/* Changed to column and centered */}
        <h3 className="text-3xl font-extrabold text-white mb-2"> {/* Added margin bottom */}
          Daily Trades
        </h3>
        {/* Legend for the chart - Moved here and adjusted for line styles */}
        <div className="flex items-center text-sm text-gray-300">
          <div className="flex items-center mr-4">
            <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: '#3b82f6' }}></div> {/* Blue for trades below limit */}
            <span>Trades</span>
          </div>
          <div className="flex items-center">
            {/* Visual representation of dashed line for Limit */}
            <svg width="20" height="4" className="mr-2">
              <line x1="0" y1="2" x2="20" y2="2" stroke="#a78bfa" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
            <span>Limit</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div
        className="rounded-lg p-8 shadow-2xl lg:w-[1100px] lg:h-[500px] lg:mx-auto md:w-[1100px] md:h-[400px] md:mx-auto shadow-black/30 font-sans text-gray-200"
        style={{
          // Applied the same black-blue gradient to the inner chart area
          background: 'linear-gradient(to bottom right, #020617, #172554, #0F172A)',
        }}
      >
<svg
  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
  preserveAspectRatio="xMidYMid meet"
  width="100%"
  height="100%"
  style={{ display: "block" }}
>
          {/* Y-axis labels and horizontal grid lines */}
          {[0, 20, 40, 60, 80, 100].map(value => {
            const y = padding.top + chartHeight - ((value / maxValue) * chartHeight);
            return (
              <g key={`y-axis-${value}`}>
                {/* Grid lines - All strokes set to 'none' to hide them */}
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="none" // Hidden
                  strokeWidth="1"
                  strokeDasharray={value === limitValue ? "5,5" : "0,0"}
                />
                {/* Y-axis labels */}
                <text
                  x={padding.left - 20}
                  y={y + 5}
                  fill="#9ca3af"
                  fontSize="17"
                  textAnchor="end"
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
            fill="#9ca3af"
            fontSize="20"
            textAnchor="middle"
            transform={`rotate(-90 ${padding.left - 55},${svgHeight / 2})`}
          >
            Daily Trades
          </text>

          {/* Limit Label - Removed from here as it's now in the legend */}

          {/* X-axis labels (Days) */}
          {days.map((day, index) => {
            const x = padding.left + (index * (barWidth * (1 + barSpacing))) + (barWidth / 2);
            return (
              <text
                key={day}
                x={x}
                y={padding.top + chartHeight + 30}
                fill="#9ca3af"
                fontSize="17"
                textAnchor="middle"
              >
                {day}
              </text>
            );
          })}

          {/* Bars */}
          {data.map((dayData, index) => {
            const barX = padding.left + (index * (barWidth * (1 + barSpacing)));
            const barHeight = (dayData.trades / maxValue) * chartHeight;
            const barY = padding.top + chartHeight - barHeight;

            // Determine the color of the bar
            let barFillColor = '#3b82f6'; // Default blue
            let overflowFillColor = 'none'; // No overflow by default

            // If trades exceed the limit, calculate overflow part
            if (dayData.trades > limitValue) {
              const limitHeight = (limitValue / maxValue) * chartHeight;
              const overflowHeight = barHeight - limitHeight;

              // Base part of the bar (up to limit)
              barFillColor = '#3b82f6'; // Blue for the part within limit

              // Overflow part of the bar (above limit)
              overflowFillColor = '#ef4444'; // Red for the overflow
              return (
                <g key={dayData.day}>
                  {/* Base part */}
                  <rect
                    x={barX}
                    y={barY + overflowHeight} // Position below overflow
                    width={barWidth}
                    height={limitHeight}
                    fill={barFillColor}
                    className="transition-all duration-300 ease-out"
                    rx="4" ry="4" // Rounded corners
                  />
                  {/* Overflow part */}
                  <rect
                    x={barX}
                    y={barY} // Position at the top
                    width={barWidth}
                    height={overflowHeight}
                    fill={overflowFillColor}
                    className="transition-all duration-300 ease-out"
                    rx="4" ry="4" // Rounded corners
                  />
                </g>
              );
            } else {
              // Bar is entirely within the limit
              return (
                <rect
                  key={dayData.day}
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={barFillColor}
                  className="transition-all duration-300 ease-out"
                  rx="4" ry="4" // Rounded corners
                />
              );
            }
          })}
        </svg>
      </div>
    </div>
  );
};

export default DailyTrades;

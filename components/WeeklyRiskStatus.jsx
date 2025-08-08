import React from 'react';

// Weekly Risk Status Bar Chart Component
const WeeklyRiskStatus = () => {
  // Sample data for weekly risk status
  const data = [
    { day: 'Mon', risk: 1.8 },
    { day: 'Tue', risk: 2.6 },
    { day: 'Wed', risk: 3.7 },
    { day: 'Thu', risk: 4.3 }, // Exceeds both nominal and limit visually
    { day: 'Fri', risk: 2.9 }
  ];

  const days = data.map(d => d.day);
  const maxValue = 5.0; // Max value for the Y-axis based on the image
  const riskNominal = 2.0; // The first limit line (dashed)
  const riskLimit = 4.0;   // The second limit line (dotted)

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
            Weekly Risk Status
          </h3>
          
          {/* Legend for the chart */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-blue-500 shadow-lg shadow-blue-500/30"></div>
              <span className="text-gray-300">Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="4" className="mr-1">
                <line x1="0" y1="2" x2="20" y2="2" stroke="#60a5fa" strokeWidth="2" strokeDasharray="5,5" />
              </svg>
              <span className="text-gray-300">Nominal</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="4" className="mr-1">
                <line x1="0" y1="2" x2="20" y2="2" stroke="#60a5fa" strokeWidth="2" strokeDasharray="2,2" />
              </svg>
              <span className="text-gray-300">Risk Limit</span>
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
            {[0.0, 1.0, 2.0, 3.0, 4.0, 5.0].map(value => {
              const y = padding.top + chartHeight - ((value / maxValue) * chartHeight);
              const isSpecialLine = value === riskNominal || value === riskLimit;
              
              return (
                <g key={`y-axis-${value}`}>
                  {/* Reference lines - only show special ones */}
                  {isSpecialLine && (
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + chartWidth}
                      y2={y}
                      stroke={value === riskNominal ? "#60a5fa" : "#60a5fa"}
                      strokeWidth="2"
                      strokeDasharray={value === riskNominal ? "5,5" : "2,2"}
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
                    {value.toFixed(1)}
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

            {/* Bars with enhanced styling */}
            {data.map((dayData, index) => {
              const barX = padding.left + (index * (barWidth * (1 + barSpacing)));
              const barHeight = (dayData.risk / maxValue) * chartHeight;
              const barY = padding.top + chartHeight - barHeight;

              let barFillColor, shadowColor;
              if (dayData.risk <= riskNominal) {
                barFillColor = '#3b82f6'; // Blue for values below nominal
                shadowColor = 'rgba(59, 130, 246, 0.4)';
              } else if (dayData.risk > riskNominal && dayData.risk <= riskLimit) {
                barFillColor = '#f59e0b'; // Amber for values between nominal and limit
                shadowColor = 'rgba(245, 158, 11, 0.4)';
              } else {
                barFillColor = '#ef4444'; // Red for values exceeding limit
                shadowColor = 'rgba(239, 68, 68, 0.4)';
              }

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
                    style={{
                      filter: ``,
                    }}
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
                    {dayData.risk.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Chart title */}
            {/* <text
              x={svgWidth / 2}
              y={30}
              fill="#f3f4f6"
              fontSize="18"
              textAnchor="middle"
              fontFamily="system-ui"
              fontWeight="600"
            >
              Daily Risk Analysis
            </text> */}
          </svg>
        </div>

        {/* Status indicators at bottom */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-300">Within Limits</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700">
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            <span className="text-gray-300">Elevated</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-gray-300">High Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyRiskStatus;
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
    <div
      className="rounded-lg p-2 md:p-8 lg:p-8 sm:p-6 shadow-2xl font-sans text-gray-200"
      style={{
        // Applied the black-blue gradient to the outer container, same as DailyTrades
        background: 'linear-gradient(to bottom right, #020617, #172554, #0F172A)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)', // Dark shadow
        backdropFilter: 'blur(24px)', // Consistency
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Card Header */}
      <div className="flex flex-col items-center justify-center mb-4"> {/* Changed to column and centered */}
        <h3 className="text-3xl font-extrabold text-white mb-2"> {/* Added margin bottom */}
          Weekly Risk Status
        </h3>
        {/* Legend for the chart - Moved here and adjusted for line styles */}
        <div className="flex items-center text-sm text-gray-300">
          <div className="flex items-center mr-4">
            <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: '#3b82f6' }}></div> {/* Blue for Risk bars */}
            <span>Risk</span>
          </div>
          <div className="flex items-center mr-4">
            {/* Visual representation of dashed line for Nominal */}
            <svg width="20" height="4" className="mr-2">
              <line x1="0" y1="2" x2="20" y2="2" stroke="#a78bfa" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
            <span>Nominal</span>
          </div>
          <div className="flex items-center">
            {/* Visual representation of dotted line for Risk Limit */}
            <svg width="20" height="4" className="mr-2">
              <line x1="0" y1="2" x2="20" y2="2" stroke="#a78bfa" strokeWidth="2" strokeDasharray="2,2" />
            </svg>
            <span>Risk Limit</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div
        className="rounded-lg p-8 shadow-2xl lg:w-[1100px] lg:h-[500px] lg:mx-auto md:w-[1100px] md:h-[400px] md:mx-auto shadow-black/30 font-sans text-gray-200"
        style={{
          // Applied the same black-blue gradient to the inner chart area, same as DailyTrades
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
          {[0.0, 1.0, 2.0, 3.0, 4.0, 5.0].map(value => {
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
                  strokeDasharray={
                    value === riskNominal ? "5,5" :
                    value === riskLimit ? "2,2" :
                    "0,0"
                  }
                />
                {/* Y-axis labels */}
                <text
                  x={padding.left - 20}
                  y={y + 5}
                  fill="#9ca3af" // Light grey for labels
                  fontSize="14"
                  textAnchor="end"
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
            fill="#9ca3af" // Light grey for labels
            fontSize="16"
            textAnchor="middle"
            transform={`rotate(-90 ${padding.left - 55},${svgHeight / 2})`}
          >
            Risk %
          </text>

          {/* Risk Nominal Label - Removed from here as it's now in the legend */}
          {/* Risk Limit Label - Removed from here as it's now in the legend */}

          {/* X-axis labels (Days) */}
          {days.map((day, index) => {
            const x = padding.left + (index * (barWidth * (1 + barSpacing))) + (barWidth / 2);
            return (
              <text
                key={day}
                x={x}
                y={padding.top + chartHeight + 30}
                fill="#9ca3af" // Light grey for labels
                fontSize="14"
                textAnchor="middle"
              >
                {day}
              </text>
            );
          })}

          {/* Bars */}
          {data.map((dayData, index) => {
            const barX = padding.left + (index * (barWidth * (1 + barSpacing)));
            const barHeight = (dayData.risk / maxValue) * chartHeight;
            const barY = padding.top + chartHeight - barHeight;

            let barFillColor;
            if (dayData.risk <= riskNominal) {
              barFillColor = '#3b82f6'; // Blue for values below nominal
            } else if (dayData.risk > riskNominal && dayData.risk <= riskLimit) {
              barFillColor = '#e6b800'; // Yellow for values between nominal and limit
            } else {
              barFillColor = '#ef4444'; // Red for values exceeding limit
            }

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
          })}
        </svg>
      </div>
    </div>
  );
};

export default WeeklyRiskStatus;

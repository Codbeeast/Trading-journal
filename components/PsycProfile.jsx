import React from 'react';

// Weekly Psychology Profile Component (2D Line Chart)
const WeeklyPsychProfile = () => {
  const data = [
    { day: 'Monday', emotReg: 7, decisionQual: 8, stress: 6, discipline: 9 },
    { day: 'Tuesday', emotReg: 6, decisionQual: 7, stress: 5, discipline: 8 },
    { day: 'Wednesday', emotReg: 4, decisionQual: 5, stress: 3, discipline: 6 },
    { day: 'Thursday', emotReg: 3, decisionQual: 4, stress: 2, discipline: 4 },
    { day: 'Friday', emotReg: 5, decisionQual: 6, stress: 4, discipline: 7 }
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const maxValue = 10;
  const svgWidth = 900; // Increased SVG width
  const svgHeight = 550; // Increased SVG height
  const padding = { top: 60, right: 60, bottom: 100, left: 80 }; // Adjusted padding for larger size
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

  // Metrics with their corresponding colors (adjusted for dark theme)
  const metrics = [
    { key: 'emotReg', label: 'Emot Regulation', color: '#67e8f9' }, // Sky blue
    { key: 'decisionQual', label: 'Decision Qual', color: '#f87171' }, // Red-orange
    { key: 'stress', label: 'Stress (Inv)', color: '#4ade80' }, // Emerald green
    { key: 'discipline', label: 'Discipline Adh', color: '#a78bfa' } // Violet
  ];

  return (
    <div
      className="rounded-lg p-2 md:p-8 lg:p-8 sm:p-6 shadow-2xl font-sans text-gray-200"
      style={{
        // Applied a solid, very dark blue-black background to the outer container
        background: 'linear-gradient(to bottom right, #020617, #172554, #0F172A)', // Using slate-900 equivalent for a distinct, dark background
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)', // Dark shadow
        backdropFilter: 'blur(24px)', // Maintaining consistency with other cards
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-center mb-6">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
          Weekly Psych Profile
        </h3>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-8 mb-8">
        {metrics.map(metric => (
          <div key={metric.key} className="flex items-center gap-3">
            <div
              className="w-5 h-2 rounded-full shadow-md"
              style={{ backgroundColor: metric.color }}
            ></div>
            <span className=" text-sm font-small sm:text-lg sm:font-medium text-gray-300">
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart Area */}
      {/* This inner div already has the requested gradient */}
      <div
        className="rounded-lg p-2 md:p-8 lg:p-8 sm:p-6 shadow-2xl shadow-black/30 font-sans text-gray-200"
        style={{
          background: 'linear-gradient(to bottom right, #020617, #172554, #0F172A)', // from-slate-950 via-blue-950 to-slate-900
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
                />
                <text
                  x={padding.left - 20}
                  y={y + 5}
                  fill="#9ca3af" // Light gray text
                  fontSize="14"
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
            fill="#9ca3af" // Light gray text
            fontSize="16"
            textAnchor="middle"
            transform={`rotate(-90 ${padding.left - 55},${svgHeight / 2})`}
          >
            Score (0-10)
          </text>

          {/* X-axis labels (Days) and vertical grid lines */}
          {days.map((day, index) => {
            const x = padding.left + (index / (days.length - 1)) * chartWidth;
            return (
              <g key={`x-axis-${day}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartHeight}
                  stroke="#4b5563" // Darker grid lines
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + chartHeight + 30}
                  fill="#9ca3af" // Light gray text
                  fontSize="14"
                  textAnchor="middle"
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
            fill="#9ca3af" // Light gray text
            fontSize="16"
            textAnchor="middle"
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
              strokeWidth="3" // Slightly thicker lines
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
                    r="5" // Slightly larger data points
                    fill={metric.color}
                    stroke="#1f2937" // Dark background for points
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
  );
};

export default WeeklyPsychProfile;
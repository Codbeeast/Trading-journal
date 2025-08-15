import React from 'react';


// Weekly Psychology Profile Component (2D Line Chart)
const WeeklyPsychProfile = () => {
 const data = [
 { day: 'Monday', 'FOMO control': 7, 'Execution Rate': 8, 'Patience Level': 6, 'Confidence Index': 9, 'Fear and Greed': 5 },
 { day: 'Tuesday', 'FOMO control': 6, 'Execution Rate': 7, 'Patience Level': 5, 'Confidence Index': 8, 'Fear and Greed': 6 },
 { day: 'Wednesday', 'FOMO control': 4, 'Execution Rate': 5, 'Patience Level': 3, 'Confidence Index': 6, 'Fear and Greed': 7 },
 { day: 'Thursday', 'FOMO control': 3, 'Execution Rate': 4, 'Patience Level': 2, 'Confidence Index': 4, 'Fear and Greed': 8 },
 { day: 'Friday', 'FOMO control': 5, 'Execution Rate': 6, 'Patience Level': 4, 'Confidence Index': 7, 'Fear and Greed': 9 }
 ];


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


 // Metrics with their corresponding colors (adjusted for dark theme)
 const metrics = [
 { key: 'FOMO control', label: 'FOMO Control', color: '#60a5fa' }, // Blue
 { key: 'Execution Rate', label: 'Execution Rate', color: '#a78bfa' }, // Violet
 { key: 'Patience Level', label: 'Patience Level', color: '#4ade80' }, // Green
 { key: 'Confidence Index', label: 'Confidence Index', color: '#f87171' }, // Red
 { key: 'Fear and Greed', label: 'Fear & Greed', color: '#facc15' } // Yellow/Orange
 ];


 return (
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
 d={getPathData(data.map(d => d[[metric.key]]))}
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
 const y = padding.top + chartHeight - ((item[[metric.key]] / maxValue) * chartHeight);
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
 );
};


export default WeeklyPsychProfile;
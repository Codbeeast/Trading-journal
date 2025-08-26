import React, { useMemo, useState } from 'react';
import { useTrades } from '../context/TradeContext'; // Adjust path as needed

// Regulation Chart Component
const RegulationChart = () => {
  const { trades, loading, error } = useTrades();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Sample data structure - replace with your actual data processing logic
  const regulationData = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    // Get trades for selected month and process regulation data
    const selectedYear = currentDate.getFullYear();
    const selectedMonth = currentDate.getMonth();
    
    const monthTrades = trades.filter(trade => {
      if (!trade.date) return false;
      const tradeDate = new Date(trade.date);
      return (
        tradeDate.getFullYear() === selectedYear &&
        tradeDate.getMonth() === selectedMonth
      );
    });

    // Group by categories (you can modify this logic based on your needs)
    const categories = ['G1vsG2', 'G2vsG3', 'G1vsG3', 'A1vsA2', 'A2vsA3', 'A1vsA3', 'G1vsA1', 'G2vsA2', 'G3vsA3'];
    
    return categories.map((category, index) => {
      // Filter trades by some criteria - this is example logic
      const categoryTrades = monthTrades.filter(trade => {
        // You can implement your own logic here based on trade properties
        return trade.pair && trade.setupType;
      });

      // Sample values - replace with your actual calculation
      const upRegulated = Math.floor(Math.random() * 5000) + 500;
      const downRegulated = Math.floor(Math.random() * 5000) + 500;
      
      // Get news from trades for this category
      const newsItems = categoryTrades
        .filter(trade => trade.news && trade.news.trim() !== '')
        .map(trade => trade.news)
        .slice(0, 5); // Limit to 5 news items

      return {
        category,
        upRegulated,
        downRegulated,
        news: newsItems,
        trades: categoryTrades
      };
    });
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

  const currentMonthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Chart dimensions
  const svgWidth = 800;
  const svgHeight = 500;
  const padding = { top: 60, right: 40, bottom: 100, left: 80 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Calculate max values for scaling
  const maxUpValue = Math.max(...regulationData.map(d => d.upRegulated));
  const maxDownValue = Math.max(...regulationData.map(d => d.downRegulated));
  const maxValue = Math.max(maxUpValue, maxDownValue);
  const yMax = Math.ceil(maxValue / 1000) * 1000; // Round up to nearest thousand

  const barWidth = chartWidth / (regulationData.length * 1.5);
  const barSpacing = barWidth * 0.1;

  // Handle mouse events for tooltip
  const handleMouseEnter = (event, data, type) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const containerRect = event.currentTarget.closest('.bg-gray-900\\/50').getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top
    });
    setHoveredBar({ data, type });
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
  };

  const handleMouseMove = (event) => {
    if (hoveredBar) {
      const rect = event.currentTarget.getBoundingClientRect();
      const containerRect = event.currentTarget.closest('.bg-gray-900\\/50').getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top - containerRect.top
      });
    }
  };

  // Loading state
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
          <div className="text-center mb-8">
            <div className="h-8 w-48 bg-gray-700/50 rounded-lg mx-auto mb-4 animate-pulse"></div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 md:p-8">
            <div className="h-64 w-full bg-gray-700/50 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-black border border-red-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="text-center text-red-400">
            <p className="mb-2">Error loading regulation data:</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto relative">
      <div
        className="bg-black border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl"
        style={{
          background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-4">
            Regulation Analysis
          </h3>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-red-500 shadow-lg shadow-red-500/30"></div>
              <span className="text-gray-300">Up-regulated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-blue-500 shadow-lg shadow-blue-500/30"></div>
              <span className="text-gray-300">Down-regulated</span>
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
            onMouseMove={handleMouseMove}
            style={{ display: "block" }}
            className="overflow-visible"
          >
            {/* Background grid */}
            <defs>
              <pattern id="grid-regulation" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(75, 85, 99, 0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-regulation)" />

            {/* Y-axis */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + chartHeight}
              stroke="#4b5563"
              strokeWidth="2"
            />

            {/* X-axis */}
            <line
              x1={padding.left}
              y1={padding.top + chartHeight / 2}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight / 2}
              stroke="#4b5563"
              strokeWidth="2"
            />

            {/* Y-axis labels */}
            {[0, 2000, 4000, 6000].map((value) => {
              const yUp = padding.top + (chartHeight / 2) - ((value / yMax) * (chartHeight / 2));
              const yDown = padding.top + (chartHeight / 2) + ((value / yMax) * (chartHeight / 2));
              
              return (
                <g key={`y-axis-${value}`}>
                  {/* Positive values */}
                  <text
                    x={padding.left - 10}
                    y={yUp + 5}
                    fill="#9ca3af"
                    fontSize="12"
                    textAnchor="end"
                    fontFamily="system-ui"
                  >
                    {value}
                  </text>
                  {/* Negative values */}
                  {value > 0 && (
                    <text
                      x={padding.left - 10}
                      y={yDown + 5}
                      fill="#9ca3af"
                      fontSize="12"
                      textAnchor="end"
                      fontFamily="system-ui"
                    >
                      -{value}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Y-axis label */}
            <text
              x={padding.left - 60}
              y={svgHeight / 2}
              fill="#d1d5db"
              fontSize="14"
              textAnchor="middle"
              fontFamily="system-ui"
              fontWeight="500"
              transform={`rotate(-90 ${padding.left - 60},${svgHeight / 2})`}
            >
              Up-regulated / Down-regulated
            </text>

            {/* Bars */}
            {regulationData.map((data, index) => {
              const x = padding.left + (index * (barWidth + barSpacing)) + barSpacing;
              const centerY = padding.top + chartHeight / 2;
              
              // Up-regulated bar (red, above center)
              const upHeight = (data.upRegulated / yMax) * (chartHeight / 2);
              const upY = centerY - upHeight;
              
              // Down-regulated bar (blue, below center)
              const downHeight = (data.downRegulated / yMax) * (chartHeight / 2);
              const downY = centerY;

              return (
                <g key={data.category}>
                  {/* Up-regulated bar */}
                  <rect
                    x={x}
                    y={upY}
                    width={barWidth}
                    height={upHeight}
                    fill="#ef4444"
                    className="transition-all duration-200 hover:opacity-80"
                    onMouseEnter={(e) => handleMouseEnter(e, data, 'up')}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Down-regulated bar */}
                  <rect
                    x={x}
                    y={downY}
                    width={barWidth}
                    height={downHeight}
                    fill="#3b82f6"
                    className="transition-all duration-200 hover:opacity-80"
                    onMouseEnter={(e) => handleMouseEnter(e, data, 'down')}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: 'pointer' }}
                  />

                  {/* Value labels */}
                  <text
                    x={x + barWidth / 2}
                    y={upY - 5}
                    fill="#e5e7eb"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="system-ui"
                    fontWeight="600"
                  >
                    {data.upRegulated}
                  </text>
                  
                  <text
                    x={x + barWidth / 2}
                    y={downY + downHeight + 15}
                    fill="#e5e7eb"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="system-ui"
                    fontWeight="600"
                  >
                    {data.downRegulated}
                  </text>

                  {/* X-axis labels */}
                  <text
                    x={x + barWidth / 2}
                    y={padding.top + chartHeight + 30}
                    fill="#9ca3af"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="system-ui"
                    fontWeight="500"
                    transform={`rotate(-45 ${x + barWidth / 2},${padding.top + chartHeight + 30})`}
                  >
                    {data.category}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="text-gray-400 mb-1">Total Up-regulated</div>
            <div className="text-red-400 font-semibold text-lg">
              {regulationData.reduce((sum, item) => sum + item.upRegulated, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="text-gray-400 mb-1">Total Down-regulated</div>
            <div className="text-blue-400 font-semibold text-lg">
              {regulationData.reduce((sum, item) => sum + item.downRegulated, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="text-gray-400 mb-1">Active Categories</div>
            <div className="text-white font-semibold text-lg">
              {regulationData.filter(item => item.upRegulated > 0 || item.downRegulated > 0).length}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredBar && (
        <div
          className="absolute z-50 bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl pointer-events-none max-w-xs"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px'
          }}
        >
          <div className="text-white font-semibold text-sm mb-2">
            {hoveredBar.data.category} - {hoveredBar.type === 'up' ? 'Up-regulated' : 'Down-regulated'}
          </div>
          <div className="text-gray-300 text-xs mb-2">
            Value: {hoveredBar.type === 'up' ? hoveredBar.data.upRegulated : hoveredBar.data.downRegulated}
          </div>
          
          {hoveredBar.data.news && hoveredBar.data.news.length > 0 ? (
            <div>
              <div className="text-gray-400 text-xs font-medium mb-1">Related News:</div>
              <div className="space-y-1">
                {hoveredBar.data.news.slice(0, 3).map((newsItem, index) => (
                  <div key={index} className="text-gray-300 text-xs leading-tight">
                    • {newsItem.length > 100 ? `${newsItem.substring(0, 100)}...` : newsItem}
                  </div>
                ))}
                {hoveredBar.data.news.length > 3 && (
                  <div className="text-gray-400 text-xs">
                    +{hoveredBar.data.news.length - 3} more news items
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-xs">No news available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegulationChart;
"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { useTrades } from '../context/TradeContext'; // Use the centralized context

const MonthlyProfitChart = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Use the centralized trade context
  const { trades, loading, error, fetchTrades } = useTrades();

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Generate monthly profit percentage data using useMemo for performance
  const generateMonthlyProfitData = (trades) => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return { monthlyData: [], ytdAverage: 0, ytdTotal: 0, year: new Date().getFullYear() };
    }

    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Initialize all months
    months.forEach((month, index) => {
      monthlyData[month] = { 
        name: month, 
        profit: 0, 
        trades: 0,
        percentage: 0
      };
    });

    let totalProfit = 0;
    let totalTrades = 0;

    // Calculate monthly profits - filter by current year
    trades.forEach(trade => {
      if (trade.date) {
        const tradeDate = new Date(trade.date);
        if (!isNaN(tradeDate.getTime()) && tradeDate.getFullYear() === currentYear) {
          const month = months[tradeDate.getMonth()];
          const pnl = parseFloat(trade.pnl) || 0;
          
          if (monthlyData[month]) {
            monthlyData[month].profit += pnl;
            monthlyData[month].trades += 1;
            totalProfit += pnl;
            totalTrades += 1;
          }
        }
      }
    });

    // Calculate percentages based on a base capital (you can adjust this)
    const baseCapital = 10000; // Assuming $10,000 base capital
    Object.values(monthlyData).forEach(month => {
      month.percentage = month.trades > 0 ? (month.profit / baseCapital) * 100 : 0;
    });

    // Calculate YTD average as percentage
    const ytdPercentage = totalTrades > 0 ? (totalProfit / baseCapital) * 100 : 0;

    return {
      monthlyData: Object.values(monthlyData),
      ytdAverage: ytdPercentage,
      ytdTotal: totalProfit,
      year: currentYear,
      totalTrades: totalTrades
    };
  };

  const monthlyProfitData = useMemo(() => {
    return generateMonthlyProfitData(trades);
  }, [trades]);

  const getCellColor = (percentage) => {
    if (percentage > 0) {
      return 'bg-emerald-600 text-white';
    } else if (percentage < 0) {
      return 'bg-red-600 text-white';
    } else {
      return 'bg-slate-700 text-gray-400';
    }
  };

  // Handle refresh by calling fetchTrades from context
  const handleRefresh = () => {
    fetchTrades();
  };

  if (loading) {
    return (
      <div className="relative group mt-6">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-20 rounded-2xl blur-xl"></div>
        <div className="relative bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Percentage Profit by Month
            </h2>
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
              title="Refresh data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="animate-pulse">
            <div className="space-y-4">
              <div className="h-12 bg-slate-700 rounded"></div>
              <div className="h-12 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative group mt-6">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-400 opacity-20 rounded-2xl blur-xl"></div>
        <div className="relative bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Percentage Profit by Month
            </h2>
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
              title="Retry"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="text-red-400 text-center">
            <p className="text-xl font-semibold">Error loading data</p>
            <p className="text-sm mt-2">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group mt-6">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-all duration-500"></div>
      <div className="relative bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Percentage Profit by Month
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Total YTD Trades: {monthlyProfitData.totalTrades} | Total P&L: ${monthlyProfitData.ytdTotal.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 text-gray-400 hover:text-white transition-all duration-200 ${loading ? 'animate-spin' : ''}`}
            title="Refresh data"
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full border border-slate-600/30 rounded-lg overflow-hidden">
            {/* Header Row */}
            <div className="flex bg-slate-700/80">
              <div className="flex-shrink-0 w-20 px-4 py-3 text-left text-sm font-semibold text-gray-300 border-r border-slate-600/50">
                {monthlyProfitData.year}
              </div>
              {monthlyProfitData.monthlyData.map((month, index) => (
                <div key={index} className="flex-1 min-w-[80px] px-4 py-3 text-center text-sm font-semibold text-gray-300 border-r border-slate-600/50 last:border-r-0">
                  {month.name}
                </div>
              ))}
              <div className="flex-1 min-w-[80px] px-4 py-3 text-center text-sm font-semibold text-gray-300">
                YTD
              </div>
            </div>

            {/* Data Row */}
            <div className="flex">
              <div className="flex-shrink-0 w-20 px-4 py-4 text-left text-sm font-semibold text-white bg-slate-700/80 border-r border-slate-600/50">
                {monthlyProfitData.year}
              </div>
              {monthlyProfitData.monthlyData.map((month, index) => (
                <div 
                  key={index} 
                  className={`flex-1 min-w-[80px] px-4 py-4 text-center text-sm font-semibold border-r border-slate-600/50 last:border-r-0 transition-all duration-200 ${getCellColor(month.percentage)} hover:opacity-80 cursor-default`}
                  title={`${month.name}: ${month.trades} trades, $${month.profit.toFixed(2)} P&L`}
                >
                  {month.percentage === 0 ? '-' : `${month.percentage.toFixed(2)}%`}
                </div>
              ))}
              <div className="flex-1 min-w-[80px] px-4 py-4 text-center text-sm font-semibold bg-cyan-600 text-white transition-all duration-200 hover:opacity-80 cursor-default">
                {monthlyProfitData.ytdAverage.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyProfitChart;

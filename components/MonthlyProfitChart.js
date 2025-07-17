"use client"
import React, { useState, useEffect } from 'react';

const MonthlyProfitChart = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trades data
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/trades');
        if (!response.ok) {
          throw new Error('Failed to fetch trades');
        }
        const data = await response.json();
        setTrades(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching trades:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  // Generate monthly profit percentage data
  const generateMonthlyProfitData = () => {
    if (!trades.length) return { monthlyData: [], ytdAverage: 0, year: new Date().getFullYear() };

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

    // Calculate monthly profits
    trades.forEach(trade => {
      if (trade.date) {
        const tradeDate = new Date(trade.date);
        const month = months[tradeDate.getMonth()];
        if (monthlyData[month]) {
          monthlyData[month].profit += trade.pnl || 0;
          monthlyData[month].trades += 1;
        }
      }
    });

    // Calculate percentages (assuming initial capital or use relative profit)
    const totalProfit = Object.values(monthlyData).reduce((sum, month) => sum + month.profit, 0);
    const avgProfit = totalProfit / 12;

    // Convert to percentage (you can adjust this calculation based on your capital)
    Object.values(monthlyData).forEach(month => {
      month.percentage = month.trades > 0 ? (month.profit / 1000) * 100 : 0; // Assuming $1000 base
    });

    return {
      monthlyData: Object.values(monthlyData),
      ytdAverage: avgProfit,
      year: currentYear
    };
  };

  const getCellColor = (percentage) => {
    if (percentage > 0) {
      return 'bg-emerald-600 text-white';
    } else if (percentage < 0) {
      return 'bg-red-600 text-white';
    } else {
      return 'bg-slate-700 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="relative group mt-6">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-20 rounded-2xl blur-xl"></div>
        <div className="relative bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/3 mb-8"></div>
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
          <div className="text-red-400 text-center">
            <p className="text-xl font-semibold">Error loading data</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const monthlyProfitData = generateMonthlyProfitData();

  return (
    <div className="relative group mt-6">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-all duration-500"></div>
      <div className="relative bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-8 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
          Percentage Profit by Month
        </h2>
        
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
                  className={`flex-1 min-w-[80px] px-4 py-4 text-center text-sm font-semibold border-r border-slate-600/50 last:border-r-0 transition-all duration-200 ${getCellColor(month.percentage)}`}
                >
                  {month.percentage === 0 ? '' : `${month.percentage.toFixed(2)}%`}
                </div>
              ))}
              <div className="flex-1 min-w-[80px] px-4 py-4 text-center text-sm font-semibold bg-cyan-600 text-white transition-all duration-200">
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
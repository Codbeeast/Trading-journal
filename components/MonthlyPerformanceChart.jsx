"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonthlyPerformanceChart = () => {
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

  // Generate monthly performance data
  const generateMonthlyData = () => {
    if (!trades.length) return [];

    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months
    months.forEach((month, index) => {
      monthlyData[month] = { name: month, value: 0, pips: 0, count: 0 };
    });

    trades.forEach(trade => {
      if (trade.date) {
        const tradeDate = new Date(trade.date);
        const month = months[tradeDate.getMonth()];
        if (monthlyData[month]) {
          monthlyData[month].value += trade.pnl || 0;
          monthlyData[month].pips += trade.pipsLostCaught || 0;
          monthlyData[month].count += 1;
        }
      }
    });

    return Object.values(monthlyData);
  };

  const lineData = generateMonthlyData();

  if (loading) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="h-6 bg-gray-600 rounded w-64 mb-4 animate-pulse"></div>
          <div className="h-[300px] bg-gray-600/20 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading chart...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Monthly Performance Overview</h2>
          <div className="h-[300px] flex items-center justify-center text-red-400">
            Error loading chart: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
      <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Monthly Performance Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}
              formatter={(value, name) => [
                `$${value.toFixed(2)}`,
                'P&L'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="url(#colorGradient)" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#10B981' }}
              animationDuration={2000}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyPerformanceChart;
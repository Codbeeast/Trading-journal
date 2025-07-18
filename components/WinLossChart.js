"use client"
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const WinLossChart = () => {
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWinLossData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/trades');
        if (!response.ok) {
          throw new Error('Failed to fetch trades');
        }
        const trades = await response.json();
        
        // Generate win/loss pie chart data
        const wins = trades.filter(trade => (trade.pnl || 0) > 0).length;
        const losses = trades.length - wins;
        const winPercentage = trades.length > 0 ? (wins / trades.length) * 100 : 0;
        const lossPercentage = 100 - winPercentage;
        
        const data = [
          { name: 'Wins', value: winPercentage, color: '#10B981' },
          { name: 'Losses', value: lossPercentage, color: '#EF4444' }
        ];
        
        setPieData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching win/loss data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWinLossData();
  }, []);

  if (loading) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Win/Loss Ratio</h2>
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Win/Loss Ratio</h2>
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-red-400">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
      <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Win/Loss Ratio</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1500}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#FFFFFF',
                zIndex: 50
              }}
              wrapperStyle={{
                zIndex: 50
              }}
              formatter={(value) => [`${value.toFixed(1)}%`, 'Percentage']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WinLossChart;
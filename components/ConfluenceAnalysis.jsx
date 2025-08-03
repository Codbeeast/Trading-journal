"use client"
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ConfluenceAnalysis = () => {
  const [confluenceData, setConfluenceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfluenceData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/trades');
        if (!response.ok) {
          throw new Error('Failed to fetch trades');
        }
        const trades = await response.json();
        
        const data = generateConfluenceData(trades);
        setConfluenceData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching confluence data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfluenceData();
  }, []);

  const generateConfluenceData = (trades) => {
    if (!trades.length) return [];

    const confluenceData = {};
    
    trades.forEach(trade => {
      if (trade.confluences) {
        const confluences = trade.confluences.split(',').map(c => c.trim());
        confluences.forEach(confluence => {
          if (!confluenceData[confluence]) {
            confluenceData[confluence] = { 
              name: confluence, 
              value: 0, 
              wins: 0, 
              losses: 0,
              totalPnl: 0
            };
          }
          confluenceData[confluence].value += 1;
          confluenceData[confluence].totalPnl += trade.pnl || 0;
          if ((trade.pnl || 0) > 0) {
            confluenceData[confluence].wins += 1;
          } else {
            confluenceData[confluence].losses += 1;
          }
        });
      }
    });

    return Object.values(confluenceData)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map(item => ({
        ...item,
        winRate: item.value > 0 ? ((item.wins / item.value) * 100).toFixed(1) : '0'
      }));
  };

  if (loading) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Top Confluences</h2>
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Top Confluences</h2>
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-red-400">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group mt-6">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
      <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Top Confluences</h2>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={confluenceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={95}
              interval={0}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}
              formatter={(value, name, props) => [
                `Count: ${value}`,
                `Win Rate: ${props.payload.winRate}%`,
                `Total P&L: $${props.payload.totalPnl.toFixed(2)}`
              ]}
              labelFormatter={(label) => `Confluence: ${label}`}
            />
            <Bar 
              dataKey="value" 
              fill="url(#confluenceGradient)"
              radius={[8, 8, 0, 0]}
              animationDuration={2000}
              barSize={80}
            />
            <defs>
              <linearGradient id="confluenceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConfluenceAnalysis;
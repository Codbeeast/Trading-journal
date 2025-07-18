"use client"
import React, { useState, useEffect } from 'react';

const SetupTypes = () => {
  const [setupTags, setSetupTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSetupTypesData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/trades');
        if (!response.ok) {
          throw new Error('Failed to fetch trades');
        }
        const trades = await response.json();
        
        const data = generateSetupTags(trades);
        setSetupTags(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching setup types data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSetupTypesData();
  }, []);

  const generateSetupTags = (trades) => {
    if (!trades.length) return [];

    const setupData = {};
    const setupColors = [
      'from-blue-600 to-blue-400',
      'from-red-600 to-red-400',
      'from-purple-600 to-purple-400',
      'from-indigo-600 to-indigo-400',
      'from-emerald-600 to-emerald-400',
      'from-orange-600 to-orange-400'
    ];

    trades.forEach(trade => {
      if (trade.setupType) {
        const setup = trade.setupType;
        if (!setupData[setup]) {
          setupData[setup] = { count: 0, wins: 0 };
        }
        setupData[setup].count += 1;
        if ((trade.pnl || 0) > 0) {
          setupData[setup].wins += 1;
        }
      }
    });

    return Object.entries(setupData)
      .slice(0, 6)
      .map(([setup, data], index) => ({
        label: setup.substring(0, 2).toUpperCase(),
        fullName: setup,
        value: data.count.toString(),
        winRate: data.count > 0 ? ((data.wins / data.count) * 100).toFixed(1) : '0',
        color: setupColors[index % setupColors.length]
      }));
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-5">
        <h2 className="text-xl font-bold text-white mb-10">Setup Types</h2>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-20 rounded-lg blur-lg"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-4 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-8 h-6 bg-gray-600 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 mt-5">
        <h2 className="text-xl font-bold text-white mb-10">Setup Types</h2>
        <div className="text-red-400 text-center">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-2">
      <h2 className="text-xl font-bold text-white mb-6">Setup Types</h2>
      <div className="grid grid-cols-2 gap-4">
        {setupTags.map((tag, index) => (
          <div key={index} className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${tag.color} opacity-20 rounded-lg blur-lg group-hover:opacity-30 transition-all duration-300`}></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm font-medium">{tag.label}</span>
                <span className="text-white text-xl font-bold">{tag.value}</span>
              </div>
              <div className="text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>{tag.fullName}</span>
                  <span className="text-green-400">{tag.winRate}% Win Rate</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetupTypes;
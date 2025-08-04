"use client"
import React, { useState, useEffect } from 'react';

const QuarterlyAnalysis = () => {
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

  // Generate quarterly data
  const generateQuarterlyData = () => {
    if (!trades.length) return [];

    const quarters = {
      Q1: { name: 'Q1', months: ['Jan', 'Feb', 'Mar'], taken: 0, wins: 0, winRate: 0, totalPips: 0, totalPnl: 0 },
      Q2: { name: 'Q2', months: ['Apr', 'May', 'Jun'], taken: 0, wins: 0, winRate: 0, totalPips: 0, totalPnl: 0 },
      Q3: { name: 'Q3', months: ['Jul', 'Aug', 'Sep'], taken: 0, wins: 0, winRate: 0, totalPips: 0, totalPnl: 0 },
      Q4: { name: 'Q4', months: ['Oct', 'Nov', 'Dec'], taken: 0, wins: 0, winRate: 0, totalPips: 0, totalPnl: 0 }
    };

    trades.forEach(trade => {
      if (trade.date) {
        const tradeDate = new Date(trade.date);
        const month = tradeDate.getMonth();

        let quarter = '';
        if (month >= 0 && month <= 2) quarter = 'Q1';
        else if (month >= 3 && month <= 5) quarter = 'Q2';
        else if (month >= 6 && month <= 8) quarter = 'Q3';
        else if (month >= 9 && month <= 11) quarter = 'Q4';

        if (quarter && quarters[quarter]) {
          quarters[quarter].taken += 1;
          if ((trade.pnl || 0) > 0) {
            quarters[quarter].wins += 1;
          }
          // Add pips and pnl
          quarters[quarter].totalPips += (trade.pipsLostCaught || 0);
          quarters[quarter].totalPnl += (trade.pnl || 0);
        }
      }
    });

    // Calculate win rates
    Object.values(quarters).forEach(quarter => {
      quarter.winRate = quarter.taken > 0 ? (quarter.wins / quarter.taken) * 100 : 0;
    });

    return Object.values(quarters);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 rounded-xl blur-xl"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/2 mx-auto mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="col-span-full relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-400 opacity-20 rounded-xl blur-xl"></div>
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="text-red-400 text-center">
              <p className="text-xl font-semibold">Error loading quarterly data</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quarterlyData = generateQuarterlyData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {quarterlyData.map((quarter, index) => (
        <div key={index} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
          <div className="relative bg-slate-800/50 mb-8 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 text-center">{quarter.name}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                <span className="text-gray-400 text-sm">Months</span>
                <span className="text-white text-sm">{quarter.months.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                <span className="text-gray-400 text-sm">Taken</span>
                <span className="text-white font-medium">{quarter.taken}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                <span className="text-gray-400 text-sm">Total Pips</span>
                <span className="text-white font-medium">{quarter.totalPips.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                <span className="text-gray-400 text-sm">Win Rate</span>
                <span className={`font-medium ${quarter.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {quarter.winRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total PnL</span>
                <span className={`font-medium ${quarter.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${quarter.totalPnl.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuarterlyAnalysis;
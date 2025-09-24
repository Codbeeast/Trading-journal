"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTrades } from '../context/TradeContext'; // Use the centralized context

const ConfluenceAnalysis = () => {
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

  // Function to truncate long text
  const truncateText = (text, maxLength = 12) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Generate confluence data using useMemo for performance
  const generateConfluenceData = (trades) => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) return [];

    const confluenceData = {};

    trades.forEach(trade => {
      if (trade.confluences) {
        // Handle both array and string formats for confluences
        const confluences = Array.isArray(trade.confluences) 
          ? trade.confluences 
          : trade.confluences.split(',').map(c => c.trim());
        confluences.forEach(confluence => {
          if (!confluenceData[confluence]) {
            confluenceData[confluence] = {
              name: confluence,
              displayName: truncateText(confluence),
              value: 0,
              wins: 0,
              losses: 0,
              totalPnl: 0
            };
          }
          confluenceData[confluence].value += 1;
          confluenceData[confluence].totalPnl += parseFloat(trade.pnl) || 0;
          if ((parseFloat(trade.pnl) || 0) > 0) {
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
        winRate: item.value > 0 ? parseFloat(((item.wins / item.value) * 100).toFixed(1)) : 0
      }));
  };

  const confluenceData = useMemo(() => {
    return generateConfluenceData(trades);
  }, [trades]);

  // Handle refresh by calling fetchTrades from context
  const handleRefresh = () => {
    fetchTrades();
  };

  if (loading) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-black border border-gray-800 rounded-xl p-6"
          style={{
            background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Top Confluences</h2>
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
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-black border border-gray-800 rounded-xl p-6"
          style={{
            background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Top Confluences</h2>
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
          <div className="flex flex-col items-center justify-center h-[250px]">
            <div className="text-red-400 mb-4">Error: {error}</div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalTrades = confluenceData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="relative group mt-6">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
      <div className="relative bg-black border border-gray-800 rounded-xl p-6"
        style={{
          background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Top Confluences</h2>
            <p className="text-sm text-gray-400">Total confluence trades: {totalTrades}</p>
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
        <ResponsiveContainer width="100%" height={isMobile ? 350 : 420}>
          <BarChart data={confluenceData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="displayName"
              stroke="#9CA3AF"
              fontSize={11}
              angle={-35}
              textAnchor="end"
              height={60}
              interval={0}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = confluenceData.find(d => d.displayName === label);
                  return (
                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg max-w-xs">
                      <div className="space-y-1">
                        <div className="font-semibold text-white border-b border-gray-600 pb-1">
                          {item?.name || label}
                        </div>
                        <div className="text-xs text-gray-300 space-y-0.5">
                          <div>Trades: {item?.value || 0}</div>
                          <div>Win Rate: {payload[0]?.value || '0'}%</div>
                          <div>P&L: ${item?.totalPnl?.toFixed(2) || '0.00'}</div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="winRate"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              animationDuration={1800}
              barSize={isMobile ? 45 : 55}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConfluenceAnalysis;

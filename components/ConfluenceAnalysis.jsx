"use client"
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ConfluenceAnalysis = () => {
  const [confluenceData, setConfluenceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

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

  const handleRefresh = () => {
    const fetchConfluenceData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/trades', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch trades: ${response.status} ${response.statusText}`);
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
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 500}>
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
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#FFFFFF',
                zIndex: 50,
                padding: '8px 12px',
                fontSize: '12px',
                maxWidth: '250px'
              }}
              wrapperStyle={{
                zIndex: 50
              }}
              formatter={(value, name, props) => [
                `${value}%`, // Display win rate with '%'
                'Win Rate'
              ]}
              labelFormatter={(label) => {
                const item = confluenceData.find(d => d.name === label);
                return `${label} | ${item?.winRate || '0'}% WR | ${item?.totalPnl?.toFixed(2) || '0.00'}`;
              }}
            />
            <Bar
              dataKey="winRate" // Changed from "value" to "winRate"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              animationDuration={1800}
              barSize={55}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConfluenceAnalysis;
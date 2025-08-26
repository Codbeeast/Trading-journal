"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTrades } from '../context/TradeContext'; // Use the centralized context

const NewsChart = () => {
  const [timeView, setTimeView] = useState('impact');
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

  // Generate news data from trades
  const generateNewsData = (trades, viewType) => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) return [];

    if (viewType === 'impact') {
      // Group by news impact
      const impactData = {
        'positively affected': { name: 'Positively Affected', value: 0, count: 0, news: [], totalPnl: 0 },
        'negatively affected': { name: 'Negatively Affected', value: 0, count: 0, news: [], totalPnl: 0 },
        'not affected': { name: 'Not Affected', value: 0, count: 0, news: [], totalPnl: 0 }
      };

      trades.forEach(trade => {
        const impact = trade.affectedByNews || 'not affected';
        const pnl = parseFloat(trade.pnl) || 0;
        
        if (impactData[impact]) {
          impactData[impact].count += 1;
          impactData[impact].value += pnl;
          impactData[impact].totalPnl += pnl;
          
          // Add news if exists
          if (trade.news && trade.news.trim() !== '') {
            impactData[impact].news.push({
              news: trade.news,
              date: trade.date,
              pnl: pnl,
              pair: trade.pair
            });
          }
        }
      });

      return Object.values(impactData).filter(item => item.count > 0);
    } 
    else if (viewType === 'pairs') {
      // Group by currency pairs with news
      const pairData = {};

      trades.forEach(trade => {
        if (trade.news && trade.news.trim() !== '') {
          const pair = trade.pair || 'Unknown';
          if (!pairData[pair]) {
            pairData[pair] = { 
              name: pair, 
              value: 0, 
              count: 0, 
              news: [], 
              totalPnl: 0,
              wins: 0
            };
          }

          const pnl = parseFloat(trade.pnl) || 0;
          pairData[pair].count += 1;
          pairData[pair].value += pnl;
          pairData[pair].totalPnl += pnl;
          if (pnl > 0) pairData[pair].wins += 1;
          
          pairData[pair].news.push({
            news: trade.news,
            date: trade.date,
            pnl: pnl,
            impact: trade.affectedByNews || 'not affected'
          });
        }
      });

      return Object.values(pairData)
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 pairs with news
    }
    else {
      // Group by session
      const sessionData = {
        'London': { name: 'London', value: 0, count: 0, news: [], totalPnl: 0, wins: 0 },
        'New York': { name: 'New York', value: 0, count: 0, news: [], totalPnl: 0, wins: 0 },
        'Asian': { name: 'Asian', value: 0, count: 0, news: [], totalPnl: 0, wins: 0 },
        'Sydney': { name: 'Sydney', value: 0, count: 0, news: [], totalPnl: 0, wins: 0 }
      };

      trades.forEach(trade => {
        if (trade.news && trade.news.trim() !== '') {
          const session = trade.session || 'Unknown';
          if (sessionData[session]) {
            const pnl = parseFloat(trade.pnl) || 0;
            sessionData[session].count += 1;
            sessionData[session].value += pnl;
            sessionData[session].totalPnl += pnl;
            if (pnl > 0) sessionData[session].wins += 1;
            
            sessionData[session].news.push({
              news: trade.news,
              date: trade.date,
              pnl: pnl,
              pair: trade.pair,
              impact: trade.affectedByNews || 'not affected'
            });
          }
        }
      });

      return Object.values(sessionData).filter(item => item.count > 0);
    }
  };

  // Generate news data using useMemo for performance
  const newsData = useMemo(() => {
    return generateNewsData(trades, timeView);
  }, [trades, timeView]);

  // Handle refresh by calling fetchTrades from context
  const handleRefresh = () => {
    fetchTrades();
  };

  if (loading) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-black border border-gray-800 rounded-xl p-6"
             style={{
               background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
             }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">News Impact Analysis</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                title="Refresh data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setTimeView('impact')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    timeView === 'impact' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Impact
                </button>
                <button
                  onClick={() => setTimeView('pairs')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    timeView === 'pairs' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Pairs
                </button>
                <button
                  onClick={() => setTimeView('sessions')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    timeView === 'sessions' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sessions
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-black border border-gray-800 rounded-xl p-6"
             style={{
               background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
             }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">News Impact Analysis</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                title="Retry"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setTimeView('impact')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    timeView === 'impact' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Impact
                </button>
                <button
                  onClick={() => setTimeView('pairs')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    timeView === 'pairs' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Pairs
                </button>
                <button
                  onClick={() => setTimeView('sessions')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    timeView === 'sessions' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sessions
                </button>
              </div>
            </div>
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

  const totalTrades = newsData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
      <div className="relative bg-black border border-gray-800 rounded-xl p-6"
           style={{
             background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
           }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">News Impact Analysis</h2>
            <p className="text-sm text-gray-400">Trades with news: {totalTrades}</p>
          </div>
          <div className="flex items-center gap-2">
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
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setTimeView('impact')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeView === 'impact' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Impact
              </button>
              <button
                onClick={() => setTimeView('pairs')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeView === 'pairs' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Pairs
              </button>
              <button
                onClick={() => setTimeView('sessions')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeView === 'sessions' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sessions
              </button>
            </div>
          </div>
        </div>
        
        {/* Color Legend */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-400">Positive P&L</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-400">Negative P&L</span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 500}>
          <BarChart data={newsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
              angle={timeView === 'pairs' ? -45 : 0}
              textAnchor={timeView === 'pairs' ? 'end' : 'middle'}
              height={timeView === 'pairs' ? 60 : 30}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
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
              formatter={(value, name, props) => [
                `$${parseFloat(value).toFixed(2)}`,
                'P&L'
              ]}
              labelFormatter={(label) => {
                const item = newsData.find(d => d.name === label);
                const winRate = item && item.count > 0 && item.wins ? ((item.wins / item.count) * 100).toFixed(1) : '0.0';
                const newsCount = item?.news?.length || 0;
                const firstNews = item?.news?.[0]?.news || 'No news available';
                return (
                  <div>
                    <div className="font-semibold">{label}</div>
                    <div className="text-sm text-gray-300 mt-1">
                      Trades: {item?.count || 0} | Win Rate: {winRate}%
                    </div>
                    <div className="text-sm text-gray-300">News Events: {newsCount}</div>
                    {firstNews && (
                      <div className="text-xs text-gray-400 mt-1 max-w-xs">
                        Latest: {firstNews.length > 60 ? `${firstNews.substring(0, 60)}...` : firstNews}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              animationDuration={1800}
            >
              {newsData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value >= 0 ? '#10b981' : '#ef4444'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NewsChart;
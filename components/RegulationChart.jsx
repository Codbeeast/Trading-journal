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

  // Generate individual trade data instead of aggregated data
  const generateIndividualTradeData = (trades, viewType) => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) return [];

    let filteredTrades = [];

    if (viewType === 'impact') {
      // Show all trades with news, grouped by impact type
      filteredTrades = trades
        .filter(trade => trade.news && trade.news.trim() !== '')
        .map((trade, index) => ({
          id: `${trade.date}-${index}`,
          name: `Trade ${index + 1}`,
          value: parseFloat(trade.pnl) || 0,
          pair: trade.pair || 'Unknown',
          date: trade.date,
          news: trade.news,
          impact: trade.affectedByNews || 'not affected',
          session: trade.session,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          tradeType: trade.tradeType,
          originalIndex: index
        }))
        .sort((a, b) => {
          // Sort by impact type first, then by date
          const impactOrder = { 'positively affected': 0, 'negatively affected': 1, 'not affected': 2 };
          if (impactOrder[a.impact] !== impactOrder[b.impact]) {
            return impactOrder[a.impact] - impactOrder[b.impact];
          }
          return new Date(a.date) - new Date(b.date);
        });
    } 
    else if (viewType === 'pairs') {
      // Show trades with news, grouped by pairs
      filteredTrades = trades
        .filter(trade => trade.news && trade.news.trim() !== '' && trade.pair)
        .map((trade, index) => ({
          id: `${trade.pair}-${trade.date}-${index}`,
          name: `${trade.pair} #${index + 1}`,
          value: parseFloat(trade.pnl) || 0,
          pair: trade.pair,
          date: trade.date,
          news: trade.news,
          impact: trade.affectedByNews || 'not affected',
          session: trade.session,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          tradeType: trade.tradeType,
          originalIndex: index
        }))
        .sort((a, b) => {
          // Sort by pair name first, then by date
          if (a.pair !== b.pair) {
            return a.pair.localeCompare(b.pair);
          }
          return new Date(a.date) - new Date(b.date);
        });
    }
    else { // pairs - fallback since sessions is removed
      // Show trades with news, grouped by pairs (same as pairs view)
      filteredTrades = trades
        .filter(trade => trade.news && trade.news.trim() !== '' && trade.pair)
        .map((trade, index) => ({
          id: `${trade.pair}-${trade.date}-${index}`,
          name: `${trade.pair} #${index + 1}`,
          value: parseFloat(trade.pnl) || 0,
          pair: trade.pair,
          date: trade.date,
          news: trade.news,
          impact: trade.affectedByNews || 'not affected',
          session: trade.session,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          tradeType: trade.tradeType,
          originalIndex: index
        }))
        .sort((a, b) => {
          // Sort by pair name first, then by date
          if (a.pair !== b.pair) {
            return a.pair.localeCompare(b.pair);
          }
          return new Date(a.date) - new Date(b.date);
        });
    }

    return filteredTrades.slice(0, 50); // Limit to 50 trades for better visualization
  };

  // Generate individual trade data using useMemo for performance
  const tradeData = useMemo(() => {
    return generateIndividualTradeData(trades, timeView);
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
            <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">News Analysis</h2>
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
            <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">News Analysis</h2>
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

  const totalTrades = tradeData.length;
  const profitTrades = tradeData.filter(trade => trade.value > 0).length;
  const lossTrades = tradeData.filter(trade => trade.value < 0).length;

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
            <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">News Analysis</h2>
            <p className="text-sm text-gray-400">
              Total: {totalTrades} | Profit: {profitTrades} | Loss: {lossTrades} | Win Rate: {totalTrades > 0 ? ((profitTrades / totalTrades) * 100).toFixed(1) : 0}%
            </p>
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

            </div>
          </div>
        </div>
        
        {/* Color Legend */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-400">Profit Trade</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-400">Loss Trade</span>
          </div>
        </div>
        
        {tradeData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-gray-400">
            No trades with news found
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={isMobile ? 280 : 500}>
            <BarChart data={tradeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                label={{ value: 'P&L ($)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  zIndex: 50,
                  maxWidth: '300px'
                }}
                wrapperStyle={{
                  zIndex: 50
                }}
                formatter={(value, name, props) => [
                  `$${parseFloat(value).toFixed(2)}`,
                  'P&L'
                ]}
                labelFormatter={(label, payload) => {
                  if (!payload || payload.length === 0) return label;
                  
                  const trade = payload[0].payload;
                  return (
                    <div className="space-y-2">
                      <div className="font-semibold border-b border-gray-600 pb-2">
                        {trade.pair} - {new Date(trade.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Impact:</span> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          trade.impact === 'positively affected' ? 'bg-green-600' : 
                          trade.impact === 'negatively affected' ? 'bg-red-600' : 'bg-gray-600'
                        }`}>
                          {trade.impact}
                        </span>
                      </div>
                      {trade.news && (
                        <div className="text-xs text-gray-300 border-t border-gray-600 pt-2">
                          <span className="text-gray-400">News:</span>
                          <div className="mt-1 max-h-20 overflow-y-auto">
                            {trade.news}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Bar 
                dataKey="value" 
                radius={[2, 2, 0, 0]}
                animationDuration={1000}
              >
                {tradeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value >= 0 ? '#3b82f6' : '#ef4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default NewsChart;
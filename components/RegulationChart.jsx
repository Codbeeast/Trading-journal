"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTrades } from '../context/TradeContext';

const NewsChart = () => {
  const [timeView, setTimeView] = useState('impact');
  const [isMobile, setIsMobile] = useState(false);

  const { trades, loading, error, fetchTrades } = useTrades();

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const generateIndividualTradeData = (trades, viewType) => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) return [];

    let filteredTrades = [];

    if (viewType === 'impact') {
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
          const impactOrder = { 'positively affected': 0, 'negatively affected': 1, 'not affected': 2 };
          if (impactOrder[a.impact] !== impactOrder[b.impact]) {
            return impactOrder[a.impact] - impactOrder[b.impact];
          }
          return new Date(a.date) - new Date(b.date);
        });
    } 
    else if (viewType === 'pairs') {
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
          if (a.pair !== b.pair) {
            return a.pair.localeCompare(b.pair);
          }
          return new Date(a.date) - new Date(b.date);
        });
    }
    else {
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
          if (a.pair !== b.pair) {
            return a.pair.localeCompare(b.pair);
          }
          return new Date(a.date) - new Date(b.date);
        });
    }

    return filteredTrades.slice(0, 50);
  };

  const tradeData = useMemo(() => {
    return generateIndividualTradeData(trades, timeView);
  }, [trades, timeView]);

  const handleRefresh = () => {
    fetchTrades();
  };

  if (loading) {
    return (
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-slate-800/20 rounded-2xl blur-2xl transition-all duration-1000 shadow-blue-500/30 animate-pulse" />
        <div className="relative backdrop-blur-2xl bg-slate-900/85 border border-blue-500/40 rounded-2xl p-6 md:p-8 w-full overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">News Analysis</h2>
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
              <div className="flex bg-slate-700/50 backdrop-blur-sm rounded-lg p-1 border border-blue-500/30">
                <button
                  onClick={() => setTimeView('impact')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    timeView === 'impact' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Impact
                </button>
                <button
                  onClick={() => setTimeView('pairs')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    timeView === 'pairs' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
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
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-slate-800/20 to-blue-900/20 rounded-2xl blur-2xl shadow-red-500/30" />
        <div className="relative backdrop-blur-2xl bg-slate-900/85 border border-red-500/40 rounded-2xl p-6 md:p-8 w-full overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">News Analysis</h2>
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
              <div className="flex bg-slate-700/50 backdrop-blur-sm rounded-lg p-1 border border-red-500/30">
                <button
                  onClick={() => setTimeView('impact')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    timeView === 'impact' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Impact
                </button>
                <button
                  onClick={() => setTimeView('pairs')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    timeView === 'pairs' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Pairs
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center h-[250px]">
            <div className="text-red-400 mb-4 text-6xl animate-shake">⚠️</div>
            <div className="text-xl text-red-400">Error: {error}</div>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg shadow-blue-500/30"
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
    <div className="relative group w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-slate-800/20 rounded-2xl blur-2xl group-hover:from-blue-500/30 group-hover:via-cyan-400/30 group-hover:to-slate-700/30 transition-all duration-1000 shadow-blue-500/30" />
      
      <div className="relative backdrop-blur-2xl bg-slate-900/85 border border-blue-500/40 rounded-2xl p-6 md:p-8 w-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">News Analysis</h2>
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
            <div className="flex bg-slate-700/50 backdrop-blur-sm rounded-lg p-1 border border-blue-500/30">
              <button
                onClick={() => setTimeView('impact')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeView === 'impact' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Impact
              </button>
              <button
                onClick={() => setTimeView('pairs')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeView === 'pairs' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Pairs
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded shadow-lg shadow-blue-500/50"></div>
            <span className="text-sm text-gray-400">Profit Trade</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded shadow-lg shadow-red-500/50"></div>
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
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  zIndex: 50,
                  maxWidth: '300px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
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
                maxBarSize={60}

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

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        .animate-shake {
          animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default NewsChart;

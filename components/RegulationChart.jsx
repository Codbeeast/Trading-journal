"use client"
import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { useTrades } from '../context/TradeContext';
import RegulationFilters from './RegulationFilters';
import { ChevronDown, Filter } from 'lucide-react';

const NewsChart = ({ trades: propTrades }) => {
  const [viewMode, setViewMode] = useState('news'); // 'news' | 'pairs'
  // Filter states
  const [currentFilter, setCurrentFilter] = useState({
    mode: 'custom',
    year: new Date().getFullYear(),
    months: [new Date().getMonth() + 1]
  });

  const [selectedPairs, setSelectedPairs] = useState([]); // Array of strings
  const initialLoadDone = React.useRef(false);

  const { trades: contextTrades, loading, error, fetchTrades } = useTrades();
  const trades = propTrades || contextTrades;

  // 1. Get Unique Pairs for Dropdown - Moved up for initializing selectedPairs
  const uniquePairs = useMemo(() => {
    const pairs = new Set(trades.map(t => t.pair || 'Unknown'));
    return Array.from(pairs).sort();
  }, [trades]);

  // Init selectedPairs to all (only once)
  useEffect(() => {
    if (uniquePairs.length > 0 && !initialLoadDone.current) {
      setSelectedPairs(uniquePairs);
      initialLoadDone.current = true;
    }
  }, [uniquePairs]);


  // 2. Filter trades based on TimeFilter
  const timeFilteredTrades = useMemo(() => {
    if (!trades.length) return [];
    if (!currentFilter) return trades;

    return trades.filter(trade => {
      // FIX: Use explicit local date construction to avoid timezone shifts
      let date;
      if (typeof trade.date === 'string' && trade.date.includes('-')) {
        const [y, m, d] = trade.date.split('-').map(Number);
        date = new Date(y, m - 1, d);
      } else {
        date = new Date(trade.date);
      }

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      if (year !== currentFilter.year) return false;

      // New 'custom' mode handling (default from RegulationFilters)
      if (currentFilter.mode === 'custom') {
        return currentFilter.months.includes(month);
      }

      // Fallback for any legacy modes if needed, though replaced
      return true;
    });
  }, [trades, currentFilter]);

  // 4. Prepare Data for Charts
  const chartData = useMemo(() => {
    if (viewMode === 'news') {
      // News Analysis: Group trades by news event
      const newsGroups = {};

      timeFilteredTrades.forEach(trade => {
        if (!trade.news || trade.news.trim() === '') return;

        const newsKey = trade.news.trim();
        if (!newsGroups[newsKey]) {
          newsGroups[newsKey] = {
            news: newsKey,
            totalPnL: 0,
            trades: [],
            impactCount: {
              'positively affected': 0,
              'negatively affected': 0,
              'affected': 0,
              'not affected': 0
            }
          };
        }

        const pnl = parseFloat(trade.pnl) || 0;
        newsGroups[newsKey].totalPnL += pnl;
        newsGroups[newsKey].trades.push({ ...trade, pnl }); // store trades with pnl

        const impact = trade.affectedByNews || 'not affected';
        if (newsGroups[newsKey].impactCount[impact] !== undefined) {
          newsGroups[newsKey].impactCount[impact]++;
        } else {
          // Fallback for unexpected values
          if (impact.toLowerCase().includes('positive')) newsGroups[newsKey].impactCount['positively affected']++;
          else if (impact.toLowerCase().includes('negative')) newsGroups[newsKey].impactCount['negatively affected']++;
          else newsGroups[newsKey].impactCount['not affected']++;
        }
      });

      return Object.values(newsGroups).map((group, index) => {
        const totalTradesCount = group.trades.length;
        const winTrades = group.trades.filter(t => t.pnl > 0).length;
        const winRate = totalTradesCount > 0 ? ((winTrades / totalTradesCount) * 100).toFixed(1) : 0;

        // Determine primary impact (most frequent)
        const primaryImpact = Object.entries(group.impactCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];

        // Truncate news text for display
        const newsText = group.news.length > 15 ? `${group.news.substring(0, 15)}...` : group.news;

        return {
          id: `news-${index}`,
          name: newsText,
          fullNews: group.news,
          value: group.totalPnL, // For sorting or axis
          pnl: group.totalPnL,   // Consolidate PnL
          winRate: winRate,
          totalTrades: totalTradesCount,
          impact: primaryImpact,
          details: group.trades // Access to individual trades if needed
        };
      }).sort((a, b) => a.pnl - b.pnl); // Sort by PnL mainly

    } else {
      // Pairs Analysis (Bubble Chart)
      // Filter by selected pair if needed AND filter for news-affected trades
      let relevantTrades = timeFilteredTrades.filter(trade =>
        (trade.news && trade.news.trim() !== '') ||
        (trade.affectedByNews && trade.affectedByNews.toLowerCase() !== 'not affected')
      );

      // Multi-Select Pair Filtering
      if (selectedPairs.length > 0) {
        relevantTrades = relevantTrades.filter(t => selectedPairs.includes(t.pair || 'Unknown'));
      }

      // Map to Scatter data format
      // x: timestamp, y: pnl, z: magnitude (size)
      return relevantTrades.map((trade, index) => {
        const pnl = parseFloat(trade.pnl) || 0;
        return {
          id: trade._id || index,
          x: new Date(trade.date).getTime(), // Time on X axis
          y: pnl,                            // PnL on Y axis
          z: Math.abs(pnl),                  // Magnitude on Z axis for bubble size
          pnl: pnl,
          pair: trade.pair || 'Unknown',
          news: trade.news || trade.affectedByNews || '', // Add news info
          date: trade.date,
          formattedDate: new Date(trade.date).toLocaleDateString(),
          type: trade.tradeType || 'Unknown'
        };
      }).sort((a, b) => a.x - b.x);
    }
  }, [timeFilteredTrades, viewMode, selectedPairs]);

  // Calculate Z-Axis Range for Bubble Chart (Min/Max size scaling)
  const bubbleDomain = useMemo(() => {
    if (viewMode !== 'pairs' || chartData.length === 0) return [0, 100];
    const maxZ = Math.max(...chartData.map(d => d.z));
    return [0, maxZ];
  }, [chartData, viewMode]);

  // Stats for Header
  const totalTrades = viewMode === 'news'
    ? chartData.reduce((acc, curr) => acc + curr.totalTrades, 0)
    : chartData.length;

  const profitTrades = viewMode === 'news'
    // This is an approximation for aggregate view, arguably we might want sum of wins from details
    ? chartData.reduce((acc, curr) => acc + curr.details.filter(t => t.pnl > 0).length, 0)
    : chartData.filter(d => d.pnl > 0).length;

  const lossTrades = totalTrades - profitTrades;
  const winRate = totalTrades > 0 ? ((profitTrades / totalTrades) * 100).toFixed(1) : 0;


  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-center text-red-200">
        <p>Error loading data: {error}</p>
        <button onClick={fetchTrades} className="mt-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500">Retry</button>
      </div>
    );
  }

  return (
    <div className="relative group w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-slate-800/20 rounded-2xl blur-2xl group-hover:from-blue-500/30 group-hover:via-cyan-400/30 group-hover:to-slate-700/30 transition-all duration-1000 shadow-blue-500/30" />

      <div className="relative backdrop-blur-2xl bg-slate-900/85 border border-blue-500/40 rounded-2xl p-4 md:p-6 w-full overflow-visible shadow-2xl">

        {/* Header & Controls */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* Title & Stats */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                {viewMode === 'news' ? 'News Analysis' : 'Pairs Analysis'}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 mt-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span>Total: {totalTrades}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Wins: {profitTrades}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Losses: {lossTrades}</span>
                <span className="font-semibold text-blue-400 ml-1">WR: {winRate}%</span>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">

              <RegulationFilters
                onFilterChange={setCurrentFilter}
                viewMode={viewMode}
                setViewMode={setViewMode}
                uniquePairs={uniquePairs}
                selectedPairs={selectedPairs}
                setSelectedPairs={setSelectedPairs}
              />

              {/* Refresh Button */}
              <button
                onClick={fetchTrades}
                disabled={loading}
                className={`p-2 rounded-xl bg-slate-800/80 border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all ${loading ? 'animate-spin' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="w-full h-[500px]">
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-lg font-semibold text-gray-300 mb-2">No data found for the selected period.</p>
              <p className="text-sm text-gray-500 mb-4">
                {viewMode === 'news'
                  ? 'Try selecting a different time period or add trades with news events.'
                  : 'Try selecting a different time period, pair, or add trades with news data.'}
              </p>
              <div className="flex gap-2 text-xs">
                <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
                  Use the filter above to select a different period
                </span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'news' ? (
                // NEWS BAR CHART
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={80}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    domain={['auto', 'auto']}
                    padding={{ top: 20, bottom: 20 }}
                    label={{ value: 'P&L ($)', angle: -90, position: 'insideLeft', fill: '#9CA3AF', dy: 40 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 border border-blue-500/30 p-3 rounded-xl shadow-xl backdrop-blur-md max-w-xs transition-all duration-300 hover:scale-[1.02]">
                            <div className="border-b border-gray-700 pb-2 mb-2">
                              <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider block mb-1">News Event</span>
                              <span className="block font-bold text-white leading-tight">{data.fullNews}</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Total P&L:</span>
                                <span className={`font-mono font-bold ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ${data.pnl.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Win Rate:</span>
                                <span className="font-mono font-bold text-blue-300">{data.winRate}%</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Total Trades:</span>
                                <span className="font-mono font-bold text-white">{data.totalTrades}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="pnl" animationDuration={1000} radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                // PAIRS BUBBLE CHART
                <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={['auto', 'auto']}
                    tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    stroke="#9CA3AF"
                    name="Date"
                    minTickGap={50}
                  />
                  <YAxis
                    dataKey="y"
                    type="number"
                    stroke="#9CA3AF"
                    unit="$"
                    name="P&L"
                    domain={['auto', 'auto']}
                    padding={{ top: 40, bottom: 40 }}
                    label={{ value: 'P&L ($)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                  />
                  <ZAxis type="number" dataKey="z" range={[100, 1000]} domain={bubbleDomain} name="Magnitude" />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    wrapperStyle={{ zIndex: 100 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 border border-blue-500/30 p-3 rounded-xl shadow-xl backdrop-blur-md">
                            <div className="border-b border-gray-700 pb-2 mb-2 flex justify-between items-center gap-4">
                              <span className="font-bold text-white">{data.pair}</span>
                              <span className="text-xs text-gray-400">{data.formattedDate}</span>
                            </div>
                            {data.news && (
                              <div className="mb-2 pb-2 border-b border-gray-700/50">
                                <span className="text-xs text-blue-400 block mb-0.5">News Event</span>
                                <span className="text-sm text-gray-200">{data.news}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center gap-6">
                              <span className="text-gray-400">P&L</span>
                              <span className={`font-mono font-bold text-lg ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${data.pnl.toFixed(2)}
                              </span>
                            </div>

                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Trades" data={chartData}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pnl >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'}
                        stroke={entry.pnl >= 0 ? '#10B981' : '#EF4444'}
                        strokeWidth={2}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsChart;
"use client"
import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { useTrades } from '../context/TradeContext';
import TimeFilter from './TimeFilter';
import { ChevronDown, Filter } from 'lucide-react';

const NewsChart = () => {
  const [viewMode, setViewMode] = useState('news'); // 'news' | 'pairs'
  const [isMobile, setIsMobile] = useState(false);

  // Filter states
  const [monthGroups, setMonthGroups] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({ type: 'current-month' });
  const [selectedPair, setSelectedPair] = useState('All Pairs');
  const [pairDropdownOpen, setPairDropdownOpen] = useState(false);

  const { trades, loading, error, fetchTrades } = useTrades();

  // Handle screen resize
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // 1. Group trades by month for the TimeFilter
  useEffect(() => {
    if (!trades || trades.length === 0) {
      setMonthGroups([]);
      return;
    }

    const groups = {};
    trades.forEach(trade => {
      const date = new Date(trade.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      if (!groups[key]) {
        groups[key] = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          trades: [],
          totalPnL: 0
        };
      }

      groups[key].trades.push(trade);
      groups[key].totalPnL += (parseFloat(trade.pnl) || 0);
    });

    const sortedGroups = Object.values(groups).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    setMonthGroups(sortedGroups);
  }, [trades]);

  // 2. Filter trades based on TimeFilter
  const timeFilteredTrades = useMemo(() => {
    if (!trades.length) return [];

    // Default to current month if initialization hasn't happened
    if (!currentFilter) return trades;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);

    return trades.filter(trade => {
      const date = new Date(trade.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const quarter = Math.ceil(month / 3);

      switch (currentFilter.type) {
        case 'month':
          return year === (currentFilter.year || currentYear) &&
            month === (currentFilter.month || currentMonth);
        case 'quarter':
          return year === (currentFilter.year || currentYear) &&
            quarter === (currentFilter.quarter || currentQuarter);
        case 'year':
          return year === (currentFilter.year || currentYear);
        case 'all':
          return true;
        default:
          // Default to current month behavior for initial load 'current-month' string
          if (currentFilter.type === 'current-month' || !currentFilter.type) {
            return year === currentYear && month === currentMonth;
          }
          return true;
      }
    });
  }, [trades, currentFilter]);

  // 3. Get Unique Pairs for Dropdown
  const uniquePairs = useMemo(() => {
    const pairs = new Set(trades.map(t => t.pair || 'Unknown'));
    return ['All Pairs', ...Array.from(pairs).sort()];
  }, [trades]);

  // 4. Prepare Data for Charts
  const chartData = useMemo(() => {
    if (viewMode === 'news') {
      // News Analysis: Filter trades with news
      return timeFilteredTrades
        .filter(trade =>
          trade.news &&
          trade.news.trim() !== ''
        )
        .map((trade, index) => {
          // Truncate news text
          const newsText = trade.news.length > 12 ? `${trade.news.substring(0, 12)}...` : trade.news;
          const pairText = trade.pair || 'Unknown';

          return {
            id: `${trade.date}-${index}`,
            name: `${newsText} (${pairText})`, // Unique name per pair
            fullNews: trade.news,
            value: parseFloat(trade.pnl) || 0,
            pair: trade.pair || 'Unknown',
            date: trade.date,
            news: trade.news,
            impact: trade.affectedByNews || 'not affected',
            pnl: parseFloat(trade.pnl) || 0
          };
        })
        // Sort: Positively Affected -> Negatively Affected -> Affected -> Not Affected
        .sort((a, b) => {
          const impactOrder = {
            'positively affected': 0,
            'negatively affected': 1,
            'affected': 2,
            'not affected': 3
          };
          // Default to 3 (not affected) if undefined
          const valA = impactOrder[a.impact] !== undefined ? impactOrder[a.impact] : 3;
          const valB = impactOrder[b.impact] !== undefined ? impactOrder[b.impact] : 3;

          if (valA !== valB) {
            return valA - valB;
          }
          return new Date(a.date) - new Date(b.date);
        });

    } else {
      // Pairs Analysis (Bubble Chart)
      // Filter by selected pair if needed
      let relevantTrades = timeFilteredTrades;

      if (selectedPair !== 'All Pairs') {
        relevantTrades = relevantTrades.filter(t => (t.pair || 'Unknown') === selectedPair);
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
          date: trade.date,
          formattedDate: new Date(trade.date).toLocaleDateString(),
          type: trade.tradeType || 'Unknown'
        };
      }).sort((a, b) => a.x - b.x);
    }
  }, [timeFilteredTrades, viewMode, selectedPair]);

  // Calculate Z-Axis Range for Bubble Chart (Min/Max size scaling)
  const bubbleDomain = useMemo(() => {
    if (viewMode !== 'pairs' || chartData.length === 0) return [0, 100];
    const maxZ = Math.max(...chartData.map(d => d.z));
    return [0, maxZ];
  }, [chartData, viewMode]);

  // Stats for Header
  const totalTrades = chartData.length;
  const profitTrades = chartData.filter(d => d.pnl > 0).length;
  const lossTrades = chartData.filter(d => d.pnl < 0).length;
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
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Title & Stats */}
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                {viewMode === 'news' ? 'News Analysis' : 'Pairs Analysis'}
              </h2>
              <div className="flex gap-3 text-sm text-gray-400 mt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span>Total: {totalTrades}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Wins: {profitTrades}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Losses: {lossTrades} ({Number(totalTrades) - Number(profitTrades)})</span>
                <span className="font-semibold text-blue-400 ml-1">WR: {winRate}%</span>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2">

              {/* View Mode Toggle */}
              <div className="flex bg-slate-800/80 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setViewMode('pairs')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'pairs'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  Pairs
                </button>
                <button
                  onClick={() => setViewMode('news')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'news'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  News
                </button>
              </div>

              {/* Pair Dropdown (Only for Pairs View) */}
              {viewMode === 'pairs' && (
                <div className="relative">
                  <button
                    onClick={() => setPairDropdownOpen(!pairDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-gray-700 bg-gray-900/60 text-gray-200 hover:bg-gray-800/80 transition-all text-sm shadow-lg min-w-[140px] justify-between backdrop-blur-md"
                  >
                    <span>{selectedPair}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${pairDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {pairDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setPairDropdownOpen(false)} />
                      <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                        {uniquePairs.map(pair => (
                          <button
                            key={pair}
                            onClick={() => {
                              setSelectedPair(pair);
                              setPairDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-600/20 hover:text-blue-400 transition-colors ${selectedPair === pair ? 'text-blue-400 bg-blue-600/10' : 'text-gray-300'
                              }`}
                          >
                            {pair}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Time Filter Component */}
              <TimeFilter
                monthGroups={monthGroups}
                onFilterChange={(filter) => {
                  console.log("Filter changed:", filter);
                  setCurrentFilter(filter);
                }}
                loading={loading}
                simpleMode={true}
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
              <div className="text-4xl mb-2">📊</div>
              <p>No data found for the selected period.</p>
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
                          <div className="bg-slate-900/95 border border-blue-500/30 p-3 rounded-xl shadow-xl backdrop-blur-md max-w-xs">
                            <div className="border-b border-gray-700 pb-2 mb-2">
                              <span className="block font-bold text-white mb-1">{data.pair}</span>
                              <span className="text-xs text-gray-400">{new Date(data.date).toLocaleDateString()}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-400">P&L:</span>
                                <span className={`font-mono font-bold ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ${data.pnl.toFixed(2)}
                                </span>
                              </div>
                              <div className="pt-2 mt-2 border-t border-gray-800">
                                <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">News Event</span>
                                <p className="text-sm text-gray-300 mt-1 leading-relaxed">{data.news}</p>
                                <div className="mt-2 text-xs px-2 py-1 rounded bg-slate-800 inline-block text-gray-400 border border-gray-700">
                                  {data.impact}
                                </div>
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
                            <div className="flex justify-between items-center gap-6">
                              <span className="text-gray-400">P&L</span>
                              <span className={`font-mono font-bold text-lg ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${data.pnl.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 uppercase text-right">{data.type}</div>
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
"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTrades } from '../context/TradeContext';
import { Calendar, X } from 'lucide-react';

const MonthlyPerformanceChart = () => {
    const { trades, loading, error } = useTrades();
    const [isMobile, setIsMobile] = useState(false);
    const [activeView, setActiveView] = useState('daily');
    const [chartData, setChartData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredTrades, setFilteredTrades] = useState([]);

    useEffect(() => {
        const checkScreen = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    // Filter trades based on date range
    useEffect(() => {
        if (!trades || trades.length === 0) {
            setFilteredTrades([]);
            return;
        }

        let filtered = trades;

        if (startDate || endDate) {
            filtered = trades.filter(trade => {
                const tradeDate = getTradeDate(trade);
                if (!tradeDate) return false;

                const tradeDateOnly = new Date(tradeDate.toDateString());

                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    return tradeDateOnly >= start && tradeDateOnly <= end;
                } else if (startDate) {
                    const start = new Date(startDate);
                    return tradeDateOnly >= start;
                } else if (endDate) {
                    const end = new Date(endDate);
                    return tradeDateOnly <= end;
                }
                return true;
            });
        }

        setFilteredTrades(filtered);
    }, [trades, startDate, endDate]);

    const getQuarter = (month) => {
        if (month >= 0 && month <= 2) return 'Q1';
        if (month >= 3 && month <= 5) return 'Q2';
        if (month >= 6 && month <= 8) return 'Q3';
        return 'Q4';
    };

    // Helper function to safely get date from trade
    const getTradeDate = (trade) => {
        // Try different possible date fields
        const dateValue = trade.date || trade.createdAt || trade.entryDate || trade.timestamp;

        if (!dateValue) {
            console.warn('Trade missing date field:', trade);
            return null;
        }

        return new Date(dateValue);
    };

    const generateData = (view) => {
        // Use filtered trades if date range is set, otherwise use all trades
        const tradesToUse = (startDate || endDate) ? filteredTrades : trades;

        if (!tradesToUse || tradesToUse.length === 0) return [];

        let data = {};

        // Filter out trades without valid dates and sort
        const validTrades = tradesToUse.filter(trade => {
            const tradeDate = getTradeDate(trade);
            return tradeDate && !isNaN(tradeDate.getTime());
        });

        const sortedTrades = validTrades.sort((a, b) => {
            const dateA = getTradeDate(a);
            const dateB = getTradeDate(b);
            return dateA - dateB;
        });

        if (view === 'daily') {
            sortedTrades.forEach(trade => {
                const tradeDate = getTradeDate(trade);
                if (!tradeDate) return;

                const dayOfWeek = tradeDate.getDay(); // 0 = Sunday, 6 = Saturday

                // Only process weekdays (Monday = 1, Tuesday = 2, ..., Friday = 5)
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    const dateKey = tradeDate.toISOString().split('T')[0];
                    const dateLabel = tradeDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });
                    if (!data[dateKey]) {
                        data[dateKey] = { name: dateLabel, value: 0, date: tradeDate };
                    }
                    data[dateKey].value += parseFloat(trade.pnl) || 0;
                }
            });

            // Convert to array and sort by date, then calculate cumulative
            const sortedData = Object.values(data).sort((a, b) => a.date - b.date);
            let cumulativeTotal = 0;
            return sortedData.map(item => {
                cumulativeTotal += item.value;
                return { name: item.name, value: cumulativeTotal };
            });

        } else if (view === 'weekly') {
            // Only weekdays
            const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            weekDays.forEach((day, index) => {
                data[day] = { name: day, value: 0, order: index };
            });

            sortedTrades.forEach(trade => {
                const tradeDate = getTradeDate(trade);
                if (!tradeDate) return;

                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayOfWeek = dayNames[tradeDate.getDay()];

                if (data[dayOfWeek]) {
                    data[dayOfWeek].value += parseFloat(trade.pnl) || 0;
                }
            });

            // Calculate cumulative for weekdays
            const sortedData = Object.values(data).sort((a, b) => a.order - b.order);
            let cumulativeTotal = 0;
            return sortedData.map(item => {
                cumulativeTotal += item.value;
                return { name: item.name, value: cumulativeTotal };
            });

        } else if (view === 'monthly') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            months.forEach((month, index) => {
                data[month] = { name: month, value: 0, order: index };
            });

            sortedTrades.forEach(trade => {
                const tradeDate = getTradeDate(trade);
                if (!tradeDate) return;

                const month = months[tradeDate.getMonth()];
                if (data[month]) {
                    data[month].value += parseFloat(trade.pnl) || 0;
                }
            });

            // Calculate cumulative for months
            const sortedData = Object.values(data).sort((a, b) => a.order - b.order);
            let cumulativeTotal = 0;
            return sortedData.map(item => {
                cumulativeTotal += item.value;
                return { name: item.name, value: cumulativeTotal };
            });

        } else if (view === 'quarterly') {
            const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
            quarters.forEach((quarter, index) => {
                data[quarter] = { name: quarter, value: 0, order: index };
            });

            sortedTrades.forEach(trade => {
                const tradeDate = getTradeDate(trade);
                if (!tradeDate) return;

                const quarter = getQuarter(tradeDate.getMonth());
                if (data[quarter]) {
                    data[quarter].value += parseFloat(trade.pnl) || 0;
                }
            });

            // Calculate cumulative for quarters
            const sortedData = Object.values(data).sort((a, b) => a.order - b.order);
            let cumulativeTotal = 0;
            return sortedData.map(item => {
                cumulativeTotal += item.value;
                return { name: item.name, value: cumulativeTotal };
            });

        } else { // 'yearly'
            sortedTrades.forEach(trade => {
                const tradeDate = getTradeDate(trade);
                if (!tradeDate) return;

                const year = tradeDate.getFullYear().toString();
                if (!data[year]) {
                    data[year] = { name: year, value: 0, year: tradeDate.getFullYear() };
                }
                data[year].value += parseFloat(trade.pnl) || 0;
            });

            // Calculate cumulative for years
            const sortedData = Object.values(data).sort((a, b) => a.year - b.year);
            let cumulativeTotal = 0;
            return sortedData.map(item => {
                cumulativeTotal += item.value;
                return { name: item.name, value: cumulativeTotal };
            });
        }
    };

    useEffect(() => {
        setChartData(generateData(activeView));
    }, [trades, filteredTrades, activeView, startDate, endDate]);

    if (loading) {
        return (
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-xl blur-xl"></div>
                <div className="relative bg-black border border-gray-800 rounded-xl p-4 sm:p-6"
                    style={{
                        background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                    }}>
                    <div className="h-6 bg-gray-700 rounded w-48 sm:w-64 mb-4 animate-pulse"></div>
                    <div className="h-[200px] sm:h-[250px] bg-gray-800/20 rounded-lg animate-pulse flex items-center justify-center">
                        <div className="text-gray-400 text-sm">Loading chart...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-20 rounded-xl blur-xl"></div>
                <div className="relative bg-black border border-gray-800 rounded-xl p-4 sm:p-6"
                    style={{
                        background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                    }}>
                    <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-4">Performance Overview</h2>
                    <div className="h-[200px] sm:h-[250px] flex items-center justify-center text-red-400 text-sm px-4">
                        Error loading chart: {error}
                    </div>
                </div>
            </div>
        );
    }

    const viewButtons = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

    return (
        <div className="relative group">
            {/* Styles to remove default calendar icon */}
            <style jsx global>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                    background: transparent;
                    bottom: 0;
                    color: transparent;
                    cursor: pointer;
                    height: auto;
                    left: 0;
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: auto;
                }
            `}</style>

            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
            <div className="relative bg-black border border-gray-800 rounded-xl p-4 sm:p-6"
                style={{
                    background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                }}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
                    <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent pt-1">Cumulative P&L</h2>

                    {/* Controls Container - Right Aligned */}
                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">

                        {/* 1. View Toggles - Segmented Pill Style */}
                        <div className="flex bg-gray-800/50 rounded-lg p-1 border border-white/5">
                            {viewButtons.map(view => (
                                <button
                                    key={view}
                                    onClick={() => setActiveView(view)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap capitalize ${activeView === view
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {view}
                                </button>
                            ))}
                        </div>

                        {/* 2. Date Picker - High Visibility Style (Matching Screenshot) */}
                        <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 rounded-lg px-4 py-2 hover:border-gray-600 transition-colors shadow-lg shadow-black/20">
                            <Calendar className="w-4 h-4 text-gray-400 pointer-events-none" />
                            <div className="relative">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    onClick={(e) => e.target.showPicker()}
                                    className="bg-transparent border-none text-sm text-white focus:ring-0 p-0 w-28 placeholder-gray-500 cursor-pointer outline-none font-medium relative z-10"
                                />
                            </div>
                            <span className="text-gray-500 text-sm font-medium">to</span>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    onClick={(e) => e.target.showPicker()}
                                    className="bg-transparent border-none text-sm text-white focus:ring-0 p-0 w-28 placeholder-gray-500 cursor-pointer outline-none font-medium relative z-10"
                                />
                            </div>
                            {(startDate || endDate) && (
                                <div className="pl-2 border-l border-gray-700 ml-1">
                                    <button
                                        onClick={() => {
                                            setStartDate('');
                                            setEndDate('');
                                        }}
                                        className="p-1 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                                        title="Clear filter"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={isMobile ? 280 : 500}>
                    <LineChart data={chartData} margin={{ top: 20, right: isMobile ? 0 : 30, left: isMobile ? 0 : 20, bottom: isMobile ? 60 : 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="name"
                            stroke="#9CA3AF"
                            angle={isMobile && activeView === 'daily' ? -45 : 0}
                            textAnchor={isMobile && activeView === 'daily' ? 'end' : 'middle'}
                            height={isMobile && activeView === 'daily' ? 60 : 40}
                            tick={{ dy: 10, fontSize: isMobile ? 12 : 14 }}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            tick={{ fontSize: isMobile ? 12 : 14 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: isMobile ? '12px' : '14px'
                            }}
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Cumulative P&L']}
                            labelFormatter={(label) => {
                                const viewLabels = {
                                    daily: 'Date',
                                    weekly: 'Day',
                                    monthly: 'Month',
                                    quarterly: 'Quarter',
                                    yearly: 'Year'
                                };
                                return `${viewLabels[activeView]}: ${label}`;
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="url(#colorGradient)"
                            strokeWidth={isMobile ? 2 : 3}
                            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: isMobile ? 3 : 4 }}
                            activeDot={{ r: isMobile ? 5 : 6, fill: '#10B981' }}
                            animationDuration={2000}
                        />
                        <defs>
                            <linearGradient id="colorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="50%" stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#10B981" />
                            </linearGradient>
                        </defs>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MonthlyPerformanceChart;
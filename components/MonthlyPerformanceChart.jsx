"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTrades } from '../context/TradeContext';

const MonthlyPerformanceChart = () => {
    const { trades, loading, error } = useTrades();
    const [isMobile, setIsMobile] = useState(false);
    const [activeView, setActiveView] = useState('daily');
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const checkScreen = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    const getQuarter = (month) => {
        if (month >= 0 && month <= 2) return 'Q1';
        if (month >= 3 && month <= 5) return 'Q2';
        if (month >= 6 && month <= 8) return 'Q3';
        return 'Q4';
    };

    const generateData = (view) => {
        if (!trades || trades.length === 0) return [];

        let data = {};
        const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

        if (view === 'daily') {
            sortedTrades.forEach(trade => {
                const dateKey = trade.date.split('T')[0];
                const tradeDate = new Date(dateKey);
                const dayOfWeek = tradeDate.getDay(); // 0 = Sunday, 6 = Saturday
                
                // Only process weekdays (Monday = 1, Tuesday = 2, ..., Friday = 5)
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    const dateLabel = tradeDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                    });
                    if (!data[dateKey]) {
                        data[dateKey] = { name: dateLabel, value: 0 };
                    }
                    data[dateKey].value += trade.pnl || 0;
                }
            });
            return Object.values(data);
        } else if (view === 'weekly') {
            // Only weekdays - removed Saturday and Sunday
            const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            weekDays.forEach((day) => {
                data[day] = { name: day, value: 0 };
            });
            
            sortedTrades.forEach(trade => {
                const tradeDate = new Date(trade.date);
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayOfWeek = dayNames[tradeDate.getDay()];
                
                // Only process weekdays (Monday to Friday)
                if (data[dayOfWeek]) {
                    data[dayOfWeek].value += trade.pnl || 0;
                }
            });
            return Object.values(data);
        } else if (view === 'monthly') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            months.forEach((month) => {
                data[month] = { name: month, value: 0 };
            });
            sortedTrades.forEach(trade => {
                const tradeDate = new Date(trade.date);
                const month = months[tradeDate.getMonth()];
                if (data[month]) {
                    data[month].value += trade.pnl || 0;
                }
            });
            return Object.values(data);
        } else if (view === 'quarterly') {
            const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
            quarters.forEach((quarter) => {
                data[quarter] = { name: quarter, value: 0 };
            });
            sortedTrades.forEach(trade => {
                const tradeDate = new Date(trade.date);
                const quarter = getQuarter(tradeDate.getMonth());
                if (data[quarter]) {
                    data[quarter].value += trade.pnl || 0;
                }
            });
            return Object.values(data);
        } else { // 'yearly'
            sortedTrades.forEach(trade => {
                const tradeDate = new Date(trade.date);
                const year = tradeDate.getFullYear().toString();
                if (!data[year]) {
                    data[year] = { name: year, value: 0 };
                }
                data[year].value += trade.pnl || 0;
            });
            return Object.values(data);
        }
    };

    useEffect(() => {
        setChartData(generateData(activeView));
    }, [trades, activeView]);

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

    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
            <div className="relative bg-black border border-gray-800 rounded-xl p-4 sm:p-6"
                style={{
                    background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                    <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Performance</h2>
                    <div className="flex bg-gray-700 rounded-lg p-1 w-fit overflow-x-auto">
                          <button
                            onClick={() => setActiveView('weekly')}
                            className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                activeView === 'weekly' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Daily
                        </button>

                        <button
                            onClick={() => setActiveView('daily')}
                            className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                activeView === 'daily' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Weekly
                        </button>
                   
                        <button
                            onClick={() => setActiveView('monthly')}
                            className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                activeView === 'monthly' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setActiveView('quarterly')}
                            className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                activeView === 'quarterly' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Quarterly
                        </button>
                        <button
                            onClick={() => setActiveView('yearly')}
                            className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                activeView === 'yearly' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Yearly
                        </button>
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
                            formatter={(value) => [`$${value.toFixed(2)}`, 'P&L']}
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
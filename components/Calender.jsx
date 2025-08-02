import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, DollarSign, Clock, Activity, Target, BarChart3 } from 'lucide-react';
import axios from "axios"
import WeeklySummary from './WeeklySummary';
const EliteTradingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [hoveredDate, setHoveredDate] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [tradeHistory, setTradeHistory] = useState([]);

 useEffect(() => {
  setMounted(true);

  const fetchTrades = async () => {
    try {
      const response = await axios.get('/api/trades');
      setTradeHistory(response.data); // ✅ This line uses backend data
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  fetchTrades();
}, []);


  // Get current date properly
  const today = new Date();
  const todayString = today.toLocaleDateString('en-CA');

  // Group trades by date
  const tradesByDate = useMemo(() => {
    const grouped = {};
    tradeHistory.forEach(trade => {
      const date = trade.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(trade);
    });
    return grouped;
  }, [tradeHistory]);

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDay.getDay();
    const days = [];

    // Add previous month's trailing days
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Add current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Add next month's leading days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  // Get week days for current week
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({ date, isCurrentMonth: true });
    }
    return days;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    }
    setCurrentDate(newDate);
    setAnimationKey(prev => prev + 1);
  };

  const getDayTradeStats = (dateString) => {
    const trades = tradesByDate[dateString] || [];
    const totalPnl = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalPips = trades.reduce((sum, trade) => sum + (trade.pipsLostCaught || 0), 0);
    const winRate = trades.length > 0 ? (trades.filter(t => (t.pnl || 0) > 0).length / trades.length) * 100 : 0;
    return { count: trades.length, totalPnl, totalPips, trades, winRate };
  };

  const getTooltipPosition = (dayInfo) => {
    const dayOfWeek = dayInfo.date.getDay();
    const isRightSide = dayOfWeek >= 5;
    return isRightSide ? 'right-0' : 'left-0';
  };

  const renderCalendarDay = (dayInfo) => {
    const dateString = formatDate(dayInfo.date);
    const dayStats = getDayTradeStats(dateString);
    const hasTrades = dayStats.count > 0;
    const isToday = dateString === todayString;
    const tooltipPosition = getTooltipPosition(dayInfo);
    const isProfit = dayStats.totalPnl > 0;

    return (
      <div
        key={`${dateString}-${animationKey}`}
        className={`
          relative p-2 sm:p-3 min-h-[60px] sm:min-h-[80px] cursor-pointer transition-all duration-300 rounded-lg transform
          ${dayInfo.isCurrentMonth ? 'bg-gray-900/80' : 'bg-gray-950/60 text-gray-500'}
          ${isToday ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-400/30' : ''}
          ${hasTrades ?
            (isProfit ?
              'bg-gradient-to-br from-green-600/20 via-gray-900/90 to-gray-800/80 shadow-lg shadow-green-400/20 border-2 border-green-500/40' :
              'bg-gradient-to-br from-red-600/20 via-gray-900/90 to-gray-800/80 shadow-lg shadow-red-400/20 border-2 border-red-500/40'
            ) :
            'border-2 border-gray-700/30 hover:border-gray-600/60 bg-gradient-to-br from-gray-900/60 to-gray-800/40'
          }
          hover:transform hover:scale-105 hover:shadow-xl
          ${hoveredDate === dateString ? 'z-[100] scale-105' : 'z-10'}
        `}
        style={{
          backdropFilter: 'blur(10px)',
          animation: mounted ? `fadeInUp 0.4s ease-out ${(dayInfo.date.getDate() % 7) * 0.05}s both` : 'none',
        }}
        onMouseEnter={() => setHoveredDate(hasTrades ? dateString : null)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        <div className="flex justify-between items-start mb-1 sm:mb-2">
          <span className={`text-lg sm:text-xl font-bold ${isToday ? 'text-cyan-400' : 'text-gray-200'}`}>
            {dayInfo.date.getDate()}
          </span>
          {hasTrades && (
            <div className="flex items-center space-x-1">
              <Activity className={`w-3 h-3 sm:w-4 sm:h-4 ${isProfit ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-xs sm:text-sm font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded ${isProfit ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'
                }`}>
                {dayStats.count}
              </span>
            </div>
          )}
        </div>

        {hasTrades && (
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between">
              <div className={`text-sm sm:text-base font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                ${dayStats.totalPnl.toFixed(0)}
              </div>
              <div className="flex items-center space-x-1">
                {dayStats.totalPips >= 0 ?
                <TrendingUp className='w-3 h-3 sm:w-4 sm:h-4 text-green-400' />:<TrendingDown className='w-3 h-3 sm:w-4 sm:h-4 text-red-400'/>}
                <span className={`text-xs sm:text-sm font-semibold ${dayStats.totalPips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {dayStats.totalPips >= 0 ? '+' : ''}{dayStats.totalPips}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Target className={`w-3 h-3 sm:w-4 sm:h-4 ${isProfit ? 'text-green-400' : 'text-red-400'}`} />
                <span className={`text-xs sm:text-sm font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                  {dayStats.winRate.toFixed(0)}%
                </span>
              </div>
              <div className={`w-2 h-2 sm:w-3 sm:h-3 ${isProfit ? 'bg-green-400' : 'bg-red-500'} rounded-full`}></div>
            </div>
          </div>
        )}

        {/* Enhanced Tooltip */}
        {hoveredDate === dateString && (
          <div
            className={`absolute z-[9999] top-full ${tooltipPosition} mt-2 w-80 bg-gray-900/98 backdrop-blur-2xl border-2 ${isProfit ? 'border-green-500/60' : 'border-red-500/60'} rounded-2xl shadow-2xl ${isProfit ? 'shadow-green-500/20' : 'shadow-red-500/20'} p-3 transform transition-all duration-300 animate-slideIn`}
            style={{
              boxShadow: `
                0 20px 40px rgba(0, 0, 0, 0.5), 
                0 0 40px ${isProfit ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}, 
                inset 0 2px 0 rgba(255, 255, 255, 0.1)
              `,
              position: 'fixed',
              zIndex: 9999,
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.95) 100%)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-green-400" />
                <h4 className="text-green-400 font-bold text-base">
                  {dayInfo.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h4>
              </div>
              <span className="text-xs text-gray-300 bg-green-600/80 px-2 py-1 rounded-full backdrop-blur-sm font-semibold">
                {dayStats.count} {dayStats.count === 1 ? 'Trade' : 'Trades'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className={`bg-gradient-to-br ${isProfit ? 'from-green-900/60 to-green-800/40 border-green-700/50' : 'from-red-900/60 to-red-800/40 border-red-700/50'} backdrop-blur-sm p-2 rounded-lg border`}>
                <div className="flex items-center space-x-1 mb-1">
                  <DollarSign className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-300 font-medium">P&L</span>
                </div>
                <div className={`text-sm font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                  ${dayStats.totalPnl.toFixed(2)}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/60 to-blue-800/40 backdrop-blur-sm p-2 rounded-lg border border-blue-700/50">
                <div className="flex items-center space-x-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-300 font-medium">Pips</span>
                </div>
                <div className={`text-sm font-bold ${dayStats.totalPips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {dayStats.totalPips > 0 ? '+' : ''}{dayStats.totalPips}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/60 to-purple-800/40 backdrop-blur-sm p-2 rounded-lg border border-purple-700/50">
                <div className="flex items-center space-x-1 mb-1">
                  <Target className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-300 font-medium">Win</span>
                </div>
                <div className="text-sm font-bold text-purple-400">
                  {dayStats.winRate.toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-800">
              {dayStats.trades.map((trade, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gradient-to-r from-gray-900/80 to-gray-800/60 backdrop-blur-sm p-2 rounded-lg text-sm border border-gray-700/50 hover:border-green-500/50 transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedTrade(trade)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col">
                      <span className="text-gray-200 font-semibold text-xs">{trade.pair}</span>
                      <div className="flex items-center space-x-1">
                        <span className={`px-1 py-0.5 rounded text-xs font-bold ${trade.positionType === 'Long' ? 'bg-green-600/80 text-white' : 'bg-red-600/80 text-white'}`}>{trade.positionType}</span>
                        <span className="text-xs text-gray-400">{trade.setupType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${typeof trade.pnl === 'number' ? trade.pnl.toFixed(2) : 'N/A'}
                    </div>
                    <div className="text-gray-400 text-xs flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{trade.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const days = viewMode === 'month' ? getCalendarDays() : getWeekDays();

  return (
  <div className="w-full min-h-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-2 sm:p-4 lg:p-6">
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      
      {/* Calendar Section */}
      <div className="flex-1 mt-16">
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-2xl rounded-2xl p-3 sm:p-4 lg:p-6 border-2 border-gray-700/50 shadow-xl shadow-gray-900/50 overflow-visible w-full">

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5"></div>
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
          </div>

          {/* Header */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-xl">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Trading Calendar
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-800/80 backdrop-blur-xl rounded-xl p-1 border border-gray-700/50 shadow-lg">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 ${viewMode === 'week'
                      ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg shadow-green-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 ${viewMode === 'month'
                      ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg shadow-green-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  Month
                </button>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1.5 sm:p-2 bg-gradient-to-r from-gray-800/80 to-gray-700/60 backdrop-blur-xl hover:from-gray-700/80 hover:to-gray-600/60 rounded-lg transition-all duration-300 border border-gray-600/50 shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                </button>
                <div className="text-center">
                  <span className="text-sm sm:text-lg lg:text-xl text-white font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    {currentDate.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                      ...(viewMode === 'week' && { day: 'numeric' })
                    })}
                  </span>
                </div>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1.5 sm:p-2 bg-gradient-to-r from-gray-800/80 to-gray-700/60 backdrop-blur-xl hover:from-gray-700/80 hover:to-gray-600/60 rounded-lg transition-all duration-300 border border-gray-600/50 shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="relative z-10">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 sm:p-3 text-center text-sm sm:text-base font-bold text-white bg-gradient-to-r from-gray-800/80 to-gray-700/60 backdrop-blur-xl rounded-lg border border-gray-600/50 shadow-lg">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className={`grid grid-cols-7 gap-1 sm:gap-2 ${viewMode === 'week' ? 'mb-4' : ''}`}>
              {days.map(dayInfo => renderCalendarDay(dayInfo))}
            </div>
          </div>

          <style jsx>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-10px) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            
            .animate-slideIn {
              animation: slideIn 0.3s ease-out;
            }
            
            .scrollbar-thin::-webkit-scrollbar {
              width: 4px;
            }
            
            .scrollbar-thin::-webkit-scrollbar-track {
              background: rgba(31, 41, 55, 0.5);
              border-radius: 2px;
            }
            
            .scrollbar-thin::-webkit-scrollbar-thumb {
              background: rgba(34, 197, 94, 0.5);
              border-radius: 2px;
            }
            
            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
              background: rgba(34, 197, 94, 0.8);
            }
          `}</style>
        </div>
      </div>

      {/* Weekly Summary Section - Smaller and positioned at top */}
      <div className="w-full lg:w-64 xl:w-72 lg:self-start">
        <WeeklySummary 
          currentDate={currentDate}
          tradeHistory={tradeHistory}
        />
      </div>
      
    </div>
  </div>
);
};

export default EliteTradingCalendar;
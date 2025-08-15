"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, Filter, Eye, EyeOff, Clock, CalendarDays } from 'lucide-react';

const TimeFilter = ({ 
  monthGroups, 
  onFilterChange, 
  showAllMonths = false,
  onToggleShowAll 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [filterType, setFilterType] = useState('current'); // 'current', 'specific', 'all'

  // Get unique years from month groups
  const years = [...new Set(monthGroups.map(group => group.year))].sort((a, b) => b - a);
  
  // Get months for selected year
  const monthsForYear = monthGroups
    .filter(group => group.year === selectedYear)
    .map(group => group.month)
    .sort((a, b) => b - a);

  // Get current year and month
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Initialize with current month/year
  useEffect(() => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
  }, [currentYear, currentMonth]);

  // Handle filter changes
  const handleFilterChange = (type, year = null, month = null) => {
    setFilterType(type);
    
    if (type === 'specific' && year && month) {
      setSelectedYear(year);
      setSelectedMonth(month);
    }
    
    onFilterChange({
      type,
      year: type === 'specific' ? year : null,
      month: type === 'specific' ? month : null
    });
  };

  // Get month name
  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  // Get filtered month groups
  const getFilteredMonthGroups = () => {
    switch (filterType) {
      case 'current':
        return monthGroups.filter(group => 
          group.year === currentYear && group.month === currentMonth
        );
      case 'specific':
        return monthGroups.filter(group => 
          group.year === selectedYear && group.month === selectedMonth
        );
      case 'all':
        return monthGroups;
      default:
        return monthGroups;
    }
  };

  // Get filter display text
  const getFilterDisplayText = () => {
    switch (filterType) {
      case 'current':
        return `Current Month (${getMonthName(currentMonth)} ${currentYear})`;
      case 'specific':
        return `${getMonthName(selectedMonth)} ${selectedYear}`;
      case 'all':
        return `All Time (${monthGroups.length} months)`;
      default:
        return 'Select Filter';
    }
  };

  // Get filter stats
  const getFilterStats = () => {
    const filteredGroups = getFilteredMonthGroups();
    const totalTrades = filteredGroups.reduce((sum, group) => sum + group.trades.length, 0);
    const totalPnL = filteredGroups.reduce((sum, group) => sum + group.totalPnL, 0);
    const avgWinRate = filteredGroups.length > 0 
      ? filteredGroups.reduce((sum, group) => sum + (group.winCount / group.totalTrades * 100), 0) / filteredGroups.length
      : 0;

    return { totalTrades, totalPnL, avgWinRate };
  };

  const stats = getFilterStats();

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg mb-6">
      {/* Filter Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
              <Filter className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Time Filter</h3>
              <p className="text-sm text-gray-400">Filter trades by time period</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Show/Hide All Months Toggle */}
            <button
              onClick={onToggleShowAll}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                showAllMonths 
                  ? 'bg-green-600/20 border-green-500/30 text-green-400' 
                  : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/70'
              }`}
              title={showAllMonths ? 'Hide previous months' : 'Show all months'}
            >
              {showAllMonths ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {showAllMonths ? 'Hide All' : 'Show All'}
              </span>
            </button>

            {/* Expand/Collapse Filter */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-600/50 text-gray-300 hover:bg-gray-700/50 transition-all"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span className="text-sm font-medium">Filter</span>
            </button>
          </div>
        </div>

        {/* Current Filter Display */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-4 h-4 text-blue-400" />
            <span className="text-white font-medium">{getFilterDisplayText()}</span>
          </div>
          
          {/* Filter Stats */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-gray-400">Trades:</span>
              <span className="text-white font-semibold">{stats.totalTrades}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-400">PnL:</span>
              <span className={`font-semibold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.totalPnL.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-400">Win Rate:</span>
              <span className="text-blue-400 font-semibold">{stats.avgWinRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Filter Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleFilterChange('current')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border transition-all ${
                filterType === 'current'
                  ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                  : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/70'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Current Month</span>
            </button>

            <button
              onClick={() => handleFilterChange('specific')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border transition-all ${
                filterType === 'specific'
                  ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                  : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/70'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-medium">Specific Period</span>
            </button>

            <button
              onClick={() => handleFilterChange('all')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border transition-all ${
                filterType === 'all'
                  ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                  : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/70'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="font-medium">All Time</span>
            </button>
          </div>

          {/* Specific Period Selection */}
          {filterType === 'specific' && (
            <div className="bg-gray-800/30 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Select Period</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Year Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      setSelectedYear(year);
                      handleFilterChange('specific', year, selectedMonth);
                    }}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year} {year === currentYear ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      const month = parseInt(e.target.value);
                      setSelectedMonth(month);
                      handleFilterChange('specific', selectedYear, month);
                    }}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {monthsForYear.map(month => (
                      <option key={month} value={month}>
                        {getMonthName(month)} {month === currentMonth && selectedYear === currentYear ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Selection Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('specific', currentYear, currentMonth)}
                  className="px-3 py-1 text-xs bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                >
                  Current Month
                </button>
                <button
                  onClick={() => handleFilterChange('specific', currentYear - 1, currentMonth)}
                  className="px-3 py-1 text-xs bg-gray-600/20 border border-gray-500/30 text-gray-300 rounded-lg hover:bg-gray-600/30 transition-colors"
                >
                  Last Year Same Month
                </button>
                <button
                  onClick={() => handleFilterChange('specific', currentYear, currentMonth - 1)}
                  className="px-3 py-1 text-xs bg-gray-600/20 border border-gray-500/30 text-gray-300 rounded-lg hover:bg-gray-600/30 transition-colors"
                >
                  Previous Month
                </button>
              </div>
            </div>
          )}

          {/* Available Periods Summary */}
          <div className="bg-gray-800/20 border border-white/5 rounded-lg p-3">
            <h4 className="text-white font-medium mb-2">Available Periods</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {years.slice(0, 4).map(year => (
                <div key={year} className="text-gray-400">
                  <span className="font-medium text-white">{year}:</span> {monthGroups.filter(g => g.year === year).length} months
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeFilter;

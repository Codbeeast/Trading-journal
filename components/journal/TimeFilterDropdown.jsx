import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, ChevronDown, Clock, TrendingUp } from 'lucide-react';

const TimeFilterDropdown = ({ onFilterChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('current-month');

  // Memoize current date info to prevent unnecessary recalculations
  const dateInfo = useMemo(() => {
    const currentDate = new Date();
    return {
      currentYear: currentDate.getFullYear(),
      currentMonth: currentDate.getMonth() + 1,
      currentQuarter: Math.ceil((currentDate.getMonth() + 1) / 3)
    };
  }, []);

  // Helper functions - memoized for performance
  const getMonthName = useCallback((month) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  }, []);

  const getLastMonthDescription = useCallback(() => {
    const { currentYear, currentMonth } = dateInfo;
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    return `${getMonthName(lastMonth)} ${lastMonthYear}`;
  }, [dateInfo, getMonthName]);

  const getLastQuarterDescription = useCallback(() => {
    const { currentYear, currentQuarter } = dateInfo;
    const lastQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    const lastQuarterYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
    return `Q${lastQuarter} ${lastQuarterYear}`;
  }, [dateInfo]);

  // Memoize filter options to prevent recreation on every render
  const filterOptions = useMemo(() => [
    { 
      value: 'current-month', 
      label: 'Current Month', 
      icon: Calendar,
      description: `${getMonthName(dateInfo.currentMonth)} ${dateInfo.currentYear}`
    },
    { 
      value: 'last-month', 
      label: 'Last Month', 
      icon: Calendar,
      description: getLastMonthDescription()
    },
    { 
      value: 'current-quarter', 
      label: 'Current Quarter', 
      icon: TrendingUp,
      description: `Q${dateInfo.currentQuarter} ${dateInfo.currentYear}`
    },
    { 
      value: 'last-quarter', 
      label: 'Last Quarter', 
      icon: TrendingUp,
      description: getLastQuarterDescription()
    },
    { 
      value: 'current-year', 
      label: 'Current Year', 
      icon: Calendar,
      description: `${dateInfo.currentYear}`
    },
    { 
      value: 'last-year', 
      label: 'Last Year', 
      icon: Calendar,
      description: `${dateInfo.currentYear - 1}`
    },
    { 
      value: 'all-time', 
      label: 'All Time', 
      icon: Clock,
      description: 'Complete history'
    }
  ], [dateInfo, getMonthName, getLastMonthDescription, getLastQuarterDescription]);


  // Get display text for selected filter - memoized
  const getDisplayText = useCallback(() => {
    const option = filterOptions.find(opt => opt.value === selectedFilter);
    return option ? option.label : 'Time Period';
  }, [filterOptions, selectedFilter]);

  // Handle filter selection - memoized to prevent unnecessary re-renders
  const handleFilterSelect = useCallback((filterValue) => {
    setSelectedFilter(filterValue);
    setIsOpen(false);
    
    const { currentYear, currentMonth, currentQuarter } = dateInfo;
    
    // Create filter data based on selection
    let filterData = { type: 'all' };
    
    switch (filterValue) {
      case 'current-month':
        filterData = { type: 'month', year: currentYear, month: currentMonth };
        break;
      case 'last-month':
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        filterData = { type: 'month', year: lastMonthYear, month: lastMonth };
        break;
      case 'current-quarter':
        filterData = { type: 'quarter', year: currentYear, quarter: currentQuarter };
        break;
      case 'last-quarter':
        const lastQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
        const lastQuarterYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
        filterData = { type: 'quarter', year: lastQuarterYear, quarter: lastQuarter };
        break;
      case 'current-year':
        filterData = { type: 'year', year: currentYear };
        break;
      case 'last-year':
        filterData = { type: 'year', year: currentYear - 1 };
        break;
      case 'all-time':
      default:
        filterData = { type: 'all' };
        break;
    }
    
    onFilterChange(filterData);
  }, [dateInfo, onFilterChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.time-filter-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative time-filter-dropdown ${className}`}>
      {/* Main Filter Button - Matches ActionButtons styling exactly */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-gray-700 bg-gray-900/60 text-gray-200 hover:bg-gray-800/80 hover:text-white transition-all text-sm shadow-lg min-w-[140px] justify-between backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span>{getDisplayText()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2">
            {/* Header */}
            <div className="px-3 py-2 border-b border-white/10 mb-2">
              <h4 className="text-sm font-semibold text-gray-300">Select Time Period</h4>
            </div>

            {/* Filter Options */}
            <div className="space-y-1">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedFilter === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleFilterSelect(option.value)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                        : 'bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <div className="text-left">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-400">{option.description}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="px-3 py-1">
                <p className="text-xs text-gray-500">
                  Filter trades by time period for focused analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeFilterDropdown;

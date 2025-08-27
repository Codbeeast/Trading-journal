"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const SearchBar = ({
  strategies = [],
  trades = [],
  selectedStrategy = '',
  selectedStrategyName = '',
  searchOpen = false,
  onStrategySelect,
  onClearFilter,
  onToggleSearch
}) => {
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by strategy..."
          value={selectedStrategy ? selectedStrategyName : ''}
          onClick={onToggleSearch}
          onChange={() => {}}
          className="w-64 pl-9 pr-10 py-2.5 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm"
          readOnly
        />
        {selectedStrategy && (
          <button
            onClick={onClearFilter}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white text-lg font-bold transition-colors"
            title="Clear filter"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {searchOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-black/40 backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto"
        >
          <div 
            onClick={onClearFilter}
            className="px-4 py-2.5 hover:bg-white/10 cursor-pointer border-b border-white/10 transition-colors"
          >
            <span className="text-white font-medium text-sm">All Strategies</span>
            <span className="text-gray-400 ml-2 text-xs">({trades.length} trades)</span>
          </div>
          {strategies.map((strategy) => {
            const tradeCount = trades.filter(t => t.strategy?._id === strategy._id).length;
            return (
              <div
                key={strategy._id}
                onClick={() => onStrategySelect(strategy._id)}
                className="px-4 py-2.5 hover:bg-white/10 cursor-pointer flex justify-between items-center transition-colors"
              >
                <span className="text-white text-sm">{strategy.strategyName}</span>
                <span className="text-gray-400 text-xs">({tradeCount} trades)</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default SearchBar;
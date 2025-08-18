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
    <div className="relative mb-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by strategy name..."
          value={selectedStrategy ? selectedStrategyName : ''}
          onClick={onToggleSearch}
          onChange={() => {}}
          className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm"
          readOnly
        />
        {selectedStrategy && (
          <button
            onClick={onClearFilter}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white text-xl font-bold transition-colors"
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
          className="absolute top-full left-0 right-0 mt-2 bg-black/40 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto"
        >
          <div 
            onClick={onClearFilter}
            className="px-6 py-3 hover:bg-white/10 cursor-pointer border-b border-white/10 transition-colors"
          >
            <span className="text-white font-medium">All Strategies</span>
            <span className="text-gray-400 ml-2">({trades.length} trades)</span>
          </div>
          {strategies.map((strategy) => {
            const tradeCount = trades.filter(t => t.strategy?._id === strategy._id).length;
            return (
              <div
                key={strategy._id}
                onClick={() => onStrategySelect(strategy._id)}
                className="px-6 py-3 hover:bg-white/10 cursor-pointer flex justify-between items-center transition-colors"
              >
                <span className="text-white">{strategy.strategyName}</span>
                <span className="text-gray-400 text-sm">({tradeCount} trades)</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default SearchBar;

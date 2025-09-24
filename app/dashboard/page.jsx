"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Search } from 'lucide-react';

// Import your existing dashboard components
import Calender from '@/components/Calender';
import MonthlyProfitChart from '@/components/MonthlyProfitChart';
import QuaterlyTables from '@/components/QuaterlyTables';
import SessionAnalysis from '@/components/SessionAnalysis';
import StatsCards from '@/components/StatsCard';
import MonthlyPerformanceChart from '@/components/MonthlyPerformanceChart';
import WinLossChart from '@/components/WinLossChart';
import BestTradingTimes from '@/components/BestTradingTimes';
import SetupTypes from '@/components/SetupTypes';
import ConfluencesAnalysis from '@/components/ConfluenceAnalysis';
import TimeCards from '@/components/TradingStatsCards';
import LongShortBar from '@/components/LongShortBar';

// Import the useTrades hook from your context
import { useTrades } from '@/context/TradeContext';

// --- SearchBar Component with Debug ---
const SearchBar = ({
  strategies = [],
  trades = [],
  allTrades = [],
  selectedStrategy = '',
  selectedStrategyName = '',
  searchOpen = false,
  onStrategySelect,
  onClearFilter,
  onToggleSearch
}) => {
  // Use allTrades for counting instead of filtered trades
  const tradesForCounting = allTrades.length > 0 ? allTrades : trades;
 

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
            <span className="text-gray-400 ml-2 text-xs">({tradesForCounting.length} trades)</span>
          </div>
          {strategies.map((strategy) => {
            
            
            // Try multiple approaches to match trades
            let tradeCount = 0;
            
            // Approach 1: Direct ObjectId comparison
            const matches1 = tradesForCounting.filter(t => t.strategy === strategy._id);
            
            // Approach 2: Populated object comparison
            const matches2 = tradesForCounting.filter(t => t.strategy?._id === strategy._id);
            
            // Approach 3: String comparison
            const matches3 = tradesForCounting.filter(t => 
              t.strategy?.toString() === strategy._id?.toString()
            );
            
            // Approach 4: Flexible comparison
            const matches4 = tradesForCounting.filter(t => {
              const tradeStrategyId = t.strategy?._id || t.strategy;
              const result = tradeStrategyId?.toString() === strategy._id?.toString();
              return result;
            });
            
            // Use the highest count that makes sense
            tradeCount = Math.max(matches1.length, matches2.length, matches3.length, matches4.length);
          
            
            return (
              <div
                key={strategy._id}
                onClick={() => onStrategySelect(strategy._id, strategy.strategyName)}
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

// --- Reusable Dashboard Card Component ---
const DashboardCard = ({ children, className = '' }) => (
  <div className={`bg-black/20 backdrop-blur-lg border-white/10 rounded-2xl shadow-lg ${className}`}>
    {children}
  </div>
);

// --- Main Dashboard Component ---
const TradingDashboard = () => {
  // FIXED: Added allTrades to destructuring
  const { loading, error, trades, allTrades, strategies, fetchTrades, fetchTradesByStrategy } = useTrades();
  
  // Search functionality state
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [selectedStrategyName, setSelectedStrategyName] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [allTradesCount, setAllTradesCount] = useState(0);


  // Store the count of all trades when component mounts
  useEffect(() => {
    if (trades && !selectedStrategy) {
      setAllTradesCount(trades.length);
    }
  }, [trades, selectedStrategy]);

  // Search handlers
  const handleStrategySelect = async (strategyId, strategyName) => {
    try {
      setSelectedStrategy(strategyId);
      setSelectedStrategyName(strategyName);
      setSearchOpen(false);
      
      await fetchTradesByStrategy(strategyId);
    } catch (error) {
      console.error('Error fetching strategy trades:', error);
    }
  };

  const handleClearFilter = async () => {
    try {
      setSelectedStrategy('');
      setSelectedStrategyName('');
      setSearchOpen(false);
    
      await fetchTrades();
    } catch (error) {
      console.error('Error fetching all trades:', error);
    }
  };

  const handleToggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  // --- Loading Screen ---
  const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center text-center p-4">
      <div>
        <div className="w-16 h-16 mx-auto mb-4 relative flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-blue-500/50 rounded-full animate-spin"></div>
          <TrendingUp className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-2xl font-semibold text-white">Loading Trading Data...</h1>
        <p className="text-gray-400 mt-2">Analyzing your performance.</p>
      </div>
    </div>
  );

  // --- Error Screen ---
  const ErrorScreen = () => (
    <div className="min-h-screen flex items-center justify-center text-center p-4">
      <div className="bg-red-900/20 border border-red-500/30 p-8 rounded-2xl">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-white">Failed to Load Data</h1>
        <p className="text-gray-400 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
  
  // --- Dashboard Header with integrated SearchBar ---
  const DashboardHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold pb-1 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
          Trading Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Your Professional Trading Analytics Hub</p>
      </div>
      
      {/* SearchBar with proper props */}
      <div className="flex justify-center md:justify-end">
        <SearchBar
          strategies={strategies || []}
          trades={trades || []}
          allTrades={allTrades || []} // FIXED: Now properly passed
          selectedStrategy={selectedStrategy}
          selectedStrategyName={selectedStrategyName}
          searchOpen={searchOpen}
          onStrategySelect={handleStrategySelect}
          onClearFilter={handleClearFilter}
          onToggleSearch={handleToggleSearch}
        />
      </div>
    </div>
  );

  // Show loading screen only if truly loading
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;

  return (
    // Main container 
    <div className="min-h-screen w-full bg-black text-white relative">
       <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]"></div>
          <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
        </div>

      <div className="relative z-10 w-full mx-auto space-y-8 p-4 md:p-8">

        {/* Dashboard Header with integrated SearchBar */}
        <motion.section 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.05, duration: 0.6 }}
        >
          <DashboardHeader />
        </motion.section>

        {/* Dashboard sections with current trades data */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <DashboardCard><StatsCards trades={trades} /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <DashboardCard><MonthlyPerformanceChart trades={trades} /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <DashboardCard><Calender trades={trades} /></DashboardCard>
        </motion.section>
        
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <DashboardCard><BestTradingTimes trades={trades} /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <DashboardCard><TimeCards trades={trades} /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <DashboardCard><WinLossChart trades={trades} /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <DashboardCard><ConfluencesAnalysis trades={trades} /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <DashboardCard><SetupTypes trades={trades} /></DashboardCard>
        </motion.section>

         <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <DashboardCard>
              <LongShortBar trades={trades} />
            </DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
            <DashboardCard>
                <SessionAnalysis
                  trades={trades}
                  autoRotate={true}
                  enableControls={true}
                  renderPriority="high"
                />
            </DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
            <DashboardCard><MonthlyProfitChart trades={trades} /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
            <DashboardCard><QuaterlyTables trades={trades} /></DashboardCard>
        </motion.section>
      </div>
    </div>
  );
};

export default TradingDashboard;
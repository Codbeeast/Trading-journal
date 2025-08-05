"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp } from 'lucide-react';

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
import LongShortBar from '@/components/LongShortBar'

// Import the useTrades hook from your context
import { useTrades } from '@/context/TradeContext';

// --- Reusable Dashboard Card Component ---
// This component applies the consistent "glass" theme to each widget.
const DashboardCard = ({ children, className = '' }) => (
  <div className={`bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg ${className}`}>
    {children}
  </div>
);

// --- Main Dashboard Component ---
const TradingDashboard = () => {
  const { loading, error } = useTrades();

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
  
  // --- Dashboard Header ---
  const DashboardHeader = () => (
    <div className="text-center mb-13">
      <h1 className="text-4xl md:text-5xl font-bold pb-1 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
        Trading Dashboard
      </h1>
      <p className="text-gray-400 mt-2">Your Professional Trading Analytics Hub</p>
    </div>
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;

  return (
    // Main container 
    <div className="min-h-screen w-full bg-black text-white relative">
       <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]"></div>
          <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
        </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8 p-4 md:p-8">

        <DashboardHeader />

        {/* Each section is wrapped in a card and maintains the original vertical layout */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <DashboardCard><StatsCards /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <DashboardCard><MonthlyPerformanceChart /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <DashboardCard><Calender /></DashboardCard>
        </motion.section>
        
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <DashboardCard><BestTradingTimes /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <DashboardCard><WinLossChart /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <DashboardCard><ConfluencesAnalysis /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <DashboardCard><TimeCards /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <DashboardCard><SetupTypes /></DashboardCard>
        </motion.section>

         <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <DashboardCard>
              <LongShortBar />
            </DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <DashboardCard>
                <SessionAnalysis
                  autoRotate={true}
                  enableControls={true}
                  renderPriority="high"
                />
            </DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
            <DashboardCard><MonthlyProfitChart /></DashboardCard>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
            <DashboardCard><QuaterlyTables /></DashboardCard>
        </motion.section>
      </div>
    </div>
  );
};

export default TradingDashboard;

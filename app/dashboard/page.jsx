"use client"
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

// Import existing components
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

const TradingDashboard = () => {

  const [animationKey, setAnimationKey] = useState(0);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [particles, setParticles] = useState([]);

  // Initialize particles for loading animation
  useEffect(() => {
    const tempParticles = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 2}s`
    }));
    setParticles(tempParticles);
  }, []);

  // Fetch trades data
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/trades');
        if (!response.ok) {
          throw new Error('Failed to fetch trades');
        }
        const data = await response.json();
        setTrades(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching trades:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  // Animation interval
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Loading component
  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1623] via-[#102030] to-[#12263a] p-6 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-20"
            style={{
              left: p.left,
              top: p.top,
              animation: `float ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay
            }}
          />
        ))}
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main loading content */}
      <div className="relative z-10 text-center">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-cyan-400/30 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-blue-400/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
              <div className="absolute inset-4 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
              Trading Dashboard
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative">
            <div className="flex justify-center space-x-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </div>
            
            <div className="w-64 h-2 bg-gray-700/50 rounded-full mx-auto mb-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xl text-white font-medium">
            Loading trading data
            <span className="animate-pulse">...</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );

  // Error component
  const ErrorScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1623] via-[#102030] to-[#12263a] p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <div className="text-red-400 text-xl">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  // Main dashboard header
  const DashboardHeader = () => (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-white mb-2 animate-pulse">
        Trading Dashboard
      </h1>
      <p className="text-gray-300 italic">
        Professional Trading Analytics
      </p>
      <div className="h-1 w-32 mx-auto mt-4 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
    </div>
  );

  // Render loading or error states
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1623] via-[#102030] to-[#12263a] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Stats Cards Row */}
        <section className="mb-8">
          <StatsCards trades={trades} />
        </section>

        {/* Monthly Performance Chart */}
        <section className="mb-8">
          <MonthlyPerformanceChart trades={trades} />
        </section>

        {/* Calendar */}
        <section className="mb-8">
          <Calender trades={trades} />
        </section>

        {/* Best Trading Times - Full Width */}
        <section className="mb-8">
          <BestTradingTimes trades={trades} />
        </section>

        {/* Win/Loss Chart - Full Width in Next Row */}
        <section className="mb-8">
          <WinLossChart trades={trades} />
        </section>

        {/* Setup Types and Confluences Analysis */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SetupTypes trades={trades} />
          <ConfluencesAnalysis trades={trades} />
        </section>

        {/* Monthly Profit Chart */}
        <section className="mb-8">
          <MonthlyProfitChart trades={trades} />
        </section>

        {/* Quarterly Tables */}
        <section className="mb-8">
          <QuaterlyTables trades={trades} />
        </section>

        {/* Session Analysis */}
        <section className="mb-8">
          <SessionAnalysis trades={trades} />
        </section>

      </div>
    </div>
  );
};

export default TradingDashboard;

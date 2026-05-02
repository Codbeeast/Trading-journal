'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SpeedometerGrid from '@/components/Speedometer';
import WeeklyPsychProfile from '@/components/PsycProfile';
import DailyTrades from '@/components/DailyTrades';
import WeeklyRiskStatus from '@/components/WeeklyRiskStatus';
import NoteSummary from '@/components/NoteSummary'
import RegulationChart from '@/components/RegulationChart'
import ProtectedRoute from '@/components/ProtectedRoute';

import { useTrades } from '@/context/TradeContext';

// --- Premium Dashboard Card Component ---
const DashboardCard = ({ children, className = '' }) => (
    <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
        className={`relative group rounded-2xl ${className}`}
    >
        {/* Animated Border Glow */}
        <div className="absolute -inset-[1px] bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative h-full bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden group-hover:border-white/10 transition-all duration-300">
            {/* Subtle light leak */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/10 transition-all duration-500" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-500/10 transition-all duration-500" />

            <div className="relative z-10 p-1">
                {children}
            </div>
        </div>
    </motion.div>
);

const PsychologyDashboard = () => {
    const [metrics, setMetrics] = useState({
        fomo: 25,
        execution: 75,
        patience: 60,
        confidence: 85,
        fearGreed: 40
    });

    const { trades, fetchTrades } = useTrades();

    useEffect(() => {
        fetchTrades();
    }, [fetchTrades]);

    return (
        <div className="min-h-screen w-full bg-black text-white relative font-inter">
            {/* Background Gradients to match Dashboard */}
            <div className="absolute inset-0 z-0 opacity-25 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]"></div>
                <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-12 p-4 md:p-8">
                {/* Header */}
                <div className="text-center md:text-left space-y-2 mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold pb-2 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent tracking-tight leading-tight">
                        Psychology Insights
                    </h1>
                    <p className="text-gray-400 text-lg font-medium max-w-2xl">
                        Monitor and optimize your mental edge and trading performance metrics.
                    </p>
                </div>

                <div className="space-y-16">
                    {/* Each component wrapped in a premium DashboardCard */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <DashboardCard>
                            <div className="p-4 md:p-8">
                                <SpeedometerGrid onMetricsChange={setMetrics} />
                            </div>
                        </DashboardCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <DashboardCard>
                            <div className="p-4 md:p-8">
                                <WeeklyPsychProfile />
                            </div>
                        </DashboardCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <DashboardCard>
                            <div className="p-4 md:p-8">
                                <WeeklyRiskStatus trades={trades} />
                            </div>
                        </DashboardCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <DashboardCard>
                            <div className="p-4 md:p-8">
                                <DailyTrades trades={trades} />
                            </div>
                        </DashboardCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <DashboardCard>
                            <div className="p-4 md:p-8">
                                <RegulationChart trades={trades} />
                            </div>
                        </DashboardCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                        <DashboardCard>
                            <div className="p-4 md:p-8">
                                <NoteSummary />
                            </div>
                        </DashboardCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default function PsychologyPage() {
    return (
        <ProtectedRoute>
            <PsychologyDashboard />
        </ProtectedRoute>
    );
}

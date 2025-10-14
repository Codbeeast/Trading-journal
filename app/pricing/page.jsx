'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Star, Bell, Sparkles, Crown, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';

const PricingPage = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };
  
  const cardHover = {
    scale: 1.05,
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)",
    transition: { duration: 0.3 }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-black text-white antialiased relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          <motion.div variants={itemVariants} className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-800 px-4 py-1 text-sm text-gray-300">
            <Crown className="h-4 w-4 text-blue-400" />
            <span>Premium Trading Plans Coming Soon</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl font-bold tracking-tight md:text-7xl">
            Unlock Pro Trading <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent">Insights</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="max-w-2xl text-lg text-gray-400">
            🚀 We're crafting revolutionary pricing plans to <span className="text-blue-400 font-semibold">supercharge</span> your trading journey. Advanced analytics, AI-powered insights, and unlimited trade tracking await.
          </motion.p>


          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-3"
          >
            {/* Plan Cards */}
            <motion.div variants={itemVariants} whileHover={cardHover} className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-gray-400" />
                <h3 className="text-xl font-bold text-gray-200">Starter</h3>
              </div>
              <p className="mt-2 text-gray-400">Perfect for getting started and logging your first trades.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={cardHover} className="rounded-xl border border-blue-500/50 bg-gray-800/50 p-6 backdrop-blur-sm ring-2 ring-blue-500/20">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-blue-400">Pro</h3>
                 </div>
                 <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300">Most Popular</span>
              </div>
              <p className="mt-2 text-gray-400">Unlock advanced analytics and performance metrics.</p>
            </motion.div>
            <motion.div variants={itemVariants} whileHover={cardHover} className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-cyan-400" />
                <h3 className="text-xl font-bold text-cyan-300">Elite</h3>
              </div>
              <p className="mt-2 text-gray-400">For serious traders seeking AI insights and priority support.</p>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-16 text-center">
            <h4 className="text-2xl font-semibold text-white">Features You'll Love</h4>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-gray-400 md:gap-8">
                <div className="flex items-center gap-2">
                    <Zap size={18} className="text-cyan-400"/> Blazing Fast Entry
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={18} className="text-cyan-400"/> Real-time Analytics
                </div>
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-cyan-400"/> Smart Notifications
                </div>
                <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-cyan-400"/> AI-Powered Insights
                </div>
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
    </>
  );
};

export default PricingPage;
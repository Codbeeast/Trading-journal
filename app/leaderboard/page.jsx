"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Award, 
  Crown, 
  Flame, 
  Star, 
  Shield,
  Gem,
  Medal,
  Calendar,
  BarChart3,
  Eye,
  EyeOff,
  ChevronRight,
  Activity
} from 'lucide-react';

// Rank tiers based on trading performance
const performanceRanks = [
  { name: 'Obsidian', minScore: 95, color: 'from-purple-900 to-black', textColor: 'text-purple-300', icon: <Crown className="w-6 h-6" /> },
  { name: 'Diamond', minScore: 85, color: 'from-blue-400 to-cyan-300', textColor: 'text-cyan-300', icon: <Gem className="w-6 h-6" /> },
  { name: 'Platinum', minScore: 75, color: 'from-gray-300 to-gray-500', textColor: 'text-gray-300', icon: <Shield className="w-6 h-6" /> },
  { name: 'Gold', minScore: 65, color: 'from-yellow-400 to-orange-400', textColor: 'text-yellow-300', icon: <Medal className="w-6 h-6" /> },
  { name: 'Silver', minScore: 45, color: 'from-gray-400 to-gray-600', textColor: 'text-gray-400', icon: <Award className="w-6 h-6" /> },
  { name: 'Bronze', minScore: 0, color: 'from-orange-600 to-red-600', textColor: 'text-orange-400', icon: <Trophy className="w-6 h-6" /> },
];

// Streak ranks (private to user)
const streakRanks = [
  { name: 'Trader Elite', minStreak: 100, icon: <Crown className="w-5 h-5 text-yellow-400" />, theme: 'text-yellow-400' },
  { name: 'Market Surgeon', minStreak: 75, icon: <Award className="w-5 h-5 text-purple-400" />, theme: 'text-purple-400' },
  { name: 'Edge Builder', minStreak: 50, icon: <Star className="w-5 h-5 text-blue-300" />, theme: 'text-blue-400' },
  { name: 'Discipline Beast', minStreak: 30, icon: <Flame className="w-5 h-5 text-red-400" />, theme: 'text-red-400' },
  { name: 'Setup Sniper', minStreak: 20, icon: <Flame className="w-5 h-5 text-orange-400" />, theme: 'text-orange-400' },
  { name: 'R-Master', minStreak: 15, icon: <Flame className="w-5 h-5 text-green-400" />, theme: 'text-green-400' },
  { name: 'Breakout Seeker', minStreak: 10, icon: <Flame className="w-5 h-5 text-teal-400" />, theme: 'text-teal-400' },
  { name: 'Zone Scout', minStreak: 5, icon: <Flame className="w-5 h-5 text-cyan-400" />, theme: 'text-cyan-400' },
  { name: 'Wick Watcher', minStreak: 2, icon: <Flame className="w-5 h-5 text-gray-400" />, theme: 'text-gray-400' },
  { name: 'Chart Rookie', minStreak: 0, icon: <Flame className="w-5 h-5 text-gray-500" />, theme: 'text-gray-500' },
];

// Mock trading data with performance metrics
const mockLeaderboardData = [
  { 
    userId: 'user_1', 
    username: 'CryptoKing',
    imageUrl: 'https://framerusercontent.com/images/ETgoVdeITLLIYCHTFNeVuZDMyQY.png',
    winRate: 78.5,
    totalTrades: 234,
    profitFactor: 2.45,
    avgRR: 1.8,
    maxDrawdown: 8.2,
    score: 96.2
  },
  { 
    userId: 'user_2', 
    username: 'ForexQueen',
    imageUrl: 'https://framerusercontent.com/images/QmmaDSjXyuZNNDsZdt23lDVXI.png',
    winRate: 72.3,
    totalTrades: 189,
    profitFactor: 2.1,
    avgRR: 1.6,
    maxDrawdown: 12.5,
    score: 89.7
  },
  { 
    userId: 'user_3', 
    username: 'StockWizard',
    imageUrl: 'https://framerusercontent.com/images/7qBFv2WmuOwj4qUFS7XUzQSFL4.jpg',
    winRate: 68.9,
    totalTrades: 156,
    profitFactor: 1.9,
    avgRR: 1.5,
    maxDrawdown: 15.3,
    score: 82.4
  },
  { 
    userId: 'user_4', 
    username: 'DayTraderPro',
    imageUrl: 'https://framerusercontent.com/images/0zuVQ2JmvxEtdnpdOq5FtRJxmNY.png',
    winRate: 65.4,
    totalTrades: 143,
    profitFactor: 1.7,
    avgRR: 1.4,
    maxDrawdown: 18.7,
    score: 77.8
  },
  { 
    userId: 'user_5', 
    username: 'ScalperSam',
    imageUrl: 'https://framerusercontent.com/images/Z9Z59ZjzMfqaMdHGgXmijuQ8hAw.jpg',
    winRate: 61.2,
    totalTrades: 298,
    profitFactor: 1.5,
    avgRR: 1.2,
    maxDrawdown: 22.1,
    score: 71.5
  },
  { 
    userId: 'user_6', 
    username: 'PipsCatcher',
    imageUrl: 'https://framerusercontent.com/images/bnJJiW5Vfixlrz7M2pzoeyHBU.png',
    winRate: 58.7,
    totalTrades: 87,
    profitFactor: 1.4,
    avgRR: 1.1,
    maxDrawdown: 25.8,
    score: 66.3
  }
];

// Current user data (including private streak info)
const currentUser = {
  userId: 'current_user',
  username: 'You',
  imageUrl: 'https://img.clerk.com/preview.png',
  winRate: 64.2,
  totalTrades: 78,
  profitFactor: 1.6,
  avgRR: 1.3,
  maxDrawdown: 19.5,
  score: 74.8,
  // Private streak data
  currentStreak: 18,
  highestStreak: 28,
  lastJournalDate: new Date().toISOString().split('T')[0],
  streakStartDate: '2024-08-01'
};

const getRank = (score) => {
  return performanceRanks.find(rank => score >= rank.minScore) || performanceRanks[performanceRanks.length - 1];
};

const getStreakRank = (streak) => {
  return streakRanks.find(rank => streak >= rank.minStreak) || streakRanks[streakRanks.length - 1];
};

const EnhancedTradingBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 15 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        x: [
          Math.random() * 100 - 50,
          Math.random() * 200 - 100,
          Math.random() * 150 - 75,
          Math.random() * 180 - 90,
          Math.random() * 100 - 50
        ],
        y: [
          Math.random() * 100 - 50,
          Math.random() * 200 - 100,
          Math.random() * 150 - 75,
          Math.random() * 180 - 90,
          Math.random() * 100 - 50
        ],
        opacity: [0.2, 0.6, 0.1, 0.4, 0.2],
        scale: [0.3, 1, 0.6, 0.8, 0.3],
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 8
      }));
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden z-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Trading chart-inspired animated elements */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.08) 40%, transparent 70%)',
        }}
        animate={{
          x: [-200, 300, -150, 200, -200],
          y: [-100, 150, -200, 100, -100],
          scale: [1, 1.4, 0.8, 1.2, 1],
          rotate: [0, 180, 360, 540, 720],
        }}
        transition={{
          duration: 30,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop"
        }}
        initial={{ x: -200, y: -100 }}
      />
      
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, rgba(185, 28, 28, 0.06) 45%, transparent 75%)',
        }}
        animate={{
          x: [400, -200, 350, -150, 400],
          y: [200, -150, 180, -100, 200],
          scale: [0.8, 1.3, 1, 1.5, 0.8],
          rotate: [0, -270, -540, -810, -1080],
        }}
        transition={{
          duration: 25,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
          delay: 2
        }}
        initial={{ x: 400, y: 200 }}
      />

      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full blur-2xl"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 50%, transparent 80%)',
        }}
        animate={{
          x: [150, -300, 250, -200, 150],
          y: [-200, 200, -150, 150, -200],
          scale: [1, 0.6, 1.4, 0.9, 1],
          rotate: [0, 360, 720, 1080, 1440],
        }}
        transition={{
          duration: 35,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
          delay: 4
        }}
        initial={{ x: 150, y: -200 }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-emerald-400/20 rounded-full blur-sm"
          animate={{
            x: p.x,
            y: p.y,
            opacity: p.opacity,
            scale: p.scale,
          }}
          transition={{
            duration: p.duration,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
            delay: p.delay
          }}
          style={{
            left: p.left,
            top: p.top,
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
};

const StatCard = ({ icon, label, value, change, isPositive = true }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-emerald-500/10 rounded-lg">
        {icon}
      </div>
      {change && (
        <span className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="text-lg font-bold text-white">{value}</p>
  </motion.div>
);

const TradingLeaderboard = () => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [showStreakDetails, setShowStreakDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLeaderboardData([...mockLeaderboardData, currentUser].sort((a, b) => b.score - a.score));
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const currentUserRank = getRank(currentUser.score);
  const currentStreakRank = getStreakRank(currentUser.currentStreak);

  return (
    <div className="min-h-screen w-full bg-black text-white relative font-sans overflow-hidden">
      <EnhancedTradingBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Trading Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">Compete with the best traders. Track your performance and climb the ranks!</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Personal Streak Section (Left Sidebar) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Your Journal Streak
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowStreakDetails(!showStreakDetails)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {showStreakDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>

              {/* Current Streak Display */}
              <div className="text-center mb-6">
                <div className="relative">
                  <motion.div 
                    className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border-4 border-emerald-500/50 flex items-center justify-center mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="text-center">
                      <Flame className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-emerald-400">{currentUser.currentStreak}</p>
                    </div>
                  </motion.div>
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                  {currentStreakRank.icon}
                  <span className={`font-semibold ${currentStreakRank.theme}`}>
                    {currentStreakRank.name}
                  </span>
                </div>
                
                <p className="text-xs text-gray-400">
                  Highest Streak: {currentUser.highestStreak} days
                </p>
              </div>

              {showStreakDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-black/30 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">Streak Progress</h3>
                    
                    {/* Progress to next rank */}
                    {currentUser.currentStreak < 100 && (
                      <div className="mb-4">
                        {(() => {
                          const nextRank = streakRanks.find(rank => rank.minStreak > currentUser.currentStreak);
                          if (!nextRank) return null;
                          const progress = (currentUser.currentStreak / nextRank.minStreak) * 100;
                          
                          return (
                            <>
                              <div className="flex justify-between text-xs text-gray-400 mb-2">
                                <span>Next: {nextRank.name}</span>
                                <span>{nextRank.minStreak - currentUser.currentStreak} days to go</span>
                              </div>
                              <div className="w-full bg-gray-700/50 rounded-full h-2">
                                <motion.div 
                                  className="h-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 space-y-1">
                      <p>• Streaks count Monday-Friday only</p>
                      <p>• Complete all journal fields to maintain streak</p>
                      <p>• Weekends don't break your streak</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Personal Stats Cards */}
            <div className="mt-6 space-y-3">
              <StatCard 
                icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
                label="Win Rate"
                value={`${currentUser.winRate}%`}
                change="2.3"
              />
              <StatCard 
                icon={<Target className="w-4 h-4 text-blue-400" />}
                label="Avg R:R"
                value={currentUser.avgRR}
                change="0.2"
              />
              <StatCard 
                icon={<BarChart3 className="w-4 h-4 text-purple-400" />}
                label="Profit Factor"
                value={currentUser.profitFactor}
                change="-0.1"
                isPositive={false}
              />
              <StatCard 
                icon={<Activity className="w-4 h-4 text-orange-400" />}
                label="Total Trades"
                value={currentUser.totalTrades}
                change="12"
              />
            </div>
          </motion.div>

          {/* Main Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Performance Rankings
                </h2>
                <div className="text-sm text-gray-400">
                  Based on win rate, profit factor, and risk management
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading rankings...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboardData.map((trader, index) => {
                    const rank = getRank(trader.score);
                    const isCurrentUser = trader.userId === currentUser.userId;
                    const isTopThree = index < 3;
                    
                    return (
                      <motion.div
                        key={trader.userId}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`relative group cursor-pointer ${
                          isCurrentUser 
                            ? 'bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 border-2 border-emerald-500/50' 
                            : 'bg-black/30 hover:bg-black/40 border border-white/10 hover:border-white/20'
                        } backdrop-blur-lg rounded-xl p-4 transition-all duration-300 overflow-hidden`}
                        whileHover={{ scale: 1.01, y: -2 }}
                      >
                        {/* Rank badge */}
                        <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isTopThree 
                            ? index === 0 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' 
                              : index === 1 
                                ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black'
                                : 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}>
                          {index + 1}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img 
                                src={trader.imageUrl} 
                                alt={trader.username}
                                className="w-12 h-12 rounded-full border-2 border-gray-600"
                              />
                              {isCurrentUser && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black"></div>
                              )}
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white">
                                  {trader.username}
                                  {isCurrentUser && <span className="text-emerald-400 text-sm ml-1">(You)</span>}
                                </h3>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1">
                                {rank.icon}
                                <span className={`text-sm font-medium ${rank.textColor}`}>
                                  {rank.name}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-4 mb-2">
                              <div className="text-center">
                                <p className="text-xs text-gray-400">Win Rate</p>
                                <p className="text-lg font-bold text-emerald-400">{trader.winRate}%</p>
                              </div>
                              
                              <div className="text-center">
                                <p className="text-xs text-gray-400">Profit Factor</p>
                                <p className="text-lg font-bold text-blue-400">{trader.profitFactor}</p>
                              </div>
                              
                              <div className="text-center">
                                <p className="text-xs text-gray-400">Score</p>
                                <p className="text-2xl font-bold text-white">{trader.score}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{trader.totalTrades} trades</span>
                              <span>•</span>
                              <span>R:R {trader.avgRR}</span>
                              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>

                        {/* Performance indicator bar */}
                        <div className="mt-3 w-full bg-gray-700/30 rounded-full h-1">
                          <motion.div 
                            className={`h-1 rounded-full bg-gradient-to-r ${rank.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(trader.score / 100) * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TradingLeaderboard;
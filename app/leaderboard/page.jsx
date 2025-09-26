
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
  Activity,
  Users,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Search,
  Zap
} from 'lucide-react';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/nextjs';
import MonthlyWrapped from '../../components/MonthlyWrappedSimple';
import { useTrades } from '../../context/TradeContext';

// Icon mapping for streak ranks
const iconMap = {
  Trophy,
  Award,
  Star,
  Flame,
  Target,
  BarChart3,
  TrendingUp,
  Search,
  Zap,
  Calendar
};

// Helper function to get icon component
const getIconComponent = (iconName) => {
  return iconMap[iconName] || Calendar;
};

// League sub-levels configuration
const leagueSubLevels = {
  Obsidian: { levels: 3, icon: '💎', color: 'from-purple-900 to-black', textColor: 'text-purple-300' },
  Diamond: { levels: 3, icon: '🔷', color: 'from-blue-400 to-cyan-300', textColor: 'text-cyan-300' },
  Platinum: { levels: 3, icon: '🔶', color: 'from-gray-300 to-gray-500', textColor: 'text-gray-300' },
  Gold: { levels: 3, icon: '🥇', color: 'from-yellow-400 to-orange-400', textColor: 'text-yellow-300' },
  Silver: { levels: 3, icon: '🥈', color: 'from-gray-400 to-gray-600', textColor: 'text-gray-400' },
  Bronze: { levels: 3, icon: '🥉', color: 'from-orange-600 to-red-600', textColor: 'text-orange-400' },
};

// Daily streak ranks with proper icons and reasonable milestones
const dailyStreakRanks = [
  { name: 'Trader Elite', minDays: 100, icon: Trophy, theme: 'text-yellow-400', bgGradient: 'from-yellow-400 to-orange-500' },
  { name: 'Market Surgeon', minDays: 75, icon: Award, theme: 'text-purple-400', bgGradient: 'from-purple-400 to-pink-500' },
  { name: 'Edge Builder', minDays: 50, icon: Star, theme: 'text-blue-400', bgGradient: 'from-blue-400 to-cyan-500' },
  { name: 'Discipline Beast', minDays: 30, icon: Flame, theme: 'text-red-400', bgGradient: 'from-red-400 to-pink-500' },
  { name: 'Setup Sniper', minDays: 21, icon: Target, theme: 'text-orange-400', bgGradient: 'from-orange-400 to-red-500' },
  { name: 'R-Master', minDays: 14, icon: BarChart3, theme: 'text-green-400', bgGradient: 'from-green-400 to-emerald-500' },
  { name: 'Breakout Seeker', minDays: 10, icon: TrendingUp, theme: 'text-teal-400', bgGradient: 'from-teal-400 to-blue-500' },
  { name: 'Zone Scout', minDays: 7, icon: Eye, theme: 'text-cyan-400', bgGradient: 'from-cyan-400 to-teal-500' },
  { name: 'Wick Watcher', minDays: 3, icon: Activity, theme: 'text-gray-400', bgGradient: 'from-gray-400 to-gray-600' },
  { name: 'Chart Rookie', minDays: 0, icon: Calendar, theme: 'text-gray-500', bgGradient: 'from-gray-500 to-gray-700' },
];

// Default user performance data
const defaultUserData = {
  winRate: 0,
  consistency: 0,
  riskManagement: 0,
  totalTrades: 0,
  profitFactor: 0,
  monthlyPnl: 0,
  currentStreak: 0,
  compositeScore: 0,
  winRateChange: 0,
  consistencyChange: 0,
  profitFactorChange: 0,
  tradesChange: 0
};

const getRank = (score) => {
  const leagues = [
    { name: 'Obsidian', minScore: 95 },
    { name: 'Diamond', minScore: 85 },
    { name: 'Platinum', minScore: 75 },
    { name: 'Gold', minScore: 65 },
    { name: 'Silver', minScore: 45 },
    { name: 'Bronze', minScore: 0 }
  ];

  const league = leagues.find(l => score >= l.minScore) || leagues[leagues.length - 1];
  const leagueInfo = leagueSubLevels[league.name];

  return {
    name: league.name,
    subLevel: 1,
    progress: 0,
    color: leagueInfo.color,
    textColor: leagueInfo.textColor,
    icon: <span className="text-2xl">{leagueInfo.icon}</span>
  };
};

const getStreakRank = (dayStreak) => {
  return dailyStreakRanks.find(rank => dayStreak >= rank.minDays) || dailyStreakRanks[dailyStreakRanks.length - 1];
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
      {change !== undefined && change !== null && (
        <span className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="text-lg font-bold text-white">{value}</p>
  </motion.div>
);

// Date utility functions
const isFirstOfMonth = () => {
  const today = new Date();
  return today.getDate() === 1;
};

const hasMonthlyWrappedBeenShown = () => {
  const today = new Date();
  const monthKey = `monthlyWrapped_${today.getFullYear()}_${today.getMonth()}`;
  return localStorage.getItem(monthKey) === 'shown';
};

const markMonthlyWrappedAsShown = () => {
  const today = new Date();
  const monthKey = `monthlyWrapped_${today.getFullYear()}_${today.getMonth()}`;
  localStorage.setItem(monthKey, 'shown');
};

const TradingLeaderboard = () => {
  const [showStreakDetails, setShowStreakDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(defaultUserData);
  const [error, setError] = useState(null);
  const [showMonthlyWrapped, setShowMonthlyWrapped] = useState(false);
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { trades, fetchTrades } = useTrades();

  // Separate streak update effect - runs once when component mounts and user is loaded
  useEffect(() => {
    const updateStreak = async () => {
      if (user && isLoaded) {
        try {
          const token = await getToken();
          await axios.post('/api/streak', {
            username: user.fullName || user.username || 'Anonymous',
            imageUrl: user.imageUrl || '',
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (error) {
          console.error('Failed to update streak:', error);
          // Don't show error to user for streak update failures
        }
      }
    };

    if (isLoaded) {
      updateStreak();
    }
  }, [isLoaded, user]);

  // Auto-show Monthly Wrapped effect
  useEffect(() => {
    if (isLoaded && user && isFirstOfMonth() && !hasMonthlyWrappedBeenShown()) {
      // Fetch trades first, then show Monthly Wrapped
      fetchTrades().then(() => {
        setShowMonthlyWrapped(true);
      });
    }
  }, [isLoaded, user, fetchTrades]);

  // Data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch leaderboard data (public endpoint - no auth required)
        const leaderboardPromise = axios.get('/api/leaderboard')
          .then(response => response.data.users || [])
          .catch(err => {
            console.error('Error fetching leaderboard:', err);
            return []; // Return empty array on error
          });

        // Fetch current user performance data if user is authenticated
        let performancePromise = Promise.resolve(defaultUserData);
        if (user) {
          try {
            const token = await getToken();
            performancePromise = axios.get('/api/user/performance', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
              .then(response => ({
                ...defaultUserData,
                ...response.data
              }))
              .catch(err => {
                console.error('Error fetching user performance:', err);
                return defaultUserData;
              });
          } catch (tokenError) {
            console.error('Error getting auth token:', tokenError);
            performancePromise = Promise.resolve(defaultUserData);
          }
        }

        const [leaderboardUsers, performanceData] = await Promise.all([
          leaderboardPromise,
          performancePromise
        ]);


        setLeaderboardData(leaderboardUsers);
        setCurrentUserData(performanceData);

      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isLoaded]);

  const currentUserRank = getRank(currentUserData?.compositeScore || 0);
  const currentStreakRank = getStreakRank(currentUserData?.currentStreak || 0);

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent pb-2">
              Trading Leaderboard
            </h1>
            <p className="text-gray-400 text-lg">
              {user ? `Welcome back, ${user.fullName || user.username}!` : 'Sign in to track your performance and compete with other traders.'}
            </p>
            
            {/* Monthly Wrapped Button - Only show on 1st of month */}
            {isFirstOfMonth() && user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative"
              >
                <motion.button
                  onClick={() => {
                    fetchTrades().then(() => {
                      setShowMonthlyWrapped(true);
                    });
                  }}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Calendar className="w-5 h-5" />
                  <span>🎉 Monthly Wrapped</span>
                  <Star className="w-5 h-5 animate-pulse" />
                </motion.button>
                
                {/* New indicator badge */}
                {!hasMonthlyWrappedBeenShown() && (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 1, 0.8] 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
                  />
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-center"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

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
                      <p className="text-2xl font-bold text-emerald-400">
                        {currentUserData?.currentStreak || 0}
                      </p>
                    </div>
                  </motion.div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <currentStreakRank.icon className="w-6 h-6" />
                  <span className={`font-semibold ${currentStreakRank.theme}`}>
                    {currentStreakRank.name}
                  </span>
                </div>

                <p className="text-xs text-gray-400">
                  Daily trading streak
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
                    {(currentUserData?.currentStreak || 0) < 200 && (
                      <div className="mb-4">
                        {(() => {
                          const nextRank = dailyStreakRanks.find(rank => rank.minDays > (currentUserData?.currentStreak || 0));
                          if (!nextRank) return null;
                          const progress = ((currentUserData?.currentStreak || 0) / nextRank.minDays) * 100;

                          return (
                            <>
                              <div className="flex justify-between text-xs text-gray-400 mb-2">
                                <span>Next: {nextRank.name}</span>
                                <span>{nextRank.minDays - (currentUserData?.currentStreak || 0)} days to go</span>
                              </div>
                              <div className="w-full bg-gray-700/50 rounded-full h-2">
                                <motion.div
                                  className="h-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, progress)}%` }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 space-y-1">
                      <p>• Daily streak counts consecutive trading days</p>
                      <p>• Complete all journal fields to maintain streak</p>
                      <p>• Weekends don't break your streak</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Personal Stats Cards */}
            {user && (
              <div className="mt-6 space-y-3">
                <StatCard
                  icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
                  label="Win Rate"
                  value={`${currentUserData?.winRate || 0}%`}
                  change={currentUserData?.winRateChange}
                  isPositive={(currentUserData?.winRateChange || 0) >= 0}
                />
                <StatCard
                  icon={<Target className="w-4 h-4 text-blue-400" />}
                  label="Consistency"
                  value={`${currentUserData?.consistency || 0}%`}
                  change={currentUserData?.consistencyChange}
                  isPositive={(currentUserData?.consistencyChange || 0) >= 0}
                />
                <StatCard
                  icon={<BarChart3 className="w-4 h-4 text-purple-400" />}
                  label="Profit Factor"
                  value={currentUserData?.profitFactor || 0}
                  change={currentUserData?.profitFactorChange}
                  isPositive={(currentUserData?.profitFactorChange || 0) >= 0}
                />
                <StatCard
                  icon={<Activity className="w-4 h-4 text-orange-400" />}
                  label="Total Trades"
                  value={currentUserData?.totalTrades || 0}
                  change={currentUserData?.tradesChange}
                  isPositive={(currentUserData?.tradesChange || 0) >= 0}
                />
              </div>
            )}
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
              ) : leaderboardData.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No traders found. Start trading to appear on the leaderboard!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboardData.map((trader, index) => {
                    const rank = getRank(trader.compositeScore || 0);
                    const isCurrentUser = user && trader.userId === user.id;
                    const isTopThree = index < 3;

                    return (
                      <motion.div
                        key={trader.userId || index}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`relative group cursor-pointer ${isCurrentUser
                            ? 'bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 border-2 border-emerald-500/50'
                            : 'bg-black/30 hover:bg-black/40 border border-white/10 hover:border-white/20'
                          } backdrop-blur-lg rounded-xl p-4 transition-all duration-300 overflow-hidden`}
                        whileHover={{ scale: 1.01, y: -2 }}
                      >
                        {/* Rank badge */}
                        <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isTopThree
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
                                src={trader.imageUrl || '/default-avatar.png'}
                                alt={trader.username || 'Anonymous'}
                                className="w-12 h-12 rounded-full border-2 border-gray-600"
                                onError={(e) => {
                                  e.target.src = '/default-avatar.png';
                                }}
                              />
                              {isCurrentUser && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black"></div>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white">
                                  {trader.username || 'Anonymous'}
                                  {isCurrentUser && <span className="text-emerald-400 text-sm ml-1">(You)</span>}
                                </h3>
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                {rank.icon}
                                <span className={`text-sm font-medium ${rank.textColor}`}>
                                  {trader.league || rank.name} {trader.leagueSubLevel ? `L${trader.leagueSubLevel}` : ''}
                                </span>
                              </div>
                              {trader.dailyStreakRank && (() => {
                                const IconComponent = getIconComponent(trader.dailyStreakRank.icon);
                                return (
                                  <div className="flex items-center gap-1 mt-1">
                                    <IconComponent className="w-3 h-3" />
                                    <span className={`text-xs ${trader.dailyStreakRank.theme}`}>
                                      {trader.dailyStreakRank.name}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-4 mb-2">
                              <div className="text-center">
                                <p className="text-xs text-gray-400">Win Rate</p>
                                <p className="text-lg font-bold text-emerald-400">{trader.winRate || 0}%</p>
                              </div>

                              <div className="text-center">
                                <p className="text-xs text-gray-400">Profit Factor</p>
                                <p className="text-lg font-bold text-blue-400">{trader.profitFactor || 0}</p>
                              </div>

                              <div className="text-center">
                                <p className="text-xs text-gray-400">Score</p>
                                <p className="text-2xl font-bold text-white">{Math.round(trader.compositeScore || 0)}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{trader.totalTrades || 0} trades</span>
                              <span>•</span>
                              <span>{trader.weeklyActive ? 'Active' : 'Inactive'}</span>
                              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>

                        {/* Performance indicator bar */}
                        <div className="mt-3 w-full bg-gray-700/30 rounded-full h-1">
                          <motion.div
                            className={`h-1 rounded-full bg-gradient-to-r ${rank.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (trader.compositeScore / 100) * 100)}%` }}
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
      
      {/* Monthly Wrapped Modal */}
      {showMonthlyWrapped && (
        <MonthlyWrapped
          trades={trades}
          currentStreak={currentUserData?.currentStreak || 0}
          isModal={true}
          onClose={() => {
            setShowMonthlyWrapped(false);
            markMonthlyWrappedAsShown();
          }}
        />
      )}
    </div>
  );
};

export default TradingLeaderboard;
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Flame, Star, Award } from 'lucide-react';

// --- Mock Streak Updater Component ---
// In a real application, this would handle API calls. Here, it does nothing.
const StreakUpdater = () => {
  useEffect(() => {
    // console.log("StreakUpdater mounted: In a real app, this would ping the backend.");
  }, []);
  return null;
};

// --- Rank Data based on your image ---
const ranks = [
    { name: 'Trader Elite', minStreak: 100, icon: <Crown className="w-5 h-5 text-yellow-400" />, theme: 'text-yellow-400' },
    { name: 'Market Surgeon', minStreak: 75, icon: <Award className="w-5 h-5 text-purple-400" />, theme: 'text-purple-400' },
    { name: 'Edge Builder', minStreak: 50, icon: <Star className="w-5 h-5 text-blue-400" />, theme: 'text-blue-400' },
    { name: 'Discipline Beast', minStreak: 30, icon: <Flame className="w-5 h-5 text-red-400" />, theme: 'text-red-400' },
    { name: 'Setup Sniper', minStreak: 20, icon: <Flame className="w-5 h-5 text-orange-400" />, theme: 'text-orange-400' },
    { name: 'R-Master', minStreak: 15, icon: <Flame className="w-5 h-5 text-green-400" />, theme: 'text-green-400' },
    { name: 'Breakout Seeker', minStreak: 10, icon: <Flame className="w-5 h-5 text-teal-400" />, theme: 'text-teal-400' },
    { name: 'Zone Scout', minStreak: 5, icon: <Flame className="w-5 h-5 text-cyan-400" />, theme: 'text-cyan-400' },
    { name: 'Wick Watcher', minStreak: 2, icon: <Flame className="w-5 h-5 text-gray-400" />, theme: 'text-gray-400' },
    { name: 'Chart Rookie', minStreak: 0, icon: <Flame className="w-5 h-5 text-gray-500" />, theme: 'text-gray-500' },
];

const getRank = (streak) => {
    return ranks.find(rank => streak >= rank.minStreak) || ranks[ranks.length - 1];
};

// --- Mock Data ---
const mockLeaderboardData = [
    { userId: 'user_1', username: 'CryptoKing', imageUrl: 'https://framerusercontent.com/images/ETgoVdeITLLIYCHTFNeVuZDMyQY.png', currentStreak: 124, highestStreak: 150 },
    { userId: 'user_2', username: 'ForexQueen', imageUrl: 'https://framerusercontent.com/images/QmmaDSjXyuZNNDsZdt23lDVXI.png', currentStreak: 88, highestStreak: 95 },
    { userId: 'user_3', username: 'StockWizard', imageUrl: 'https://framerusercontent.com/images/7qBFv2WmuOwj4qUFS7XUzQSFL4.jpg', currentStreak: 62, highestStreak: 70 },
    { userId: 'user_4', username: 'DayTraderPro', imageUrl: 'https://framerusercontent.com/images/0zuVQ2JmvxEtdnpdOq5FtRJxmNY.png', currentStreak: 45, highestStreak: 55 },
    { userId: 'user_5', username: 'ScalperSam', imageUrl: 'https://framerusercontent.com/images/Z9Z59ZjzMfqaMdHGgXmijuQ8hAw.jpg', currentStreak: 28, highestStreak: 32 },
    { userId: 'user_6', username: 'PipsCatcher', imageUrl: 'https://framerusercontent.com/images/bnJJiW5Vfixlrz7M2pzoeyHBU.png', currentStreak: 18, highestStreak: 25 },
    { userId: 'user_7', username: 'ChartMaster', imageUrl: 'https://framerusercontent.com/images/rlizSNVuxrrqd6I5hGaSxwqn0Os.png', currentStreak: 12, highestStreak: 15 },
    { userId: 'user_8', username: 'NewbieTrader', imageUrl: 'https://framerusercontent.com/images/X0pqhTmlK8gdYqPbljhuLXlyd0I.png', currentStreak: 7, highestStreak: 10 },
    { userId: 'user_9', username: 'CandleCounter', imageUrl: 'https://img.clerk.com/preview.png', currentStreak: 3, highestStreak: 5 },
    { userId: 'user_10', username: 'JustStarting', imageUrl: 'https://framerusercontent.com/images/7qBFv2WmuOwj4qUFS7XUzQSFL4.jpg', currentStreak: 1, highestStreak: 2 },
];

// Mock data for the current user
const mockCurrentUser = {
    username: 'You',
    imageUrl: 'https://img.clerk.com/preview.png',
    currentStreak: 16,
    highestStreak: 22,
};

// --- New Enhanced Background Component ---
const EnhancedLightBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 12 }).map(() => ({
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
        opacity: [0.3, 0.8, 0.2, 0.6, 0.3],
        scale: [0.5, 1.2, 0.8, 1, 0.5],
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 5
      }));
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden z-0 bg-black">
      {/* Primary animated light orb */}
      <p className='p-10'>currently running on mockdata</p>
      <motion.div
        className="absolute w-96 h-96 bg-gradient-radial from-blue-500/40 via-blue-600/20 to-transparent rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.2) 40%, transparent 70%)',
        }}
        animate={{
          x: [-200, 200, -100, 150, -200],
          y: [-150, 100, -200, 50, -150],
          scale: [1, 1.3, 0.8, 1.1, 1],
          rotate: [0, 180, 360, 540, 720],
        }}
        transition={{
          duration: 25,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop"
        }}
        initial={{ x: -200, y: -150 }}
      />
      {/* Secondary animated light orb */}
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.35) 0%, rgba(126, 34, 206, 0.18) 45%, transparent 75%)',
        }}
        animate={{
          x: [300, -150, 250, -200, 300],
          y: [200, -100, 150, -50, 200],
          scale: [0.8, 1.2, 1, 1.4, 0.8],
          rotate: [0, -180, -360, -540, -720],
        }}
        transition={{
          duration: 30,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
          delay: 1
        }}
        initial={{ x: 300, y: 200 }}
      />
      {/* Tertiary smaller light orb */}
      <motion.div
        className="absolute w-60 h-60 rounded-full blur-2xl"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.15) 50%, transparent 80%)',
        }}
        animate={{
          x: [100, -250, 200, -150, 100],
          y: [-250, 150, -100, 200, -250],
          scale: [1, 0.7, 1.3, 0.9, 1],
          rotate: [0, 270, 540, 810, 1080],
        }}
        transition={{
          duration: 20,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
          delay: 2
        }}
        initial={{ x: 100, y: -250 }}
      />
      {/* Ambient floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400/30 rounded-full blur-sm"
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
      {/* Pulsing central glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.08) 40%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 0.9, 1.1, 1],
          opacity: [0.3, 0.6, 0.2, 0.5, 0.3],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 18,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop"
        }}
      />
      {/* Gradient overlay for depth */}
      <div
         className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(147, 51, 234, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 20% 70%, rgba(16, 185, 129, 0.06) 0%, transparent 50%)
          `,
        }}
      />
      {/* Animated light streaks */}
      <motion.div
        className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"
        animate={{
          scaleX: [0, 1, 0, 1, 0],
          opacity: [0, 0.8, 0, 0.6, 0],
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        }}
        style={{ transformOrigin: 'left' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-purple-400/50 to-transparent"
        animate={{
          scaleX: [0, 1, 0, 1, 0],
          opacity: [0, 0.8, 0, 0.6, 0],
        }}
        transition={{
          duration: 12,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
          delay: 2
        }}
        style={{ transformOrigin: 'right' }}
      />
      <motion.div
        className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent"
        animate={{
          scaleY: [0, 1, 0, 1, 0],
          opacity: [0, 0.8, 0, 0.6, 0],
        }}
        transition={{
          duration: 10,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
          delay: 4
        }}
        style={{ transformOrigin: 'top' }}
      />
    </div>
  );
};


// --- Main Leaderboard Page Component ---
const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data
        const timer = setTimeout(() => {
            setLeaderboard(mockLeaderboardData);
            setLoading(false);
        }, 1500); // Simulate network delay
        return () => clearTimeout(timer);
    }, []);

    const currentUserRank = getRank(mockCurrentUser.currentStreak);

    return (
        <>
            <StreakUpdater />
            <div className="min-h-screen w-full bg-black text-white relative font-sans overflow-hidden">
                <EnhancedLightBackground />

                <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent py-1">
                            Journaling Leaderboard
                        </h1>
                        <p className="text-gray-400 mt-2">Maintain your daily journaling streak to climb the ranks!</p>
                    </motion.div>

                    {/* Your Streak Card Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-black/20 backdrop-blur-lg border-2 border-blue-500/50 rounded-2xl p-6 mb-8 shadow-2xl shadow-blue-500/20"
                    >
                        <div className="flex items-center gap-4">
                             <img src={mockCurrentUser.imageUrl} alt={mockCurrentUser.username} className="w-16 h-16 rounded-full border-2 border-gray-700" />
                             <div className="flex-grow">
                                <p className="text-xl font-bold text-white">Your Streak</p>
                                <div className="flex items-center gap-2 text-sm">
                                    {currentUserRank.icon}
                                    <span className={currentUserRank.theme}>{currentUserRank.name}</span>
                                </div>
                             </div>
                             <div className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                    <p className="text-2xl font-bold text-orange-400">{mockCurrentUser.currentStreak}</p>
                                    <Flame className="w-6 h-6 text-orange-400" />
                                </div>
                                <p className="text-xs text-gray-400">Highest: {mockCurrentUser.highestStreak}</p>
                            </div>
                        </div>
                    </motion.div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-400">Loading Ranks...</p>
                        </div>
                    ) : (
                        <motion.div 
                            className="space-y-4"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.05 } }
                            }}
                        >
                            {leaderboard.map((user, index) => {
                                const rank = getRank(user.currentStreak);
                                const isTopThree = index < 3;
                                return (
                                    <motion.div
                                        key={user.userId}
                                        className={`relative bg-black/20 backdrop-blur-lg p-4 flex items-center gap-4 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden
                                            ${isTopThree ? 'border-2' : 'border border-white/10'}
                                            ${index === 0 ? 'border-yellow-400/50' : ''}
                                            ${index === 1 ? 'border-gray-400/50' : ''}
                                            ${index === 2 ? 'border-orange-400/50' : ''}
                                        `}
                                        variants={{
                                            hidden: { opacity: 0, x: -50 },
                                            visible: { opacity: 1, x: 0 }
                                        }}
                                        whileHover={{ scale: 1.02, boxShadow: '0px 10px 30px rgba(0,0,0,0.3)' }}
                                    >
                                        {isTopThree && (
                                            <div className={`absolute top-0 right-0 h-full w-24 bg-gradient-to-l ${index === 0 ? 'from-yellow-500/20' : index === 1 ? 'from-gray-500/20' : 'from-orange-500/20'} to-transparent`}></div>
                                        )}
                                        <div className="text-2xl font-bold text-gray-500 w-10 text-center">{index + 1}</div>
                                        <img src={user.imageUrl} alt={user.username} className="w-12 h-12 rounded-full border-2 border-gray-700" />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-white">{user.username}</p>
                                            <div className="flex items-center gap-2 text-sm">
                                                {rank.icon}
                                                <span className={rank.theme}>{rank.name}</span>
                                            </div>
                                        </div>
                                        <div className="text-right z-10">
                                            <div className="flex items-center gap-2 justify-end">
                                                <p className="text-xl font-bold text-orange-400">{user.currentStreak}</p>
                                                <Flame className="w-5 h-5 text-orange-400" />
                                            </div>
                                            <p className="text-xs text-gray-400">Highest: {user.highestStreak}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
};

export default LeaderboardPage;

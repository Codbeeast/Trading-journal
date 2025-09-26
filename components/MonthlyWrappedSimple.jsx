import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Calendar,
  Star,
  Award,
  Flame,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  X
} from 'lucide-react';

const MonthlyWrapped = ({ 
  trades = [], 
  currentStreak = 0, 
  onClose = null,
  isModal = false 
}) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Calculate monthly data from real trades
  const calculateMonthlyData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter trades for current month
    const monthlyTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.entryDate || trade.createdAt);
      return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear;
    });

    const totalTrades = monthlyTrades.length;
    const winningTrades = monthlyTrades.filter(trade => (trade.pnl || 0) > 0);
    const winRate = totalTrades > 0 ? Math.round((winningTrades.length / totalTrades) * 100) : 0;
    
    const totalPnl = monthlyTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalWinAmount = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const losingTrades = monthlyTrades.filter(trade => (trade.pnl || 0) < 0);
    const totalLossAmount = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
    const profitFactor = totalLossAmount > 0 ? (totalWinAmount / totalLossAmount).toFixed(1) : totalWinAmount > 0 ? 999 : 0;
    
    const biggestWin = Math.max(...monthlyTrades.map(trade => trade.pnl || 0), 0);
    const averageRisk = monthlyTrades.length > 0 
      ? (monthlyTrades.reduce((sum, trade) => sum + (trade.riskPercentage || 1), 0) / monthlyTrades.length).toFixed(1)
      : 1.0;
    
    // Calculate trading days (unique dates)
    const tradingDates = [...new Set(monthlyTrades.map(trade => {
      const date = new Date(trade.entryDate || trade.createdAt);
      return date.toDateString();
    }))];
    
    // Find most common strategy, pair, session
    const strategies = monthlyTrades.map(trade => trade.strategy).filter(Boolean);
    const pairs = monthlyTrades.map(trade => trade.pair).filter(Boolean);
    const sessions = monthlyTrades.map(trade => trade.session).filter(Boolean);
    
    const getMostCommon = (arr) => {
      if (arr.length === 0) return 'N/A';
      const frequency = {};
      arr.forEach(item => frequency[item] = (frequency[item] || 0) + 1);
      return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
    };
    
    return {
      month: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalTrades,
      winRate,
      profitFactor: parseFloat(profitFactor),
      bestStreak: currentStreak,
      monthlyPnl: Math.round(totalPnl),
      consistency: Math.min(100, Math.round((winRate + (profitFactor * 10)) / 2)),
      riskManagement: Math.min(100, Math.round(100 - (averageRisk * 10))),
      topStrategy: getMostCommon(strategies),
      mostTradedPair: getMostCommon(pairs),
      bestSession: getMostCommon(sessions),
      topConfluence: 'Technical Analysis',
      emotionalControl: Math.min(100, Math.round(winRate * 1.2)),
      biggestWin: Math.round(biggestWin),
      averageRisk: parseFloat(averageRisk),
      tradingDays: tradingDates.length
    };
  };

  const monthlyData = calculateMonthlyData();

  const wrappedCards = [
    {
      id: 1,
      title: "Your Trading Journey",
      subtitle: monthlyData.month,
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            {monthlyData.totalTrades}
          </div>
          <p className="text-xl text-gray-300">trades executed</p>
          <div className="flex justify-center space-x-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{monthlyData.tradingDays}</div>
              <p className="text-sm text-gray-400">trading days</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{monthlyData.tradingDays > 0 ? (monthlyData.totalTrades / monthlyData.tradingDays).toFixed(1) : 0}</div>
              <p className="text-sm text-gray-400">avg trades/day</p>
            </div>
          </div>
        </div>
      ),
      icon: Calendar,
      gradient: "from-purple-900/40 to-blue-900/40"
    },
    {
      id: 2,
      title: "Profit Performance",
      subtitle: "Your financial snapshot",
      content: (
        <div className="text-center space-y-4">
          <div className="text-5xl font-bold text-green-400">
            ${monthlyData.monthlyPnl.toLocaleString()}
          </div>
          <p className="text-lg text-gray-300">monthly P&L</p>
          <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Biggest Win</span>
              <span className="text-green-400 font-bold">${monthlyData.biggestWin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Win Rate</span>
              <span className="text-blue-400 font-bold">{monthlyData.winRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Profit Factor</span>
              <span className="text-purple-400 font-bold">{monthlyData.profitFactor}</span>
            </div>
          </div>
        </div>
      ),
      icon: TrendingUp,
      gradient: "from-green-900/40 to-emerald-800/40"
    },
    {
      id: 3,
      title: "Streak Master",
      subtitle: "Your consistency game",
      content: (
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="text-6xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              {monthlyData.bestStreak}
            </div>
            <div className="absolute -top-2 -right-2">
              <Flame className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <p className="text-xl text-gray-300">day streak</p>
          <div className="flex justify-center space-x-1">
            {[...Array(Math.min(monthlyData.bestStreak, 10))].map((_, i) => (
              <div key={i} className="w-3 h-8 bg-gradient-to-t from-orange-600 to-orange-400 rounded-full" />
            ))}
          </div>
          <p className="text-sm text-gray-400">
            {monthlyData.bestStreak > 10 ? `+${monthlyData.bestStreak - 10} more` : "streak visualization"}
          </p>
        </div>
      ),
      icon: Flame,
      gradient: "from-orange-900/40 to-red-900/40"
    }
  ];

  // Auto-advance cards
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentCard(current => (current + 1) % wrappedCards.length);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, wrappedCards.length]);

  const nextCard = () => {
    setCurrentCard((current) => (current + 1) % wrappedCards.length);
    setProgress(0);
  };

  const prevCard = () => {
    setCurrentCard((current) => (current - 1 + wrappedCards.length) % wrappedCards.length);
    setProgress(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const currentCardData = wrappedCards[currentCard];

  const containerClasses = isModal 
    ? "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100000] p-4"
    : "min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4";
    
  const contentClasses = isModal 
    ? "max-w-md w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-4"
    : "max-w-md mx-auto";

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {/* Close Button for Modal */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-gray-700/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
            Trading Wrapped
          </h1>
          <p className="text-gray-400">Your {monthlyData.month} Story</p>
        </div>

        {/* Progress Indicators */}
        <div className="flex space-x-1 mb-6">
          {wrappedCards.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 transition-all duration-100"
                style={{ 
                  width: index === currentCard ? `${progress}%` : index < currentCard ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="relative">
          <div className={`backdrop-blur-xl bg-gradient-to-br ${currentCardData.gradient} rounded-3xl p-8 border border-gray-700/50 shadow-2xl min-h-[400px] flex flex-col justify-center`}>
            {/* Card Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-2xl mb-4">
                <currentCardData.icon className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{currentCardData.title}</h2>
              <p className="text-gray-300">{currentCardData.subtitle}</p>
            </div>

            {/* Card Content */}
            <div className="flex-1 flex items-center justify-center">
              {currentCardData.content}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevCard}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-gray-700/80 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextCard}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-gray-700/80 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 mt-8">
          <button
            onClick={togglePlayPause}
            className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
        </div>

        {/* Card Counter */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            {currentCard + 1} of {wrappedCards.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyWrapped;

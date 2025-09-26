// This file has been replaced by MonthlyWrappedSimple.jsx
// Please use MonthlyWrappedSimple.jsx instead
export { default } from './MonthlyWrappedSimple';

    const totalLossAmount = Math.abs(closingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
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
{{ ... }}
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
{{ ... }}
      id: 1,
      title: "Your Trading Journey",
      subtitle: monthlyData.month,
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            {monthlyData.totalTrades}
            <p className="text-sm text-gray-400">trading days: {monthlyData.tradingDays}</p>
          </div>
          <p className="text-xl text-gray-300">trades executed</p>
          <div className="flex justify-center space-x-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{monthlyData.tradingDays}</div>
              <p className="text-sm text-gray-400">trading days</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{(monthlyData.totalTrades / monthlyData.tradingDays).toFixed(1)}</div>
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
          <p className="text-xl text-gray-300">consecutive wins</p>
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
    },
    {
      id: 4,
      title: "Strategy Champion",
      subtitle: "Your go-to setup",
      content: (
        <div className="text-center space-y-6">
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-blue-400 mb-2">{monthlyData.topStrategy}</h3>
            <p className="text-gray-300">Your most successful strategy</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/30 rounded-xl p-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Top Pair</p>
              <p className="text-lg font-bold text-gray-200">{monthlyData.mostTradedPair}</p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Best Session</p>
              <p className="text-lg font-bold text-gray-200">{monthlyData.bestSession}</p>
            </div>
          </div>
        </div>
      ),
      icon: Target,
      gradient: "from-blue-900/40 to-cyan-900/40"
    },
    {
      id: 5,
      title: "Risk Management",
      subtitle: "Your discipline score",
      content: (
        <div className="text-center space-y-6">
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - monthlyData.riskManagement / 100)}`}
                className="text-blue-400 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{monthlyData.riskManagement}%</div>
                <div className="text-xs text-gray-400">Risk Score</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Average Risk</span>
              <span className="text-green-400">{monthlyData.averageRisk}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Consistency</span>
              <span className="text-purple-400">{monthlyData.consistency}%</span>
            </div>
          </div>
        </div>
      ),
      icon: BarChart3,
      gradient: "from-indigo-900/40 to-purple-900/40"
    },
    {
      id: 6,
      title: "Year-End Achievement",
      subtitle: "Your trading badge",
      content: (
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-8">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Discipline Master
          </h3>
          <p className="text-gray-300">
            Maintained excellent risk management with {monthlyData.riskManagement}% discipline score
          </p>
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl p-4 border border-yellow-400/30">
            <p className="text-sm text-yellow-200">
              You're in the top 15% of disciplined traders this month!
            </p>
          </div>
        </div>
      ),
      icon: Award,
      gradient: "from-yellow-900/40 to-orange-900/40"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-md mx-auto">
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
          <div className={`backdrop-blur-xl bg-gradient-to-br ${currentCardData.gradient} rounded-3xl p-8 border border-gray-700/50 shadow-2xl min-h-[500px] flex flex-col justify-center`}>
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

        {/* Share Button */}
        <div className="text-center mt-8">
          <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 shadow-lg">
            Share Your Wrapped 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyWrapped;
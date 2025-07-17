"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import Calender from '@/components/Calender'
import Slidebar from '@/components/Slidebar'
import MonthlyProfitChart from '@/components/MonthlyProfitChart'
import QuaterlyTables from '@/components/QuaterlyTables'
import SessionAnalysis from '@/components/SessionAnalysis'

const TradingDashboard = () => {
  const [animationKey, setAnimationKey] = useState(0);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    const [particles, setParticles] = useState([]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Calculate statistics from real data
  const calculateStats = () => {
    if (!trades.length) return null;

    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => (trade.pnl || 0) > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const totalPips = trades.reduce((sum, trade) => sum + (trade.pipsLostCaught || 0), 0);

    return {
      totalPnL,
      totalTrades,
      winRate,
      totalPips,
      winningTrades
    };
  };

  const stats = calculateStats();

  // Generate stats cards with real data
  const statsCards = stats ? [
    { 
      label: 'P/L', 
      value: `$${stats.totalPnL.toFixed(2)}`, 
      change: `${stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}`, 
      icon: stats.totalPnL >= 0 ? TrendingUp : TrendingDown, 
      color: 'from-emerald-500 to-green-400', 
      positive: stats.totalPnL >= 0 
    },
    { 
      label: 'Total Trades', 
      value: stats.totalTrades.toString(), 
      change: `+${stats.totalTrades}`, 
      icon: Activity, 
      color: 'from-blue-500 to-cyan-400', 
      positive: true 
    },
    { 
      label: 'Win Rate', 
      value: `${stats.winRate.toFixed(1)}%`, 
      change: `${stats.winningTrades}/${stats.totalTrades}`, 
      icon: Target, 
      color: 'from-purple-500 to-pink-400', 
      positive: stats.winRate >= 50 
    },
    { 
      label: 'Total Pips', 
      value: stats.totalPips.toString(), 
      change: `${stats.totalPips >= 0 ? '+' : ''}${stats.totalPips}`, 
      icon: stats.totalPips >= 0 ? TrendingUp : TrendingDown, 
      color: 'from-orange-500 to-red-400', 
      positive: stats.totalPips >= 0 
    }
  ] : [];

  // Generate monthly performance data
  const generateMonthlyData = () => {
    if (!trades.length) return [];

    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months
    months.forEach((month, index) => {
      monthlyData[month] = { name: month, value: 0, pips: 0, count: 0 };
    });

    trades.forEach(trade => {
      if (trade.date) {
        const tradeDate = new Date(trade.date);
        const month = months[tradeDate.getMonth()];
        if (monthlyData[month]) {
          monthlyData[month].value += trade.pnl || 0;
          monthlyData[month].pips += trade.pipsLostCaught || 0;
          monthlyData[month].count += 1;
        }
      }
    });

    return Object.values(monthlyData);
  };

  // Generate win/loss pie chart data
  const generatePieData = () => {
    if (!trades.length) return [];

    const wins = trades.filter(trade => (trade.pnl || 0) > 0).length;
    const losses = trades.length - wins;
    const winPercentage = trades.length > 0 ? (wins / trades.length) * 100 : 0;
    const lossPercentage = 100 - winPercentage;
    return [
      { name: 'Wins', value: winPercentage, color: '#10B981' },
      { name: 'Losses', value: lossPercentage, color: '#EF4444' }
    ];
  };

  // State for time analysis view
  const [timeView, setTimeView] = useState('hours'); // 'hours' or 'days'

  // Generate best trading times data
  const generateBestTimesData = () => {
    if (!trades.length) return [];

    if (timeView === 'hours') {
      // Generate 6 time slots: 0-4, 4-8, 8-12, 12-16, 16-20, 20-24
      const timeSlots = {
        '0-4': { name: '0-4', value: 0, count: 0, wins: 0 },
        '4-8': { name: '4-8', value: 0, count: 0, wins: 0 },
        '8-12': { name: '8-12', value: 0, count: 0, wins: 0 },
        '12-16': { name: '12-16', value: 0, count: 0, wins: 0 },
        '16-20': { name: '16-20', value: 0, count: 0, wins: 0 },
        '20-24': { name: '20-24', value: 0, count: 0, wins: 0 }
      };

      trades.forEach(trade => {
        if (trade.time) {
          const time = trade.time;
          let hour = 0;
          
          // Extract hour from time string (assuming format like "14:30" or "2:30 PM")
          if (time.includes(':')) {
            const timeParts = time.split(':');
            hour = parseInt(timeParts[0]);
            
            // Handle 12-hour format
            if (time.toLowerCase().includes('pm') && hour !== 12) {
              hour += 12;
            } else if (time.toLowerCase().includes('am') && hour === 12) {
              hour = 0;
            }
          }

          // Determine time slot
          let slot = '';
          if (hour >= 0 && hour < 4) slot = '0-4';
          else if (hour >= 4 && hour < 8) slot = '4-8';
          else if (hour >= 8 && hour < 12) slot = '8-12';
          else if (hour >= 12 && hour < 16) slot = '12-16';
          else if (hour >= 16 && hour < 20) slot = '16-20';
          else if (hour >= 20 && hour < 24) slot = '20-24';

          if (slot && timeSlots[slot]) {
            timeSlots[slot].value += trade.pnl || 0;
            timeSlots[slot].count += 1;
            if ((trade.pnl || 0) > 0) {
              timeSlots[slot].wins += 1;
            }
          }
        }
      });

      return Object.values(timeSlots);
    } else {
      // Generate days data
      const daysData = {
        'Mon': { name: 'Mon', value: 0, count: 0, wins: 0 },
        'Tue': { name: 'Tue', value: 0, count: 0, wins: 0 },
        'Wed': { name: 'Wed', value: 0, count: 0, wins: 0 },
        'Thu': { name: 'Thu', value: 0, count: 0, wins: 0 },
        'Fri': { name: 'Fri', value: 0, count: 0, wins: 0 },
        'Sat': { name: 'Sat', value: 0, count: 0, wins: 0 },
        'Sun': { name: 'Sun', value: 0, count: 0, wins: 0 }
      };

      trades.forEach(trade => {
        if (trade.date) {
          const tradeDate = new Date(trade.date);
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayName = dayNames[tradeDate.getDay()];

          if (daysData[dayName]) {
            daysData[dayName].value += trade.pnl || 0;
            daysData[dayName].count += 1;
            if ((trade.pnl || 0) > 0) {
              daysData[dayName].wins += 1;
            }
          }
        }
      });

      return Object.values(daysData);
    }
  };

  // Generate confluence data
  const generateConfluenceData = () => {
    if (!trades.length) return [];

    const confluenceData = {};
    
    trades.forEach(trade => {
      if (trade.confluences) {
        const confluences = trade.confluences.split(',').map(c => c.trim());
        confluences.forEach(confluence => {
          if (!confluenceData[confluence]) {
            confluenceData[confluence] = { name: confluence, value: 0, wins: 0, losses: 0 };
          }
          confluenceData[confluence].value += 1;
          if ((trade.pnl || 0) > 0) {
            confluenceData[confluence].wins += 1;
          } else {
            confluenceData[confluence].losses += 1;
          }
        });
      }
    });

    return Object.values(confluenceData).slice(0, 6); // Top 6 confluences
  };

  // Generate setup type tags
  const generateSetupTags = () => {
    if (!trades.length) return [];

    const setupData = {};
    const setupColors = [
      'from-blue-600 to-blue-400',
      'from-red-600 to-red-400',
      'from-purple-600 to-purple-400',
      'from-indigo-600 to-indigo-400',
      'from-emerald-600 to-emerald-400',
      'from-orange-600 to-orange-400'
    ];


    trades.forEach(trade => {
      if (trade.setupType) {
        const setup = trade.setupType;
        if (!setupData[setup]) {
          setupData[setup] = { count: 0, wins: 0 };
        }
        setupData[setup].count += 1;
        if ((trade.pnl || 0) > 0) {
          setupData[setup].wins += 1;
        }
      }
    });

    return Object.entries(setupData)
      .slice(0, 6)
      .map(([setup, data], index) => ({
        label: setup.substring(0, 2).toUpperCase(),
        value: data.count.toString(),
        color: setupColors[index % setupColors.length]
      }));
  };

  /////////////////////////////////////////


// Generate monthly profit percentage data
const generateMonthlyProfitData = () => {
  if (!trades.length) return [];

  const monthlyData = {};
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  
  // Initialize all months
  months.forEach((month, index) => {
    monthlyData[month] = { 
      name: month, 
      profit: 0, 
      trades: 0,
      percentage: 0
    };
  });

  // Calculate monthly profits
  trades.forEach(trade => {
    if (trade.date) {
      const tradeDate = new Date(trade.date);
      const month = months[tradeDate.getMonth()];
      if (monthlyData[month]) {
        monthlyData[month].profit += trade.pnl || 0;
        monthlyData[month].trades += 1;
      }
    }
  });

  // Calculate percentages (assuming initial capital or use relative profit)
  const totalProfit = Object.values(monthlyData).reduce((sum, month) => sum + month.profit, 0);
  const avgProfit = totalProfit / 12;

  // Convert to percentage (you can adjust this calculation based on your capital)
  Object.values(monthlyData).forEach(month => {
    month.percentage = month.trades > 0 ? (month.profit / 1000) * 100 : 0; // Assuming $1000 base
  });
    return {
    monthlyData: Object.values(monthlyData),
    ytdAverage: avgProfit,
    year: currentYear
  };
};

// Generate quarterly data
const generateQuarterlyData = () => {
  if (!trades.length) return [];

  const quarters = {
    Q1: { name: 'Q1', months: ['Jan', 'Feb', 'Mar'], taken: 0, wins: 0, winRate: 0 },
    Q2: { name: 'Q2', months: ['Apr', 'May', 'Jun'], taken: 0, wins: 0, winRate: 0 },
    Q3: { name: 'Q3', months: ['Jul', 'Aug', 'Sep'], taken: 0, wins: 0, winRate: 0 },
    Q4: { name: 'Q4', months: ['Oct', 'Nov', 'Dec'], taken: 0, wins: 0, winRate: 0 }
  };

  trades.forEach(trade => {
    if (trade.date) {
      const tradeDate = new Date(trade.date);
      const month = tradeDate.getMonth();
      
      let quarter = '';
      if (month >= 0 && month <= 2) quarter = 'Q1';
      else if (month >= 3 && month <= 5) quarter = 'Q2';
      else if (month >= 6 && month <= 8) quarter = 'Q3';
      else if (month >= 9 && month <= 11) quarter = 'Q4';

      if (quarter && quarters[quarter]) {
        quarters[quarter].taken += 1;
        if ((trade.pnl || 0) > 0) {
          quarters[quarter].wins += 1;
        }
      }
    }
  });

  // Calculate win rates
  Object.values(quarters).forEach(quarter => {
    quarter.winRate = quarter.taken > 0 ? (quarter.wins / quarter.taken) * 100 : 0;
  });

  return Object.values(quarters);
};

// Generate session data
const generateSessionData = () => {
  if (!trades.length) return { winRateData: [], totalTradesData: [] };

  const sessions = {
    'Asian': { name: 'Asian', wins: 0, total: 0, winRate: 0 },
    'London': { name: 'London', wins: 0, total: 0, winRate: 0 },
    'New York': { name: 'New York', wins: 0, total: 0, winRate: 0 },
    'Overlap': { name: 'Overlap', wins: 0, total: 0, winRate: 0 }
  };
  

  trades.forEach(trade => {
    if (trade.time) {
      const time = trade.time;
      let hour = 0;
      
      // Extract hour from time string
      if (time.includes(':')) {
        const timeParts = time.split(':');
        hour = parseInt(timeParts[0]);
        
        // Handle 12-hour format
        if (time.toLowerCase().includes('pm') && hour !== 12) {
          hour += 12;
        } else if (time.toLowerCase().includes('am') && hour === 12) {
          hour = 0;
        }
      }

      // Determine session based on hour (GMT)
      let session = '';
      if (hour >= 0 && hour < 8) session = 'Asian';
      else if (hour >= 8 && hour < 16) session = 'London';
      else if (hour >= 16 && hour < 24) session = 'New York';
      
      // Check for overlap periods
      if ((hour >= 8 && hour < 12) || (hour >= 16 && hour < 20)) {
        session = 'Overlap';
      }

      if (session && sessions[session]) {
        sessions[session].total += 1;
        if ((trade.pnl || 0) > 0) {
          sessions[session].wins += 1;
        }
      }
    }
  });

  // Calculate win rates
  Object.values(sessions).forEach(session => {
    session.winRate = session.total > 0 ? (session.wins / session.total) * 100 : 0;
  });

  return {
    winRateData: Object.values(sessions),
    totalTradesData: Object.values(sessions)
  };
};



/////////////////////////

  const lineData = generateMonthlyData();
  const pieData = generatePieData();
  const bestTimesData = generateBestTimesData();
  const confluenceData = generateConfluenceData();
  const setupTags = generateSetupTags();
   const monthlyProfitData = generateMonthlyProfitData();
  const quarterlyData = generateQuarterlyData();
  const sessionData = generateSessionData();
 

 if (loading) {
  return (
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
        {/* Logo/Brand area */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              {/* Animated trading chart icon */}
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

        {/* Loading animation */}
        <div className="mb-8">
          <div className="relative">
            {/* Pulsing circles */}
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
            
            {/* Progress bar */}
            <div className="w-64 h-2 bg-gray-700/50 rounded-full mx-auto mb-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* Loading text with typewriter effect */}
        <div className="space-y-2">
          <p className="text-xl text-white font-medium">
            Loading trading data
            <span className="animate-pulse">...</span>
          </p>
         </div>
      </div>

      {/* Custom CSS animations */}
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
}

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1623] via-[#102030] to-[#12263a] p-6 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

const getCellColor = (percentage) => {
    if (percentage > 0) {
      return 'bg-emerald-600 text-white';
    } else if (percentage < 0) {
      return 'bg-red-600 text-white';
    } else {
      return 'bg-slate-700 text-gray-400';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0b1623] via-[#102030] to-[#12263a] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 animate-pulse">Trading Dashboard</h1>
            <p className="text-gray-300 italic">Professional Trading Analytics</p>
          </div>

          {/* Row 1: Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-20 rounded-xl blur-xl group-hover:opacity-30`}></div>
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      <p className={`text-sm font-medium mt-1 ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Line Graph */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Monthly Performance Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="url(#colorGradient)" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#10B981' }}
                    animationDuration={2000}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 3: Calendar */}
          <Calender />

          {/* Row 4: Pie Chart and Session Performance */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-[1]">
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
    <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Win/Loss Ratio</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1500}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#FFFFFF',
              zIndex: 50
            }}
            wrapperStyle={{
              zIndex: 50
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>

  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
    <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Best Trading Times</h2>
        <div className="flex bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setTimeView('hours')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
              timeView === 'hours' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Hours
          </button>
          <button
            onClick={() => setTimeView('days')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
              timeView === 'days' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Days
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={bestTimesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#FFFFFF',
              zIndex: 50
            }}
            wrapperStyle={{
              zIndex: 50
            }}
            formatter={(value, name) => [
              `${value.toFixed(2)}`,
              'P&L'
            ]}
            labelFormatter={(label) => `${timeView === 'hours' ? 'Time:' : 'Day:'} ${label}`}
          />
          <Bar 
            dataKey="value" 
            fill="url(#timesGradient)"
            radius={[4, 4, 0, 0]}
            animationDuration={1800}
          />
          <defs>
            <linearGradient id="timesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>

          {/* Row 5: Setup Tags and Confluence Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 mt-5">
              <h2 className="text-xl font-bold text-white mb-10">Setup Types</h2>
              <div className="grid grid-cols-2 gap-4">
                {setupTags.map((tag, index) => (
                  <div key={index} className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r ${tag.color} opacity-20 rounded-lg blur-lg group-hover:opacity-30 transition-all duration-300`}></div>
                    <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm font-medium">{tag.label}</span>
                        <span className="text-white text-xl font-bold">{tag.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Top Confluences</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={confluenceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="url(#quarterlyGradient)"
                      radius={[8, 8, 0, 0]}
                      animationDuration={2000}
                    />
                    <defs>
                      <linearGradient id="quarterlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="50%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
                {/* Row 6: Monthly Profit Percentage Chart */}
        <MonthlyProfitChart />



{/* Row 7: Quarterly Tables */}
<QuaterlyTables />

{/* Row 8: Session Analysis */}
<SessionAnalysis />
      </div>
    </>
  );
};

export default TradingDashboard;
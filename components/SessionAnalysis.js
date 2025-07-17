import React, { useState, useEffect } from 'react';

const SessionAnalysis = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock API data - replace with actual API call
//   const mockTrades = [
//     { id: 1, time: '09:30', pnl: 150, session: 'London' },
//     { id: 2, time: '10:45', pnl: -75, session: 'London' },
//     { id: 3, time: '14:20', pnl: 200, session: 'New York' },
//     { id: 4, time: '15:30', pnl: 120, session: 'New York' },
//     { id: 5, time: '16:45', pnl: -50, session: 'New York' },
//     { id: 6, time: '02:30', pnl: 80, session: 'Asian' },
//     { id: 7, time: '03:45', pnl: -30, session: 'Asian' },
//     { id: 8, time: '09:15', pnl: 90, session: 'Overlap' },
//     { id: 9, time: '17:30', pnl: 110, session: 'Overlap' },
//     { id: 10, time: '18:00', pnl: -40, session: 'Overlap' }
//   ];

  // Simulate API fetch
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In real implementation, replace with:
        const response = await fetch('/api/trades');
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


  const sessionColorMap = {
  London: '#06B6D4',
  'New York': '#8B5CF6',
  Asian: '#10B981',
  Overlap: '#F59E0B',
  Unknown: '#9CA3AF',
};

function getColorForSession(session) {
  return sessionColorMap[session] || getRandomColor(session);
}

function getRandomColor(seed) {
  // Simple hash from session name to color hue
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}


const generateSessionData = () => {
  if (!trades.length) return { winRateData: [], totalTradesData: [] };

  const sessionsMap = {};

  // Aggregate win/total per session
  trades.forEach(trade => {
    const sessionKey = (trade.session || 'Unknown').trim();

    if (!sessionsMap[sessionKey]) {
      sessionsMap[sessionKey] = {
        name: sessionKey,
        fullName: sessionKey,
        wins: 0,
        total: 0,
        winRate: 0,
        color: getColorForSession(sessionKey),
      };
    }

    sessionsMap[sessionKey].total += 1;
    const pnl = parseFloat(trade.pnl) || 0;
    if (pnl > 0) sessionsMap[sessionKey].wins += 1;
  });

  // Prepare array and calculate winRate
  const sessionArray = Object.values(sessionsMap).map(session => ({
    ...session,
    winRate: session.total > 0 ? (session.wins / session.total) * 100 : 0,
  }));

  const buildWithOthers = (array, sortBy) => {
const sorted = [...array].sort((a, b) => {
  const diff = b[sortBy] - a[sortBy];
  return diff !== 0 ? diff : a.name.localeCompare(b.name); // break tie by name
});

    const top3 = sorted.slice(0, 3);
    const others = sorted.slice(3);

    if (others.length > 0) {
      const totalWins = others.reduce((acc, s) => acc + s.wins, 0);
      const totalTrades = others.reduce((acc, s) => acc + s.total, 0);
      const othersWinRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;

      top3.push({
        name: 'Others',
        fullName: 'Others',
        wins: totalWins,
        total: totalTrades,
        winRate: othersWinRate,
        color: '#9CA3AF', // gray
      });
    }

    return top3;
  };

  return {
    winRateData: buildWithOthers(sessionArray, 'winRate'),
    totalTradesData: buildWithOthers(sessionArray, 'total'),
  };
};

  const TriangleChart = ({ data, title, showWinRate = false }) => {
    const svgSize = 300;
    const triangleSize = 200;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    
    // Calculate triangle points
    const height = (Math.sqrt(3) / 2) * triangleSize;
    const topPoint = { x: centerX, y: centerY - height / 2 };
    const leftPoint = { x: centerX - triangleSize / 2, y: centerY + height / 2 };
    const rightPoint = { x: centerX + triangleSize / 2, y: centerY + height / 2 };
    
    const points = [topPoint, leftPoint, rightPoint];
    const trianglePath = `M ${topPoint.x} ${topPoint.y} L ${leftPoint.x} ${leftPoint.y} L ${rightPoint.x} ${rightPoint.y} Z`;
    
    return (
      <div className="relative">
        <svg width={svgSize} height={svgSize} className="overflow-visible">
          <defs>
            <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Triangle background */}
          <path 
            d={trianglePath} 
            fill="url(#triangleGradient)" 
            stroke="#06B6D4" 
            strokeWidth="2"
            filter="url(#glow)"
            className="animate-pulse"
          />
          
          {/* Data points and labels */}
          {data.slice(0, 3).map((session, index) => {
            const point = points[index];
            const value = showWinRate ? session.winRate : session.total;
            const displayValue = showWinRate ? `${value.toFixed(1)}%` : value.toString();
            
            return (
              <g key={index}>
                {/* Data point */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  fill={session.color}
                  stroke="#fff"
                  strokeWidth="2"
                  className="animate-bounce"
                  style={{ animationDelay: `${index * 0.2}s` }}
                />
                
                {/* Session name */}
                <text
                  x={point.x}
                  y={point.y - 20}
                  textAnchor="middle"
                  className="fill-white text-sm font-semibold"
                >
                  {session.name}
                </text>
                
                {/* Value */}
                <text
                  x={point.x}
                  y={point.y + 25}
                  textAnchor="middle"
                  className="fill-gray-300 text-xs"
                >
                  {displayValue}
                </text>
              </g>
            );
          })}
          
          {/* Center info */}
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            className="fill-white text-lg font-bold"
          >
            {showWinRate ? 'Win Rate' : 'Total Trades'}
          </text>
        </svg>
        
        {/* Hover tooltip */}
        {data.length > 0 && (
          <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600">
            <div className="text-xs text-gray-300 space-y-1">
              {data.slice(0, 3).map((session, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: session.color }}
                  ></div>
                  <span>{session.fullName}: {showWinRate ? `${session.winRate.toFixed(1)}%` : session.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 rounded-xl blur-xl"></div>
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
              <div className="h-80 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 rounded-xl blur-xl"></div>
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
              <div className="h-80 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="col-span-full relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-400 opacity-20 rounded-xl blur-xl"></div>
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="text-red-400 text-center">
              <p className="text-xl font-semibold">Error loading session data</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sessionData = generateSessionData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Win Rate by Session - Triangle Chart */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Win Rate By Session</h2>
          <div className="flex justify-center">
            <TriangleChart data={sessionData.winRateData} title="Win Rate" showWinRate={true} />
          </div>
        </div>
      </div>

      {/* Total Trades by Session - Triangle Chart */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Total Trades By Session</h2>
          <div className="flex justify-center">
            <TriangleChart data={sessionData.totalTradesData} title="Total Trades" showWinRate={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionAnalysis;
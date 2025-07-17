import React, { useState, useEffect } from 'react';

const SessionAnalysis = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await fetch('/api/trades');
        const data = await response.json();
        setTrades(data);
      } catch (err) {
        setError(err.message);
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
    Others: '#9CA3AF',
    Unknown: '#9CA3AF',
  };

  const getColorForSession = session => sessionColorMap[session] || getRandomColor(session);

  const getRandomColor = seed => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const generateSessionData = () => {
    if (!trades.length) return { winRateData: [], totalTradesData: [] };

    const sessionsMap = {};

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

    const sessionArray = Object.values(sessionsMap).map(session => ({
      ...session,
      winRate: session.total > 0 ? (session.wins / session.total) * 100 : 0,
    }));

    const getFixedData = () => {
      const ordered = ['London', 'Asian'];
      const fixed = ordered.map(name => sessionArray.find(s => s.name === name)).filter(Boolean);
      const others = sessionArray.filter(s => !ordered.includes(s.name));
      const totalWins = others.reduce((acc, s) => acc + s.wins, 0);
      const totalTrades = others.reduce((acc, s) => acc + s.total, 0);
      fixed.push({
        name: 'Others',
        fullName: 'Others',
        wins: totalWins,
        total: totalTrades,
        winRate: totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0,
        color: sessionColorMap['Others'],
      });
      return fixed;
    };

    return {
      winRateData: getFixedData(),
      totalTradesData: getFixedData(),
    };
  };

  const TriangleChart = ({ data, title, showWinRate = false }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const svgSize = 300;
    const triangleSize = 200;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const height = (Math.sqrt(3) / 2) * triangleSize;

    const topPoint = { x: centerX, y: centerY - height / 2 };
    const leftPoint = { x: centerX - triangleSize / 2, y: centerY + height / 2 };
    const rightPoint = { x: centerX + triangleSize / 2, y: centerY + height / 2 };

    const pointsMap = {
      London: topPoint,
      Asian: { ...leftPoint, x: leftPoint.x - 15 },
      Others: { ...rightPoint, x: rightPoint.x + 15 },
    };

    const trianglePath = `M ${topPoint.x} ${topPoint.y} L ${leftPoint.x} ${leftPoint.y} L ${rightPoint.x} ${rightPoint.y} Z`;

    return (
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg width={svgSize} height={svgSize}>
          <defs>
            <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Triangle */}
          <path
            d={trianglePath}
            fill="url(#triangleGradient)"
            stroke="#06B6D4"
            strokeWidth="2"
            filter="url(#glow)"
          />

          {/* Points */}
          {data.map((session, index) => {
            const point = pointsMap[session.name];
            if (!point) return null;
            const value = showWinRate ? session.winRate : session.total;
            const displayValue = showWinRate ? `${value.toFixed(1)}%` : value.toString();

            return (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  fill={session.color}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={point.x}
                  y={point.y - 20}
                  textAnchor="middle"
                  className="fill-white text-sm font-semibold"
                >
                  {session.name}
                </text>
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

          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            className="fill-white text-lg font-bold"
          >
            {showWinRate ? '' : ''}
          </text>
        </svg>

        {showTooltip && (
          <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-slate-600 shadow-lg transition-all duration-300">
            <div className="text-sm text-gray-200 font-medium space-y-2">
              {data.map((session, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: session.color }}
                  ></div>
                  <span>
                    {session.fullName}:{' '}
                    <span className="font-semibold">
                      {showWinRate ? `${session.winRate.toFixed(1)}%` : session.total}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading || error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 rounded-xl blur-xl"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="h-80 bg-slate-700 rounded"></div>
              </div>
              {error && (
                <div className="text-red-400 text-center mt-4">
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const sessionData = generateSessionData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Win Rate By Session</h2>
          <div className="flex justify-center">
            <TriangleChart data={sessionData.winRateData} showWinRate={true} />
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Total Trades By Session</h2>
          <div className="flex justify-center">
            <TriangleChart data={sessionData.totalTradesData} showWinRate={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionAnalysis;

'use client'

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

        const mockTrades = [
          { session: 'London', pnl: 150 },
          { session: 'London', pnl: -50 },
          { session: 'London', pnl: 200 },
          { session: 'london', pnl: 100 },
          { session: 'Asian', pnl: -75 },
          { session: 'New York', pnl: 300 },
          { session: 'New York', pnl: 120 },
          { session: 'Overlap', pnl: -30 },
          { session: 'Frankfurt', pnl: 50 },
        ];
        setTrades(mockTrades);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
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
    Others: '#F59E0B',
    Unknown: '#9CA3AF',
  };

  const getColorForSession = (session) => sessionColorMap[session] || sessionColorMap.Unknown;

  const generateSessionData = () => {
    if (!trades.length) return { winRateData: [], totalTradesData: [] };

    const sessionsMap = {};
    const knownSessions = ['London', 'Asian', 'New York'];

    trades.forEach(trade => {
      let sessionKey = (trade.session || 'Unknown').trim();
      if (!knownSessions.includes(sessionKey)) {
        sessionKey = 'Others';
      }

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
      const pnl = parseFloat(trade.pnl.toString()) || 0;
      if (pnl > 0) sessionsMap[sessionKey].wins += 1;
    });

    const sessionArray = Object.values(sessionsMap).map((session) => ({
      ...session,
      winRate: session.total > 0 ? (session.wins / session.total) * 100 : 0,
    }));

    const getFixedData = () => {
      const orderedNames = ['London', 'Asian', 'New York', 'Others'];
      return orderedNames.map(name => {
        const session = sessionArray.find(s => s.name === name);
        return session || {
          name: name,
          fullName: name,
          wins: 0,
          total: 0,
          winRate: 0,
          color: sessionColorMap[name] || sessionColorMap['Unknown'],
        };
      });
    };

    return {
      winRateData: getFixedData(),
      totalTradesData: getFixedData(),
    };
  };

  const TriangleChart = ({ data, showWinRate = false, title }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 640);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const calculateTrianglePoints = (data, showWinRate) => {
      const center = { x: 250, y: showWinRate ? 250 : 280 };
      const maxRadius = 180;
      
      // Get values and find max for scaling
      const values = data.map(session => showWinRate ? session.winRate : session.total);
      const maxValue = Math.max(...values, 1);
      
      // Calculate points for each session (3 corners of triangle)
      const sessionOrder = ['London', 'New York', 'Asian'];
      return sessionOrder.map((sessionName, index) => {
        const session = data.find(s => s.name === sessionName) || 
          { name: sessionName, fullName: sessionName, wins: 0, total: 0, winRate: 0, color: sessionColorMap[sessionName] };
        
        const value = showWinRate ? session.winRate : session.total;
        let normalizedValue;
        let radius;
        
        if (value === 0) {
          radius = 0;
        } else if (showWinRate) {
          // Progressive win rate scaling: linear with minimum visibility
          normalizedValue = value / 100; // Direct percentage to decimal
          radius = 20 + (normalizedValue * maxRadius); // Min 20px for 1%, max 200px for 100%
        } else {
          // Progressive trade count scaling: square root for better small number distinction
          normalizedValue = Math.sqrt(value) / Math.sqrt(maxValue);
          radius = 25 + (normalizedValue * (maxRadius - 25)); // Min 25px for 1 trade
        }
        
        // Triangle corners: top (0°), bottom-left (240°), bottom-right (120°)
        const angles = [-90, 30, 150]; // degrees
        const angle = (angles[index] * Math.PI) / 180;
        
        return {
          x: center.x + Math.cos(angle) * radius,
          y: center.y + Math.sin(angle) * radius,
          session: session,
          value: value,
          normalizedValue: normalizedValue || 0
        };
      });
    };

    const points = calculateTrianglePoints(data, showWinRate);
    const pathData = `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y} L ${points[2].x},${points[2].y} Z`;

    const handleMouseMove = (e, point) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setHoveredPoint(point);
    };

    return (
      <div className="relative w-full h-[400px] sm:h-[500px] bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
        <svg 
          viewBox="0 0 500 500" 
          className="w-full h-full max-w-[350px] max-h-[350px] sm:max-w-[480px] sm:max-h-[480px]"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
        >
          {/* Grid layers */}
          <defs>
            <filter id={`glow-${title}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <radialGradient id={`gradient-${title}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.2)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0.05)" />
            </radialGradient>
          </defs>
          
          
          {/* Background grid */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
            <polygon
              key={i}
              points={`${250 + (points[0].x - 250) * scale},${(showWinRate ? 250 : 280) + (points[0].y - (showWinRate ? 250 : 280)) * scale} ${250 + (points[1].x - 250) * scale},${(showWinRate ? 250 : 280) + (points[1].y - (showWinRate ? 250 : 280)) * scale} ${250 + (points[2].x - 250) * scale},${(showWinRate ? 250 : 280) + (points[2].y - (showWinRate ? 250 : 280)) * scale}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
          
          {/* Axis lines */}
          {points.map((point, index) => (
            <line
              key={`axis-${index}`}
              x1="250"
              y1={showWinRate ? "250" : "280"}
              x2={point.x}
              y2={point.y}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
              className="animate-pulse"
              style={{ animationDelay: `${index * 0.3}s` }}
            />
          ))}
          
          {/* Data area */}
          <polygon
            points={pathData.replace('M ', '').replace(' Z', '').replace(/L /g, ' ')}
            fill={`url(#gradient-${title})`}
            stroke="rgba(6, 182, 212, 0.9)"
            strokeWidth="3"
            filter={`url(#glow-${title})`}
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={`point-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="12"
                fill={point.session.color}
                stroke="#ffffff"
                strokeWidth="4"
                filter={`url(#glow-${title})`}
                className="cursor-pointer triangle-point"
                onMouseEnter={(e) => handleMouseMove(e, point)}
                onMouseMove={(e) => handleMouseMove(e, point)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{
                  animation: `pointExpand 1s ease-out forwards`,
                  animationDelay: `${1.5 + index * 0.2}s`,
                  opacity: 0
                }}
              />
            </g>
          ))}
        </svg>
        
        {/* Labels */}
        {points.map((point, index) => {
          // Calculate label positions based on actual triangle points
          const containerWidth = isMobile ? 350 : 480;
          const containerHeight = isMobile ? 350 : 480;
          
          // Get the actual point coordinates and calculate label positions
          const pointX = (point.x / 500) * 100; // Convert to percentage
          const pointY = (point.y / 500) * 100; // Convert to percentage
          
          // Offset labels from triangle points to avoid overlap
          const labelOffsets = [
            { offsetX: 0, offsetY: -12 }, // Top - above point
            { offsetX: -5, offsetY: 8 },  // Bottom right - left and below to stay inside
            { offsetX: -8, offsetY: 8 }   // Bottom left - left and below (original position)
          ];
          
          const labelX = Math.max(8, Math.min(85, pointX + labelOffsets[index].offsetX));
          const labelY = Math.max(8, Math.min(85, pointY + labelOffsets[index].offsetY));
          
          return (
            <div
              key={`label-${index}`}
              className="absolute text-white font-bold bg-slate-900/90 rounded-lg border border-cyan-400/30 backdrop-blur-sm shadow-lg"
              style={{
                left: `${labelX}%`,
                top: `${labelY}%`,
                transform: index === 0 ? 'translateX(-50%)' : index === 1 ? 'translateX(-100%)' : 'translateX(-25%)',
                color: point.session.color,
                animation: `fadeIn 1s ease-out forwards`,
                animationDelay: `${2 + index * 0.2}s`,
                opacity: 0,
                minWidth: 'fit-content',
                whiteSpace: 'nowrap',
                padding: isMobile ? '4px 6px' : '6px 10px',
                fontSize: isMobile ? '10px' : '12px',
                zIndex: 20
              }}
            >
              <div className="text-center">
                <div className="font-bold leading-tight">
                  {point.session.name === 'New York' ? 'NY' : point.session.name}
                </div>
                <div className="text-cyan-300 leading-tight" style={{ 
                  fontSize: isMobile ? '8px' : '10px', 
                  marginTop: '1px' 
                }}>
                  {showWinRate ? `${point.value.toFixed(1)}%` : `${point.value} trades`}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-slate-900/95 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-cyan-400/50 backdrop-blur-sm pointer-events-none z-30 text-xs sm:text-sm font-semibold"
            style={{
              left: Math.min(Math.max(tooltipPos.x + 10, 10), isMobile ? 280 : 420),
              top: Math.max(tooltipPos.y - 60, 10),
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              maxWidth: isMobile ? '120px' : '180px'
            }}
          >
            <div style={{ color: hoveredPoint.session.color }}>
              {hoveredPoint.session.name}
            </div>
            <div className="text-cyan-400">
              {showWinRate 
                ? `${hoveredPoint.value.toFixed(1)}% Win Rate`
                : `${hoveredPoint.value} Trades`
              }
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-auto bg-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl animate-pulse">Loading session analysis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-auto bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  const { winRateData, totalTradesData } = generateSessionData();

  return (
    <div className="bg-slate-900 min-h-auto p-2 sm:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-cyan-400 mb-4 sm:mb-6 lg:mb-8 text-center px-2">
          Trading Session Analysis
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-6 shadow-2xl border border-cyan-400/20">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-3 sm:mb-6 text-center">
              Win Rate by Session
            </h2>
            <TriangleChart 
              data={winRateData} 
              showWinRate={true} 
              title="winrate"
            />
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-6 shadow-2xl border border-cyan-400/20">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-3 sm:mb-6 text-center">
              Total Trades by Session
            </h2>
            <TriangleChart 
              data={totalTradesData} 
              showWinRate={false} 
              title="trades"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SessionAnalysis;

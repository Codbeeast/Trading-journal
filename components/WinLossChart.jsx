"use client";
import { useMemo, useState, useEffect } from 'react';
import { useTrades } from '../context/TradeContext';

// Powerful vibrant color palette for realistic 2D pie chart
const generateVibrantColors = (numColors) => {
    const coreColors = [
        '#FF0000', // Bright Red
        '#FFD700', // Gold
        '#00FF00', // Bright Green
        '#0066FF', // Bright Blue
        '#FF6600', // Bright Orange
        '#9900FF', // Bright Purple
        '#00FFFF', // Bright Cyan
        '#FF0099', // Bright Magenta
        '#00CC99', // Bright Teal
        '#99FF00', // Bright Lime
        '#FF6699', // Bright Pink
        '#6600FF', // Bright Violet
    ];

    const colors = [];
    for (let i = 0; i < numColors; i++) {
        if (i < coreColors.length) {
            colors.push(coreColors[i]);
        } else {
            // Generate additional powerful vibrant colors
            const hue = (i * 137.5) % 360; // Golden angle for good distribution
            const saturation = 95 + (i % 2) * 5; // Very high saturation for power
            const lightness = 45 + (i % 2) * 10; // Medium-bright lightness
            colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }
    }
    
    return colors;
};

// 2D Realistic Pie Chart Component
function RealisticPieChart({ data, size = 300 }) {
    const colors = useMemo(() => generateVibrantColors(data.length), [data.length]);
    const center = size / 2;
    const radius = size * 0.45;
    const labelRadius = radius * 1.4;

    // Calculate angles for each segment
    const segments = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        let currentAngle = -Math.PI / 2; // Start from top
        
        return data.map((segment, index) => {
            const angleSize = (segment.percentage / 100) * Math.PI * 2;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angleSize;
            const midAngle = (startAngle + endAngle) / 2;
            
            currentAngle = endAngle;
            
            return {
                ...segment,
                startAngle,
                endAngle,
                midAngle,
                angleSize,
                color: colors[index]
            };
        });
    }, [data, colors]);

    // Create SVG path for pie slice
    const createSlicePath = (startAngle, endAngle, radius) => {
        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);
        
        const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
        
        return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    };

    // Calculate label positions to avoid overlaps
    const calculateLabelPositions = (segments) => {
        return segments.map((segment, index) => {
            const baseX = center + labelRadius * Math.cos(segment.midAngle);
            const baseY = center + labelRadius * Math.sin(segment.midAngle);
            
            // Adjust for text anchor
            const isRightSide = segment.midAngle > -Math.PI/2 && segment.midAngle < Math.PI/2;
            const textAnchor = isRightSide ? 'start' : 'end';
            
            return {
                x: baseX,
                y: baseY,
                textAnchor,
                lineX1: center + (radius + 10) * Math.cos(segment.midAngle),
                lineY1: center + (radius + 10) * Math.sin(segment.midAngle),
                lineX2: baseX - (isRightSide ? 10 : -10),
                lineY2: baseY
            };
        });
    };

    const labelPositions = calculateLabelPositions(segments);

    return (
        <div className="flex justify-center items-center">
            <svg width={size} height={size} className="drop-shadow-2xl">
                {/* Gradient definitions for realistic effects */}
                <defs>
                    {segments.map((segment, index) => (
                        <g key={`gradients-${index}`}>
                            {/* Main gradient for slice */}
                            <radialGradient id={`gradient-${index}`} cx="30%" cy="30%">
                                <stop offset="0%" stopColor={segment.color} stopOpacity="1" />
                                <stop offset="70%" stopColor={segment.color} stopOpacity="0.9" />
                                <stop offset="100%" stopColor={segment.color} stopOpacity="0.7" />
                            </radialGradient>
                            
                            {/* Shadow gradient */}
                            <radialGradient id={`shadow-${index}`} cx="70%" cy="70%">
                                <stop offset="0%" stopColor="#000000" stopOpacity="0" />
                                <stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
                                <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                            </radialGradient>
                            
                            {/* Highlight gradient */}
                            <linearGradient id={`highlight-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </linearGradient>
                        </g>
                    ))}
                </defs>

                {/* Background circle for depth */}
                <circle 
                    cx={center} 
                    cy={center + 3} 
                    r={radius + 2} 
                    fill="#00000020" 
                    className="blur-sm"
                />

                {/* Pie slices */}
                {segments.map((segment, index) => (
                    <g key={`slice-${index}`}>
                        {/* Shadow layer */}
                        <path
                            d={createSlicePath(segment.startAngle, segment.endAngle, radius + 1)}
                            fill={`url(#shadow-${index})`}
                            transform="translate(2, 2)"
                        />
                        
                        {/* Main slice */}
                        <path
                            d={createSlicePath(segment.startAngle, segment.endAngle, radius)}
                            fill={`url(#gradient-${index})`}
                            stroke="#ffffff"
                            strokeWidth="2"
                            style={{
                                filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))',
                                transformOrigin: `${center}px ${center}px`,
                                transform: 'scale(1.05)'
                            }}
                        />
                        
                        {/* Highlight overlay */}
                        <path
                            d={createSlicePath(segment.startAngle, segment.endAngle, radius)}
                            fill={`url(#highlight-${index})`}
                            className="pointer-events-none"
                        />
                        
                        {/* Pair name label inside slice */}
                        <text
                            x={center + (radius * 0.6) * Math.cos(segment.midAngle)}
                            y={center + (radius * 0.6) * Math.sin(segment.midAngle)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-white font-bold pointer-events-none"
                            style={{
                                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                fontSize: size < 350 ? (segment.percentage > 15 ? '12px' : '10px') : (segment.percentage > 15 ? '16px' : '14px')
                            }}
                        >
                            {segment.name}
                        </text>
                    </g>
                ))}

            </svg>
        </div>
    );
}

export default function WinRate() {
    const { trades, loading, error } = useTrades();
    const [data, setData] = useState([]);
    const [isMobile, setIsMobile] = useState(false);

    // Effect to determine if it's a mobile view
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (trades && trades.length > 0) {
            const pairData = {};
            
            // Process all trades to get comprehensive pair statistics
            trades.forEach(trade => {
                if (!pairData[trade.pair]) {
                    pairData[trade.pair] = { 
                        wins: 0, 
                        losses: 0, 
                        value: 0, 
                        pnl: 0,
                        totalVolume: 0,
                        avgPnl: 0
                    };
                }
                
                pairData[trade.pair].value++;
                pairData[trade.pair].totalVolume += Math.abs(trade.pnl || 0);
                pairData[trade.pair].pnl += trade.pnl || 0;

                if ((trade.pnl || 0) > 0) {
                    pairData[trade.pair].wins++;
                } else {
                    pairData[trade.pair].losses++;
                }
            });

            const processedData = Object.keys(pairData).map(pairName => {
                const { wins, losses, value, pnl, totalVolume } = pairData[pairName];
                const totalTradesForPair = wins + losses;
                const winRate = totalTradesForPair > 0 ? (wins / totalTradesForPair) * 100 : 0;
                const avgPnl = totalTradesForPair > 0 ? pnl / totalTradesForPair : 0;

                return {
                    name: pairName,
                    percentage: 0, // Will be calculated based on trade volume
                    wins: wins,
                    losses: losses,
                    winRate: parseFloat(winRate.toFixed(1)),
                    value: value,
                    pnl: pnl,
                    totalVolume: totalVolume,
                    avgPnl: parseFloat(avgPnl.toFixed(2))
                };
            });

            // Calculate percentages based on trade volume
            const total = processedData.reduce((sum, pair) => sum + pair.value, 0);
            processedData.forEach(pair => {
                pair.percentage = total > 0 ? parseFloat(((pair.value / total) * 100).toFixed(1)) : 0;
            });

            // Sort by percentage in descending order
            const sortedData = processedData
                .filter(pair => pair.percentage > 0) // Only show pairs with data
                .sort((a, b) => b.percentage - a.percentage);

            setData(sortedData);
        } else {
            setData([]);
        }
    }, [trades]);

    // Define different sizes for mobile/desktop - increased size with better mobile centering
    const chartSize = isMobile ? 300 : 500;

    // Loading state
    if (loading) {
        return (
            <div className="relative group w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-blue-800/30 to-slate-900/30 rounded-2xl blur-3xl shadow-blue-500/50 animate-pulse"></div>
                <div className="relative backdrop-blur-2xl bg-slate-900/80 border border-blue-500/30 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                        Currency Pairs Performance
                    </h2>
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="relative">
                            <div className="rounded-full h-20 w-20 border-4 border-blue-500/30 border-t-blue-400 shadow-blue-400/50 animate-spin"></div>
                            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-blue-400/20 shadow-blue-400/50 animate-ping"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="relative group w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 via-slate-800/30 to-blue-900/30 rounded-2xl blur-3xl shadow-red-500/50"></div>
                <div className="relative backdrop-blur-2xl bg-slate-900/80 border border-red-500/30 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl md:text-2xl font-bold text-white mb-5 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
                        Currency Pairs Performance
                    </h2>
                    <div className="text-red-400 text-center">
                        <div className="text-6xl mb-6 drop-shadow-lg animate-shake">
                            ⚠️
                        </div>
                        <div className="text-xl">Error: {error.message || 'Failed to fetch data'}</div>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (!data || data.length === 0) {
        return (
            <div className="relative group w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-slate-800/30 to-blue-900/30 rounded-2xl blur-3xl shadow-blue-500/50"></div>
                <div className="relative backdrop-blur-2xl bg-slate-900/80 border border-blue-500/30 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                        Currency Pairs Performance
                    </h2>
                    <div className="text-center text-slate-400">
                        <div className="text-6xl mb-6 drop-shadow-lg">
                            📊
                        </div>
                        <div className="text-xl mb-2">No trading data available</div>
                        <div className="text-sm">Start trading to see your currency pair performance analysis</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative group w-full">
            {/* Blue-themed outer glow effect */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-cyan-500/40 to-slate-800/40 rounded-2xl blur-3xl group-hover:from-blue-500/60 group-hover:via-cyan-400/60 group-hover:to-slate-700/60 transition-all duration-1000 shadow-blue-500/50 animate-pulse-light"
            />

            {/* Main container with blue-black glassy effect */}
            <div className="relative backdrop-blur-2xl bg-slate-900/85 border border-blue-500/40 rounded-2xl p-6 md:p-8 w-full overflow-hidden shadow-2xl">

                {/* Header with blue glowing text */}
                <div className="mb-6 text-center">
                    <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                        Currency Pairs Performance
                    </h2>
                </div>

                {/* 2D Realistic Pie Chart with dark background */}
                <div className="flex justify-center items-center mb-8">
                    <div className="backdrop-blur-xl bg-slate-900/60 w-full rounded-xl p-6 border border-blue-500/30 shadow-blue-400/30">
                        <div className="flex justify-center items-center w-full">
                            <RealisticPieChart data={data} size={chartSize} />
                        </div>
                    </div>
                </div>

                {/* Detailed Analysis Section with blue theme */}
                <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-cyan-500/30 rounded-xl blur-lg group-hover/card:from-blue-500/50 group-hover/card:to-cyan-400/50 transition-all duration-300 shadow-blue-400/30" />
                    <div className="relative backdrop-blur-xl bg-slate-900/70 border border-blue-500/40 rounded-xl p-4 shadow-xl">
                        <h3 className="text-xl lg:text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-blue-400/50 animate-pulse-slow" />
                            Currency Pairs Analysis
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-44 overflow-y-auto custom-scrollbar">
                            {data.map((pair, index) => {
                                const segmentColor = generateVibrantColors(data.length)[index];
                                return (
                                    <div
                                        key={pair.name}
                                        className="group/item p-2 backdrop-blur-lg bg-slate-800/50 rounded-lg border border-blue-600/30 hover:bg-slate-800/70 hover:border-blue-500/50 transition-all duration-200 shadow-lg hover:shadow-blue-400/30"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded-full ring-2 ring-blue-300/50 animate-pulse-slow"
                                                    style={{
                                                        backgroundColor: segmentColor,
                                                        boxShadow: `0 0 15px ${segmentColor}, 0 0 30px ${segmentColor}60, inset 0 0 8px rgba(255,255,255,0.15)`
                                                    }}
                                                />
                                                <span className="text-base lg:text-lg font-bold text-white drop-shadow-lg">{pair.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-base lg:text-lg font-bold drop-shadow-lg ${
                                                    pair.winRate >= 60 ? 'text-green-400' : 
                                                    pair.winRate >= 50 ? 'text-yellow-400' : 
                                                    'text-red-400'
                                                }`}>
                                                    {pair.winRate.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex gap-3 text-sm">
                                                <span className="text-slate-300">
                                                    <span className="text-green-400 font-semibold drop-shadow-lg">{pair.wins}</span> W
                                                </span>
                                                <span className="text-slate-300">
                                                    <span className="text-red-400 font-semibold drop-shadow-lg">{pair.losses}</span> L
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-400 font-medium">
                                                {pair.value} Trades
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-xs text-slate-400">
                                                <span className="text-blue-400 font-semibold">
                                                    Avg: ${pair.avgPnl}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {pair.percentage}%
                                            </div>
                                        </div>
                                        
                                        <div className="mt-2">
                                            <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                                                <div
                                                    className="h-2 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${pair.percentage}%`,
                                                        backgroundColor: segmentColor,
                                                        boxShadow: `0 0 10px ${segmentColor}60`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Blue-themed Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(30, 58, 138, 0.2);
                    border-radius: 4px;
                    backdrop-filter: blur(10px);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #3b82f6 0%, #06b6d4 100%);
                    border-radius: 4px;
                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #2563eb 0%, #0891b2 100%);
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
                }
                @media (max-width: 768px) {
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                }

                @keyframes pulse-light {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.02); }
                }
                .animate-pulse-light {
                    animation: pulse-light 4s infinite ease-in-out;
                }

                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.2); opacity: 1; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s infinite ease-in-out;
                }

                @keyframes shake {
                    0%, 100% { transform: rotate(0deg); }
                    10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
                    20%, 40%, 60%, 80% { transform: rotate(10deg); }
                }
                .animate-shake {
                    animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
}

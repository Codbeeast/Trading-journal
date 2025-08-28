"use client";
import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useTrades } from '../context/TradeContext';

// Blue-black themed color palette
const generateBlueBlackColors = (numColors) => {
    const colors = [
        // Primary blues
        { h: 220, s: 85, l: 60 },   // Bright Blue
        { h: 200, s: 90, l: 55 },   // Sky Blue
        { h: 240, s: 80, l: 65 },   // Light Blue
        { h: 210, s: 95, l: 50 },   // Deep Sky Blue
        { h: 190, s: 85, l: 58 },   // Cyan Blue
        
        // Accent blues
        { h: 260, s: 75, l: 60 },   // Blue Purple
        { h: 180, s: 90, l: 55 },   // Turquoise
        { h: 230, s: 85, l: 55 },   // Royal Blue
        { h: 170, s: 80, l: 60 },   // Light Turquoise
        
        // Dark blues and grays
        { h: 220, s: 60, l: 40 },   // Dark Blue
        { h: 210, s: 70, l: 35 },   // Navy Blue
        { h: 200, s: 55, l: 45 },   // Steel Blue
        
        // Lighter accents for contrast
        { h: 195, s: 100, l: 70 },  // Bright Cyan
        { h: 215, s: 90, l: 75 },   // Light Sky Blue
        { h: 235, s: 80, l: 70 },   // Periwinkle
    ];

    const generatedColors = [];
    
    for (let i = 0; i < numColors; i++) {
        if (i < colors.length) {
            const color = colors[i];
            generatedColors.push(`hsl(${color.h}, ${color.s}%, ${color.l}%)`);
        } else {
            // Generate additional blue variations
            const baseHue = 200 + (i * 15) % 80; // Stay in blue range (180-260)
            const saturation = 70 + (i % 4) * 8;
            const lightness = 45 + (i % 3) * 15;
            generatedColors.push(`hsl(${baseHue}, ${saturation}%, ${lightness}%)`);
        }
    }
    
    return generatedColors;
};

// Function to convert HSL to RGB for glow effects
const hslToRgb = (h, s, l) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }

    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
};

function PieSegment({ startAngle, endAngle, color, percentage, radius, height, pairName, stats }) {
    const meshRef = useRef(null);
    const glowMeshRef = useRef(null);

    const geometry = useMemo(() => {
        const shape = new THREE.Shape();
        const segments = 32;
        const angleStep = (endAngle - startAngle) / segments;

        shape.moveTo(0, 0);

        for (let i = 0; i <= segments; i++) {
            const angle = startAngle + (i * angleStep);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                shape.lineTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        }

        shape.lineTo(0, 0);

        const extrudeSettings = {
            depth: height,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 2,
            bevelSize: 0.03,
            bevelThickness: 0.03
        };

        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }, [startAngle, endAngle, radius, height]);

    // Create a larger geometry for the glow effect
    const glowGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        const segments = 32;
        const angleStep = (endAngle - startAngle) / segments;
        const glowRadius = radius * 1.05; // Slightly larger for glow

        shape.moveTo(0, 0);

        for (let i = 0; i <= segments; i++) {
            const angle = startAngle + (i * angleStep);
            const x = Math.cos(angle) * glowRadius;
            const y = Math.sin(angle) * glowRadius;
            if (i === 0) {
                shape.lineTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        }

        shape.lineTo(0, 0);

        const extrudeSettings = {
            depth: height * 1.1,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 2,
            bevelSize: 0.04,
            bevelThickness: 0.04
        };

        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }, [startAngle, endAngle, radius, height]);

    const { material, glowMaterial } = useMemo(() => {
        // Parse HSL color to get RGB values for enhanced glow
        const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        let rgbColor = [255, 255, 255];
        if (hslMatch) {
            rgbColor = hslToRgb(parseInt(hslMatch[1]), parseInt(hslMatch[2]), parseInt(hslMatch[3]));
        }

        const threeColor = new THREE.Color();
        threeColor.set(color);

        // Enhanced main material with blue-tinted emissive properties
        const mainMaterial = new THREE.MeshPhongMaterial({
            color: threeColor,
            emissive: threeColor,
            emissiveIntensity: 0.35, // Slightly increased for better glow
            shininess: 300, // Increased for more metallic look
            specular: new THREE.Color(0.9, 0.95, 1.0), // Blue-tinted specular
            transparent: false,
        });

        // Enhanced glow material for the outer layer
        const glowMat = new THREE.MeshBasicMaterial({
            color: threeColor,
            transparent: true,
            opacity: 0.2, // Slightly more visible glow
            side: THREE.BackSide,
        });

        return { material: mainMaterial, glowMaterial: glowMat };
    }, [color]);

    // Add subtle animation to the segments
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();
            meshRef.current.material.emissiveIntensity = 0.35 + Math.sin(time * 1.5 + startAngle) * 0.12;
        }
    });

    const labelAngle = (startAngle + endAngle) / 2;
    
    // Label position - use same X,Z for both percentage (inside) and pair name (above)
    const labelRadius = radius * 0.6;
    const innerLabelX = Math.cos(labelAngle) * labelRadius;
    const innerLabelY = Math.sin(labelAngle) * labelRadius;

    return (
        <group>
            {/* Glow layer */}
            <mesh 
                ref={glowMeshRef} 
                geometry={glowGeometry} 
                material={glowMaterial} 
                rotation={[-Math.PI / 2, 0, 0]} 
                position={[0, -0.02, 0]}
            />
            {/* Main segment */}
            <mesh 
                ref={meshRef} 
                geometry={geometry} 
                material={material} 
                rotation={[-Math.PI / 2, 0, 0]} 
                castShadow 
                receiveShadow 
            />
            
            {/* Inner label - Percentage (keep existing) */}
            <Text
                position={[innerLabelX, height / 2, innerLabelY]}
                fontSize={0.35}
                color="white"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
                outlineWidth={0.025}
                outlineColor="#001122"
            >
                {percentage}%
            </Text>

            {/* Outer label - Pair Name (new) - directly above, facing camera */}
            <Text
                position={[innerLabelX, height + 0.5, innerLabelY]} // Same X,Z as inner label but raised
                fontSize={0.28}
                color="white"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
                outlineWidth={0.02}
                outlineColor="#001122"
            >
                {pairName}
            </Text>
        </group>
    );
}

function Scene({ data, radius, height, isMobile }) {
    const groupRef = useRef(null);

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.005; // Auto-rotation speed
        }
    });

    const blueBlackColors = useMemo(() => generateBlueBlackColors(data.length), [data.length]);

    // Calculate angles with proper distribution
    const segments = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        // Ensure minimum angle size for visibility
        const minAngleSize = Math.PI / 6; // 30 degrees minimum
        const totalAngle = Math.PI * 2;
        
        let processedData = [...data];
        
        // If we have very few segments, distribute them evenly
        if (data.length <= 4) {
            const evenAngleSize = totalAngle / data.length;
            let currentAngle = 0;
            
            return processedData.map((segment, index) => {
                const angleSize = Math.max(evenAngleSize, minAngleSize);
                const startAngle = currentAngle;
                const endAngle = currentAngle + angleSize;
                currentAngle = endAngle;
                
                return {
                    ...segment,
                    startAngle,
                    endAngle,
                    angleSize,
                    index
                };
            });
        } else {
            // For more segments, use percentage-based distribution
            let currentAngle = 0;
            
            return processedData.map((segment, index) => {
                const angleSize = Math.max((segment.percentage / 100) * totalAngle, minAngleSize);
                const startAngle = currentAngle;
                const endAngle = currentAngle + angleSize;
                currentAngle = endAngle;
                
                return {
                    ...segment,
                    startAngle,
                    endAngle,
                    angleSize,
                    index
                };
            });
        }
    }, [data]);

    return (
        <group ref={groupRef} position={[0, 0.3, 0]}>
            {segments.map((segment, index) => (
                <PieSegment
                    key={`${segment.name}-${index}`}
                    startAngle={segment.startAngle}
                    endAngle={segment.endAngle}
                    color={blueBlackColors[index]}
                    percentage={segment.percentage}
                    pairName={segment.name}
                    radius={radius}
                    height={height}
                    stats={segment}
                />
            ))}
        </group>
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

    // Define different radius and height for mobile/desktop
    const chartRadius = isMobile ? 2.5 : 3.5;
    const chartHeight = isMobile ? 0.8 : 1.0;
    const cameraFov = isMobile ? 60 : 45;
    const cameraPosition = isMobile ? [5, 4, 5] : [7, 6, 7];

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

                {/* 3D Chart with blue-themed lighting */}
                <div className="flex justify-center items-center mb-5">
                    <div className="w-full h-80 backdrop-blur-xl bg-slate-900/60 rounded-xl border border-blue-500/30 shadow-blue-400/30">
                        <Canvas
                            camera={{ position: cameraPosition, fov: cameraFov }}
                            shadows
                            gl={{ antialias: true, alpha: true }}
                        >
                            {/* Blue-themed lighting setup */}
                            <ambientLight intensity={0.3} color="#0088cc" />
                            <directionalLight
                                position={[10, 10, 5]}
                                intensity={1.0}
                                color="#ffffff"
                                castShadow
                                shadow-mapSize-width={2048}
                                shadow-mapSize-height={2048}
                                shadow-camera-near={0.1}
                                shadow-camera-far={50}
                                shadow-camera-left={-10}
                                shadow-camera-right={10}
                                shadow-camera-top={10}
                                shadow-camera-bottom={-10}
                            />
                            {/* Blue accent lights */}
                            <pointLight position={[-8, 5, -8]} intensity={0.7} color="#00aaff" />
                            <pointLight position={[8, 5, 8]} intensity={0.7} color="#0066cc" />
                            <pointLight position={[0, 8, 0]} intensity={0.4} color="#88ccff" />
                            
                            {/* Rim lighting for better edge definition */}
                            <directionalLight
                                position={[-10, 2, -10]}
                                intensity={0.4}
                                color="#aaccff"
                            />

                            <Scene data={data} radius={chartRadius} height={chartHeight} isMobile={isMobile} />

                            <OrbitControls
                                enablePan={false}
                                enableZoom={true}
                                maxDistance={isMobile ? 6 : 8}
                                minDistance={isMobile ? 1.5 : 2}
                                maxPolarAngle={Math.PI / 2}
                                enableDamping={true}
                                dampingFactor={0.05}
                            />
                        </Canvas>
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
                                const segmentColor = generateBlueBlackColors(data.length)[index];
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

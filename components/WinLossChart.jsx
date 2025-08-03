"use client";
import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useTrades } from '../context/TradeContext';

// Enhanced function to generate vibrant, distinct colors with better saturation and brightness
const generateDistinctColors = (numColors) => {
    const colors = [];
    const baseColors = [
        { h: 0, s: 90, l: 55 },     // Vibrant Red
        { h: 120, s: 85, l: 50 },   // Vibrant Green
        { h: 240, s: 95, l: 60 },   // Vibrant Blue
        { h: 60, s: 95, l: 55 },    // Vibrant Yellow
        { h: 300, s: 80, l: 60 },   // Vibrant Magenta
        { h: 180, s: 85, l: 50 },   // Vibrant Cyan
        { h: 30, s: 95, l: 55 },    // Vibrant Orange
        { h: 270, s: 80, l: 60 },   // Vibrant Purple
        { h: 330, s: 90, l: 55 },   // Vibrant Pink
        { h: 90, s: 80, l: 50 },    // Vibrant Lime
        { h: 210, s: 85, l: 55 },   // Vibrant Sky Blue
        { h: 15, s: 90, l: 60 },    // Vibrant Red-Orange
    ];

    for (let i = 0; i < numColors; i++) {
        if (i < baseColors.length) {
            const color = baseColors[i];
            colors.push(`hsl(${color.h}, ${color.s}%, ${color.l}%)`);
        } else {
            // Generate additional colors using golden angle for even distribution
            const hue = (i * 137.508) % 360;
            colors.push(`hsl(${hue}, ${85 + (i % 3) * 5}%, ${55 + (i % 2) * 5}%)`);
        }
    }
    return colors;
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

function PieSegment({ startAngle, endAngle, color, percentage, radius, height }) {
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

        // Enhanced main material with stronger emissive properties
        const mainMaterial = new THREE.MeshPhongMaterial({
            color: threeColor,
            emissive: threeColor,
            emissiveIntensity: 0.3, // Increased for more glow
            shininess: 200,
            specular: new THREE.Color(0.8, 0.8, 0.8),
            transparent: false,
        });

        // Glow material for the outer layer
        const glowMat = new THREE.MeshBasicMaterial({
            color: threeColor,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide, // Render from inside out for glow effect
        });

        return { material: mainMaterial, glowMaterial: glowMat };
    }, [color]);

    // Add subtle animation to the segments
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();
            meshRef.current.material.emissiveIntensity = 0.3 + Math.sin(time * 2 + startAngle) * 0.1;
        }
    });

    const labelAngle = (startAngle + endAngle) / 2;
    const labelRadius = radius * 0.7;
    const labelX = Math.cos(labelAngle) * labelRadius;
    const labelY = Math.sin(labelAngle) * labelRadius;

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
            {/* Enhanced label with outline */}
            <Text
                position={[labelX, height / 2, labelY]}
                fontSize={0.35}
                color="white"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
                outlineWidth={0.02}
                outlineColor="black"
            >
                {percentage}%
            </Text>
        </group>
    );
}

function Scene({ data }) {
    const groupRef = useRef(null);

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.005; // Auto-rotation speed
        }
    });

    const radius = 3.5;
    const height = 1.0;
    let currentAngle = 0;

    const distinctColors = useMemo(() => generateDistinctColors(data.length), [data.length]);

    return (
        <group ref={groupRef} position={[0, 0.3, 0]}>
            {data.map((segment, index) => {
                const angleSize = (segment.percentage / 100) * Math.PI * 2;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angleSize;
                currentAngle = endAngle;

                return (
                    <PieSegment
                        key={index}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        color={distinctColors[index]}
                        percentage={segment.percentage}
                        radius={radius}
                        height={height}
                    />
                );
            })}
        </group>
    );
}

export default function PieChart3D() {
    const { trades: tradeHistory, loading, error } = useTrades();
    const [data, setData] = useState([]);

    useEffect(() => {
        if (tradeHistory && tradeHistory.length > 0) {
            const pairData = {};
            tradeHistory.forEach(trade => {
                if (!pairData[trade.pair]) {
                    pairData[trade.pair] = { wins: 0, losses: 0, value: 0, pnl: 0 };
                }
                pairData[trade.pair].value++;
                pairData[trade.pair].pnl += trade.pnl || 0;

                if ((trade.pnl || 0) > 0) {
                    pairData[trade.pair].wins++;
                } else {
                    pairData[trade.pair].losses++;
                }
            });

            const processedData = Object.keys(pairData).map(pairName => {
                const { wins, losses, value, pnl } = pairData[pairName];
                const totalTradesForPair = wins + losses;
                const winRate = totalTradesForPair > 0 ? (wins / totalTradesForPair) * 100 : 0;

                return {
                    name: pairName,
                    percentage: 0,
                    wins: wins,
                    losses: losses,
                    winRate: parseFloat(winRate.toFixed(1)),
                    value: value,
                    pnl: pnl
                };
            });

            const totalTrades = processedData.reduce((sum, pair) => sum + pair.value, 0);
            const dataWithPercentages = processedData.map(pair => ({
                ...pair,
                percentage: totalTrades > 0 ? parseFloat(((pair.value / totalTrades) * 100).toFixed(1)) : 0
            })).sort((a, b) => b.percentage - a.percentage);

            setData(dataWithPercentages);
        } else {
            setData([]);
        }
    }, [tradeHistory]);

    // Simplified loading and error states without Framer Motion animations
    if (loading) {
        return (
            <div className="relative group w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-glass-primary/30 via-glass-secondary/30 to-glass-accent/30 rounded-2xl blur-3xl shadow-glow-primary animate-pulse"></div>
                <div className="relative backdrop-blur-2xl bg-glass-bg border border-gray-300 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-glass-primary to-glass-accent bg-clip-text text-transparent drop-shadow-lg">
                        Currency Pairs Performance
                    </h2>
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="relative">
                            <div className="rounded-full h-20 w-20 border-4 border-glass-primary/30 border-t-glass-primary shadow-glow-primary animate-spin"></div>
                            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-glass-primary/20 shadow-glow-primary animate-ping"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative group w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-glass-danger/30 via-glass-secondary/30 to-glass-warning/30 rounded-2xl blur-3xl shadow-glow-danger"></div>
                <div className="relative backdrop-blur-2xl bg-glass-bg border border-gray-300 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl md:text-2xl font-bold text-white mb-5 bg-gradient-to-r from-glass-danger to-glass-warning bg-clip-text text-transparent drop-shadow-lg">
                        Currency Pairs Performance
                    </h2>
                    <div className="text-glass-danger text-center">
                        <div className="text-6xl mb-6 drop-shadow-lg animate-shake">
                            ⚠️
                        </div>
                        <div className="text-xl">Error: {error.message || 'Failed to fetch data'}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative group w-full">
            {/* Outer glow effect with bright colors (using Tailwind animation) */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-glass-primary/40 via-glass-secondary/40 to-glass-accent/40 rounded-2xl blur-3xl group-hover:from-glass-primary/60 group-hover:via-glass-secondary/60 group-hover:to-glass-accent/60 transition-all duration-1000 shadow-glow-primary animate-pulse-light"
            />

            {/* Main container with glassy effect */}
            <div className="relative backdrop-blur-2xl bg-glass-bg border border-gray-600 rounded-2xl p-6 md:p-8 w-full overflow-hidden shadow-2xl">

                {/* Header with glowing text (using Tailwind animation) */}
                <div
                    className="mb-6 text-center"
                >
                    <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-white mb-4 bg-gradient-to-r from-glass-primary via-glass-accent to-glass-secondary bg-clip-text text-transparent drop-shadow-2xl">
                        Currency Pairs Performance
                    </h2>
                </div>

                {/* 3D Chart with enhanced lighting for better glow visibility */}
                <div
                    className="flex justify-center items-center mb-5"
                >
                    <div className="w-full h-80 backdrop-blur-xl bg-glass-backdrop rounded-xl border border-gray-600 shadow-glow-accent">
                        <Canvas
                            camera={{ position: [7, 6, 7], fov: 45 }}
                            shadows
                            gl={{ antialias: true, alpha: true }}
                        >
                            {/* Enhanced lighting setup for better glow effects */}
                            <ambientLight intensity={0.4} />
                            <directionalLight
                                position={[10, 10, 5]}
                                intensity={1.2}
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
                            {/* Additional colored lights for enhanced glow */}
                            <pointLight position={[-8, 5, -8]} intensity={0.6} color="#00FFFF" />
                            <pointLight position={[8, 5, 8]} intensity={0.6} color="#FF0080" />
                            <pointLight position={[0, 8, 0]} intensity={0.5} color="#FFFF00" />
                            
                            {/* Rim lighting for better edge definition */}
                            <directionalLight
                                position={[-10, 2, -10]}
                                intensity={0.3}
                                color="#ffffff"
                            />

                            <Scene data={data} />

                            <OrbitControls
                                enablePan={false}
                                enableZoom={true}
                                maxDistance={8}
                                minDistance={2}
                                maxPolarAngle={Math.PI / 2}
                                enableDamping={true}
                                dampingFactor={0.05}
                            />
                        </Canvas>
                    </div>
                </div>

                {/* Detailed Analysis Section with enhanced colors */}
                <div
                    className="relative group/card"
                >
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-glass-primary/30 to-glass-accent/30 rounded-xl blur-lg group-hover/card:from-glass-primary/50 group-hover/card:to-glass-accent/50 transition-all duration-300 shadow-glow-secondary"
                    />
                    <div className="relative backdrop-blur-xl bg-glass-bg border border-gray-600 rounded-xl p-4 shadow-xl">
                        <h3 className="text-xl lg:text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <div
                                className="w-3 h-3 bg-gradient-to-r from-glass-primary to-glass-accent rounded-full shadow-glow-primary animate-pulse-slow"
                            />
                            Detailed Analysis
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-44 overflow-y-auto custom-scrollbar">
                            {data.map((pair, index) => {
                                const segmentColor = generateDistinctColors(data.length)[index];
                                return (
                                    <div
                                        key={pair.name}
                                        className="group/item p-2 backdrop-blur-lg bg-glass-bg/50 rounded-lg border border-gray-700 hover:bg-glass-bg/70 hover:border-gray-600 transition-all duration-200 shadow-lg hover:shadow-glow-primary/30"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded-full ring-2 ring-white/50 animate-pulse-slow"
                                                    style={{
                                                        backgroundColor: segmentColor,
                                                        boxShadow: `0 0 20px ${segmentColor}, 0 0 40px ${segmentColor}80, inset 0 0 10px rgba(255,255,255,0.2)`
                                                    }}
                                                />
                                                <span className="text-base lg:text-lg font-bold text-white drop-shadow-lg">{pair.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-base lg:text-lg font-bold drop-shadow-lg ${pair.winRate >= 60 ? 'text-glass-success' : pair.winRate >= 50 ? 'text-glass-warning' : 'text-glass-danger'}`}>
                                                    {pair.winRate.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex gap-3 text-sm">
                                                <span className="text-slate-300">
                                                    <span className="text-glass-success font-semibold drop-shadow-lg">{pair.wins}</span> W
                                                </span>
                                                <span className="text-slate-300">
                                                    <span className="text-glass-danger font-semibold drop-shadow-lg">{pair.losses}</span> L
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-400 font-medium">
                                                {pair.value} Trades
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <div className="w-full bg-slate-600/60 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        pair.winRate >= 60 ? 'bg-gradient-to-r from-glass-success to-green-400' :
                                                        pair.winRate >= 50 ? 'bg-gradient-to-r from-glass-warning to-orange-400' :
                                                        'bg-gradient-to-r from-glass-danger to-red-400'
                                                    }`}
                                                    style={{
                                                        width: `${pair.winRate}%`,
                                                        boxShadow: `0 0 15px ${segmentColor}80`
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

            {/* Enhanced Custom Scrollbar Styles and animations */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    backdrop-filter: blur(10px);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, hsl(var(--glass-primary)) 0%, hsl(var(--glass-accent)) 100%);
                    border-radius: 4px;
                    box-shadow: 0 0 10px hsl(var(--glass-primary) / 0.5);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, hsl(var(--glass-primary)) 0%, hsl(var(--glass-secondary)) 100%);
                    box-shadow: 0 0 15px hsl(var(--glass-primary) / 0.7);
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
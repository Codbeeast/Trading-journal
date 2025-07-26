import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Simple 3D Triangle Component
const Triangle3D = ({ data, showWinRate, position = [0, 0, 0] }) => {
  const triangleRef = useRef();
  const groupRef = useRef();

  // Create triangle shape
  const triangleShape = React.useMemo(() => {
    const shape = new THREE.Shape();
    const size = 1.5;
    shape.moveTo(0, size);
    shape.lineTo(-size * 0.866, -size * 0.5);
    shape.lineTo(size * 0.866, -size * 0.5);
    shape.lineTo(0, size);
    return shape;
  }, []);

  // Gentle floating animation only (no rotation)
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  // Data point positions for 3 points
  const dataPointPositions = [
    [0, 1.8, 0.6],       // Top (Asian)
    [-1.6, -1.0, 0.6],   // Bottom Left (London)
    [1.6, -1.0, 0.6],    // Bottom Right (Others)
  ];

  if (!data || data.length === 0) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Main Triangle */}
      <mesh ref={triangleRef}>
        <extrudeGeometry
          args={[
            triangleShape,
            {
              depth: 0.3,
              bevelEnabled: true,
              bevelSegments: 4,
              steps: 2,
              bevelSize: 0.05,
              bevelThickness: 0.05,
            },
          ]}
        />
        <meshPhysicalMaterial
          color="#0056b3" // A deep, rich blue for a polished aesthetic
          metalness={0.99} // Even higher metalness for extreme reflectivity
          roughness={0.01} // Even lower roughness for a near-perfect mirror finish
          clearcoat={1.0} // Full clearcoat
          clearcoatRoughness={0.005} // Ultra-low clearcoat roughness for maximum polish
          transparent={true}
          opacity={0.9} // Slightly increased opacity for more solidity
          envMapIntensity={2.0} // Increased environment map intensity for dramatic reflections
          sheen={0.5} // Added sheen for a subtle, soft highlight
          sheenColor="#ffffff" // White sheen color
        />
      </mesh>

      {/* Triangle Glow (subtle, ethereal glow) */}
      <mesh ref={triangleRef}>
        <extrudeGeometry
          args={[
            triangleShape,
            {
              depth: 0.32,
              bevelEnabled: true,
              bevelSegments: 4,
              steps: 2,
              bevelSize: 0.07,
              bevelThickness: 0.07,
            },
          ]}
        />
        <meshBasicMaterial
          color="#66b3ff" // A brighter, complementary blue for the glow
          transparent={true}
          opacity={0.4} // Slightly increased opacity for a more visible glow
        />
      </mesh>

      {/* Data Points */}
      {data.slice(0, 3).map((session, index) => {
        if (!session || index >= dataPointPositions.length) return null;

        const [x, y, z] = dataPointPositions[index];
        const value = showWinRate ? session.winRate : session.total;
        const normalizedValue = Math.max(0.4, Math.min(1, value / 100));
        const sphereSize = 0.12 + (normalizedValue * 0.08);

        return (
          <group key={index}>
            {/* Data Sphere */}
            <mesh position={[x, y, z]}>
              <sphereGeometry args={[sphereSize, 16, 16]} />
              <meshPhysicalMaterial
                color={session.color}
                metalness={0.7}
                roughness={0.3}
                clearcoat={0.8}
              />
            </mesh>

            {/* Session Label (adjusted position) */}
            <Text
              position={[x, y + sphereSize + 0.15, z]} // Positioned above the sphere
              fontSize={0.1}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {session.name}
            </Text>
            {/* Value Label (adjusted position) */}
            <Text
              position={[x, y + sphereSize - 0.05, z]} // Positioned just below the session name
              fontSize={0.07}
              color="#94a3b8"
              anchorX="center"
              anchorY="middle"
            >
              {showWinRate ? `${value.toFixed(1)}%` : `${value}`}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

// Skeleton Loading Component for 3D Canvas
const CanvasSkeleton = () => {
  return (
    <div className="h-[500px] bg-slate-800/30 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 bg-slate-600/40 rounded-full mb-4 mx-auto animate-pulse"></div>
        <div className="h-4 bg-slate-600/40 rounded w-24 mx-auto mb-2 animate-pulse"></div>
        <div className="h-3 bg-slate-600/40 rounded w-16 mx-auto animate-pulse"></div>
      </div>
    </div>
  );
};

// Session Info Skeleton
const SessionInfoSkeleton = () => {
  return (
    <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 z-10">
      <div className="h-3 bg-slate-600/40 rounded w-16 mb-2 animate-pulse"></div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-2 mb-1">
          <div className="w-3 h-3 bg-slate-600/40 rounded-full animate-pulse"></div>
          <div className="h-3 bg-slate-600/40 rounded w-12 animate-pulse"></div>
          <div className="h-3 bg-slate-600/40 rounded w-8 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};

// Linear Loading Component (YouTube style)
const LinearLoader = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent overflow-hidden z-50">
      <div className="h-full bg-blue-400 animate-linear-progress origin-left"></div>
      {/* Tailwind CSS for animation - add this to your global CSS or an inline style tag */}
      <style>{`
        @keyframes linear-progress {
          0% { transform: translateX(-100%) scaleX(0); }
          50% { transform: translateX(0%) scaleX(0.6); }
          100% { transform: translateX(100%) scaleX(0); }
        }
        .animate-linear-progress {
          animation: linear-progress 2s infinite cubic-bezier(0.65, 0.815, 0.735, 0.395);
        }
      `}</style>
    </div>
  );
};

// 3D Canvas Wrapper
const Canvas3D = ({ data, showWinRate, title, loading }) => {
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  if (loading) {
    return (
      <div className="relative">
        <CanvasSkeleton />
        <SessionInfoSkeleton />
      </div>
    );
  }

  return (
    <div className="h-[500px] relative bg-slate-800/30 rounded-lg overflow-hidden">
      {!isCanvasReady && <LinearLoader />} {/* Show LinearLoader until canvas is ready */}
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0f172a', 1);
          setTimeout(() => setIsCanvasReady(true), 100); // Small delay to ensure visual render
        }}
      >
        {/* Simple Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3b82f6" />

        <Suspense fallback={null}>
          {/* Adjusted position for the triangle to center it vertically */}
          <Triangle3D data={data} showWinRate={showWinRate} position={[0, -0.7, 0]} /> {/* Increased negative Y to move it further down */}
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          maxDistance={10}
          minDistance={4}
          autoRotate={false}
        />
      </Canvas>

      {/* Session Info Overlay */}
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 z-10">
        <div className="text-xs font-semibold text-blue-400 mb-2">SESSIONS</div>
        {data.slice(0, 3).map((session, i) => (
          <div key={i} className="flex items-center space-x-2 text-xs mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: session.color }}
            />
            <span className="text-white">{session.name}</span>
            <span className="text-slate-400">
              {showWinRate ? `${session.winRate.toFixed(1)}%` : `${session.total}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Dashboard Card Skeleton
const DashboardCardSkeleton = ({ title, icon }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-xl blur-xl"></div>
      <div className="relative bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-slate-600/40 rounded mr-3 animate-pulse"></div>
          <div className="h-6 bg-slate-600/40 rounded w-40 animate-pulse"></div>
        </div>
        <CanvasSkeleton />
        <SessionInfoSkeleton />
      </div>
    </div>
  );
};

// Main Dashboard Component
const TradingDashboard = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);

        // Replace this URL with your actual API endpoint
        const response = await fetch('/api/trades');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTrades(data);

      } catch (err) {
        console.error('Failed to fetch trades:', err);

        // Fallback to mock data if API fails
        const mockData = [
          { session: 'London', pnl: 150 },
          { session: 'London', pnl: -50 },
          { session: 'London', pnl: 200 },
          { session: 'London', pnl: 80 },
          { session: 'Asian', pnl: 100 },
          { session: 'Asian', pnl: -30 },
          { session: 'Asian', pnl: 60 },
          { session: 'Others', pnl: -25 },
          { session: 'Others', pnl: 90 },
          { session: 'Others', pnl: 45 },
        ];
        setTrades(mockData);
        setError('Using demo data - API connection failed');
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  const sessionColorMap = {
    Asian: '#10B981',    // Green
    London: '#06B6D4',   // Cyan
    Others: '#F97316',   // Orange
  };

  const generateSessionData = useCallback(() => {
    if (!trades.length) return { winRateData: [], totalTradesData: [] };

    const sessionsMap = {};

    trades.forEach(trade => {
      let sessionKey = trade.session || 'Others';

      // Map any session that's not Asian or London to Others
      if (!['Asian', 'London'].includes(sessionKey)) {
        sessionKey = 'Others';
      }

      if (!sessionsMap[sessionKey]) {
        sessionsMap[sessionKey] = {
          name: sessionKey,
          wins: 0,
          total: 0,
          color: sessionColorMap[sessionKey] || '#9CA3AF',
        };
      }

      sessionsMap[sessionKey].total += 1;
      if (parseFloat(trade.pnl) > 0) {
        sessionsMap[sessionKey].wins += 1;
      }
    });

    const sessionArray = Object.values(sessionsMap).map(session => ({
      ...session,
      winRate: session.total > 0 ? (session.wins / session.total) * 100 : 0,
    }));

    // Ensure we have exactly 3 sessions: Asian, London, Others
    const orderedSessions = ['Asian', 'London', 'Others'].map(sessionName => {
      const found = sessionArray.find(s => s.name === sessionName);
      return found || {
        name: sessionName,
        wins: 0,
        total: 0,
        winRate: 0,
        color: sessionColorMap[sessionName]
      };
    });

    return {
      winRateData: orderedSessions,
      totalTradesData: orderedSessions,
    };
  }, [trades]);

  const sessionData = generateSessionData();

  if (error && trades.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center text-red-400">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="font-medium">Failed to load data</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-auto bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Win Rate Analysis */}
          {loading ? (
            <DashboardCardSkeleton title="Win Rate Analysis" icon="🏆" />
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm mt-6 border border-blue-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-3 text-xl">🏆</span>
                Win Rate Analysis
              </h2>
              <Canvas3D
                data={sessionData.winRateData}
                showWinRate={true}
                title="Win Rate Analytics"
                loading={loading}
              />
            </div>
          )}

          {/* Volume Distribution */}
          {loading ? (
            <DashboardCardSkeleton title="Volume Distribution" icon="📈" />
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm mt-6 border border-cyan-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-3 text-xl">📈</span>
                Volume Distribution
              </h2>
              <Canvas3D
                data={sessionData.totalTradesData}
                showWinRate={false}
                title="Volume Analytics"
                loading={loading}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-yellow-900/50 border border-yellow-500/50 rounded-lg p-3 text-center">
            <span className="text-yellow-300 text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingDashboard;
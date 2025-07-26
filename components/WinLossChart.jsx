"use client"
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const PairsRatio3DChart = () => {
  const [pairsData, setPairsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);
  const containerRef = useRef(null);

  // Predefined colors for different currency pairs
  const pairColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];

  // Responsive dimensions hook
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth < 1024;
        
        let size;
        if (isMobile) {
          size = Math.min(clientWidth - 32, 350);
        } else if (isTablet) {
          size = Math.min(clientWidth * 0.5, 450);
        } else {
          size = Math.min(clientWidth * 0.5, 600);
        }
        
        setDimensions({ width: size, height: size });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const fetchPairsData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/trades');
        if (!response.ok) {
          throw new Error(`Failed to fetch trades: ${response.status} ${response.statusText}`);
        }
        const trades = await response.json();

        // Process pairs data from your API
        const pairStats = {};
        trades.forEach(trade => {
          if (!trade.pair) return; // Skip trades without pair data
          
          if (!pairStats[trade.pair]) {
            pairStats[trade.pair] = { wins: 0, losses: 0, total: 0 };
          }
          pairStats[trade.pair].total++;
          if ((trade.pnl || 0) > 0) {
            pairStats[trade.pair].wins++;
          } else {
            pairStats[trade.pair].losses++;
          }
        });

        const data = Object.entries(pairStats).map(([pair, stats], index) => ({
          name: pair,
          value: stats.total,
          winRate: (stats.wins / stats.total) * 100,
          wins: stats.wins,
          losses: stats.losses,
          color: pairColors[index % pairColors.length]
        }));

        setPairsData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching pairs data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPairsData();
  }, []);

  useEffect(() => {
    if (loading || error || pairsData.length === 0 || !dimensions.width) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    
    const camera = new THREE.PerspectiveCamera(75, dimensions.width / dimensions.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const rimLight = new THREE.DirectionalLight(0x00ffff, 0.3);
    rimLight.position.set(-10, -10, -5);
    scene.add(rimLight);

    // Create 3D pie chart
    const totalTrades = pairsData.reduce((sum, pair) => sum + pair.value, 0);
    let currentAngle = 0;
    const isMobile = dimensions.width < 400;
    const radius = isMobile ? 4 : 7;
    const height = isMobile ? 1.2 : 1.8;
    const group = new THREE.Group();

    pairsData.forEach((pair, index) => {
      const angle = (pair.value / totalTrades) * Math.PI * 2;
      
      const geometry = new THREE.CylinderGeometry(radius, radius, height, 32, 1, false, currentAngle, angle);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(pair.color),
        shininess: 100,
        specular: 0x222222,
        transparent: true,
        opacity: 0.9
      });

      const slice = new THREE.Mesh(geometry, material);
      slice.castShadow = true;
      slice.receiveShadow = true;
      
      const glowGeometry = new THREE.CylinderGeometry(radius * 1.02, radius * 1.02, height * 1.1, 32, 1, false, currentAngle, angle);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(pair.color),
        transparent: true,
        opacity: 0.1
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      
      group.add(slice);
      group.add(glow);
      
      currentAngle += angle;
    });

    // Add base platform
    const baseGeometry = new THREE.CylinderGeometry(radius * 1.1, radius * 1.1, 0.1, 64);
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: 0x1e293b,
      shininess: 50
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -height / 2 - 0.1;
    base.receiveShadow = true;
    group.add(base);

    scene.add(group);
    
    // Add text labels with responsive sizing
    const textGroup = new THREE.Group();
    
    const centerCanvas = document.createElement('canvas');
    const centerContext = centerCanvas.getContext('2d');
    const canvasSize = isMobile ? 300 : 500;
    const canvasHeight = isMobile ? 200 : 300;
    centerCanvas.width = canvasSize;
    centerCanvas.height = canvasHeight;
    
    centerContext.fillStyle = 'rgba(15, 23, 42, 0.95)';
    centerContext.fillRect(0, 0, centerCanvas.width, centerCanvas.height);
    
    centerContext.strokeStyle = '#06b6d4';
    centerContext.lineWidth = 3;
    centerContext.strokeRect(15, 15, centerCanvas.width - 30, centerCanvas.height - 30);
    
    const totalWins = pairsData.reduce((sum, pair) => sum + pair.wins, 0);
    const overallWinRate = (totalWins / totalTrades * 100).toFixed(1);
    
    const fontSize = isMobile ? 18 : 32;
    const smallFontSize = isMobile ? 16 : 28;
    const tinyFontSize = isMobile ? 14 : 22;
    
    centerContext.fillStyle = '#ffffff';
    centerContext.font = `bold ${fontSize}px Arial`;
    centerContext.textAlign = 'center';
    centerContext.fillText('TRADING', centerCanvas.width / 2, isMobile ? 40 : 60);
    centerContext.fillText('OVERVIEW', centerCanvas.width / 2, isMobile ? 60 : 100);
    
    centerContext.fillStyle = '#10b981';
    centerContext.font = `bold ${smallFontSize}px Arial`;
    centerContext.fillText(`${totalTrades} Trades`, centerCanvas.width / 2, isMobile ? 90 : 150);
    
    centerContext.fillStyle = '#06b6d4';
    centerContext.font = `bold ${isMobile ? 14 : 26}px Arial`;
    centerContext.fillText(`${overallWinRate}% Win Rate`, centerCanvas.width / 2, isMobile ? 110 : 185);
    
    centerContext.fillStyle = '#8b5cf6';
    centerContext.font = `bold ${tinyFontSize}px Arial`;
    centerContext.fillText(`${pairsData.length} Pairs`, centerCanvas.width / 2, isMobile ? 130 : 220);
    
    const centerTexture = new THREE.CanvasTexture(centerCanvas);
    const centerSpriteMaterial = new THREE.SpriteMaterial({ 
      map: centerTexture, 
      transparent: true,
      opacity: 0.95
    });
    const centerSprite = new THREE.Sprite(centerSpriteMaterial);
    centerSprite.position.set(0, 2.0, 0);
    centerSprite.scale.set(isMobile ? 3 : 5, isMobile ? 2 : 3, 1);
    
    textGroup.add(centerSprite);
    scene.add(textGroup);
    
    const cameraDistance = isMobile ? 12 : 15;
    camera.position.set(cameraDistance * 0.67, cameraDistance * 0.53, cameraDistance);
    camera.lookAt(0, 0, 0);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      group.rotation.y += 0.005;
      group.position.y = Math.sin(Date.now() * 0.001) * 0.1;
      renderer.render(scene, camera);
    };

    sceneRef.current = scene;
    rendererRef.current = renderer;
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [pairsData, loading, error, dimensions]);

  if (loading) {
    return (
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Currency Pairs Trading Ratio</h2>
          <div className="flex items-center justify-center h-[300px] md:h-[600px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Currency Pairs Trading Ratio</h2>
          <div className="flex items-center justify-center h-[300px] md:h-[600px]">
            <div className="text-red-400">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative group w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-500"></div>
      <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 md:p-8 w-full flex flex-col">
        
        {/* Title */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-3xl font-bold text-white">Currency Pairs Trading Ratio</h2>
        </div>
        
        <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* 3D Chart */}
          <div className="flex-1 flex justify-center items-center">
            <div className="relative">
              <div ref={mountRef} className="rounded-lg overflow-hidden shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-lg pointer-events-none"></div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex-1 flex flex-col gap-4 md:gap-6">
            {/* Overall Stats */}
           
            
            {/* Pairs Breakdown */}
            <div className="relative group/card flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-lg blur-lg group-hover/card:opacity-30 transition-all duration-300"></div>
              <div className="relative bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-lg p-4 md:p-6 h-full flex flex-col">
                <h3 className="text-lg md:text-xl font-bold text-white mb-10 flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                  Pairs Breakdown
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2 md:space-y-10 custom-scrollbar">
                  {pairsData.map((pair, index) => (
                    <div key={pair.name} className="group/item p-3 md:p-4 bg-slate-800/30 rounded-lg border border-slate-600/50 hover:bg-slate-800/50 transition-all duration-200 hover:scale-105">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div 
                            className="w-3 h-3 md:w-4 md:h-4 rounded-full shadow-lg ring-2 ring-white/20"
                            style={{ backgroundColor: pair.color }}
                          ></div>
                          <span className="text-sm md:text-lg font-bold text-white">{pair.name}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm md:text-lg font-bold ${pair.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {pair.winRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 md:gap-4 text-xs md:text-sm">
                          <span className="text-slate-300">
                            <span className="text-emerald-400 font-semibold">{pair.wins}</span> Wins
                          </span>
                          <span className="text-slate-300">
                            <span className="text-red-400 font-semibold">{pair.losses}</span> Losses
                          </span>
                        </div>
                        <div className="text-xs md:text-sm text-slate-400">
                          {pair.value} total
                        </div>
                      </div>
                      
                      <div className="mt-2 md:mt-3">
                        <div className="w-full bg-slate-600 rounded-full h-1.5 md:h-2">
                          <div 
                            className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${pair.winRate >= 50 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                            style={{ width: `${pair.winRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
        @media (max-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 3px;
          }
        }
      `}</style>
    </div>
  );
};

export default PairsRatio3DChart;
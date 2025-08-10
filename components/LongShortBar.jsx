import React, { useRef, useState, useEffect, useCallback } from 'react';

// Single 3D Bar with Long/Short segments
const UnifiedBar = ({ longPercentage, shortPercentage }) => {
  const [animatedLong, setAnimatedLong] = useState(0);
  const [animatedShort, setAnimatedShort] = useState(0);
  
  // Smooth animation
  useEffect(() => {
    let animationId;
    const animate = () => {
      setAnimatedLong(prev => {
        const target = longPercentage;
        const newValue = prev + (target - prev) * 0.08;
        return Math.abs(newValue - target) < 0.1 ? target : newValue;
      });
      setAnimatedShort(prev => {
        const target = shortPercentage;
        const newValue = prev + (target - prev) * 0.08;
        return Math.abs(newValue - target) < 0.1 ? target : newValue;
      });
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [longPercentage, shortPercentage]);
  
  return (
    <div className="relative w-full max-w-2xl mx-auto">
       
      {/* Single unified bar container */}
      <div className="relative h-20 bg-slate-800/50 rounded-2xl overflow-hidden border border-blue-800/30 shadow-2xl">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-slate-800/30 to-cyan-900/20 rounded-2xl" />
        
        {/* Long segment (left side) */}
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-l-2xl transition-all duration-500 ease-out shadow-lg"
          style={{ 
            width: `${animatedLong}%`,
            boxShadow: `0 0 20px rgba(59, 130, 246, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.2)`
          }}
        >
          {/* Long segment glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-blue-400/30 rounded-l-2xl" />
          
          {/* Long percentage text */}
          {animatedLong > 10 && (
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl drop-shadow-lg">
              {Math.round(animatedLong)}%
            </div>
          )}
        </div>
        
        {/* Short segment (right side) */}
        <div 
          className="absolute right-0 top-0 h-full bg-gradient-to-l from-cyan-500 to-cyan-600 rounded-r-2xl transition-all duration-500 ease-out shadow-lg"
          style={{ 
            width: `${animatedShort}%`,
            boxShadow: `0 0 20px rgba(6, 182, 212, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.2)`
          }}
        >
          {/* Short segment glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/50 to-cyan-400/30 rounded-r-2xl" />
          
          {/* Short percentage text */}
          {animatedShort > 10 && (
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl drop-shadow-lg">
              {Math.round(animatedShort)}%
            </div>
          )}
        </div>
        
        {/* Center divider line */}
        <div 
          className="absolute top-2 bottom-2 w-0.5 bg-slate-300/50 transition-all duration-500"
          style={{ left: `${animatedLong}%` }}
        />
      </div>
      
      {/* Bar labels */}
      <div className="flex justify-between mt-4 px-2">
        <div className="text-blue-400 font-semibold">LONG</div>
        <div className="text-cyan-400 font-semibold">SHORT</div>
      </div>
    </div>
  );
};

// Main component
const LongShortBar3D = ({ initialLongPercentage = 70, initialShortPercentage = 30 }) => {
  const [long, setLong] = useState(initialLongPercentage);
  const [short, setShort] = useState(initialShortPercentage);
  
  // Sample trade data - you can make these props or state as needed
  const longTrades = 120;
  const shortTrades = 80;
  const totalTrades = longTrades + shortTrades;
  
  const isValid = long >= 0 && short >= 0 && (long + short === 100);
  
  const handleLongChange = useCallback((e) => {
    const newLong = parseFloat(e.target.value);
    const newShort = 100 - newLong;
    setLong(newLong);
    setShort(newShort);
  }, []);
  
  if (!isValid) {
    return (
      <div className="flex flex-col space-y-2 p-6 bg-red-900/20 rounded-xl border border-red-800/30 text-red-300">
        <p>Error: Invalid percentage values. Percentages must sum to 100.</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col w-full items-center p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 rounded-3xl border border-blue-800/30 shadow-2xl mx-auto backdrop-blur-sm">
     
      <div className="relative mb-4">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 text-center">
          Long/Short Ratio
        </h2>
      </div> 

      {/* Total Trades Section */}
      <div className="w-full mb-4 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
        <div className="text-center mb-3">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Total Trades</h3>
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 font-mono">
            {totalTrades}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700/40 text-center">
            <div className="text-blue-300 text-sm font-medium">Long Trades</div>
            <div className="text-xl font-bold text-blue-400 font-mono">{longTrades}</div>
          </div>
          
          <div className="bg-cyan-900/30 p-3 rounded-lg border border-cyan-700/40 text-center">
            <div className="text-cyan-300 text-sm font-medium">Short Trades</div>
            <div className="text-xl font-bold text-cyan-400 font-mono">{shortTrades}</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 text-lg font-medium mb-5">
        <div className="flex items-center text-blue-300 bg-blue-900/20 px-4 py-2 rounded-full border border-blue-700/30 backdrop-blur-sm">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-3 shadow-lg shadow-blue-500/50"></div>
          Long
        </div>
        <div className="flex items-center text-cyan-300 bg-cyan-900/20 px-4 py-2 rounded-full border border-cyan-700/30 backdrop-blur-sm">
          <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full mr-3 shadow-lg shadow-cyan-500/50"></div>
          Short
        </div>
      </div>
      
      {/* Single Unified Bar */}
      <div className="w-full mt-3 mb-0">
        <UnifiedBar longPercentage={long} shortPercentage={short} />
      </div>
      
      {/* Analytics Summary */}
      <div className="grid grid-cols-2 gap-4 mt-1">
        <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-700/30 text-center backdrop-blur-sm">
          <div className="text-blue-300 text-sm font-medium">Dominance</div>
          <div className="text-blue-400 text-lg font-bold">
            {long > short ? 'LONG' : short > long ? 'SHORT' : 'BALANCED'}
          </div>
        </div>
        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-600/30 text-center backdrop-blur-sm">
          <div className="text-slate-300 text-sm font-medium">Ratio</div>
          <div className="text-slate-200 text-lg font-bold font-mono">
            {short > 0 ? (long/short).toFixed(2) : '∞'}:1
          </div>
        </div>
      </div>
    </div>
  );
};


export default LongShortBar3D;
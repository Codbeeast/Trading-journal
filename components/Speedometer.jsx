"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { animate } from "framer-motion";
import { useTrades } from '@/context/TradeContext';

// Skeleton Loading Component
const SpeedometerSkeleton = () => {
  return (
    <div className="group relative rounded-3xl  backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-black/20 rounded-3xl animate-pulse border border-gray-800" />
      
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-[-50px]">
        <div className="w-16 h-6 bg-gray-700/30 rounded-lg animate-pulse" />
      </div>

      {/* Speedometer skeleton */}
      <div className="flex flex-col items-center relative">
        <div className="relative w-56 h-56 mb-[-50px]">
          <div className="w-full h-full rounded-full border-4 border-gray-700/30 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-700/30 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Value skeleton */}
        <div className="text-center space-y-2">
          <div className="w-20 h-12 bg-gray-700/30 rounded-lg animate-pulse mx-auto" />
          <div className="w-24 h-4 bg-gray-700/30 rounded animate-pulse mx-auto" />
        </div>
      </div>

      {/* Progress bar skeleton */}
      <div className="mt-1 space-y-3">
        <div className="flex justify-center space-x-1">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="h-1.5 w-3 rounded-full bg-gray-700/30 animate-pulse" />
          ))}
        </div>
        <div className="flex justify-between px-1">
          <div className="w-6 h-3 bg-gray-700/30 rounded animate-pulse" />
          <div className="w-8 h-3 bg-gray-700/30 rounded animate-pulse" />
          <div className="w-8 h-3 bg-gray-700/30 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// Enhanced Large Speedometer Card Component with Sequential Animation
const SpeedometerCard = ({ label, value, target, min = 0, max = 100, color = '#f97316', comparison, isLoading = false, animationDelay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [displayedValue, setDisplayedValue] = useState(0);
  const [isComponentReady, setIsComponentReady] = useState(false);
  const animationRef = useRef(null);
  const cardRef = useRef(null);

  const controls = useAnimation();
  const motionValue = useMotionValue(0);
 
  // Ensure value is within bounds (0-100)
  const clampedValue = Math.max(0, Math.min(100, value));
  const targetPercentage = ((clampedValue - min) / (max - min)) * 100;

  // Helper function for consistent segment threshold calculation
  const getSegmentOpacity = (progress, segmentIndex, totalSegments) => {
    const segmentStart = (segmentIndex / totalSegments) * 100;
    const segmentEnd = ((segmentIndex + 1) / totalSegments) * 100;
    
    let opacity = 0;
    let intensity = 0;
    
    if (progress >= segmentEnd) {
      opacity = 1;
      intensity = 1;
    } else if (progress >= segmentStart) {
      const progressRatio = (progress - segmentStart) / (segmentEnd - segmentStart);
      opacity = Math.pow(progressRatio, 0.8);
      intensity = progressRatio;
    }
    
    return { opacity, intensity, isActive: opacity > 0 };
  };

  // Check if component is fully rendered and ready
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is painted
    const frame = requestAnimationFrame(() => {
      setIsComponentReady(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hasAnimated && !isLoading && isComponentReady) {
      // Cancel any existing animation
      if (animationRef.current) {
        animationRef.current.stop();
      }

      // Reset initial values
      motionValue.set(0);
      setCurrentProgress(0);
      setDisplayedValue(0);

      // Sequential animation: 0 → 100 → target value
      const startAnimation = async () => {
        // Wait for the specified delay
        if (animationDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, animationDelay));
        }

        // Phase 1: Animate to 100% with smooth easing
        const phase1Animation = animate(0, 100, {
          duration: 2,
          ease: [0.4, 0, 0.2, 1], // More natural easing
          onUpdate: (latest) => {
            // Use requestAnimationFrame for smoother updates
            requestAnimationFrame(() => {
              setCurrentProgress(latest);
              setDisplayedValue(Math.round(latest));
            });
          }
        });

        animationRef.current = phase1Animation;
        await phase1Animation;

        // Small pause at 100%
        await new Promise(resolve => setTimeout(resolve, 400));

        // Phase 2: Settle down to target value with bounce effect
        const phase2Animation = animate(100, targetPercentage, {
          duration: 1.8,
          ease: [0.34, 1.56, 0.64, 1], // Smooth settle with slight overshoot
          onUpdate: (latest) => {
            requestAnimationFrame(() => {
              setCurrentProgress(latest);
              // Fix rounding mismatch by snapping to nearest integer
              const proportionalValue = (latest / 100) * clampedValue;
              setDisplayedValue(Math.round(proportionalValue));
            });
          },
          onComplete: () => {
            requestAnimationFrame(() => {
              setHasAnimated(true);
              setCurrentProgress(targetPercentage);
              setDisplayedValue(clampedValue); // Force exact final value
            });
          }
        });

        animationRef.current = phase2Animation;
      };

      startAnimation().catch(console.error);

      return () => {
        if (animationRef.current) {
          animationRef.current.stop();
        }
      };
    }
  }, [targetPercentage, hasAnimated, motionValue, isLoading, clampedValue, isComponentReady, animationDelay]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  if (isLoading) {
    return <SpeedometerSkeleton />;
  }

  return (
    <motion.div
      ref={cardRef}
      className="group relative rounded-3xl  transition-all duration-500 backdrop-blur-xl text-gray-200 border border-gray-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Animated Border Glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${color}20, transparent, ${color}20)`,
          padding: '2px',
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Glassmorphic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/2 to-transparent rounded-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-[-50px]">
        {/* Comparison Badge */}
        <div className="flex items-center space-x-3">
          {comparison && (
            <motion.div
              className={`px-3 py-1 rounded-lg text-sm font-bold flex items-center space-x-2 backdrop-blur-sm border ${comparison > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                  : comparison < 0
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-lg shadow-red-500/20'
                    : 'bg-gray-500/20 text-gray-300 border-gray-500/40'
                }`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + animationDelay / 1000 }}
            >
              <motion.span
                className="text-sm inline-block"
                initial={{ rotate: 0 }}
                animate={{ rotate: comparison > 0 ? -45 : comparison < 0 ? 45 : 0 }}
                transition={{ duration: 0.3, delay: 0.5 + animationDelay / 1000 }}
              >
                →
              </motion.span>
              <span>{Math.abs(comparison)}%</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Large Speedometer */}
      <div className="flex flex-col items-center relative">
        <div className="relative w-56 h-56 mb-[-50px]">
          <svg className="w-full h-full filter drop-shadow-2xl" viewBox="0 0 400 220">
            {/* Background Ring */}
            <circle
              cx="200"
              cy="170"
              r="150"
              fill="none"
              stroke="url(#slate-gradient)"
              strokeWidth="2"
              opacity="0.3"
            />

            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="slate-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4b5563" />
                <stop offset="100%" stopColor="#374151" />
              </linearGradient>
            </defs>

            {/* Animated segments with smooth progression */}
            {[...Array(30)].map((_, i) => {
              const startAngle = 180 - i * 6;
              const endAngle = startAngle - 4;
             
              const outerRadius = 200;
              const innerRadius = 160;

              const x1 = 200 + outerRadius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 170 - outerRadius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 200 + innerRadius * Math.cos((startAngle * Math.PI) / 180);
              const y2 = 170 - innerRadius * Math.sin((startAngle * Math.PI) / 180);
              const x3 = 200 + innerRadius * Math.cos((endAngle * Math.PI) / 180);
              const y3 = 170 - innerRadius * Math.sin((endAngle * Math.PI) / 180);
              const x4 = 200 + outerRadius * Math.cos((endAngle * Math.PI) / 180);
              const y4 = 170 - outerRadius * Math.sin((endAngle * Math.PI) / 180);

              // Use helper function for consistent threshold calculation
              const { opacity: segmentOpacity, intensity: segmentIntensity, isActive } = getSegmentOpacity(currentProgress, i, 30);

              return (
                <g key={i}>
                  <path
                    d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`}
                    fill={isActive ? color : '#4b5563'}
                    opacity={isActive ? (0.4 + segmentOpacity * 0.6) : 0.3}
                    style={{
                      filter: 'none',
                      transition: 'all 0.05s ease-out'
                    }}
                  />
                </g>
              );
            })}

            {/* Center dot */}
            <motion.circle
              cx="200"
              cy="170"
              r="6"
              fill="#1f2937"
              stroke="#ffffff"
              strokeWidth="2"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + animationDelay / 1000 }}
            />
            <motion.circle
              cx="200"
              cy="170"
              r="3"
              fill={color}
              opacity="0.9"
              style={{
                filter: `drop-shadow(0 0 6px ${color})`
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + animationDelay / 1000 }}
            />

            {/* Value markers */}
            <text x="60" y="180" fill="#9ca3af" fontSize="12" textAnchor="middle" className="font-semibold">0</text>
            <text x="200" y="40" fill="#9ca3af" fontSize="12" textAnchor="middle" className="font-semibold">50</text>
            <text x="340" y="180" fill="#9ca3af" fontSize="12" textAnchor="middle" className="font-semibold">100</text>

            {/* Quarter markers */}
            <text x="120" y="90" fill="#6b7280" fontSize="10" textAnchor="middle" className="font-medium">25</text>
            <text x="280" y="90" fill="#6b7280" fontSize="10" textAnchor="middle" className="font-medium">75</text>
          </svg>
        </div>

        {/* Enhanced Value Display */}
        <div className="text-center space-y-2">
          <div className="relative">
            <motion.div
              className="text-4xl font-black tracking-tight mb-2 relative"
              style={{
                color: color,
                textShadow: `0 0 20px ${color}60, 0 0 40px ${color}30`,
                fontFamily: 'ui-monospace, monospace'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 + animationDelay / 1000 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + animationDelay / 1000 }}
              >
                {displayedValue}
              </motion.span>
              <span className="text-lg text-white/90 font-light ml-1">%</span>
            </motion.div>
          </div>

          <motion.div
            className="text-sm font-bold text-gray-200 uppercase tracking-[0.2em] mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + animationDelay / 1000 }}
          >
            {label}
          </motion.div>
        </div>
      </div>

      {/* Enhanced Progress Indicator */}
      <div className="mt-1 space-y-3">
        {/* Large Segmented Progress Bar with smooth progression */}
        <div className="flex justify-center space-x-1">
          {[...Array(20)].map((_, i) => {
            // Use helper function for consistent threshold calculation
            const { opacity: segmentOpacity, intensity: segmentIntensity, isActive } = getSegmentOpacity(currentProgress, i, 20);
            const segmentScale = 1 + (segmentIntensity * 0.2);

            return (
              <div
                key={i}
                className="h-1.5 w-3 rounded-full transition-all duration-75 ease-out"
                style={{
                  backgroundColor: isActive ? color : '#4b5563',
                  transform: `scaleY(${segmentScale})`,
                  opacity: isActive ? (0.5 + segmentOpacity * 0.5) : 0.5,
                  boxShadow: isActive && segmentOpacity > 0.7
                    ? `0 0 ${8 + segmentOpacity * 8}px ${color}60, 0 0 ${16 + segmentOpacity * 16}px ${color}30`
                    : '0 0 0px transparent',
                }}
              />
            );
          })}
        </div>

        {/* Progress percentage labels */}
        <motion.div
          className="flex justify-between text-xs text-gray-400 font-mono px-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 + animationDelay / 1000 }}
        >
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Enhanced Dashboard Component with proper metric calculations
const SpeedometerGrid = ({ isLoading, onMetricsChange }) => {
  const { trades, loading, error, fetchTrades } = useTrades();

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Calculate metrics from trade data with proper bounds
  const metrics = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        fomoControl: 0,
        executionRate: 0,
        patienceLevel: 0,
        confidenceIndex: 0,
        fearGreed: 50, // Neutral at 50
        fomoComparison: 0,
        executionComparison: 0,
        patienceComparison: 0,
        confidenceComparison: 0,
        fearGreedComparison: 0
      };
    }

    // Helper function to ensure values are between 0 and 100
    const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

    // Calculate averages from trade ratings (assuming ratings are 1-5 scale)
    const fomoRatings = trades.filter(t => t.fomoRating && t.fomoRating > 0).map(t => t.fomoRating);
    const executionRatings = trades.filter(t => t.executionRating && t.executionRating > 0).map(t => t.executionRating);
    const fearGreedRatings = trades.filter(t => t.fearToGreed && t.fearToGreed > 0).map(t => t.fearToGreed);

    // Calculate averages (1-5 scale converted to 0-100)
    const avgFomo = fomoRatings.length > 0 
      ? (fomoRatings.reduce((a, b) => a + b, 0) / fomoRatings.length) * 20 
      : 50;
    
    const avgExecution = executionRatings.length > 0 
      ? (executionRatings.reduce((a, b) => a + b, 0) / executionRatings.length) * 20 
      : 50;
    
    const avgFearGreed = fearGreedRatings.length > 0 
      ? (fearGreedRatings.reduce((a, b) => a + b, 0) / fearGreedRatings.length) * 20 
      : 50;

    // Calculate win rate for confidence
    const profitableTrades = trades.filter(t => (t.pnl || 0) > 0).length;
    const winRate = trades.length > 0 ? (profitableTrades / trades.length) * 100 : 0;

    // Calculate patience level based on setup types and execution quality
    const setupQuality = trades.filter(t => t.setupType && t.setupType !== 'Impulse').length;
    const patienceFromSetups = trades.length > 0 ? (setupQuality / trades.length) * 100 : 50;
    const patienceLevel = (avgExecution * 0.6) + (patienceFromSetups * 0.4);

    return {
      fomoControl: clamp(100 - avgFomo), // Invert FOMO (lower FOMO rating = better control)
      executionRate: clamp(avgExecution),
      patienceLevel: clamp(patienceLevel),
      confidenceIndex: clamp(winRate),
      fearGreed: clamp(avgFearGreed),
      // Mock comparison data - you can calculate these based on historical data
      fomoComparison: Math.floor(Math.random() * 21) - 10, // -10 to +10
      executionComparison: Math.floor(Math.random() * 21) - 10,
      patienceComparison: Math.floor(Math.random() * 21) - 10,
      confidenceComparison: Math.floor(Math.random() * 21) - 10,
      fearGreedComparison: Math.floor(Math.random() * 21) - 10
    };
  }, [trades]);

  // Notify parent component of metrics change in useEffect
  useEffect(() => {
    if (onMetricsChange && metrics) {
      onMetricsChange(metrics);
    }
  }, [metrics, onMetricsChange]);

  if (error) {
    return (
      <div className="text-center text-red-400 py-8">
        <p>Error loading trade data: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="space-y-8 max-w-full mx-auto">
        {/* First Row - 3 cards */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <SpeedometerCard
            label="FOMO Control"
            value={metrics.fomoControl}
            target={80}
            color="#ef4444"
            comparison={metrics.fomoComparison}
            isLoading={isLoading || loading}
            animationDelay={0}
          />
          <SpeedometerCard
            label="Execution Rate"
            value={metrics.executionRate}
            target={85}
            color="#10b981"
            comparison={metrics.executionComparison}
            isLoading={isLoading || loading}
            animationDelay={300}
          />
          <SpeedometerCard
            label="Patience Level"
            value={metrics.patienceLevel}
            target={75}
            color="#3b82f6"
            comparison={metrics.patienceComparison}
            isLoading={isLoading || loading}
            animationDelay={600}
          />
        </motion.div>

        {/* Second Row - 2 cards centered */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-5xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <SpeedometerCard
            label="Confidence Index"
            value={metrics.confidenceIndex}
            target={80}
            color="#f59e0b"
            comparison={metrics.confidenceComparison}
            isLoading={isLoading || loading}
            animationDelay={900}
          />
          <SpeedometerCard
            label="Fear & Greed"
            value={metrics.fearGreed}
            target={50}
            color="#8b5cf6"
            comparison={metrics.fearGreedComparison}
            isLoading={isLoading || loading}
            animationDelay={1200}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SpeedometerGrid;

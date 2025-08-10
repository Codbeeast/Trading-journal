"use client";

import React from 'react';
import { useTrades } from '../context/TradeContext'; // Your actual hook

const TradeStatistics = () => {
  const { trades, loading, error } = useTrades();

  const tradeStatsColors = [
    'from-blue-500 to-cyan-500',
    'from-red-500 to-rose-500', 
    'from-green-500 to-emerald-500',
    'from-orange-500 to-amber-500',
    'from-purple-500 to-violet-500',
    'from-pink-500 to-rose-500'
  ];

  const calculateTradeStatistics = (tradeData) => {
    if (!tradeData || tradeData.length === 0) {
      return [
        { label: 'BW', fullName: 'Biggest Win', value: '0', color: tradeStatsColors[0], currency: true },
        { label: 'BL', fullName: 'Biggest Loss', value: '0', color: tradeStatsColors[1], currency: true },
        { label: 'CW', fullName: 'Consecutive Wins', value: '0', color: tradeStatsColors[2] },
        { label: 'CL', fullName: 'Consecutive Losses', value: '0', color: tradeStatsColors[3] },
        { label: 'AW', fullName: 'Average Win', value: '0', color: tradeStatsColors[4], currency: true },
        { label: 'AL', fullName: 'Average Loss', value: '0', color: tradeStatsColors[5], currency: true },
      ];
    }

    let biggestWin = 0;
    let biggestLoss = 0;
    let currentConsecutiveWins = 0;
    let maxConsecutiveWins = 0;
    let currentConsecutiveLosses = 0;
    let maxConsecutiveLosses = 0;
    let totalWinsPnl = 0;
    let winCount = 0;
    let totalLossesPnl = 0;
    let lossCount = 0;

    tradeData.forEach(trade => {
      const pnl = trade.pnl || 0;

      if (pnl > biggestWin) {
        biggestWin = pnl;
      }
      if (pnl < biggestLoss) {
        biggestLoss = pnl;
      }

      if (pnl > 0) {
        currentConsecutiveWins++;
        currentConsecutiveLosses = 0;
        totalWinsPnl += pnl;
        winCount++;
      } else if (pnl < 0) {
        currentConsecutiveLosses++;
        currentConsecutiveWins = 0;
        totalLossesPnl += pnl;
        lossCount++;
      } else {
        currentConsecutiveWins = 0;
        currentConsecutiveLosses = 0;
      }

      if (currentConsecutiveWins > maxConsecutiveWins) {
        maxConsecutiveWins = currentConsecutiveWins;
      }
      if (currentConsecutiveLosses > maxConsecutiveLosses) {
        maxConsecutiveLosses = currentConsecutiveLosses;
      }
    });

    const averageWin = winCount > 0 ? (totalWinsPnl / winCount) : 0;
    const averageLoss = lossCount > 0 ? (totalLossesPnl / lossCount) : 0;

    return [
      {
        label: 'BW',
        fullName: 'Biggest Win',
        value: biggestWin.toFixed(2),
        color: tradeStatsColors[0],
        currency: true
      },
      {
        label: 'BL',
        fullName: 'Biggest Loss',
        value: biggestLoss.toFixed(2),
        color: tradeStatsColors[1],
        currency: true
      },
      {
        label: 'CW',
        fullName: 'Consecutive Wins',
        value: maxConsecutiveWins.toString(),
        color: tradeStatsColors[2]
      },
      {
        label: 'CL',
        fullName: 'Consecutive Losses',
        value: maxConsecutiveLosses.toString(),
        color: tradeStatsColors[3]
      },
      {
        label: 'AW',
        fullName: 'Average Win',
        value: averageWin.toFixed(2),
        color: tradeStatsColors[4],
        currency: true
      },
      {
        label: 'AL',
        fullName: 'Average Loss',
        value: averageLoss.toFixed(2),
        color: tradeStatsColors[5],
        currency: true
      },
    ];
  };

  const tradeStatistics = calculateTradeStatistics(trades);

  if (loading) {
    return (
      <div className="space-y-4 mt-5">
        <h2 className="text-xl font-bold text-blue-400 mb-10">Trade Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          {tradeStatsColors.map((colorClass, index) => (
            <div key={index} className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-r ${colorClass} opacity-10 rounded-xl blur-xl animate-pulse`}></div>
              <div className="relative border border-blue-900/30 rounded-xl p-4 bg-black">
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-4 bg-gradient-to-r ${colorClass} opacity-50 rounded animate-pulse`}></div>
                  <div className={`w-8 h-6 bg-gradient-to-r ${colorClass} opacity-50 rounded animate-pulse`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 mt-5">
        <h2 className="text-xl font-bold text-blue-400 mb-10">Trade Statistics</h2>
        <div className="text-red-400 text-center">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-2">
      <h2 className="text-xl font-bold text-blue-400 mb-6">Trade Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        {tradeStatistics.map((stat, index) => (
          <div key={index} className="relative group">
            {/* Dynamic gradient background glow using stat's color */}
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10 rounded-xl blur-xl group-hover:opacity-20 transition-all duration-300`}></div>
            
            {/* Main card with dynamic border */}
            <div className="relative border border-blue-900/30 rounded-xl p-4 bg-black hover:border-blue-800/50 transition-all duration-300 group-hover:transform group-hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                {/* Dynamic gradient text for label */}
                <span className={`text-transparent bg-gradient-to-r ${stat.color} bg-clip-text text-sm font-medium`}>
                  {stat.label}
                </span>
                {/* Fixed: Added whitespace-nowrap to prevent line wrapping */}
                <span className="text-blue-200 text-xl font-bold group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                  {stat.currency && '$'}{stat.value}
                </span>
              </div>
              
              {/* Dynamic separator line */}
              <div className={`h-px bg-gradient-to-r ${stat.color} opacity-30 mb-2 group-hover:opacity-50 transition-opacity duration-300`}></div>
              
              <div className="text-xs text-blue-400/70 border-t border-blue-900/30 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="group-hover:text-blue-300 transition-colors duration-300">
                    {stat.fullName}
                  </span>
                  {/* Dynamic indicator dot */}
                  <div className={`w-2 h-2 bg-gradient-to-r ${stat.color} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              </div>
              
              {/* Subtle inner glow */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5 rounded-xl group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeStatistics;
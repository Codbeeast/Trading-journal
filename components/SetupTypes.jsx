"use client";

import React from 'react';
import { useTrades } from '../context/TradeContext'; // Adjust path as needed

const TradeStatistics = () => {
  const { trades, loading, error } = useTrades();

  const tradeStatsColors = [
    'from-blue-600 to-blue-400',
    'from-green-600 to-green-400',
    'from-red-600 to-red-400',
    'from-purple-600 to-purple-400',
    'from-indigo-600 to-indigo-400',
    'from-orange-600 to-orange-400',
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
      const pnl = trade.pnl || 0; // Ensure pnl is a number, default to 0

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
      } else { // pnl is 0 (break streak)
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
        <h2 className="text-xl font-bold text-white mb-10">Trade Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-20 rounded-lg blur-lg"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-4 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-8 h-6 bg-gray-600 rounded animate-pulse"></div>
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
        <h2 className="text-xl font-bold text-white mb-10">Trade Statistics</h2>
        <div className="text-red-400 text-center">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-2">
      <h2 className="text-xl font-bold text-white mb-6">Trade Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        {tradeStatistics.map((stat, index) => (
          <div key={index} className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-20 rounded-lg blur-lg group-hover:opacity-30 transition-all duration-300`}></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
                <span className="text-white text-xl font-bold">
                  {stat.currency && '$'}
                  {stat.value}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>{stat.fullName}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeStatistics;
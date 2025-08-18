import React from 'react';
import { Calculator, TrendingUp, BarChart3 } from 'lucide-react';

// Reusable Card for metrics
const JournalCard = ({ children, className = '' }) => (
  <div className={`bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg p-5 flex flex-col gap-2 items-center justify-between w-full min-w-[180px] max-w-[240px] mx-auto transition-all duration-200 hover:scale-105 hover:shadow-2xl ${className}`}>
    {children}
  </div>
);

const JournalCards = ({ rows, sessions }) => {
  // Statistics calculations
  const totalPnL = rows.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winningTrades = rows.filter(t => t.pnl && t.pnl > 0).length;
  const totalTradesWithPnL = rows.filter(t => t.pnl !== null && t.pnl !== undefined).length;
  const winRate = totalTradesWithPnL > 0 ? (winningTrades / totalTradesWithPnL) * 100 : 0;
  const avgRFactor = rows.filter(t => t.rFactor).length > 0
    ? rows.reduce((sum, t) => sum + (t.rFactor || 0), 0) / rows.filter(t => t.rFactor).length
    : 0;

  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-6">
      <div className="col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <JournalCard>
          <Calculator className="w-6 h-6 text-gray-400 mb-2" />
          <span className="text-base font-bold text-white">Total Trades</span>
          <span className="text-xl font-extrabold text-green-400">{rows.length}</span>
          <span className="text-xs text-gray-400">{sessions.length} sessions available</span>
        </JournalCard>
        
        <JournalCard>
          <TrendingUp className="w-6 h-6 text-green-300 mb-2" />
          <span className="text-base font-bold text-white">Win Rate</span>
          <span className="text-xl font-extrabold text-green-400">{winRate.toFixed(1)}%</span>
          <span className="text-xs text-green-200">{winningTrades} wins / {totalTradesWithPnL-winningTrades} losses</span>
        </JournalCard>
        
        <JournalCard>
          <BarChart3 className="w-6 h-6 text-gray-400 mb-2" />
          <span className="text-base font-bold text-white">Total PnL</span>
          <span className="text-xl font-extrabold text-gray-200">{totalPnL.toFixed(2)}</span>
          <span className="text-xs text-gray-300">Avg: {(totalTradesWithPnL>0?(totalPnL/totalTradesWithPnL):0).toFixed(2)} per trade</span>
        </JournalCard>
        
        <JournalCard>
          <Calculator className="w-6 h-6 text-purple-300 mb-2" />
          <span className="text-base font-bold text-white">Avg R Factor</span>
          <span className="text-xl font-extrabold text-purple-400">{avgRFactor.toFixed(2)}</span>
          <span className="text-xs text-purple-200">Risk management metric</span>
        </JournalCard>
      </div>
    </div>
  );
};

export default JournalCards;

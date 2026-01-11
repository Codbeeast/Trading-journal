"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, RefreshCw, BarChart3, Info } from 'lucide-react';
import { useTrades } from '../context/TradeContext';

const MonthlyProfitChart = () => {
  const { trades, loading, error, fetchTrades } = useTrades();

  const monthlyProfitData = useMemo(() => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return { monthlyData: [], ytdAverage: 0, ytdTotal: 0, year: new Date().getFullYear(), totalTrades: 0 };
    }

    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    months.forEach(month => {
      monthlyData[month] = { name: month, profit: 0, trades: 0, percentage: 0 };
    });

    let totalProfit = 0;
    let totalTrades = 0;
    const baseCapital = 10000;

    trades.forEach(trade => {
      if (trade.date) {
        const tradeDate = new Date(trade.date);
        if (!isNaN(tradeDate.getTime()) && tradeDate.getFullYear() === currentYear) {
          const month = months[tradeDate.getMonth()];
          const pnl = parseFloat(trade.pnl) || 0;
          if (monthlyData[month]) {
            monthlyData[month].profit += pnl;
            monthlyData[month].trades += 1;
            totalProfit += pnl;
            totalTrades += 1;
          }
        }
      }
    });

    Object.values(monthlyData).forEach(month => {
      month.percentage = month.trades > 0 ? (month.profit / baseCapital) * 100 : 0;
    });

    return {
      monthlyData: Object.values(monthlyData),
      ytdAverage: totalTrades > 0 ? (totalProfit / baseCapital) * 100 : 0,
      ytdTotal: totalProfit,
      year: currentYear,
      totalTrades: totalTrades
    };
  }, [trades]);

  const getCellStyles = (percentage) => {
    if (percentage > 0) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (percentage < 0) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    return 'bg-white/5 text-gray-500 border-white/5';
  };

  if (loading) return (
    <div className="h-64 bg-white/5 rounded-2xl animate-pulse border border-white/10 mt-6" />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative group mt-6"
    >
      {/* Dynamic Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-purple-500/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-duration-500" />

      <div className="relative bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden group-hover:border-white/10 transition-all duration-300">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Percentage Profit
              </h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {monthlyProfitData.year} Performance</span>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span>Base Capital: $10,000</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-semibold text-gray-300">
              YTD: <span className={monthlyProfitData.ytdTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {monthlyProfitData.ytdAverage.toFixed(2)}%
              </span>
            </div>
            <button
              onClick={fetchTrades}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all group/btn"
              title="Sync Analytics"
            >
              <RefreshCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10 custom-scrollbar pb-2">
          <div className="grid grid-cols-13 min-w-[1000px] gap-2">
            {/* Year Label */}
            <div className="flex items-center justify-center font-bold text-gray-600 text-sm py-4">
              {monthlyProfitData.year}
            </div>

            {/* Monthly Cells */}
            {monthlyProfitData.monthlyData.map((month, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all duration-300 cursor-default group/cell
                  ${getCellStyles(month.percentage)}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2">{month.name}</span>
                <span className="text-sm font-bold tracking-tight">
                  {month.percentage === 0 ? '0.00' : month.percentage.toFixed(2)}%
                </span>
                <div className="mt-2 w-full h-[2px] bg-white/10 rounded-full overflow-hidden opacity-0 group-hover/cell:opacity-100 transition-opacity">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    className={`h-full ${month.percentage >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                  />
                </div>
              </motion.div>
            ))}

            {/* YTD Cell */}
            <div className={`flex flex-col items-center justify-between p-3 rounded-2xl border bg-gradient-to-br from-blue-500/40 to-indigo-500/20 text-white border-blue-500/40 shadow-lg shadow-blue-500/10`}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-2">YTD</span>
              <span className="text-sm font-extrabold tracking-tight">
                {monthlyProfitData.ytdAverage.toFixed(2)}%
              </span>
              <div className="mt-2 text-[9px] font-medium opacity-70">Cumulative</div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-6 text-[10px] font-medium text-gray-500 uppercase tracking-[0.2em] relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500/50 shadow-[0_0_8px_emerald]" /> Profit
            <span className="ml-4 w-2 h-2 rounded-full bg-rose-500/50 shadow-[0_0_8px_rose]" /> Loss
          </div>
          <div className="flex items-center gap-1.5 opacity-60">
            <Info className="w-3 h-3" />
            Real-time trade data analysis
          </div>
        </div>
      </div>

      <style jsx>{`
        .grid-cols-13 {
          grid-template-columns: 60px repeat(12, 1fr) 80px;
        }
      `}</style>
    </motion.div>
  );
};

export default MonthlyProfitChart;


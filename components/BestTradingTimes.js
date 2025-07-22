"use client"
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BestTradingTimes = () => {
  const [timeView, setTimeView] = useState('hours');
  const [bestTimesData, setBestTimesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestTimesData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/trades');
        if (!response.ok) {
          throw new Error('Failed to fetch trades');
        }
        const trades = await response.json();
        
        const data = generateBestTimesData(trades, timeView);
        setBestTimesData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching best times data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBestTimesData();
  }, [timeView]);

  const generateBestTimesData = (trades, viewType) => {
    if (!trades.length) return [];

    if (viewType === 'hours') {
      const timeSlots = {
        '0-4': { name: '0-4', value: 0, count: 0, wins: 0 },
        '4-8': { name: '4-8', value: 0, count: 0, wins: 0 },
        '8-12': { name: '8-12', value: 0, count: 0, wins: 0 },
        '12-16': { name: '12-16', value: 0, count: 0, wins: 0 },
        '16-20': { name: '16-20', value: 0, count: 0, wins: 0 },
        '20-24': { name: '20-24', value: 0, count: 0, wins: 0 }
      };

      trades.forEach(trade => {
        if (trade.time) {
          const time = trade.time;
          let hour = 0;
          
          if (time.includes(':')) {
            const timeParts = time.split(':');
            hour = parseInt(timeParts[0]);
            
            if (time.toLowerCase().includes('pm') && hour !== 12) {
              hour += 12;
            } else if (time.toLowerCase().includes('am') && hour === 12) {
              hour = 0;
            }
          }

          let slot = '';
          if (hour >= 0 && hour < 4) slot = '0-4';
          else if (hour >= 4 && hour < 8) slot = '4-8';
          else if (hour >= 8 && hour < 12) slot = '8-12';
          else if (hour >= 12 && hour < 16) slot = '12-16';
          else if (hour >= 16 && hour < 20) slot = '16-20';
          else if (hour >= 20 && hour < 24) slot = '20-24';

          if (slot && timeSlots[slot]) {
            timeSlots[slot].value += trade.pnl || 0;
            timeSlots[slot].count += 1;
            if ((trade.pnl || 0) > 0) {
              timeSlots[slot].wins += 1;
            }
          }
        }
      });

      return Object.values(timeSlots);
    } else {
      const daysData = {
        'Mon': { name: 'Mon', value: 0, count: 0, wins: 0 },
        'Tue': { name: 'Tue', value: 0, count: 0, wins: 0 },
        'Wed': { name: 'Wed', value: 0, count: 0, wins: 0 },
        'Thu': { name: 'Thu', value: 0, count: 0, wins: 0 },
        'Fri': { name: 'Fri', value: 0, count: 0, wins: 0 },
        'Sat': { name: 'Sat', value: 0, count: 0, wins: 0 },
        'Sun': { name: 'Sun', value: 0, count: 0, wins: 0 }
      };

      trades.forEach(trade => {
        if (trade.date) {
          const tradeDate = new Date(trade.date);
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayName = dayNames[tradeDate.getDay()];

          if (daysData[dayName]) {
            daysData[dayName].value += trade.pnl || 0;
            daysData[dayName].count += 1;
            if ((trade.pnl || 0) > 0) {
              daysData[dayName].wins += 1;
            }
          }
        }
      });

      return Object.values(daysData);
    }
  };

  if (loading) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Best Trading Times</h2>
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setTimeView('hours')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeView === 'hours' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Hours
              </button>
              <button
                onClick={() => setTimeView('days')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeView === 'days' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Days
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Best Trading Times</h2>
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setTimeView('hours')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeView === 'hours' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Hours
              </button>
              <button
                onClick={() => setTimeView('days')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeView === 'days' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Days
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-red-400">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
      <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Best Trading Times</h2>
          <div className="flex bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setTimeView('hours')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                timeView === 'hours' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Hours
            </button>
            <button
              onClick={() => setTimeView('days')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                timeView === 'days' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Days
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={bestTimesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#FFFFFF',
                zIndex: 50
              }}
              wrapperStyle={{
                zIndex: 50
              }}
              formatter={(value, name) => [
                `${value.toFixed(2)}`,
                'P&L'
              ]}
              labelFormatter={(label) => `${timeView === 'hours' ? 'Time:' : 'Day:'} ${label}`}
            />
            <Bar 
              dataKey="value" 
              fill="url(#timesGradient)"
              radius={[4, 4, 0, 0]}
              animationDuration={1800}
            />
            <defs>
              <linearGradient id="timesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BestTradingTimes;
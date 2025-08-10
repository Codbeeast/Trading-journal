"use client"
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BestTradingTimes = () => {
  const [timeView, setTimeView] = useState('hours');
  const [bestTimesData, setBestTimesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768); // you can change the threshold
    };

    checkScreen(); // Initial check
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    const fetchBestTimesData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/trades');
        if (!response.ok) {
          throw new Error(`Failed to fetch trades: ${response.status} ${response.statusText}`);
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
    if (!trades || !Array.isArray(trades) || trades.length === 0) return [];

    if (viewType === 'hours') {
      // 2-hour intervals from 0-24
      const timeSlots = {
        '0-2': { name: '0-2', value: 0, count: 0, wins: 0 },
        '2-4': { name: '2-4', value: 0, count: 0, wins: 0 },
        '4-6': { name: '4-6', value: 0, count: 0, wins: 0 },
        '6-8': { name: '6-8', value: 0, count: 0, wins: 0 },
        '8-10': { name: '8-10', value: 0, count: 0, wins: 0 },
        '10-12': { name: '10-12', value: 0, count: 0, wins: 0 },
        '12-14': { name: '12-14', value: 0, count: 0, wins: 0 },
        '14-16': { name: '14-16', value: 0, count: 0, wins: 0 },
        '16-18': { name: '16-18', value: 0, count: 0, wins: 0 },
        '18-20': { name: '18-20', value: 0, count: 0, wins: 0 },
        '20-22': { name: '20-22', value: 0, count: 0, wins: 0 },
        '22-24': { name: '22-24', value: 0, count: 0, wins: 0 }
      };

      trades.forEach(trade => {
        if (trade.time) {
          const time = trade.time;
          let hour = 0;
          
          // Parse time in various formats
          if (time.includes(':')) {
            const timeParts = time.split(':');
            hour = parseInt(timeParts[0]);
            
            // Handle AM/PM format
            if (time.toLowerCase().includes('pm') && hour !== 12) {
              hour += 12;
            } else if (time.toLowerCase().includes('am') && hour === 12) {
              hour = 0;
            }
          } else if (typeof time === 'number') {
            hour = time;
          }

          // Determine 2-hour slot
          let slot = '';
          if (hour >= 0 && hour < 2) slot = '0-2';
          else if (hour >= 2 && hour < 4) slot = '2-4';
          else if (hour >= 4 && hour < 6) slot = '4-6';
          else if (hour >= 6 && hour < 8) slot = '6-8';
          else if (hour >= 8 && hour < 10) slot = '8-10';
          else if (hour >= 10 && hour < 12) slot = '10-12';
          else if (hour >= 12 && hour < 14) slot = '12-14';
          else if (hour >= 14 && hour < 16) slot = '14-16';
          else if (hour >= 16 && hour < 18) slot = '16-18';
          else if (hour >= 18 && hour < 20) slot = '18-20';
          else if (hour >= 20 && hour < 22) slot = '20-22';
          else if (hour >= 22 && hour < 24) slot = '22-24';

          if (slot && timeSlots[slot]) {
            const pnl = parseFloat(trade.pnl) || 0;
            timeSlots[slot].value += pnl;
            timeSlots[slot].count += 1;
            if (pnl > 0) {
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
       
      };

      trades.forEach(trade => {
        if (trade.date) {
          const tradeDate = new Date(trade.date);
          if (!isNaN(tradeDate.getTime())) {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = dayNames[tradeDate.getDay()];

            if (daysData[dayName]) {
              const pnl = parseFloat(trade.pnl) || 0;
              daysData[dayName].value += pnl;
              daysData[dayName].count += 1;
              if (pnl > 0) {
                daysData[dayName].wins += 1;
              }
            }
          }
        }
      });

      return Object.values(daysData);
    }
  };

  const handleRefresh = () => {
    const fetchBestTimesData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/trades', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch trades: ${response.status} ${response.statusText}`);
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
  };

  if (loading) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-black border border-gray-800 rounded-xl p-6"
             style={{
               background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
             }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Best Trading Times</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                title="Refresh data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="flex bg-gray-700 rounded-lg p-1">
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
        <div className="relative bg-black border border-gray-800 rounded-xl p-6"
             style={{
               background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
             }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Best Trading Times</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                title="Retry"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 714.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="flex bg-gray-700 rounded-lg p-1">
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
          </div>
          <div className="flex flex-col items-center justify-center h-[250px]">
            <div className="text-red-400 mb-4">Error: {error}</div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalTrades = bestTimesData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
      <div className="relative bg-black border border-gray-800 rounded-xl p-6"
           style={{
             background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
           }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Best Trading Times</h2>
            <p className="text-sm text-gray-400">Total trades: {totalTrades}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-2 text-gray-400 hover:text-white transition-all duration-200 ${loading ? 'animate-spin' : ''}`}
              title="Refresh data"
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="flex bg-gray-700 rounded-lg p-1">
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
        </div>
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 500}>
          <BarChart data={bestTimesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
              angle={timeView === 'hours' ? -45 : 0}
              textAnchor={timeView === 'hours' ? 'end' : 'middle'}
              height={timeView === 'hours' ? 60 : 30}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
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
              formatter={(value, name, props) => [
                `$${parseFloat(value).toFixed(2)}`,
                'P&L'
              ]}
              labelFormatter={(label) => {
                const item = bestTimesData.find(d => d.name === label);
                const winRate = item && item.count > 0 ? ((item.wins / item.count) * 100).toFixed(1) : '0.0';
                return `${timeView === 'hours' ? 'Time:' : 'Day:'} ${label} | Trades: ${item?.count || 0} | Win Rate: ${winRate}%`;
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              animationDuration={1800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BestTradingTimes;
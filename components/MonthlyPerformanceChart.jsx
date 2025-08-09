"use client"
import React,{useState,useEffect} from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTrades } from '../context/TradeContext'; // Import the custom hook

const MonthlyPerformanceChart = () => {
  // Get trades, loading, and error from the centralized context
  const { trades, loading, error } = useTrades();

   const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768); // you can change the threshold
    };

    checkScreen(); // Initial check
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Generate monthly performance data
  const generateMonthlyData = () => {
    if (!trades.length) return [];

    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize all months for the current year (assuming trades are for the current year)
    // For a more robust solution, you might want to dynamically determine the years present in trades
    // and generate data for those years.
    months.forEach((month, index) => {
      monthlyData[month] = { name: month, value: 0, pips: 0, count: 0 };
    });

    trades.forEach(trade => {
      if (trade.date) {
        const tradeDate = new Date(trade.date);
        const month = months[tradeDate.getMonth()];
        // Only process trades if they belong to the current year for simplicity,
        // or you'd need to group by year as well.
        // For this example, we assume trades are relevant to a single year for monthly aggregation.
        if (monthlyData[month]) {
          monthlyData[month].value += trade.pnl || 0;
          monthlyData[month].pips += trade.pipsLostCaught || 0;
          monthlyData[month].count += 1;
        }
      }
    });

    return Object.values(monthlyData);
  };

  const lineData = generateMonthlyData();

  if (loading) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-black border border-gray-800 rounded-xl p-6"
             style={{
               background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
             }}>
          <div className="h-6 bg-gray-700 rounded w-64 mb-4 animate-pulse"></div>
          <div className="h-[250px] bg-gray-800/20 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading chart...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-20 rounded-xl blur-xl"></div>
        <div className="relative bg-black border border-gray-800 rounded-xl p-6"
             style={{
               background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
             }}>
          <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-4">Monthly Performance Overview</h2>
          <div className="h-[250px] flex items-center justify-center text-red-400">
            Error loading chart: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
      <div className="relative bg-black border border-gray-800 rounded-xl p-6"
           style={{
             background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
           }}>
        <h2 className="text-xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-4">Monthly Performance Overview</h2>
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 500}>
          <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}
              formatter={(value, name) => [
                `$${value.toFixed(2)}`,
                'P&L'
              ]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#colorGradient)"
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#10B981' }}
              animationDuration={2000}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyPerformanceChart;
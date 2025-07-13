"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import Calender from '@/components/Calender'
import Slidebar from '@/components/Slidebar'
const TradingDashboard = () => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sample data
  const stats = [
    { label: 'P/L', value: '+$12,450', change: '+8.2%', icon: TrendingUp, color: 'from-emerald-500 to-green-400', positive: true },
    { label: 'Total Trades', value: '1,247', change: '+23', icon: Activity, color: 'from-blue-500 to-cyan-400', positive: true },
    { label: 'W/R', value: '68.3%', change: '+2.1%', icon: Target, color: 'from-purple-500 to-pink-400', positive: true },
    { label: 'Pip Count', value: '2,847', change: '-45', icon: TrendingDown, color: 'from-orange-500 to-red-400', positive: false }
  ];

  const lineData = [
    { name: 'Jan', value: 4000, pips: 240 },
    { name: 'Feb', value: 3000, pips: 180 },
    { name: 'Mar', value: 5000, pips: 320 },
    { name: 'Apr', value: 2780, pips: 150 },
    { name: 'May', value: 1890, pips: 100 },
    { name: 'Jun', value: 2390, pips: 200 },
    { name: 'Jul', value: 3490, pips: 280 },
    { name: 'Aug', value: 4200, pips: 340 },
    { name: 'Sep', value: 3800, pips: 290 },
    { name: 'Oct', value: 5200, pips: 380 },
    { name: 'Nov', value: 4800, pips: 360 },
    { name: 'Dec', value: 6200, pips: 420 }
  ];



  const pieData = [
    { name: 'Wins', value: 68, color: '#10B981' },
    { name: 'Losses', value: 32, color: '#EF4444' }
  ];

  const timeData = [
    { name: 'Mon', value: 850 },
    { name: 'Tue', value: 920 },
    { name: 'Wed', value: 1200 },
    { name: 'Thu', value: 1100 },
    { name: 'Fri', value: 980 },
    { name: 'Sat', value: 200 },
    { name: 'Sun', value: 150 }
  ];

  const barData = [
    { name: 'Q1', value: 12000 },
    { name: 'Q2', value: 19000 },
    { name: 'Q3', value: 15000 },
    { name: 'Q4', value: 25000 }
  ];

  const tags = [
    { label: 'BW', value: '142', color: 'from-blue-600 to-blue-400' },
    { label: 'LL', value: '23', color: 'from-red-600 to-red-400' },
    { label: 'LW', value: '89', color: 'from-purple-600 to-purple-400' },
    { label: 'CL', value: '67', color: 'from-indigo-600 to-indigo-400' },
    { label: 'AW', value: '234', color: 'from-emerald-600 to-emerald-400' },
    { label: 'AL', value: '156', color: 'from-orange-600 to-orange-400' }
  ];

  return (
    <>

    <div className="min-h-screen bg-gradient-to-b from-[#0b1623] via-[#102030] to-[#12263a]
 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 animate-pulse">Trading Dashboard</h1>
          <p className="text-gray-300 italic">Professional Trading Analytics</p>
        </div>

        {/* Row 1: Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-20 rounded-xl blur-xl group-hover:opacity-30`}></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <p className={`text-sm font-medium mt-1 ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Line Graph */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Performance Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
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

        {/* Row 3: Calendar */}
        
        <Calender />

        {/* Row 4: Pie Chart and Best Time Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Win/Loss Ratio</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart >
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Best Trading Times</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={timeData}>
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
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1800}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 5: Tags and Bar Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4 mt-5">
            <h2 className="text-xl font-bold text-white mb-10">Trading Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              {tags.map((tag, index) => (
                <div key={index} className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r ${tag.color} opacity-20 rounded-lg blur-lg group-hover:opacity-30 transition-all duration-300`}></div>
                  <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm font-medium">{tag.label}</span>
                      <span className="text-white text-xl font-bold">{tag.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quarterly Performance</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
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
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#quarterlyGradient)"
                    radius={[8, 8, 0, 0]}
                    animationDuration={2000}
                  />
                  <defs>
                    <linearGradient id="quarterlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    </>
  );
};

export default TradingDashboard;
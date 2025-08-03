'use client'
import React, { useState } from 'react';
// Assuming these paths are correct for your project structure
import SpeedometerGrid from '@/components/Speedometer'; // Adjust path if needed
import WeeklyPsychProfile from '@/components/PsycProfile'; // Adjust path if needed
import DailyTrades from '@/components/DailyTrades'; // Adjust path if needed
import WeeklyRiskStatus from '@/components/WeeklyRiskStatus'; // Import the WeeklyRiskStatus component

const PsychologyDashboard = () => {
  const [metrics, setMetrics] = useState({
    fomo: 25,
    execution: 75,
    patience: 60,
    confidence: 85,
    fearGreed: 40
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 py-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-400 bg-clip-text text-transparent">
            Psychology Trading Dashboard
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Monitor and optimize your trading psychology metrics
          </p>
        </div>

        {/* Speedometer Grid Component */}
        <SpeedometerGrid metrics={metrics} onMetricsChange={setMetrics} />

        {/* Weekly Psychology Profile Component */}
        <WeeklyPsychProfile />

        {/* Daily Trades Component */}
        <DailyTrades />

        {/* Weekly Risk Status Component - Added here */}
        <WeeklyRiskStatus />
      </div>

      {/* Global styles for slider thumb if needed elsewhere */}
      {/* Note: In a real Next.js or Create React App, this 'style jsx' block
          would typically be in a global CSS file or a dedicated styled-components file.
          For direct embedding, it's included here. */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
        }
      `}</style>
    </div>
  );
};

export default PsychologyDashboard;

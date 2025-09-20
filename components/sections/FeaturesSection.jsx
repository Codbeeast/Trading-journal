'use client';
import React from 'react';

// Dummy Placeholder for Card1
const Card1 = () => (
  <div className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
    <span className="text-gray-400">Feature Card 1</span>
  </div>
);

// Dummy Placeholder for Card2
const Card2 = () => (
  <div className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
    <span className="text-gray-400">Feature Card 2</span>
  </div>
);

// Dummy Placeholder for Card3
const Card3 = () => (
  <div className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
    <span className="text-gray-400">Feature Card 3</span>
  </div>
);

// Dummy Placeholder for Card4
const Card4 = () => (
  <div className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
    <span className="text-gray-400">Feature Card 4</span>
  </div>
);

// Dummy LightRays component
const LightRays = ({ className = '' }) => (
  <div className={`absolute inset-0 w-full h-full bg-black bg-opacity-30 ${className}`}>
    {/* This is a placeholder for the LightRays component */}
  </div>
);

const FeaturesSection = ({ className = '' }) => {
  return (
    <section id="features" className={`relative w-full min-h-[800px] bg-[#000000] py-[80px] ${className}`}>
      {/* Light Rays Background */}
      <div className="absolute inset-0 w-full h-full">
        <LightRays
          raysOrigin="top-center"
          raysColor="#4A90E2"
          raysSpeed={1.0}
          lightSpread={1.7}
          rayLength={3.0}
          pulsating={false}
          fadeDistance={0.2}
          saturation={4.0}
          followMouse={false}
          mouseInfluence={0.15}
          noiseAmount={0.1}
          distortion={0.1}
          className="opacity-90"
        />
      </div>

      <div className="relative z-10 flex flex-col justify-start items-center w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Section Header */}
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="relative inline-block">
            {/* Gradient Border - matches the design system */}
            <div
              className="absolute overflow-hidden rounded-[22px] opacity-100"
              style={{
                inset: '-1px -1px -1px -2px',
                background:
                  'linear-gradient(105deg, rgb(41, 52, 255) -8%, rgba(36, 65, 212, 0) 50%)',
                zIndex: 1,
              }}
            ></div>
            {/* Button Content */}
            <div className="relative bg-black rounded-[22px] px-4 py-2" style={{ zIndex: 2 }}>
              <span
                className="inline-block font-semibold tracking-[-0.02em] leading-[1.6em]"
                style={{
                  fontFamily: 'Inter, "Inter Placeholder", sans-serif',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundImage:
                    'linear-gradient(105deg, rgb(138, 165, 255) 22.36939136402027%, rgb(133, 77, 255) 180%)',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                FEATURES
              </span>
            </div>
          </div>

          {/* Additional Text */}
          <div className="text-center px-4">
            <h2 className="text-4xl sm:text-[33px] md:text-[44px] font-inter font-bold leading-[27px] sm:leading-[41px] md:leading-[54px] text-center text-[#ffffff] w-auto  leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Powerful Trading Analytics
            </h2>
            <p className="text-sm sm:text-base md:text-lg font-inter font-normal text-gray-400 leading-relaxed max-w-md sm:max-w-lg mx-auto">
              Transform your trading with data-driven insights and advanced analytics.
            </p>
          </div>
        </div>

        {/* Features Grid Container - 1200px max width */}
        <div className="w-full max-w-[1200px] mx-auto">
          {/* Row 1: Card 1 + Card 2 */}
          <div className="flex flex-col lg:flex-row gap-[8px] mb-[8px]">
            {/* Card 1 */}
            <div className="w-full lg:w-[434px] h-[377px] flex-shrink-0 p-1">
              <Card1 />
            </div>

            {/* Card 2 */}
            <div className="w-full lg:w-[676px] h-[377px] flex-shrink-0 p-1">
              <Card2 />
            </div>
          </div>

          {/* Row 2: Card 3 + Card 4 */}
          <div className="flex flex-col lg:flex-row gap-[8px]">
            {/* Card 3 */}
            <div className="w-full lg:w-[781px] h-[523px] flex-shrink-0 p-1">
              <Card3 />
            </div>

            {/* Card 4 */}
            <div className="w-full lg:w-[327px] h-[523px] flex-shrink-0 p-1">
              <Card4 />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
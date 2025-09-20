'use client';
import React, { useState } from 'react';

// Placeholder component for LightRays to resolve import error
const LightRays = ({ className }) => (
  <div className={`absolute inset-0 w-full h-full bg-black ${className}`}>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-gradient-radial from-blue-500/20 via-blue-900/10 to-transparent blur-3xl"></div>
  </div>
);

// Placeholder component for PricingCard to resolve import error
const PricingCard = ({ planName, price, period, isPopular, features, buttonVariant }) => {
  const cardClasses = `relative flex flex-col p-6 rounded-2xl shadow-lg h-full ${
    isPopular ? 'bg-gray-800/50 border-2 border-blue-500' : 'bg-gray-900/50 border border-gray-700'
  }`;

  const buttonClasses = `w-full py-3 mt-auto font-semibold rounded-lg transition-transform transform hover:scale-105 ${
    buttonVariant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-600 text-white hover:bg-gray-500'
  }`;

  return (
    <div className={cardClasses}>
      {isPopular && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-white text-center mb-4">{planName}</h3>
      <div className="mt-4 text-center">
        <span className="text-5xl font-extrabold text-white">{typeof price === 'number' ? `₹${price}` : price}</span>
        <span className="text-base font-medium text-gray-400">{period}</span>
      </div>
      <ul className="mt-8 mb-8 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span className="text-gray-300">{feature.text}</span>
          </li>
        ))}
      </ul>
      <button className={buttonClasses}>
        {planName === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
      </button>
    </div>
  );
};


const PricingSection = ({ className = '' }) => {
  const [isYearly, setIsYearly] = useState(false);

  const pricingPlans = [
    {
      planName: 'Pro',
      price: isYearly ? 5990 : 599,
      period: isYearly ? '/ year' : '/ month',
      isPopular: true,
      buttonVariant: 'primary',
      features: [
        { text: 'Integrations with 3rd-party', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Team performance tracking', included: true },
        { text: 'Top grade security', included: true },
        { text: 'Priority customer support', included: true },
        { text: 'Detailed usage reports', included: true },
      ],
    },
    {
      planName: 'Enterprise',
      price: 'Custom',
      period: '',
      isPopular: false,
      buttonVariant: 'secondary',
      features: [
        { text: 'Dedicated account manager', included: true },
        { text: 'Custom reports & dashboards', included: true },
        { text: 'Most performance usage', included: true },
        { text: 'Tailored onboarding and training', included: true },
        { text: 'Customizable API access', included: true },
        { text: 'Dedicated success manager', included: true },
      ],
    },
  ];

  return (
    <>
      {/* Pricing Section */}
      <section id="pricing" className={`relative w-full min-h-screen lg:min-h-[1010px] ${className}`}>
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

        <div className="relative z-10 flex flex-col gap-6 sm:gap-8 lg:gap-[44px] justify-start items-center w-full max-w-[1204px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-[99px]">
          {/* Section Header */}
          <div className="flex flex-col justify-start items-center w-full max-w-[600px]">
            {/* Badge */}
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
                  PRICING & PLANS
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-row justify-center items-center w-full px-4 sm:px-8 lg:px-[56px] mt-2 sm:mt-3 lg:mt-[10px]">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[44px] font-inter font-medium leading-tight text-center text-white w-auto mt-4">
                Flexible Pricing Plans
              </h2>
            </div>

            {/* Description */}
            <div className="flex flex-col justify-center items-center w-full px-4">
              <p className="text-sm sm:text-base font-inter font-normal leading-relaxed text-center text-[#e6ecffb2] max-w-xs sm:max-w-md lg:max-w-[500px] mx-auto">
                Choose a plan that fits your needs and unlock the full potential of our platform
              </p>
            </div>
          </div>

          {/* Pricing Content */}
          <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px] justify-start items-center flex-1">
            {/* Pricing Toggle */}
            <div className="relative bg-gray-900/70 border border-gray-700 rounded-full p-1 w-full max-w-xs sm:max-w-sm mx-auto">
              <div className="flex flex-row items-center justify-center relative">
                {/* Monthly Option */}
                <div className="relative flex-1">
                  <button
                    onClick={() => setIsYearly(false)}
                    className="transition-all duration-300 relative group w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3"
                  >
                    <p
                      className="text-center text-sm sm:text-base font-medium text-white group-hover:opacity-100 transition-opacity duration-300"
                      style={{ opacity: !isYearly ? 1 : 0.6 }}
                    >
                      Monthly
                    </p>
                  </button>
                  {/* Underline for Monthly */}
                  <div
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 transition-all duration-300 bg-blue-300 rounded-sm"
                    style={{
                      width: !isYearly ? '35px' : '0px',
                      height: '2px',
                      opacity: 0.5,
                    }}
                  />
                </div>

                {/* Vertical Separator */}
                <div className="mx-2 sm:mx-4 w-px h-4 sm:h-5 bg-blue-300 opacity-50" />

                {/* Yearly Option */}
                <div className="relative flex-1">
                  <button
                    onClick={() => setIsYearly(true)}
                    className="transition-all duration-300 relative group flex items-center justify-center w-full px-1 sm:px-2 lg:px-3 py-2 sm:py-3"
                  >
                    <p
                      className="text-center text-sm sm:text-base mr-1 sm:mr-2 font-medium text-white group-hover:opacity-100 transition-opacity duration-300"
                      style={{ opacity: isYearly ? 1 : 0.6 }}
                    >
                      Yearly
                    </p>
                    {/* 2 months free badge */}
                    <div className="bg-blue-600/50 border border-blue-500 rounded-full px-1.5 sm:px-3 py-0.5 sm:py-1">
                      <p className="text-xs sm:text-sm text-center text-white font-medium">
                        2 months free
                      </p>
                    </div>
                  </button>
                  {/* Underline for Yearly */}
                  <div
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 transition-all duration-300 bg-blue-300 rounded-sm"
                    style={{
                      width: isYearly ? '55px' : '0px',
                      height: '2px',
                      opacity: 0.5,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-6 lg:gap-[32px] justify-center items-stretch lg:items-start w-full max-w-6xl mx-auto px-4">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className="flex-1 w-full max-w-sm mx-auto sm:mx-0"
                >
                  <PricingCard
                    planName={plan.planName}
                    price={plan.price}
                    period={plan.period}
                    isPopular={plan.isPopular}
                    features={plan.features}
                    buttonVariant={plan.buttonVariant}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HR Separator */}
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <hr className="w-full max-w-[600px] sm:max-w-[800px] border-t border-gray-600 opacity-30" />
      </div>

      {/* Founder's Note Section */}
      <section className="relative w-full min-h-[320px] sm:min-h-[350px] lg:min-h-[396px] px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
        {/* Background Images */}
        <img
          src="https://placehold.co/884x332/000000/1E293B?text=Shape"
          alt="Abstract background shape"
          width={884}
          height={332}
          className="absolute top-[120px] sm:top-[250px] lg:top-[324px] left-1/2 transform -translate-x-1/2 w-[85%] sm:w-[78%] lg:w-[72%] rounded-[10px] opacity-80 lg:opacity-100"
        />

        <div className="relative z-10 flex flex-col gap-4 sm:gap-5 lg:gap-[22px] justify-start items-center w-full max-w-[1204px] mx-auto pt-4 sm:pt-2 lg:pt-0">
          <div className="flex flex-row justify-center items-center w-full px-4 sm:px-8 lg:px-[56px]">
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
                  FOUNDERS NOTE
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px] justify-start items-center w-full px-4 sm:px-8 lg:px-0">
            {/* Two Founder's Notes in a Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 w-full max-w-[1200px]">
              {/* First Founder's Note */}
              <div className="flex flex-col justify-start items-center w-full px-2 sm:px-4 lg:px-[6px]">
                <div className="flex flex-col gap-1 sm:gap-2 lg:gap-[6px] justify-center items-center w-auto">
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-inter font-normal leading-tight text-center text-gray-100 tracking-tight">
                    " No matter where you are in your
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span> journey break-even, losing, or already funded
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>this journal is a mirror. Use it honestly. Learn from it. We're in this with you."
                  </h3>
                </div>
                <div className="flex flex-row justify-center items-center w-full mt-3 sm:mt-4 lg:mt-[16px]">
                  <div className="flex flex-row justify-center items-center w-auto">
                    <p className="text-sm sm:text-base font-inter font-normal leading-relaxed text-center text-[#e6ecffb2] w-auto">
                      MMK <br />
                      Founder
                    </p>
                  </div>
                </div>
              </div>

              {/* Second Founder's Note */}
              <div className="flex flex-col justify-start items-center w-full px-2 sm:px-4 lg:px-[6px] lg:border-l-2 lg:border-gray-600 lg:pl-8">
                <div className="flex flex-col gap-1 sm:gap-2 lg:gap-[6px] justify-center items-center w-auto">
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-inter font-normal leading-tight text-center text-gray-100 tracking-tight">
                    " Forenotes was born from our own
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>struggles with tracking trades and mindset.
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>Our goal is simple: help traders see their journey clearly, learn faster, and trade better. "
                  </h3>
                </div>
                <div className="flex flex-row justify-center items-center w-full mt-3 sm:mt-4 lg:mt-[16px]">
                  <div className="flex flex-row justify-center items-center w-auto">
                    <p className="text-sm sm:text-base font-inter font-normal leading-relaxed text-center text-[#e6ecffb2] w-auto">
                      Atharva Maradwar
                      <br />
                      Founder
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PricingSection;
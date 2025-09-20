'use client';
import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

const HeroSection = ({ className = '' }) => {
  const [customerCount, setCustomerCount] = useState(10000);
  const targetCount = 15725;

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const startCount = 10000;
    const increment = (targetCount - startCount) / (duration / 50); // Update every 50ms

    let currentCount = startCount;
    const timer = setInterval(() => {
      currentCount += increment;
      if (currentCount >= targetCount) {
        setCustomerCount(targetCount);
        clearInterval(timer);
      } else {
        setCustomerCount(Math.floor(currentCount));
      }
    }, 50);

    return () => clearInterval(timer);
  }, [targetCount]);

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return (
    <section
      id="hero"
      className={`relative w-full bg-[linear-gradient(180deg,#031457_0%,_#001122_60%,_#000000_100%)] min-h-screen flex items-center justify-center ${className}`}
    >
      {/* Background Images */}
      <div className="absolute inset-0">
        <img
          src="/images/img_component_1_black_900_426x1920.png"
          alt=""
          width={1920}
          height={426}
          className="w-full h-[200px] sm:h-[300px] lg:h-[426px] object-cover"
        />
        <img
          src="/images/img_blur_mask_group.png"
          alt=""
          width={1260}
          height={1714}
          className="absolute top-[40px] sm:top-[68px] left-0 w-[80%] sm:w-[66%] h-auto max-h-full object-cover opacity-60 sm:opacity-100"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col justify-center items-center w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Social Proof Badge */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-[10px] mb-6 sm:mb-8 w-full max-w-[720px] px-4">
          {/* Customer Avatars */}
          <div className="flex items-center justify-center gap-2 sm:gap-[10px]">
            {/* Images Container - Simplified for mobile */}
            <div className="flex items-center -space-x-2 sm:-space-x-3">
              {/* Avatar 1 */}
              <div className="w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-full overflow-hidden border-2 border-white/20 relative z-[4]">
                <img
                  className="w-full h-full object-cover"
                  src="/Testimonial/Shivam.png"
                  alt="Customer profile"
                  width={28}
                  height={28}
                />
              </div>

              {/* Avatar 2 */}
              <div className="w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-full overflow-hidden border-2 border-white/20 relative z-[3]">
                <img
                  className="w-full h-full object-cover"
                  src="/Testimonial/Ayush.png"
                  alt="Customer profile"
                  width={28}
                  height={28}
                />
              </div>

              {/* Avatar 3 */}
              <div className="w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-full overflow-hidden border-2 border-white/20 relative z-[2]">
                <img
                  className="w-full h-full object-cover"
                  src="/Testimonial/Choin.png"
                  alt="Customer profile"
                  width={28}
                  height={28}
                />
              </div>

              {/* Avatar 4 */}
              <div className="w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-full overflow-hidden border-2 border-white/20 relative z-[1]">
                <img
                  className="w-full h-full object-cover"
                  src="/Testimonial/Zainul.png"
                  alt="Customer profile"
                  width={28}
                  height={28}
                />
              </div>
            </div>
          </div>

          {/* Text Container */}
          <div className="flex flex-wrap items-center justify-center gap-1 text-center sm:text-left">
            <span className="text-sm sm:text-[16px] font-inter font-normal text-[rgba(230,236,255,0.7)] tracking-[-0.32px]">
              Join
            </span>
            <span className="text-sm sm:text-[16px] font-inter font-normal text-white tracking-[-0.32px]">
              {formatNumber(customerCount)}+
            </span>
            <span className="text-sm sm:text-[16px] font-inter font-normal text-[rgba(230,236,255,0.7)] tracking-[-0.32px]">
              other loving customers
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center mb-6 sm:mb-8 px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            AI journal that actually helps you
          </h1>
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-inter font-normal text-gray-300 leading-relaxed max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto">
            Forenotes connects emotion, execution, and outcome AI <br />
            translates your trading journey into measurable improvement
          </h3>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mb-8 sm:mb-10 lg:mb-12 px-4">
          <a
            href="/dashboard"
            className="relative inline-flex items-center justify-center text-white transition-all duration-300 hover:brightness-110 transform hover:scale-105 cursor-pointer w-full max-w-[200px] sm:w-auto"
            style={{
              alignContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgb(41, 52, 255)',
              height: '44px',
              minWidth: '140px',
              borderRadius: '10px',
              boxShadow:
                'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px, rgba(255, 255, 255, 0.03) 0px 0px 10px 1px inset, rgba(0, 85, 255, 0.13) 0px 0px 0px 1.40127px',
              display: 'flex',
              justifyContent: 'center',
              padding: '10px 18px',
              textDecoration: 'none',
              willChange: 'transform',
              WebkitFontSmoothing: 'antialiased',
              opacity: 1,
              position: 'relative',
              border: '1.6px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span
              className="text-white font-inter text-sm sm:text-base font-normal tracking-[-0.32px] whitespace-nowrap"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: 'rgb(255, 255, 255)',
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              Get Started Now
            </span>
          </a>
        </div>

        {/* Trading Keywords SVG Marquee */}
        <div className="w-full overflow-hidden px-4">
          <div
            className="w-full overflow-hidden relative"
            style={{
              maskImage:
                'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)',
              WebkitMaskImage:
                'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)',
            }}
          >
            <div
              className="flex items-center gap-8 sm:gap-12 lg:gap-[100px] animate-scroll"
              style={{
                width: 'max-content',
                transform: 'translateX(0px)',
                willChange: 'transform',
              }}
            >
              {/* First set of words as SVG */}
              <div className="flex-shrink-0">
                <svg
                  className="h-6 sm:h-7 lg:h-8 w-auto"
                  viewBox="0 0 85 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                  }}
                >
                  <text
                    x="42.5"
                    y="15"
                    textAnchor="middle"
                    className="font-inter font-semibold tracking-wider"
                    style={{
                      fontSize: '14px',
                      fill: '#ffffff',
                      letterSpacing: '0.1em',
                    }}
                  >
                    CLARITY
                  </text>
                </svg>
              </div>

              <div className="flex-shrink-0">
                <svg
                  className="h-6 sm:h-7 lg:h-8 w-auto"
                  viewBox="0 0 100 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                  }}
                >
                  <text
                    x="50"
                    y="15"
                    textAnchor="middle"
                    className="font-inter font-semibold tracking-wider"
                    style={{
                      fontSize: '14px',
                      fill: '#ffffff',
                      letterSpacing: '0.1em',
                    }}
                  >
                    DISCIPLINE
                  </text>
                </svg>
              </div>

              <div className="flex-shrink-0">
                <svg
                  className="h-6 sm:h-7 lg:h-8 w-auto"
                  viewBox="0 0 85 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                  }}
                >
                  <text
                    x="42.5"
                    y="15"
                    textAnchor="middle"
                    className="font-inter font-semibold tracking-wider"
                    style={{
                      fontSize: '14px',
                      fill: '#ffffff',
                      letterSpacing: '0.1em',
                    }}
                  >
                    INSIGHT
                  </text>
                </svg>
              </div>

              <div className="flex-shrink-0">
                <svg
                  className="h-6 sm:h-7 lg:h-8 w-auto"
                  viewBox="0 0 110 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                  }}
                >
                  <text
                    x="55"
                    y="15"
                    textAnchor="middle"
                    className="font-inter font-semibold tracking-wider"
                    style={{
                      fontSize: '14px',
                      fill: '#ffffff',
                      letterSpacing: '0.1em',
                    }}
                  >
                    PSYCHOLOGY
                  </text>
                </svg>
              </div>

              <div className="flex-shrink-0">
                <svg
                  className="h-6 sm:h-7 lg:h-8 w-auto"
                  viewBox="0 0 95 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                  }}
                >
                  <text
                    x="47.5"
                    y="15"
                    textAnchor="middle"
                    className="font-inter font-semibold tracking-wider"
                    style={{
                      fontSize: '14px',
                      fill: '#ffffff',
                      letterSpacing: '0.1em',
                    }}
                  >
                    STRATEGY
                  </text>
                </svg>
              </div>

              {/* Duplicate set for seamless scrolling */}
              <div className="flex-shrink-0" aria-hidden="true">
                <svg
                  className="h-6 sm:h-7 lg:h-8 w-auto"
                  viewBox="0 0 85 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                  }}
                >
                  <text
                    x="42.5"
                    y="15"
                    textAnchor="middle"
                    className="font-inter font-semibold tracking-wider"
                    style={{
                      fontSize: '14px',
                      fill: '#ffffff',
                      letterSpacing: '0.1em',
                    }}
                  >
                    CLARITY
                  </text>
                </svg>
              </div>

              <div className="flex-shrink-0" aria-hidden="true">
                <svg
                  className="h-6 sm:h-7 lg:h-8 w-auto"
                  viewBox="0 0 100 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                  }}
                >
                  <text
                    x="50"
                    y="15"
                    textAnchor="middle"
                    className="font-inter font-semibold tracking-wider"
                    style={{
                      fontSize: '14px',
                      fill: '#ffffff',
                      letterSpacing: '0.1em',
                    }}
                  >
                    DISCIPLINE
                  </text>
                </svg>
              </div>

              <div className="flex-shrink-0" aria-hidden="true">
                <svg
                  className="h-6 sm:h-7 lg:h-8 w-auto"
                  viewBox="0 0 85 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                  }}
                >
                  <text
                    x="42.5"
                    y="15"
                    textAnchor="middle"
                    className="font-inter font-semibold tracking-wider"
                    style={{
                      fontSize: '14px',
                      fill: '#ffffff',
                      letterSpacing: '0.1em',
                    }}
                  >
                    INSIGHT
                  </text>
                </svg>
              </div>

              <div className="flex-shrink-0" aria-hidden="true">
                <svg
                  className="h-6 sm:h-7 lg:h-8 w-auto"
                  viewBox="0 0 110 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                  }}
                >
                  <text
                    x="55"
                    y="15"
                    textAnchor="middle"
                    className="font-inter font-semibold tracking-wider"
                    style={{
                      fontSize: '14px',
                      fill: '#ffffff',
                      letterSpacing: '0.1em',
                    }}
                  >
                    PSYCHOLOGY
                  </text>
                </svg>
              </div>

              <div className="flex-shrink-0" aria-hidden="true">
                <svg
                  className="h-6 sm:h-7 lg:h-8 w-auto"
                  viewBox="0 0 95 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                  }}
                >
                  <text
                    x="47.5"
                    y="15"
                    textAnchor="middle"
                    className="font-inter font-semibold tracking-wider"
                    style={{
                      fontSize: '14px',
                      fill: '#ffffff',
                      letterSpacing: '0.1em',
                    }}
                  >
                    STRATEGY
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

'use client';
import React from 'react';
import Image from 'next/image';
import SectionHeader from '@/components/common/SectionHeader';
import TestimonialCard from '@/components/ui/TestimonialCard';
import LightRays from '@/components/ui/LightRays';

const TestimonialsSection = ({ className = '' }) => {
  const testimonials = [
    {
      quote: 'I’ve been using ForeNotes for a month it’s super easy, and the AI assistant helps me spot mistakes and improve my trading much faster.',
      rating: 5.0,
      user: {
        name: 'Shivam',
        title: 'Trader',
        avatar: '/Testimonial/Shivam.png',
      },
    },
    {
      quote: 'Great journal tool to review your progress and fasten your journey as a trader.Best thing about this one is your persosal Ai assistant loved it',
      rating: 5.0,
      user: {
        name: 'Ayush',
        title: 'Trader',
        avatar: '/Testimonial/Ayush.png',
      },
    },
    {
      quote: 'Forenotes helping me to track my records of trades flawlessly and made me a tough disciplined guy and result is quite impressive in positive way.',
      rating: 4.9,
      user: {
        name: 'Choin',
        title: 'Day Trader',
        avatar: '/Testimonial/Choin.png',
      },
    },
    {
      quote: 'This trading journal eliminated the mess that used to stop me from journaling. Now my trading is organized and I see patterns and decisions with clarity.',
      rating: 5.0,
      user: {
        name: 'Zainul',
        title: 'Swing Trader',
        avatar: '/Testimonial/Zainul.png',
      },
    },
    {
      quote: 'Clean and easy to use platform that helps me stay organized and consistent with my trading. It’s been a game changer for tracking.',
      rating: 4.8,
      user: {
        name: 'Abdul',
        title: 'SB Growth',
        avatar: '/Testimonial/Abdul.png',
      },
    },
    {
      quote: 'Forenotes has brought clarity and consistency to my trading journey. While The Ai assistant has been a game changer.',
      rating: 5.0,
      user: {
        name: 'Amir',
        title: 'Options Trader',
        avatar: '/Testimonial/Amir.png',
      },
    },
  ];

  return (
    <section
      className={`relative w-full px-4 sm:px-6 lg:px-8 ${className}`}
    >
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
      <div className="relative z-10 flex flex-col gap-6 sm:gap-8 lg:gap-[44px] justify-start items-center w-full max-w-[1204px] mx-auto pt-2 sm:pt-4 lg:pt-[5px]">
        {/* Section Header */}
        <div className="flex flex-row justify-center items-center w-full px-4 sm:px-8 mt-6 sm:mt-8">
          <div className="flex flex-col justify-start items-center w-full max-w-[600px]">
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
                  WALL OF LOVE
                </span>
              </div>
            </div>
            <div className="flex flex-row justify-center items-center w-full px-[28px] sm:px-[56px] mt-[10px]">
              <h2 className="text-[22px] sm:text-[33px] md:text-[44px] font-inter font-medium leading-[27px] sm:leading-[41px] md:leading-[54px] text-center text-[#ffffff] w-auto">
                Loved by Traders
              </h2>
            </div>
            <div className="flex flex-row justify-center items-center w-full mx-[50px] sm:mx-[100px]">
              <p className="text-[16px] font-inter font-normal leading-[20px] text-center text-[#e6ecffb2] self-end w-auto">
                Here’s what people worldwide are saying about us
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="flex flex-row justify-center items-start w-full px-2 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-[24px] w-full max-w-[1200px]">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                quote={testimonial.quote}
                rating={testimonial.rating}
                user={testimonial.user}
              />
            ))}
          </div>
        </div>

        {/* HR Separator */}
        <hr className="w-full max-w-[600px] sm:max-w-[800px] border-t border-gray-600 opacity-30 mt-5 sm:mt-6 lg:mt-8" />
      </div>
    </section>
  );
};

export default TestimonialsSection;
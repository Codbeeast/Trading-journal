'use client';
import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

const PricingCard = ({
  planName,
  price,
  period = '/ month',
  isPopular = false,
  features,
  buttonText = 'Get Started',
  buttonVariant = 'primary',
  onSelect = null,
  onTrialSelect = null,
  isTrialEligible = false,
  bonusMonths = 0,
  monthlyEquivalent = null,
  className = '',
}) => {
  return (
    <div
      className={`pricing-card flex flex-col justify-start items-start w-full max-w-[420px] overflow-hidden rounded-[16px] min-h-[500px] lg:h-auto ${className}`}
      style={{
        padding: '24px',
        background: 'radial-gradient(96% 96% at 50% 7.5%, rgb(18, 20, 38) 0%, rgb(0, 0, 0) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Card Content */}
      <div className="flex flex-col gap-4 sm:gap-5 lg:gap-[24px] justify-start items-start w-full lg:flex-1">
        {/* Plan Header with Popular Badge */}
        <div className="flex flex-row justify-between items-center w-full">
          <p className="text-base sm:text-lg font-inter font-medium text-white">{planName}</p>
          {isPopular && (
            <div className="flex flex-row justify-center items-center shadow-lg bg-[#854dff] rounded-lg px-2 sm:px-3 py-1">
              <p className="text-xs sm:text-sm font-inter font-medium text-center text-white">
                Popular
              </p>
            </div>
          )}
        </div>

        {/* Price - above button */}
        <div className="flex flex-col justify-start items-start w-full gap-1">
          <div className="flex flex-row justify-start items-baseline w-full">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-inter font-bold text-white">
              {typeof price === 'string' ? price : `₹${price}`}
            </h3>
            {period && typeof price === 'number' && (
              <p className="text-sm sm:text-base font-inter font-normal text-gray-400 ml-2">
                {period}
              </p>
            )}
          </div>
          {monthlyEquivalent && (
            <p className="text-xs sm:text-sm font-inter font-normal text-blue-400">
              ₹{monthlyEquivalent}/month effective
            </p>
          )}
        </div>

        {/* Bonus Months Badge */}
        {bonusMonths > 0 && (
          <div className="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-sm font-semibold text-center text-green-300 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {bonusMonths === 1 ? '+1 Month' : `+${bonusMonths} Months`} FREE Bonus
            </p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={onSelect}
          className={`relative inline-flex items-center justify-center w-full rounded-lg py-3 px-4 sm:py-3 sm:px-6 transition-all duration-300 hover:brightness-110 transform hover:scale-[1.02] cursor-pointer font-medium text-sm sm:text-base ${buttonVariant === 'primary'
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-800 hover:bg-blue-600'
            }`}
          style={{
            backgroundColor: buttonVariant === 'primary' ? 'rgb(41, 52, 255)' : 'rgb(3, 20, 87)',
            minHeight: '44px',
            boxShadow:
              buttonVariant === 'primary'
                ? 'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px, rgba(255, 255, 255, 0.03) 0px 0px 10px 1px inset'
                : 'rgba(0, 0, 0, 0.3) 0px 4px 20px 0px, rgba(255, 255, 255, 0.1) 0px 0px 5px 1px inset',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
          onMouseEnter={(e) => {
            if (buttonVariant === 'secondary') {
              e.currentTarget.style.backgroundColor = 'rgb(41, 52, 255)';
              e.currentTarget.style.boxShadow =
                'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px, rgba(255, 255, 255, 0.03) 0px 0px 10px 1px inset, rgba(0, 85, 255, 0.13) 0px 0px 0px 1.40127px';
            }
          }}
          onMouseLeave={(e) => {
            if (buttonVariant === 'secondary') {
              e.currentTarget.style.backgroundColor = 'rgb(3, 20, 87)';
              e.currentTarget.style.boxShadow =
                'rgba(0, 0, 0, 0.3) 0px 4px 20px 0px, rgba(255, 255, 255, 0.1) 0px 0px 5px 1px inset, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px';
            }
          }}
        >
          <span className="text-white font-inter font-medium tracking-tight">{buttonText}</span>
        </button>



        {/* Features List */}
        <div className="flex flex-col gap-3 sm:gap-4 justify-start items-start w-full">
          <p className="text-sm sm:text-base font-inter font-normal text-gray-400">Includes:</p>

          {features.map((feature, index) => (
            <div key={index} className="flex flex-row justify-start items-start w-full gap-2">
              <Image
                src="/images/img_component_1_white_a700_22x22.svg"
                alt="Check"
                width={18}
                height={18}
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm sm:text-base font-inter font-normal text-gray-300 leading-relaxed">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingCard;

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
  buttonText = 'Get Started Now',
  buttonVariant = 'primary',
  className = '',
}) => {
  return (
    <div
      className={`pricing-card flex flex-col justify-start lg:justify-start items-start w-full max-w-sm sm:max-w-md lg:w-[438px] overflow-hidden rounded-[16px] min-h-[450px] sm:min-h-[480px] lg:h-[499px] ${className}`}
      style={{
        padding: '20px',
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
        <div className="flex flex-col sm:flex-row justify-start items-start sm:items-baseline w-full">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-inter font-bold text-white">
            {typeof price === 'string' ? price : `₹${price}`}
          </h3>
          {period && typeof price === 'number' && (
            <p className="text-sm sm:text-base font-inter font-normal text-gray-400 sm:ml-2">
              {period}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <button
          className={`relative inline-flex items-center justify-center w-full rounded-lg py-3 px-4 sm:py-3 sm:px-6 transition-all duration-300 hover:brightness-110 transform hover:scale-[1.02] cursor-pointer font-medium text-sm sm:text-base ${
            buttonVariant === 'primary'
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

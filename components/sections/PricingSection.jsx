'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SectionHeader from '@/components/common/SectionHeader';
import PricingCard from '@/components/ui/PricingCard';
import LightRays from '@/components/ui/LightRays';
import PaymentModal from '@/components/payment/PaymentModal';

const PricingSection = ({ className = '' }) => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (data) => {
    // Redirect to success page or dashboard
    router.push('/payment/success');
  };

  const pricingPlans = [
    {
      planId: '1_MONTH',
      planName: 'Monthly',
      price: 599,
      period: '/ month',
      isPopular: false,
      buttonVariant: 'secondary',
      billingPeriod: 1,
      bonusMonths: 0,
      totalMonths: 1,
      features: [
        { text: 'Full trading journal access', included: true },
        { text: 'Advanced analytics & insights', included: true },
        { text: 'AI-powered trade assistant', included: true },
        { text: 'Performance tracking', included: true },
        { text: 'Psychology analysis', included: true },
        { text: '7-day free trial', included: true },
      ],
    },
    {
      planId: '6_MONTHS',
      planName: '6 Months',
      price: 2999,
      period: '/ 6 months',
      isPopular: true,
      buttonVariant: 'primary',
      billingPeriod: 6,
      bonusMonths: 1,
      totalMonths: 7,
      monthlyEquivalent: 428,
      savingsPercent: 28,
      features: [
        { text: 'Full trading journal access', included: true },
        { text: 'Advanced analytics & insights', included: true },
        { text: 'AI-powered trade assistant', included: true },
        { text: 'Performance tracking', included: true },
        { text: 'Psychology analysis', included: true },
        { text: '1 bonus month FREE', included: true },
        { text: '7-day free trial', included: true },
      ],
    },
    {
      planId: '12_MONTHS',
      planName: 'Yearly',
      price: 5990,
      period: '/ year',
      isPopular: false,
      buttonVariant: 'secondary',
      billingPeriod: 12,
      bonusMonths: 2,
      totalMonths: 14,
      monthlyEquivalent: 428,
      savingsPercent: 29,
      features: [
        { text: 'Full trading journal access', included: true },
        { text: 'Advanced analytics & insights', included: true },
        { text: 'AI-powered trade assistant', included: true },
        { text: 'Performance tracking', included: true },
        { text: 'Psychology analysis', included: true },
        { text: 'Priority support', included: true },
        { text: '2 bonus months FREE', included: true },
        { text: '7-day free trial', included: true },
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
              <h2 className="text-4xl sm:text-[33px] md:text-[44px] font-inter font-bold leading-[27px] sm:leading-[41px] md:leading-[54px] text-center text-[#ffffff] w-auto  leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
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
            {/* Free Trial Badge */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-6 py-3">
              <p className="text-sm sm:text-base font-semibold text-white text-center">
                🎉 Start with 7 Days FREE Trial - No Credit Card Required
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10 xl:gap-12">
                {pricingPlans.map((plan, index) => (
                  <div
                    key={index}
                    className="w-full flex justify-center"
                  >
                    <PricingCard
                      planName={plan.planName}
                      price={plan.price}
                      period={plan.period}
                      isPopular={plan.isPopular}
                      features={plan.features}
                      buttonVariant={plan.buttonVariant}
                      onSelect={() => handleSelectPlan(plan.planId)}
                      bonusMonths={plan.bonusMonths}
                      monthlyEquivalent={plan.monthlyEquivalent}
                    />
                  </div>
                ))}
              </div>
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
        <Image
          src="/images/img_bg_shape.png"
          alt=""
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
                    <span className="sm:hidden"> </span> journey break-even, losing, or already  funded
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>this journal is a mirror.  Use it honestly. Learn from it. We're in this with you."
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          planId={selectedPlan}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default PricingSection;

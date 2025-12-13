'use client';
import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import SectionHeader from '@/components/common/SectionHeader';
import PricingCard from '@/components/ui/PricingCard';
import LightRays from '@/components/ui/LightRays';
import PaymentModal from '@/components/payment/PaymentModal';
import SpecialOfferCard from '@/components/subscription/SpecialOfferCard';

function PricingSectionContent({ className = '' }) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isTrialEligible, setIsTrialEligible] = useState(false);
  const [processingTrial, setProcessingTrial] = useState(false);
  const [showSpecialOffer, setShowSpecialOffer] = useState(false);
  const [processingSpecialOffer, setProcessingSpecialOffer] = useState(false);

  const { user, isLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const checkEligibility = async () => {
      if (!isLoaded || !isSignedIn) return;
      try {
        const res = await fetch('/api/subscription/status');
        const data = await res.json();
        if (data.success) {
          setIsTrialEligible(data.isTrialEligible);
        }
      } catch (error) {
        console.error('Failed to check trial eligibility:', error);
      }
    };
    checkEligibility();
  }, [isLoaded, isSignedIn]);

  // Handle return from login with plan selected
  React.useEffect(() => {
    const handleReturn = async () => {
      if (isLoaded && isSignedIn) {
        const planFromUrl = searchParams.get('plan');
        if (planFromUrl) {
          // Check if user already has an active subscription
          try {
            const res = await fetch('/api/subscription/status');
            const data = await res.json();

            if (data.success && data.hasAccess) {
              // User already has a plan, redirect to profile
              const newUrl = window.location.pathname;
              window.history.replaceState({}, '', newUrl); // Clean URL
              router.push('/profile');
              return;
            }
          } catch (error) {
            console.error('Error checking subscription status:', error);
          }

          setSelectedPlan(planFromUrl);
          setShowPaymentModal(true);
          // Optional: Clean URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }
    };
    handleReturn();
  }, [isLoaded, isSignedIn, searchParams, router]);

  const handleSelectPlan = (planId) => {
    if (!isSignedIn) {
      // Redirect to login with callback to this page + plan param
      const currentPath = window.location.pathname;
      const callbackUrl = `${currentPath}?plan=${planId}`;
      router.push(`/auth/sign-in?redirect_url=${encodeURIComponent(callbackUrl)}`);
      return;
    }
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handleStartTrial = async (planId = '1_MONTH') => {
    if (!isSignedIn) {
      router.push(`/auth/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`);
      return;
    }

    setProcessingTrial(true);

    try {
      // Create Razorpay subscription with trial
      const res = await fetch('/api/user/init-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });

      const data = await res.json();

      if (!data.success) {
        console.error('Trial creation failed:', data.message);
        setProcessingTrial(false);
        return;
      }

      // Load Razorpay script if not already loaded
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (typeof window.Razorpay === 'undefined') {
          console.error('Razorpay SDK not loaded');
          setProcessingTrial(false);
          return;
        }

        // Razorpay checkout options
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          subscription_id: data.subscription.razorpaySubscriptionId,
          name: 'Forenotes',
          description: `7-Day Free Trial - ${planId.replace(/_/g, ' ')}`,
          currency: 'INR',
          handler: async function (response) {
            console.log('Trial subscription authorized:', response);
            // Subscription is now authorized with card mandate
            // Razorpay webhook will activate the trial
            setProcessingTrial(false);
            router.push('/dashboard');
            router.refresh();
          },
          modal: {
            ondismiss: function () {
              console.log('Trial signup cancelled by user');
              // Clean up the abandoned 'created' subscription
              if (data.subscription?.id) {
                fetch('/api/subscription/cleanup', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ subscriptionId: data.subscription.id })
                }).catch(err => console.error('Cleanup failed:', err));
              }
              setProcessingTrial(false);
            }
          },
          prefill: {
            email: user?.emailAddresses?.[0]?.emailAddress || '',
            contact: user?.phoneNumbers?.[0]?.phoneNumber || ''
          },
          theme: {
            color: '#2934FF'
          },
          config: {
            display: {
              preferences: {
                show_default_blocks: true
              }
            }
          }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      };

      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        setProcessingTrial(false);
      };

    } catch (error) {
      console.error('Failed to start trial:', error);
      setProcessingTrial(false);
    }
  };

  const handleSpecialOfferSelect = async () => {
    if (!isSignedIn) {
      const currentPath = window.location.pathname;
      router.push(`/auth/sign-in?redirect_url=${encodeURIComponent(currentPath)}`);
      return;
    }

    setProcessingSpecialOffer(true);
    try {
      // Create one-time payment order
      const res = await fetch('/api/subscription/create-onetime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (data.success) {
        // Initialize Razorpay checkout for one-time payment
        initiateSpecialOfferCheckout(data);
      } else {
        console.error('Failed to create order:', data.error);
      }
    } catch (error) {
      console.error('Error creating special offer order:', error);
    } finally {
      setProcessingSpecialOffer(false);
    }
  };

  const initiateSpecialOfferCheckout = (orderData) => {
    if (!window.Razorpay) {
      console.error('Razorpay SDK not loaded');
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: 179900, // ₹1799 in paise
      currency: 'INR',
      order_id: orderData.orderId,
      name: 'Trading Journal',
      description: 'Launch Special - 6 Months Access',
      image: '/logo.png',
      handler: async function (response) {
        await verifySpecialOfferPayment(response);
      },
      prefill: {
        name: user?.fullName || '',
        email: user?.primaryEmailAddress?.emailAddress || ''
      },
      theme: {
        color: '#10B981' // Green color for special offer
      },
      config: {
        display: {
          preferences: {
            show_default_blocks: true
          }
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifySpecialOfferPayment = async (paymentData) => {
    try {
      const res = await fetch('/api/subscription/verify-onetime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      const data = await res.json();

      if (data.success && data.verified) {
        router.push('/payment/success');
      } else {
        console.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
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
      bonusMonths: 0,
      totalMonths: 6,
      monthlyEquivalent: 499,
      savingsPercent: 17,
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
      planId: '12_MONTHS',
      planName: 'Yearly',
      price: 5990,
      period: '/ year',
      isPopular: false,
      buttonVariant: 'secondary',
      billingPeriod: 12,
      bonusMonths: 0,
      totalMonths: 12,
      monthlyEquivalent: 499,
      savingsPercent: 17,
      features: [
        { text: 'Full trading journal access', included: true },
        { text: 'Advanced analytics & insights', included: true },
        { text: 'AI-powered trade assistant', included: true },
        { text: 'Performance tracking', included: true },
        { text: 'Psychology analysis', included: true },
        { text: 'Priority support', included: true },
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
                🎉 Start with 7 Days FREE Trial
              </p>
            </div>

            {/* Special Launch Offer - Conditionally Rendered */}
            {process.env.NEXT_PUBLIC_SHOW_SPECIAL_OFFER === 'true' && (
              <div className="w-full flex justify-center mb-12">
                <SpecialOfferCard
                  onSelect={handleSpecialOfferSelect}
                  isTrialEligible={isTrialEligible}
                  onTrialSelect={handleStartTrial}
                />
              </div>
            )}

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
                      onSelect={() => handleStartTrial(plan.planId)}
                      bonusMonths={plan.bonusMonths}
                      monthlyEquivalent={plan.monthlyEquivalent}
                      isTrialEligible={isTrialEligible}
                      onTrialSelect={() => handleStartTrial(plan.planId)}
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
}

// Wrap in Suspense to fix useSearchParams warning
export default function PricingSection(props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading pricing...</div>
      </div>
    }>
      <PricingSectionContent {...props} />
    </Suspense>
  );
}

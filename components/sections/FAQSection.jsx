'use client';
import React, { useState } from 'react';

const FAQSection = ({ className = '' }) => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      question: 'What is Forenotes?',
      answer:
        'Discover the power of Artificial Intelligence in trading. Our platform uses smart algorithms and real-time data to give you deep, accurate insights. Make faster, smarter decisions, reduce risks, and boost your trading profits with the help of AI.',
    },
    {
      question: 'Can I access Forenotes on mobile?',
      answer:
        'Yes, Forenotes is fully optimized for both desktop and mobile, ensuring a seamless experience everywhere.',
    },
    {
      question: 'Is Forenotes secure?',
      answer:
        'Yes, Forenotes uses top-tier encryption, multi-layer security, and solutions to keep your assets safe.',
    },
    {
      question: 'Do I need to verify my identity?',
      answer:
        'Yes, for security and compliance, identity verification is required for certain transactions.',
    },
    {
      question: 'How can I contact support?',
      answer: 'Our support team is available 24/7. Reach out via chat or email for any assistance.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section id="faq" className={`relative w-full bg-black py-24 ${className}`}>
      {/* Top decorative gradient */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[220px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(46, 55, 85, 0.5) 0%, transparent 70%)',
          transform: 'translateX(-50%)',
          opacity: 0.85,
        }}
      />
      {/* Background overlay (matched to ComparisonSection) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/30 to-transparent" />

      {/* Content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Icon and text container */}
          <div className="inline-flex items-center justify-center mb-6">
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
                  FAQS
                </span>
              </div>
            </div>
          </div>

          {/* Main title */}
          <h2 className="text-4xl md:text-5xl tracking-tight font-medium text-white mb-6">
            Some Common FAQ's
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-gray-400 max-w-2xl mx-auto tracking-tight">
            Get answers to your questions and learn about our platform
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="w-full md:max-w-2xl mx-auto overflow-hidden transition-all duration-300"
              style={{
                background: 'linear-gradient(108deg, rgb(18,20,38) 0%, rgb(0,0,0) 100%)',
                borderRadius: '10px',
                boxShadow: 'rgba(138,165,255,0.2) 0px 1px 0px 0px inset',
              }}
            >
              {/* Question container */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-200 focus:outline-none"
                style={{ transform: 'none', transformOrigin: '50% 50% 0px' }}
              >
                <h3 className="text-sm md:text-base font-medium text-white pr-3 leading-snug">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  <svg
                    className={`w-4 h-4 text-white transition-transform duration-300 ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    fill="currentColor"
                  >
                    <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z" />
                  </svg>
                </div>
              </button>

              {/* Answer container */}
              <div
                className={`overflow-hidden transition-[max-height] duration-500 ease-in-out will-change-[max-height] ${
                  openFAQ === index ? 'max-h-60' : 'max-h-0'
                }`}
                style={{
                  background:
                    openFAQ === index
                      ? 'linear-gradient(108deg, rgb(18,20,38) 0%, rgb(0,0,0) 100%)'
                      : undefined,
                  borderRadius: '0 0 10px 10px',
                }}
                aria-hidden={openFAQ !== index}
              >
                {/* Inner content: subtle blur that clears early while height still expanding */}
                <div
                  className={`px-4 pb-3 transition-all relative ${
                    openFAQ === index ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-0.5'
                  }`}
                  style={{
                    filter: openFAQ === index ? 'blur(0)' : 'blur(2px)',
                    // Filter (blur) transitions fast so it clears early on open and appears quickly on close
                    transition: 'opacity 340ms ease, transform 340ms ease, filter 140ms ease',
                    transform: 'none',
                    transformOrigin: '50% 50% 0px',
                  }}
                >
                  <p className="text-gray-300 text-xs md:text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom decorative gradient */}
       <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[220px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at bottom, rgba(46, 55, 85, 0.5) 0%, transparent 70%)',
          transform: 'translateX(-50%)',
          opacity: 0.9,
        }}
      />
    </section>
  );
};

export default FAQSection;
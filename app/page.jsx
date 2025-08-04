'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Plus, Twitter, Instagram, Facebook } from 'lucide-react';
import Navbar from '@/components/Navbar'; // Make sure this path is correct

// --- Reusable Components ---

const AnimatedSection = ({ children, className, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  useEffect(() => { if (inView) controls.start('visible'); }, [controls, inView]);
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        // ✅ FIX: Corrected the cubic-bezier values to be within the valid range for browser animation APIs.
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay } },
        hidden: { opacity: 0, y: 50 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const BenefitCard = ({ title, description, icon }) => (
  <div className="bg-gradient-to-b from-gray-900 to-black p-1 rounded-2xl border border-gray-800">
    <div className="bg-black p-8 rounded-[15px] h-full">
      <div className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-gray-400">{description}</p>
    </div>
  </div>
);

const FaqItem = ({ question, answer }) => (
  <details className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 group transition-all duration-300 hover:border-gray-700">
    <summary className="flex items-center justify-between cursor-pointer font-semibold list-none">
      {question}
      <Plus className="h-5 w-5 transition-transform duration-300 group-open:rotate-45 text-gray-500" />
    </summary>
    <p className="mt-4 text-gray-400">{answer}</p>
  </details>
);

// --- Main Landing Page Component ---
export default function LandingPage() {
  return (
    <div className="bg-black text-white font-sans overflow-x-hidden">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-40">
            <div className="absolute top-[-30vh] left-1/2 -translate-x-1/2 w-[100vw] h-[80vh] bg-[radial-gradient(circle_at_center,_rgba(41,52,255,0.3)_0%,_rgba(41,52,255,0)_50%)]"></div>
          </div>
          <div className="relative z-10">
            <AnimatedSection>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent !leading-tight">
                AI journal that actually helps you
              </h1>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-300">
                Forenotes connects emotion, execution, and outcome—AI translates your trading journey into measurable improvement.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <Link href="/dashboard">
                <button className="mt-10 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 transform transition-all duration-300">
                  Get Started Now
                </button>
              </Link>
            </AnimatedSection>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4">
          <div className="container mx-auto">
            <AnimatedSection className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold">Why Choose Us?</h2>
              <p className="mt-4 text-gray-400">Innovative AI for trading, powerful insights for profit.</p>
            </AnimatedSection>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatedSection delay={0.1}><BenefitCard title="Unbeatable Value" description="All-in-one features at a fraction of the cost of other platforms." icon={<Check className="text-green-400" />} /></AnimatedSection>
              <AnimatedSection delay={0.2}><BenefitCard title="Fully Customizable" description="Journal multiple strategies with filters, tags, and a dashboard built your way." icon={<Check className="text-green-400" />} /></AnimatedSection>
              <AnimatedSection delay={0.3}><BenefitCard title="Smart AI Insights" description="Get personalized analysis to improve your edge and understand your trading behavior." icon={<Check className="text-green-400" />} /></AnimatedSection>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-4 bg-gray-900/30">
           <div className="container mx-auto text-center max-w-4xl">
                <AnimatedSection>
                    <h2 className="text-4xl md:text-5xl font-bold">Flexible Pricing Plans</h2>
                    <p className="mt-4 text-gray-400">Choose a plan that fits your needs and unlock the full potential of our platform.</p>
                </AnimatedSection>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pro Plan */}
                    <AnimatedSection delay={0.1} className="bg-gray-900/50 p-8 rounded-2xl border-2 border-blue-500 shadow-2xl shadow-blue-500/20">
                        <h3 className="text-2xl font-semibold">Pro</h3>
                        <p className="mt-2 text-blue-400 font-medium">Popular</p>
                        <p className="text-5xl font-bold mt-6">$17 <span className="text-lg font-normal text-gray-400">/ month</span></p>
                        <ul className="mt-8 space-y-4 text-left">
                            <li className="flex items-center gap-3"><Check className="text-green-400 h-5 w-5" /> Advanced analytics</li>
                            <li className="flex items-center gap-3"><Check className="text-green-400 h-5 w-5" /> Team performance tracking</li>
                            <li className="flex items-center gap-3"><Check className="text-green-400 h-5 w-5" /> Priority customer support</li>
                        </ul>
                        <button className="mt-10 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Get Started Now</button>
                    </AnimatedSection>
                    {/* Enterprise Plan */}
                    <AnimatedSection delay={0.2} className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
                        <h3 className="text-2xl font-semibold">Enterprise</h3>
                        <p className="mt-2 text-gray-400">For large teams</p>
                        <p className="text-5xl font-bold mt-6">Custom</p>
                         <ul className="mt-8 space-y-4 text-left">
                            <li className="flex items-center gap-3"><Check className="text-green-400 h-5 w-5" /> Dedicated account manager</li>
                            <li className="flex items-center gap-3"><Check className="text-green-400 h-5 w-5" /> Custom reports & dashboards</li>
                            <li className="flex items-center gap-3"><Check className="text-green-400 h-5 w-5" /> Tailored onboarding</li>
                        </ul>
                        <button className="mt-10 w-full px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">Contact Sales</button>
                    </AnimatedSection>
                </div>
           </div>
        </section>

        {/* FAQ Section */}
        <section id="contact" className="py-24 px-4">
          <div className="container mx-auto max-w-3xl">
            <AnimatedSection className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold">Some Common FAQ's</h2>
              <p className="mt-4 text-gray-400">Get answers to your questions and learn about our platform.</p>
            </AnimatedSection>
            <AnimatedSection className="mt-12 space-y-4">
              <FaqItem question="What is Forenotes?" answer="Discover the power of Artificial Intelligence in trading. Our platform uses smart algorithms and real-time data to give you deep, accurate insights." />
              <FaqItem question="Can I access Forenotes on mobile?" answer="Yes, Forenotes is fully optimized for both desktop and mobile, ensuring a seamless experience everywhere." />
              <FaqItem question="Is Forenotes secure?" answer="Yes, Forenotes uses top-tier encryption and multi-layer security to keep your assets safe." />
            </AnimatedSection>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-800 py-16 px-4">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Forenotes. All rights reserved.</p>
          <div className="mt-6 flex justify-center gap-6">
            <Link href="#" className="hover:text-white transition-colors"><Twitter /></Link>
            <Link href="#" className="hover:text-white transition-colors"><Instagram /></Link>
            <Link href="#" className="hover:text-white transition-colors"><Facebook /></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

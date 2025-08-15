"use client";
import { useState } from 'react';
import SectionHeading from '../common/SectionHeading';
import PricingCard from '../common/PricingCard';

const PricingSection = () => {
    const [isYearly, setIsYearly] = useState(false);
    const proPrice = isYearly ? Math.round(12 * 12 * 0.7) : 12;

    return (
        <section className="py-20 text-center px-4">
            <SectionHeading>PRICING & PLANS</SectionHeading>
            <h2 className="text-4xl md:text-5xl font-bold mb-3.5 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Flexible Pricing Plans</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-12">Choose a plan that fits your needs and unlock the full potential of our platform</p>

            <div className="flex justify-center items-center mb-12">
                <div className="bg-gray-900/70 border border-gray-800 rounded-full p-1 flex items-center space-x-2">
                    <button onClick={() => setIsYearly(false)} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${!isYearly ? 'bg-gray-700' : 'bg-transparent'}`}>Monthly</button>
                    <button onClick={() => setIsYearly(true)} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors relative ${isYearly ? 'bg-gray-700' : 'bg-transparent'}`}>
                        Yearly
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">30% off</span>
                    </button>
                </div>
            </div>

            <div className="container mx-auto flex flex-col md:flex-row justify-center items-center gap-8">
                <PricingCard
                    plan="Pro"
                    price={`${proPrice}`}
                    period={isYearly ? '/ year' : '/ month'}
                    isPopular={true}
                    features={[
                        "Integrations with 3rd-party",
                        "Advanced analytics",
                        "Team performance tracking",
                        "Top grade security",
                        "Priority customer support",
                        "Detailed usage reports"
                    ]}
                />
                <PricingCard
                    plan="Enterprise"
                    price="Custom"
                    period=""
                    features={[
                        "Dedicated account manager",
                        "Custom reports & dashboards",
                        "Most performance usage",
                        "Tailored onboarding and training",
                        "Customizable API access",
                        "Dedicated success manager"
                    ]}
                />
            </div>
        </section>
    );
};

export default PricingSection;
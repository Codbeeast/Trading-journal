"use client";
import { motion } from 'framer-motion';
import { Star, Settings, BrainCircuit, Award, UserCheck, LifeBuoy } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import BenefitCard from '../common/BenefitCard';

const BenefitsSection = () => (
    <section className="py-20 text-center px-4">
        <SectionHeading>BENEFITS</SectionHeading>
        <h2 className="text-4xl md:text-5xl font-bold mb-3.5 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Why Choose Us?</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-12">Innovative AI for trading, powerful insights for profit.</p>
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <BenefitCard title="Unbeatable Value" description="All-in-one features at a fraction of the cost of other platforms." icon={<Star />} />
            <BenefitCard title="Fully Customizable" description="Journal multiple strategies with filters, tags, and a dashboard built your way." icon={<Settings />} />
            <BenefitCard title="Smart AI Insights" description="Get personalized analysis to improve your edge and understand your trading behavior." icon={<BrainCircuit />} />
            <BenefitCard title="Earn for Consistency" description="Get paid for journaling daily — your discipline deserves rewards." icon={<Award />} />
            <BenefitCard title="Minimalist & Easy" description="Clean, intuitive design that works for both beginners and pros." icon={<UserCheck />} />
            <BenefitCard title="Dedicated Support" description="Access expert assistance 24/7 to ensure you're never alone on your growth journey." icon={<LifeBuoy />} />
        </div>
    </section>
);

export default BenefitsSection;
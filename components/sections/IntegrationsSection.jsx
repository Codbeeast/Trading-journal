"use client";
import { motion } from 'framer-motion';
import { BrainCircuit, Bot, BarChart, ShieldCheck } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import IntegrationCard from '../common/IntegrationCard';
import AnimatedSection from '../common/AnimatedSection';

const IntegrationsSection = () => (
    <section className="py-20 px-4 text-center">
        <AnimatedSection>
            <SectionHeading>INTEGRATIONS</SectionHeading>
            <h2 className="text-4xl md:text-5xl font-bold mb-3.5 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Master Your Mind, Master The Markets</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-16 md:mb-24">Integrate powerful tools to build unshakable trading psychology.</p>
        </AnimatedSection>
        <div className="container mx-auto relative max-w-4xl h-[550px] md:h-[450px] flex items-center justify-center">
            {/* Animated Grid Lines */}
            <motion.div className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.5 }} viewport={{ once: true }} />
            <motion.div className="absolute h-full w-px bg-gradient-to-b from-transparent via-blue-500/30 to-transparent" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} transition={{ duration: 1, delay: 0.5 }} viewport={{ once: true }} />

            {/* Central Pulsing & Floating Logo */}
            <motion.div
                className="absolute"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="relative w-28 h-28 flex items-center justify-center">
                    <motion.span className="absolute inline-flex h-full w-full rounded-full bg-blue-500/50" animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                    <motion.span className="absolute inline-flex h-full w-full rounded-full bg-purple-500/50" animate={{ scale: [1, 2.2, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
                    <div className="relative w-24 h-24 bg-black/30 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center">
                        <img src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg" alt="Forenotes Logo" className="w-16 h-auto rounded-md" />
                    </div>
                </div>
            </motion.div>

            {/* Integration Cards */}
            <IntegrationCard text="Connect with Self-Awareness Understand your habits, emotions & thought patterns that influence trades." position="top-0 left-1/2 -translate-x-1/2 md:-translate-y-8" icon={<BrainCircuit />} delay={0.2} />
            <IntegrationCard text="Connect with Psychology Models Leverage proven psychological frameworks like CBT, NLP & emotional jourmaling." position="bottom-0 left-1/2 -translate-x-1/2 md:translate-y-8" icon={<Bot />} delay={0.4} />
            <IntegrationCard text="Connect with Your Emotional Data Track stress, excitement, fear, and confidence during each trading session." position="left-0 top-1/2 -translate-y-1/2 md:-translate-x-8" icon={<BarChart />} delay={0.6} />
            <IntegrationCard text="Connect with Automation & Reminders Set routines, reflection checkpoints & trigger-based nudges to stay disciplined." position="right-0 top-1/2 -translate-y-1/2 md:translate-x-8" icon={<ShieldCheck />} delay={0.8} />
        </div>
    </section>
);

export default IntegrationsSection;
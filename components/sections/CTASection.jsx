"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import SectionHeading from '../common/SectionHeading';

const CTASection = () => (
    <section className="py-20 text-center px-4 relative overflow-hidden">
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-900/40 rounded-full blur-3xl"></div>
        <div className="relative z-10">
            <SectionHeading>WHAT YOU STILL WAITING FOR</SectionHeading>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Grow Now with Forenotes</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">Unlock the power of AI to Trade smarter and grow Faster with our platform.</p>
            <Link href="/dashboard" passHref>
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.7)" }}
                    className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-blue-500/50 transition-all">
                    Get Started Now
                </motion.button>
            </Link>
        </div>
    </section>
);

export default CTASection;
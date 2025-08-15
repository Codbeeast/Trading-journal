"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import AnimatedSection from '../common/AnimatedSection';

const HeroSection = () => {
    return (
        <section className="relative text-center py-20 md:py-32 px-4">
            <AnimatedSection>
                <div className="flex justify-center items-center gap-3 mb-6">
                    <div className="flex -space-x-3">
                        <img className="w-8 h-8 rounded-full border-2 border-gray-800" src="https://framerusercontent.com/images/ETgoVdeITLLIYCHTFNeVuZDMyQY.png" alt="User avatar" />
                        <img className="w-8 h-8 rounded-full border-2 border-gray-800" src="https://framerusercontent.com/images/bnJJiW5Vfixlrz7M2pzoeyHBU.png" alt="User avatar" />
                        <img className="w-8 h-8 rounded-full border-2 border-gray-800" src="https://framerusercontent.com/images/rlizSNVuxrrqd6I5hGaSxwqn0Os.png" alt="User avatar" />
                        <img className="w-8 h-8 rounded-full border-2 border-gray-800" src="https://framerusercontent.com/images/X0pqhTmlK8gdYqPbljhuLXlyd0I.png" alt="User avatar" />
                    </div>
                    <p className="text-sm text-gray-300">Join 10,000+ other loving customers</p>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                    AI journal that actually helps you
                </h1>
                <p className="max-w-2xl mx-auto text-gray-300 text-lg md:text-xl mb-8">
                    Forenotes connects emotion, execution, and outcome—AI translates your trading journey into measurable improvement
                </p>
                <Link href="/dashboard" passHref>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.7)" }}
                        className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg shadow-blue-500/50 transition-all">
                        Get Started Now
                    </motion.button>
                </Link>
            </AnimatedSection>
        </section>
    );
};

export default HeroSection;
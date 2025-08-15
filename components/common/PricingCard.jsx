"use client";
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

const PricingCard = ({ plan, price, period, isPopular, features }) => (
    <div className={`bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border border-gray-800 w-full max-w-sm ${isPopular ? 'border-blue-500' : ''}`}>
        <div className="flex justify-between items-center mb-4">
            <h4 className="text-2xl font-bold">{plan}</h4>
            {isPopular && <span className="bg-blue-600 text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>}
        </div>
        <div className="flex items-baseline mb-6">
            <p className="text-5xl font-bold">{price}</p>
            <span className="text-gray-400 ml-1">{period}</span>
        </div>
        <Link href="/dashboard" passHref>
            <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.7)" }}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${isPopular ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                Get Started Now
            </motion.button>
        </Link>
        <ul className="text-left mt-8 space-y-4">
            <p className="text-sm text-gray-400">Includes:</p>
            {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default PricingCard;
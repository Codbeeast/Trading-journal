"use client";
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Zap, Clock, Gem, BarChart, Percent } from 'lucide-react';
import AnimatedInfoCard from '../common/AnimatedInfoCard';

const FeaturesSection = () => (
    <section className="py-20 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.3)" }}
                className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 relative overflow-hidden min-h-[400px]">
                <h3 className="text-2xl font-bold mb-4">Distinguish yourself</h3>
                <p className="text-gray-400 mb-6">Discover the power of Artificial Intelligence in trading. Our platform uses smart algorithms and real-time data to give you deep, accurate insights.</p>
                <div className="relative h-48 w-auto">
                    <AnimatedInfoCard
                        title="Forenotes"
                        imgSrc="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg"
                        icon={<CheckCircle className="w-4 h-4 text-green-500" />}
                        position="top-0 left-4"
                        delay={0.4}
                        className="flex items-center gap-2"
                        imgClassName="w-8.5 h-8 rounded-full object-cover"
                    />
                    <AnimatedInfoCard
                        title="Robinson jr"
                        imgSrc="https://framerusercontent.com/images/PQuVtaPx0bm7On63y46yxJIM.png"
                        icon={<CheckCircle className="w-4 h-4 text-green-500" />}
                        position="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        delay={0.6}
                    />
                    <AnimatedInfoCard
                        title="Crystalio"
                        imgSrc="https://framerusercontent.com/images/AtXPNff5LTVvIV6wxVjP76Wnvc.svg"
                        icon={<CheckCircle className="w-4 h-4 text-green-500" />}
                        position="bottom-0 right-4"
                        delay={0.8}
                    />
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.3)" }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 min-h-[400px]">
                <h3 className="text-2xl font-bold mb-4">Elevate Your Trading</h3>
                <p className="text-gray-400 mb-6">Unlock the Full Potential of Your Trading Strategy with Our Cutting-Edge Platform</p>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <img src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg" alt="Forenotes" className="w-8 h-6 rounded-full" />
                            <span className="font-semibold">Forenotes</span>
                        </div>
                        <img src="https://framerusercontent.com/images/PQuVtaPx0bm7On63y46yxJIM.png" alt="Robinson" className="w-6 h-6 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center"><span>Trading</span> <TrendingUp className="w-4 h-4 text-green-500" /></div>
                        <div className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center"><span>Consistent FX Returns</span> <TrendingUp className="w-4 h-4 text-green-500" /></div>
                        <div className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center"><span>Entry/Exit Strategies</span> <TrendingUp className="w-4 h-4 text-green-500" /></div>
                        <div className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center"><span>Breakout Trading</span> <TrendingUp className="w-4 h-4 text-green-500" /></div>
                        <div className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center"><span>Position Sizing</span> <TrendingUp className="w-4 h-4 text-green-500" /></div>
                        <div className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center"><span>Trend Following</span> <TrendingUp className="w-4 h-4 text-green-500" /></div>
                    </div>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.3)" }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 min-h-[400px]">
                <h3 className="text-2xl font-bold mb-4">Elevate Your Trading Game with Our Cutting-Edge Platform</h3>
                <p className="text-gray-400 mb-6">Your data-driven guide to making informed trading decisions.</p>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">See Growth</h4>
                        <div className="flex text-xs bg-gray-800 rounded-full p-1">
                            <button className="px-3 py-1 rounded-full bg-gray-700">Monthly Earnings</button>
                            <button className="px-3 py-1 rounded-full">Last 24hrs</button>
                        </div>
                    </div>
                    <div className="h-24 bg-gray-800 rounded-md mb-4 flex items-end p-2">
                        <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
                            <motion.path
                                d="M 0 40 Q 15 10, 30 30 T 60 20 Q 80 45, 100 35"
                                stroke="#3b82f6"
                                fill="none"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />
                        </svg>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-md">
                        <h5 className="font-semibold mb-2">See Growth</h5>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Highly Accurate Suggestions</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Trade & Grow</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Start Growing Now with AI</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.3)" }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 min-h-[400px]">
                <h3 className="text-2xl font-bold mb-4">Designed for Traders</h3>
                <p className="text-gray-400 mb-6">Elevate Your Trading Game with Our Cutting-Edge Platform</p>
                <div className="space-y-3">
                    <div className="bg-gray-800/50 p-3 rounded-md flex items-center gap-3"><Zap className="w-5 h-5 text-blue-500" /> Technical Indicators</div>
                    <div className="bg-gray-800/50 p-3 rounded-md flex items-center gap-3"><Clock className="w-5 h-5 text-blue-500" /> Last 24hrs</div>
                    <div className="bg-gray-800/50 p-3 rounded-md flex items-center gap-3"><Gem className="w-5 h-5 text-blue-500" /> Pattern Recognition</div>
                    <div className="bg-gray-800/50 p-3 rounded-md flex items-center gap-3"><BarChart className="w-5 h-5 text-blue-500" /> Market Sentiment</div>
                    <div className="bg-gray-800/50 p-3 rounded-md flex items-center gap-3"><Percent className="w-5 h-5 text-blue-500" /> Conversion</div>
                    <div className="bg-gray-800/50 p-3 rounded-md flex items-center gap-3"><TrendingUp className="w-5 h-5 text-blue-500" /> Grow Income</div>
                </div>
            </motion.div>
        </div>
    </section>
);

export default FeaturesSection;
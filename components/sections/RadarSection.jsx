'use client';

import { motion } from 'framer-motion';
import { Zap, ShieldCheck, BarChart } from 'lucide-react';

// --- Reusable Components ---
const AnimatedSection = ({ children, className = '', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut", delay }}
        className={className}
    >
        {children}
    </motion.div>
);

const SectionHeading = ({ children }) => (
    <div className="inline-block bg-blue-500/10 text-blue-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
        {children}
    </div>
);

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        className="relative p-[1px] rounded-2xl overflow-hidden group"
        variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
        }}
        whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.3)" }}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative bg-black/60 backdrop-blur-lg rounded-[15px] p-8 text-left h-full">
            <div className="w-12 h-12 bg-gray-800/50 rounded-lg mb-4 flex items-center justify-center text-blue-400 border border-white/10">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
            <p className="text-gray-400">{description}</p>
        </div>
    </motion.div>
);

// --- Main Radar Section Component ---
const RadarSection = () => {
    return (
        <section className="relative w-full flex flex-col items-center justify-center text-center py-20 px-4 overflow-hidden bg-black">

            {/* Background decorative elements */}
            <div className="absolute inset-0 z-0">
                {/* Soft animated gradient */}
                <motion.div
                    className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(0,0,0,0)_60%)]"
                    animate={{ opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Light leak shimmer */}
                <motion.div
                    className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-blue-500/10"
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-6xl">
                {/* Radar Animation */}
                <div className="relative w-[300px] h-[150px] sm:w-[450px] sm:h-[225px] md:w-[600px] md:h-[300px] mb-8">
                    {/* Main Glass Arc */}
                    <div className="absolute top-0 left-0 w-full h-full bg-black/20 backdrop-blur-md border-b border-white/10 rounded-t-full overflow-hidden shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]"></div>

                    {/* Radar Sweep */}
                    <motion.div
                        className="absolute top-0 left-0 w-full h-[200%] origin-bottom"
                        style={{
                            maskImage: 'radial-gradient(circle at 50% 0, black 0%, transparent 70%)',
                            WebkitMaskImage: 'radial-gradient(circle at 50% 0, black 0%, transparent 70%)',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
                    >
                        <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_100%,rgba(59,130,246,0)_0%,rgba(59,130,246,0.5)_15%,rgba(59,130,246,0.8)_16%,rgba(59,130,246,0)_35%)]"></div>
                    </motion.div>

                    {/* Radar Glow Trail */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.2),transparent_70%)] blur-sm"></div>
                    </motion.div>

                    {/* Concentric Arcs */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 300">
                        <motion.path d="M 50 300 A 250 250 0 0 1 550 300" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" />
                        <motion.path d="M 125 300 A 175 175 0 0 1 475 300" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" />
                        <motion.path d="M 200 300 A 100 100 0 0 1 400 300" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" />
                    </svg>

                    {/* Central Text Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 md:pt-12">
                        <motion.div
                            className="inline-block bg-blue-500/10 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            AI-DRIVEN EFFICIENCY
                        </motion.div>
                        <motion.h2
                            className="text-3xl md:text-5xl font-bold text-white"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            Never Miss an Opportunity
                        </motion.h2>
                        <motion.p
                            className="text-gray-400 mt-2 text-sm md:text-base"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            Capture Trades, Analyze Trends, Centralize Insights.
                        </motion.p>
                    </div>
                </div>

                {/* Feature Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ staggerChildren: 0.2 }}
                >
                    <FeatureCard
                        icon={<Zap />}
                        title="Effortless Integration"
                        description="Your data is synced in real-time across devices, ensuring you stay connected and informed."
                    />
                    <FeatureCard
                        icon={<ShieldCheck />}
                        title="Secure & Scalable"
                        description="Enterprise-grade encryption protects your information, while flexible tools adapt to your needs."
                    />
                    <FeatureCard
                        icon={<BarChart />}
                        title="Actionable Insights"
                        description="Leverage AI-powered analytics to identify trends, predict outcomes, and optimize your trading effortlessly."
                    />
                </motion.div>

                {/* Bottom Bar */}
                <motion.div
                    className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                        <Zap size={18} />
                        <span className="font-medium">Smart Analytics</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                        <ShieldCheck size={18} />
                        <span className="font-medium">Real-Time Collaboration</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                        <BarChart size={18} />
                        <span className="font-medium">Fast Trading</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default RadarSection;

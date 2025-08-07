"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle, ChevronDown, BrainCircuit, Bot, BarChart, ShieldCheck, Zap, Gem, UserCheck, Settings, Award, LifeBuoy, TrendingUp, Clock, Percent } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar'; // Assuming you have a Navbar component
import Footer from '@/components/Footer'; // Import the new Footer component

const Page = () => {
  return (
    <div className="bg-black text-white font-sans relative">
      <BlueLightLeakBackground />
     <Navbar /> 
      <main className="overflow-hidden relative z-10">
        {/* Hero Section */}
        <section className="relative text-center py-20 md:py-32 px-4 overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-center items-center gap-2 mb-6">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-gray-800" src="https://framerusercontent.com/images/ETgoVdeITLLIYCHTFNeVuZDMyQY.png" alt="User avatar" />
                <img className="w-8 h-8 rounded-full border-2 border-gray-800" src="https://framerusercontent.com/images/bnJJiW5Vfixlrz7M2pzoeyHBU.png" alt="User avatar" />
                <img className="w-8 h-8 rounded-full border-2 border-gray-800" src="https://framerusercontent.com/images/rlizSNVuxrrqd6I5hGaSxwqn0Os.png" alt="User avatar" />
                <img className="w-8 h-8 rounded-full border-2 border-gray-800" src="https://framerusercontent.com/images/X0pqhTmlK8gdYqPbljhuLXlyd0I.png" alt="User avatar" />
              </div>
              <p className="text-sm text-gray-300">Join 10,000+ other loving customers</p>
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              AI journal that actually helps you
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto text-gray-300 text-lg md:text-xl mb-8">
              Forenotes connects emotion, execution, and outcome—AI translates your trading journey into measurable improvement
            </motion.p>
            <Link href="/dashboard" passHref>
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.7)" }}
                className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-blue-500/50 transition-all">
                Get Started Now
              </motion.button>
            </Link>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap opacity-60 grayscale">
              <img src="https://framerusercontent.com/images/otv1rEDn2X7h8TFtKPCksQmAEKQ.svg" alt="Company logo" className="h-6" />
              <img src="https://framerusercontent.com/images/rrRoFs4icQtustYbIGm5r5DXREI.svg" alt="Company logo" className="h-6" />
              <img src="https://framerusercontent.com/images/hhTRf8RciR9bakkAgIckAkEiQM.svg" alt="Company logo" className="h-6" />
              <img src="https://framerusercontent.com/images/1ph1389RD4RtUDEfqVhWbujyF7s.svg" alt="Company logo" className="h-6" />
              <img src="https://framerusercontent.com/images/Yn3MOOL9rTXhK9U8MLvSnEoNP8.svg" alt="Company logo" className="h-5" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <FeaturesSection />
        
        {/* Benefits Section */}
        <BenefitsSection />

        {/* Reviews Section */}
        <ReviewsSection />

        {/* Founder's Note Section */}
        <FounderNoteSection />

        {/* Integrations Section */}
        <IntegrationsSection />

        {/* Comparison Section */}
        <ComparisonSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ Section */}
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-3xl">
                <div className="text-center mb-12">
                    <SectionHeading>FAQ'S SECTION</SectionHeading>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">Some Common FAQ's</h2>
                    <p className="text-gray-400">Get answers to your questions and learn about our platform</p>
                </div>
                <div className="space-y-4">
                    <FAQItem 
                        question="What is Forenotes?" 
                        answer="Discover the power of Artificial Intelligence in trading. Our platform uses smart algorithms and real-time data to give you deep, accurate insights. Make faster, smarter decisions, reduce risks, and boost your trading profits with the help of AI." 
                        isOpenDefault={true}
                    />
                    <FAQItem 
                        question="Can I access Forenotes on mobile?" 
                        answer="Yes, Forenotes is fully optimized for both desktop and mobile, ensuring a seamless experience everywhere." 
                    />
                    <FAQItem 
                        question="Is Forenotes secure?" 
                        answer="Yes, Forenotes uses top-tier encryption, multi-layer security, and solutions to keep your assets safe." 
                    />
                    <FAQItem 
                        question="Do I need to verify my identity?" 
                        answer="Yes, for security and compliance, identity verification is required for certain transactions." 
                    />
                    <FAQItem 
                        question="How can I contact support?" 
                        answer="Our support team is available 24/7. Reach out via chat or email for any assistance." 
                    />
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center px-4 relative overflow-hidden">
            <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-900/40 rounded-full blur-3xl"></div>
            <div className="relative z-10">
                <SectionHeading>WHAT YOU STILL WAITING FOR</SectionHeading>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Grow Now with Forenotes</h2>
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
      </main>
      <Footer />
    </div>
  );
};

const SectionHeading = ({ children }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="inline-block bg-gray-800/50 border border-gray-700 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-300 mb-4"
    >
        {children}
    </motion.div>
);

const BlueLightLeakBackground = () => (
    <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div 
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/30 rounded-full blur-3xl"
            animate={{
                x: [-100, 100, -100],
                y: [-100, 100, -100],
                rotate: [0, 180, 360],
            }}
            transition={{
                duration: 40,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror"
            }}
        />
        <motion.div 
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-500/30 rounded-full blur-3xl"
            animate={{
                x: [100, -100, 100],
                y: [100, -100, 100],
                rotate: [0, -180, -360],
            }}
            transition={{
                duration: 45,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror"
            }}
        />
    </div>
);

const FeaturesSection = () => (
    <section className="py-20 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.3)"}}
                className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 relative overflow-hidden min-h-[400px]">
                <h3 className="text-2xl font-bold mb-4">Distinguish yourself</h3>
                <p className="text-gray-400 mb-6">Discover the power of Artificial Intelligence in trading. Our platform uses smart algorithms and real-time data to give you deep, accurate insights.</p>
                <div className="relative h-48">
                    <AnimatedInfoCard
                        title="Forenotes"
                        imgSrc="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg"
                        icon={<CheckCircle className="w-4 h-4 text-green-400" />}
                        position="top-0 left-4"
                        delay={0.4}
                    />
                    <AnimatedInfoCard
                        title="Robinson jr"
                        imgSrc="https://framerusercontent.com/images/PQuVtaPx0bm7On63y46yxJIM.png"
                        icon={<CheckCircle className="w-4 h-4 text-green-400" />}
                        position="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        delay={0.6}
                    />
                    <AnimatedInfoCard
                        title="Crystalio"
                        imgSrc="https://framerusercontent.com/images/AtXPNff5LTVvIV6wxVjP76Wnvc.svg"
                        icon={<CheckCircle className="w-4 h-4 text-green-400" />}
                        position="bottom-0 right-4"
                        delay={0.8}
                    />
                </div>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.3)"}}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 min-h-[400px]">
              <h3 className="text-2xl font-bold mb-4">Elevate Your Trading</h3>
              <p className="text-gray-400 mb-6">Unlock the Full Potential of Your Trading Strategy with Our Cutting-Edge Platform</p>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 space-y-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <img src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg" alt="Forenotes" className="w-6 h-6 rounded-full" />
                         <span className="font-semibold">Forenotes</span>
                    </div>
                    <img src="https://framerusercontent.com/images/PQuVtaPx0bm7On63y46yxJIM.png" alt="Robinson" className="w-6 h-6 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center"><span>Trading</span> <TrendingUp className="w-4 h-4 text-green-400" /></div>
                    <div className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center"><span>Consistent FX Returns</span> <TrendingUp className="w-4 h-4 text-green-400" /></div>
                    <div className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center"><span>Entry/Exit Strategies</span> <TrendingUp className="w-4 h-4 text-green-400" /></div>
                    <div className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center"><span>Breakout Trading</span> <TrendingUp className="w-4 h-4 text-green-400" /></div>
                    <div className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center"><span>Position Sizing</span> <TrendingUp className="w-4 h-4 text-green-400" /></div>
                    <div className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center"><span>Trend Following</span> <TrendingUp className="w-4 h-4 text-green-400" /></div>
                </div>
              </div>
            </motion.div>
             <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.3)"}}
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
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400"/> Highly Accurate Suggestions</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400"/> Trade & Grow</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400"/> Start Growing Now with AI</li>
                    </ul>
                </div>
              </div>
            </motion.div>
             <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.3)"}}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 min-h-[400px]">
              <h3 className="text-2xl font-bold mb-4">Designed for Traders</h3>
              <p className="text-gray-400 mb-6">Elevate Your Trading Game with Our Cutting-Edge Platform</p>
              <div className="space-y-3">
                <div className="bg-gray-800/50 p-3 rounded-md flex items-center gap-3"><Zap className="w-5 h-5 text-blue-400" /> Technical Indicators</div>
                <div className="bg-gray-800/50 p-3 rounded-md flex items-center gap-3"><Clock className="w-5 h-5 text-blue-400" /> Last 24hrs</div>
                <div className="bg-gray-800/50 p-3 rounded-md flex items-center gap-3"><Gem className="w-5 h-5 text-blue-400" /> Pattern Recognition</div>
                <div className="bg-gray-800/50 p-3 rounded-md flex items-center gap-3"><BarChart className="w-5 h-5 text-blue-400" /> Market Sentiment</div>
                <div className="bg-gray-800/50 p-3 rounded-md flex items-center gap-3"><Percent className="w-5 h-5 text-blue-400" /> Conversion</div>
                <div className="bg-gray-800/50 p-3 rounded-md flex items-center gap-3"><TrendingUp className="w-5 h-5 text-blue-400" /> Grow Income</div>
              </div>
            </motion.div>
        </div>
    </section>
);

const AnimatedInfoCard = ({ title, imgSrc, icon, position, delay }) => (
    <motion.div
        className={`absolute ${position} z-10`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ scale: 1.1, zIndex: 20, boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.5)' }}
    >
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-2 flex items-center gap-2">
            <img src={imgSrc} alt={title} className="w-8 h-8 rounded-full" />
            <span className="font-semibold text-sm">{title}</span>
            {icon}
        </div>
    </motion.div>
);


const BenefitsSection = () => (
    <section className="py-20 text-center px-4">
        <SectionHeading>BENEFITS</SectionHeading>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Us?</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-12">Innovative AI for trading, powerful insights for profit.</p>
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <BenefitCard title="Unbeatable Value" description="All-in-one features at a fraction of the cost of other platforms." icon={<Star />} />
            <BenefitCard title="Fully Customizable" description="Journal multiple strategies with filters, tags, and a dashboard built your way." icon={<Settings />} />
            <BenefitCard title="Smart AI Insights" description="Get personalized analysis to improve your edge and understand your trading behavior." icon={<BrainCircuit />} />
            <BenefitCard title="Earn for Consistency" description="Get paid for journaling daily — your discipline deserves rewards." icon={<Award />} />
            <BenefitCard title="Minimalist & Easy" description="Clean, intuitive design that works for both beginners and pros." icon={<UserCheck />} />
            <BenefitCard title="Dedicated Support" description="Access expert assistance 24/7 to ensure you’re never alone on your growth journey." icon={<LifeBuoy />} />
        </div>
    </section>
);


const BenefitCard = ({ title, description, icon }) => (
    <motion.div 
        className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border border-gray-800 text-left"
        whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.3)" }}
        transition={{ type: 'spring', stiffness: 300 }}
    >
        <div className="w-12 h-12 bg-gray-800 rounded-lg mb-4 flex items-center justify-center text-blue-400">
            {icon}
        </div>
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <p className="text-gray-400">{description}</p>
    </motion.div>
);

const ReviewsSection = () => {
    const reviews = [
        { review: '"Saves me so much time analyzing charts. Let the AI do the heavy lifting."', author: 'Alex jonas', role: 'Trader', avatar: 'https://framerusercontent.com/images/ETgoVdeITLLIYCHTFNeVuZDMyQY.png' },
        { review: '"Forenotes has been a game-changer for my consistency. Highly recommend!"', author: 'John Robert', role: 'Trader', avatar: 'https://framerusercontent.com/images/QmmaDSjXyuZNNDsZdt23lDVXI.png' },
        { review: '"Good tool to validate my own ideas before pulling the trigger."', author: 'jack hanma', role: 'JK Finance', avatar: 'https://framerusercontent.com/images/7qBFv2WmuOwj4qUFS7XUzQSFL4.jpg' },
        { review: '"The insights are scarily accurate. It\'s like having a trading mentor."', author: 'Samantha Bee', role: 'Day Trader', avatar: 'https://framerusercontent.com/images/0zuVQ2JmvxEtdnpdOq5FtRJxmNY.png' },
        { review: '"I finally understand my emotional triggers thanks to this journal."', author: 'Mike Chen', role: 'Swing Trader', avatar: 'https://framerusercontent.com/images/7qBFv2WmuOwj4qUFS7XUzQSFL4.jpg' },
        { review: '"The UI is clean and intuitive. A joy to use every day."', author: 'Isabelle Rossi', role: 'Forex Trader', avatar: 'https://framerusercontent.com/images/Z9Z59ZjzMfqaMdHGgXmijuQ8hAw.jpg' },
    ];

    return (
        <section className="py-20 text-center px-4">
            <SectionHeading>WALL OF LOVE</SectionHeading>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Traders</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-12">Here’s what people worldwide are saying about us</p>
            <motion.div 
                className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ staggerChildren: 0.1 }}
            >
                {reviews.map((review, i) => (
                    <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                        <ReviewCard {...review} />
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

const ReviewCard = ({ review, author, role, avatar }) => (
    <div className="bg-gradient-to-b from-gray-900 to-black p-6 rounded-2xl border border-gray-800 text-left h-full">
        <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
        </div>
        <p className="mb-6 text-gray-300">{review}</p>
        <div className="flex items-center gap-4 mt-auto">
            <img src={avatar} alt={author} className="w-12 h-12 rounded-full" />
            <div>
                <p className="font-semibold">{author}</p>
                <p className="text-sm text-gray-400">{role}</p>
            </div>
        </div>
    </div>
);

const PricingSection = () => {
    const [isYearly, setIsYearly] = useState(false);
    const proPrice = isYearly ? Math.round(12 * 12 * 0.7) : 12;

    return (
        <section className="py-20 text-center px-4">
            <SectionHeading>PRICING & PLANS</SectionHeading>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Flexible Pricing Plans</h2>
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
                    price={`$${proPrice}`}
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

const FAQItem = ({ question, answer, isOpenDefault = false }) => {
    const [isOpen, setIsOpen] = useState(isOpenDefault);

    return (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <h5 className="font-semibold text-lg">{question}</h5>
                <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <p className="text-gray-400 mt-4 transition-all duration-300 ease-in-out">
                    {answer}
                </p>
            )}
        </div>
    );
};

const FounderNoteSection = () => (
  <section className="py-20 px-4 text-center">
    <div className="container mx-auto max-w-3xl">
      <SectionHeading>FOUNDERS NOTE</SectionHeading>
      <blockquote className="text-2xl md:text-4xl font-medium my-8 leading-relaxed">
        “Boost your trading profitability by doubling down on winning strategies and cutting losses on what doesn't work. That's the AI-powered advantage of Forenotes.”
      </blockquote>
      <p className="text-gray-400">Founder</p>
    </div>
  </section>
);

const IntegrationsSection = () => (
    <section className="py-20 px-4 text-center">
      <SectionHeading>INTEGRATIONS</SectionHeading>
      <h2 className="text-4xl md:text-5xl font-bold mb-4">Master Your Mind, Master The Markets</h2>
      <p className="text-gray-400 max-w-2xl mx-auto mb-16">Integrate powerful tools to build unshakable trading psychology.</p>
      <div className="container mx-auto relative max-w-4xl h-[450px] md:h-[400px] flex items-center justify-center">
        <motion.div 
          className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        <motion.div 
          className="absolute h-full w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        <div className="absolute">
          <div className="relative w-24 h-24 flex items-center justify-center">
              <motion.span 
                  className="absolute inline-flex h-full w-full rounded-full bg-blue-400"
                  animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span 
                  className="absolute inline-flex h-full w-full rounded-full bg-blue-500"
                  animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
              <div className="relative w-24 h-24 bg-blue-900/50 rounded-full flex items-center justify-center">
                  <img src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg" alt="Forenotes Logo" className="w-16 h-auto" />
              </div>
          </div>
        </div>
        <IntegrationCard text="Connect with Self-Awareness" position="top-0 left-1/2 -translate-x-1/2" icon={<BrainCircuit />} delay={0.2} />
        <IntegrationCard text="Connect with Psychology Models" position="bottom-0 left-1/2 -translate-x-1/2" icon={<Bot />} delay={0.4} />
        <IntegrationCard text="Connect with Your Emotional Data" position="left-0 top-1/2 -translate-y-1/2" icon={<BarChart />} delay={0.6} />
        <IntegrationCard text="Connect with Automation & Reminders" position="right-0 top-1/2 -translate-y-1/2" icon={<ShieldCheck />} delay={0.8} />
      </div>
    </section>
  );
  
  const IntegrationCard = ({ text, position, icon, delay }) => (
    <motion.div 
      className={`absolute ${position} w-52 md:w-64`}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{boxShadow: "0px 0px 25px rgba(59, 130, 246, 0.5)"}}
    >
      <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-lg p-4 text-center">
        <div className="w-10 h-10 bg-gray-800 rounded-lg mb-3 mx-auto flex items-center justify-center text-blue-400">
          {icon}
        </div>
        <p className="text-sm">{text}</p>
      </div>
    </motion.div>
  );

const ComparisonSection = () => (
  <section className="py-20 px-4">
    <div className="container mx-auto max-w-5xl">
      <div className="text-center mb-12">
        <SectionHeading>COMPARISON</SectionHeading>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Forenotes Stands Out</h2>
        <p className="text-gray-400">See how we compare against others in performance, growth</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border border-gray-800">
          <h3 className="text-2xl font-bold mb-6 text-center">Forenotes</h3>
          <ul className="space-y-4">
            <ComparisonItem text="Effortless & Fast Trading" icon={<CheckCircle className="w-5 h-5 text-blue-400" />} />
            <ComparisonItem text="Highly scalable & flexible" icon={<CheckCircle className="w-5 h-5 text-blue-400" />} />
            <ComparisonItem text="Advanced dashboard control" icon={<CheckCircle className="w-5 h-5 text-blue-400" />} />
            <ComparisonItem text="Built-in AI-driven analytics" icon={<CheckCircle className="w-5 h-5 text-blue-400" />} />
            <ComparisonItem text="User-friendly & intuitive design" icon={<CheckCircle className="w-5 h-5 text-blue-400" />} />
          </ul>
        </div>
        <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border border-gray-800">
          <h3 className="text-2xl font-bold mb-6 text-center">Others</h3>
          <ul className="space-y-4">
            <ComparisonItem text="Tiresome" icon={<XCircle className="w-5 h-5 text-red-400" />} />
            <ComparisonItem text="Rigid and non-scalable" icon={<XCircle className="w-5 h-5 text-red-400" />} />
            <ComparisonItem text="Basic dashboard functionalities" icon={<XCircle className="w-5 h-5 text-red-400" />} />
            <ComparisonItem text="Lack of advanced analytics" icon={<XCircle className="w-5 h-5 text-red-400" />} />
            <ComparisonItem text="Outdated and complex interfaces" icon={<XCircle className="w-5 h-5 text-red-400" />} />
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const ComparisonItem = ({ text, icon }) => (
  <li className="flex items-center gap-3">
    {icon}
    <span className="text-gray-300">{text}</span>
  </li>
);

export default Page;

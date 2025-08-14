'use client';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Phone } from 'lucide-react';

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, ease: "easeOut" },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const cardVariants = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.03, y: -5, transition: { duration: 0.3, ease: "easeOut" } },
};

// --- Reusable Components ---
const InfoCard = ({ icon, title, description, link, linkText }) => (
    <motion.div
        className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border border-gray-800 flex flex-col items-center text-center space-y-4"
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
    >
        <div className="p-3 bg-gray-800/50 rounded-lg border border-white/10">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
        <a href={link} className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
            {linkText}
        </a>
    </motion.div>
);

const StyledInput = ({ id, type = 'text', placeholder, rows, defaultValue }) => {
    return (
        <div>
            <label htmlFor={id} className="sr-only">{placeholder}</label>
            {type === 'textarea' ? (
                <textarea
                    id={id}
                    name={id}
                    placeholder={placeholder}
                    rows={rows}
                    defaultValue={defaultValue}
                    className="w-full bg-black/30 backdrop-blur-md text-gray-200 border border-white/10 rounded-md py-4 px-5 shadow-inner shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300 hover:border-blue-400 hover:ring-1"
                />
            ) : (
                <input
                    type={type}
                    id={id}
                    name={id}
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                    className="w-full bg-black/30 backdrop-blur-md text-gray-200 border border-white/10 rounded-md py-3 px-4 shadow-inner shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300 hover:border-blue-400 hover:ring-1"
                />
            )}
        </div>
    );
};

// --- Main Page Component ---
export default function ContactPage() {
  return (
    <>
      <Navbar />

      {/* Page wrapper: accounts for fixed navbar and anchors footer at bottom */}
      <div className="min-h-screen bg-black text-gray-200 font-sans relative overflow-hidden pt-20 flex flex-col">

        {/* Light Rays Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* 🌈 Rotating radial glow */}
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.2)_0%,_rgba(0,0,0,0)_50%)] mix-blend-screen blur-3xl"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 80, ease: "linear", repeat: Infinity }}
          />
          {/* 💫 Skewed light beam */}
          <motion.div
            className="absolute top-1/4 left-1/3 w-[150%] h-[150%] bg-gradient-to-r from-blue-500/10 via-blue-400/20 to-transparent transform -rotate-45 blur-2xl mix-blend-screen"
            animate={{ x: [0, 50, -50, 0] }}
            transition={{ duration: 30, ease: "easeInOut", repeat: Infinity }}
          />
          {/* 🌀 Subtle bottom glow */}
          <motion.div
            className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.1)_0%,_rgba(0,0,0,0)_70%)] blur-2xl mix-blend-screen"
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 100, ease: "linear", repeat: Infinity }}
          />
          {/* 🔆 Lens flare pulse */}
          <motion.div
            className="absolute top-[30%] left-[45%] w-32 h-32 rounded-full bg-gradient-radial from-white/80 via-blue-300/40 to-transparent blur-3xl opacity-60 mix-blend-screen"
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          />
          {/* Optional second flare */}
          <motion.div
            className="absolute bottom-[20%] right-[30%] w-24 h-24 rounded-full bg-gradient-radial from-pink-200/70 via-purple-300/30 to-transparent blur-2xl opacity-50 mix-blend-screen"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          />
        </div>

        {/* Main content: grows to push footer down; move page padding here */}
        <main className="relative z-10 flex-1 px-8 md:px-16 py-12">
          <motion.div
            className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left Section */}
            <div className="flex flex-col space-y-12">
              <motion.div variants={itemVariants}>
                <span className="inline-block bg-blue-500/10 text-blue-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                  CUSTOMERS FEEDBACK
                </span>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mt-2">
                  Early Customers Feedback
                </h1>
                <ul className="list-none mt-6 space-y-4 text-gray-400">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span>Hassle-Free Support. Link with our crew anytime</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span>Schedule a Demo Now. Witness our platform's performance</span>
                  </li>
                </ul>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoCard
                  icon={<Mail className="w-8 h-8 text-blue-400" />}
                  title="Reach Out to Us"
                  description="Have questions? We're here to help reach out"
                  link="mailto:teams@forenotes.com"
                  linkText="teams@forenotes.com"
                />
                <InfoCard
                  icon={<Phone className="w-8 h-8 text-blue-400" />}
                  title="Reach Out to Us"
                  description="Need assistance? Ring us up—we're at your service."
                  link="tel:+1234567890"
                  linkText="+1234567890"
                />
              </div>
            </div>

            {/* Right Section (Form) */}
            <motion.div
              className="bg-gradient-to-b from-gray-900 to-black backdrop-blur-md border border-gray-800 p-8 rounded-2xl shadow-lg shadow-blue-500/10 w-full"
              variants={itemVariants}
            >
              <form className="space-y-6">
                <StyledInput id="name" placeholder="Jane Smith" defaultValue="Jane Smith" />
                <StyledInput id="email" type="email" placeholder="jane@framer.com" defaultValue="jane@framer.com" />
                <StyledInput id="subject" placeholder="Subject of Interest" defaultValue="Product related" />
                <StyledInput id="product" placeholder="Product related" defaultValue="Product related" />
                <StyledInput id="message" type="textarea" placeholder="message goes here..." rows={4} defaultValue="message goes here..." />

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="newsletter"
                    name="newsletter"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 bg-gray-800 rounded border-gray-700 focus:ring-blue-500"
                  />
                  <label htmlFor="newsletter" className="text-sm text-gray-400">
                    Subscribe to Newsletter
                  </label>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.7)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-blue-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                >
                  Submit
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </main>
        <Footer />
      </div>
    </>
  );
}
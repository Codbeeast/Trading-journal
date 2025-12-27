import React from 'react';
import { motion } from 'framer-motion';
import { Settings, HelpCircle } from 'lucide-react';

const ChatHeader = () => {
  return (
    <motion.header
      className="bg-black/30 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/10 p-2 sm:p-3 md:p-5 z-40 m-1 sm:m-2 md:m-4 sticky top-0"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
    >
      <div className="flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2 sm:gap-3 md:gap-5 sm:ml-6"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden relative flex-shrink-0"
            animate={{
              boxShadow: [
                '0 0 20px rgba(255, 255, 255, 0.1)',
                '0 0 30px rgba(147, 51, 234, 0.2)',
                '0 0 20px rgba(255, 255, 255, 0.1)'
              ],
              rotate: [0, 1, -1, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            whileHover={{
              scale: 1.05,
              rotate: [0, 3, -3, 0],
              transition: { duration: 0.6, ease: "easeInOut" }
            }}
          >
            <img
              src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg"
              alt="Forenotes Logo"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <div className="min-w-0 flex-1">
            <motion.h2
              className="text-sm sm:text-lg md:text-2xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent tracking-wide truncate"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}
            >
              FoNo
            </motion.h2>
            <motion.p
              className="text-xs sm:text-sm text-gray-400 tracking-wide hidden sm:block truncate"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              AI-powered trading insights and analysis
            </motion.p>
          </div>
        </motion.div>


      </div>
    </motion.header>
  );
};

export default ChatHeader;
import React from 'react';
import { motion } from 'framer-motion';
import { Settings, HelpCircle } from 'lucide-react';

const ChatHeader = () => {
  return (
    <motion.header 
      className="bg-black/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/10 p-3 sm:p-5 relative z-10 m-2 sm:m-4"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
    >
      <div className="flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-3 sm:gap-5 sm:ml-5"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shadow-lg overflow-hidden relative"
            animate={{ 
              boxShadow: [
                '0 0 30px rgba(255, 255, 255, 0.1)',
                '0 0 40px rgba(147, 51, 234, 0.2)',
                '0 0 30px rgba(255, 255, 255, 0.1)'
              ],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, 5, -5, 0],
              transition: { duration: 0.6, type: "spring" }
            }}
          >
            <img 
              src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg" 
              alt="Forenotes Logo" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <div>
            <motion.h2 
              className="text-lg sm:text-2xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent tracking-wide"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}
            >
              Trade Journal Assistant
            </motion.h2>
            <motion.p 
              className="text-xs sm:text-sm text-gray-400 tracking-wide hidden sm:block"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              AI-powered trading insights and analysis
            </motion.p>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-2 sm:gap-4"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button 
            className="p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 backdrop-blur-sm"
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 10px 30px rgba(255, 255, 255, 0.1)"
            }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings size={16} className="sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
          </motion.button>
          <motion.button 
            className="p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 backdrop-blur-sm"
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 10px 30px rgba(255, 255, 255, 0.1)"
            }}
            whileTap={{ scale: 0.9 }}
          >
            <HelpCircle size={16} className="sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
          </motion.button>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default ChatHeader;
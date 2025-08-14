import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

const MessageInterface = ({ messages, isTyping, messagesEndRef }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  const welcomeVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar p-3 sm:p-8 space-y-4 sm:space-y-8 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent relative z-10">
      <AnimatePresence mode="wait">
        {messages.length === 0 && (
          <motion.div 
            className="text-center py-8 sm:py-16"
            variants={welcomeVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div 
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl shadow-lg border border-white/10 mx-auto mb-6 sm:mb-8 relative overflow-hidden"
              animate={{ 
                boxShadow: [
                  '0 0 30px rgba(255, 255, 255, 0.1)',
                  '0 0 40px rgba(147, 51, 234, 0.2)',
                  '0 0 30px rgba(255, 255, 255, 0.1)'
                ],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              whileHover={{ 
                scale: 1.1,
                rotate: 180,
                transition: { duration: 0.6, type: "spring" }
              }}
            >
              <img 
                src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg" 
                alt="Forenotes Logo" 
                className="w-full h-full object-cover rounded-3xl"
              />
            </motion.div>
            
            <motion.h3 
              className="text-2xl sm:text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent tracking-tight mb-4 sm:mb-6 px-4"
              style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: 700
              }}
            >
              Welcome to TradeBot AI
            </motion.h3>
            
            <motion.div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <Sparkles size={16} className="sm:w-5 sm:h-5 text-blue-400" />
              <motion.p 
                className="text-gray-400 max-w-xs sm:max-w-lg mx-auto leading-relaxed text-sm sm:text-base px-4"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              >
                Your intelligent trading companion for logging trades, analyzing performance, and gaining market insights.
              </motion.p>
              <Zap size={16} className="sm:w-5 sm:h-5 text-blue-400" />
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span>✨ AI-Powered Insights</span>
              <span className="hidden sm:inline">•</span>
              <span>📊 Real-time Analysis</span>
              <span className="hidden sm:inline">•</span>
              <span>🎯 Smart Recommendations</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6`}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              layout
            >
              <motion.div
                className={`max-w-[85%] sm:max-w-md lg:max-w-lg px-4 sm:px-6 py-3 sm:py-4 rounded-3xl relative overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-800/40 hover:shadow-blue-500/60 animate-gradient-move bg-[length:200%_200%]'
                    : 'bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 text-white hover:bg-white/15 hover:shadow-white/20'
                }`}
                whileHover={{ 
                  scale: 1.02,
                  y: -2,
                  boxShadow: message.type === 'user' 
                    ? '0 20px 40px rgba(59, 130, 246, 0.3)'
                    : '0 20px 40px rgba(255, 255, 255, 0.1)'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {message.type === 'user' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                )}
                
                <motion.p 
                  className="text-sm leading-relaxed relative z-10"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {message.content}
                </motion.p>
                <motion.p 
                  className={`text-xs mt-2 sm:mt-3 relative z-10 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {message.timestamp}
                </motion.p>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isTyping && (
          <motion.div 
            className="flex justify-start"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <motion.div 
              className="bg-black/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/10 px-4 sm:px-6 py-3 sm:py-4"
              animate={{ 
                boxShadow: [
                  '0 10px 30px rgba(255, 255, 255, 0.05)',
                  '0 15px 40px rgba(59, 130, 246, 0.2)',
                  '0 10px 30px rgba(255, 255, 255, 0.05)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex space-x-2 sm:space-x-3">
                <motion.div 
                  className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full"
                  animate={{ 
                    y: [0, -8, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                />
                <motion.div 
                  className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full"
                  animate={{ 
                    y: [0, -8, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div 
                  className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"
                  animate={{ 
                    y: [0, -8, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageInterface;
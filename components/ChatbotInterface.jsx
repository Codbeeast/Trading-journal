import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, TrendingUp, Plus, Mic, Menu, Settings, HelpCircle, Sparkles, Zap, ChevronDown, Search, BookOpen, BarChart3, Brain, Target, Clock, TrendingDown } from 'lucide-react';

// Prompts Dropdown Component
const PromptsDropdown = ({ isOpen, onClose, onSelectPrompt, inputRef }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const prompts = [
    {
      category: "Self-Discovery & Pattern Recognition",
      icon: <BookOpen size={16} />,
      color: "from-purple-500 to-violet-600",
      items: [
        "Identify patterns in my winning and losing trades—what common factors or setups can you find?",
        "Based on my trade history, what times of day or market conditions do I perform best and worst in?"
      ]
    },
    {
      category: "Performance Review & Goal Setting", 
      icon: <Target size={16} />,
      color: "from-blue-500 to-cyan-600",
      items: [
        "Evaluate my last 30 trades and suggest areas for improvement.",
        "What trading style (scalping, swing, etc.) suits me the most based on my journaled activity?"
      ]
    },
    {
      category: "Risk Management Insights",
      icon: <TrendingDown size={16} />,
      color: "from-red-500 to-pink-600", 
      items: [
        "Examine my risk management—am I risking too much per trade or letting losers run too long?",
        "Spot instances where I violated my trading plan and assess the outcome versus sticking to the plan."
      ]
    },
    {
      category: "Tracking Improvement Over Time",
      icon: <Clock size={16} />,
      color: "from-green-500 to-emerald-600",
      items: [
        "Track my progress over the past three months and show improvements or regressions.",
        "What are the three best and three worst trades I made recently, and what can I learn from each?"
      ]
    },
    {
      category: "Psychological & Behavioral Insights",
      icon: <Brain size={16} />,
      color: "from-orange-500 to-amber-600",
      items: [
        "Analyze my journal for signs of FOMO, revenge trading, or hesitation. How can I address these behaviors?",
        "Review my trading journal and identify any emotional triggers—such as news, rapid price moves, or losses—that lead to impulsive trades. Suggest strategies to build discipline and reduce these reactions."
      ]
    },
    {
      category: "Market Contextualization",
      icon: <BarChart3 size={16} />,
      color: "from-teal-500 to-blue-600",
      items: [
        "Cross-analyze market volatility on trade days with my trade outcomes to spot any performance trends.",
        "How do my trades perform around major economic events, and should I adjust my strategies accordingly?"
      ]
    },
    {
      category: "Market Analysis Integration",
      icon: <TrendingUp size={16} />,
      color: "from-indigo-500 to-purple-600",
      items: [
        "Compare my journal entries to major market moves—am I consistently aligned with the broader trend, or am I fading moves?",
        "Analyze which indicators, news events, or economic data have reliably preceded my best and worst trades.",
        "Suggest realistic, measurable goals for the coming month based on my recent performance."
      ]
    }
  ];

  const filteredPrompts = prompts.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, inputRef]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute bottom-full left-0 right-0 mb-2 bg-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 max-h-96 overflow-hidden z-50"
      >
        {/* Search Header */}
        <motion.div 
          className="p-4 border-b border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search trading prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-400 text-sm transition-all duration-300"
              autoFocus
            />
          </div>
        </motion.div>

        {/* Prompts Content */}
        <div className="overflow-y-auto hide-scrollbar max-h-80 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {filteredPrompts.length === 0 ? (
            <motion.div 
              className="p-6 text-center text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No prompts found matching your search.</p>
            </motion.div>
          ) : (
            <motion.div 
              className="p-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, staggerChildren: 0.05 }}
            >
              {filteredPrompts.map((category, categoryIndex) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                  className="mb-4 last:mb-2"
                >
                  {/* Category Header */}
                  <motion.div 
                    className="flex items-center gap-3 px-3 py-2 mb-2"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <motion.div 
                      className={`p-1.5 rounded-lg bg-gradient-to-r ${category.color} shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {category.icon}
                    </motion.div>
                    <h3 className="text-sm font-semibold text-white/90 tracking-wide">
                      {category.category}
                    </h3>
                  </motion.div>

                  {/* Category Items */}
                  <div className="space-y-1">
                    {category.items.map((prompt, promptIndex) => (
                      <motion.button
                        key={promptIndex}
                        onClick={() => onSelectPrompt(prompt)}
                        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 group border border-transparent hover:border-white/10"
                        whileHover={{ 
                          x: 6,
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: (categoryIndex * 0.1) + (promptIndex * 0.03),
                          type: "spring",
                          stiffness: 400 
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <motion.div 
                            className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 mt-2 opacity-60 group-hover:opacity-100"
                            whileHover={{ scale: 1.5 }}
                            transition={{ type: "spring", stiffness: 600 }}
                          />
                          <span className="leading-relaxed group-hover:text-white transition-colors duration-300">
                            {prompt}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.div 
          className="px-4 py-3 border-t border-white/10 bg-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-gray-400 text-center">
            💡 Select a prompt to get started with your trading analysis
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ChatbotInterface = ({ currentChatId, welcomeMessage = "Welcome to your Trade Journal Assistant! I can help you track trades, analyze performance, and provide insights. What would you like to do today?" }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowPrompts(false);

    // Simulate bot response with more realistic delay
    setTimeout(() => {
      const responses = [
        'I understand you want to track that trade. Let me help you log the details and analyze the performance metrics.',
        'Great question! Let me analyze your trading patterns and provide some insights based on your recent activity.',
        'I can help you with that. Based on your trading history, here are some recommendations for your strategy.',
        'Let me pull up your portfolio data and generate a comprehensive analysis for you.'
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: randomResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleSelectPrompt = (prompt) => {
    setInputValue(prompt);
    setShowPrompts(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setInputFocused(true);
    setShowPrompts(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
    // Don't immediately close prompts to allow for selection
  };

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
    <motion.div 
      className="flex-1 flex flex-col h-screen bg-black text-white relative overflow-hidden font-sans"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      {/* Background decorative elements - matching your dashboard */}
      <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
      </div>

      {/* Additional subtle lighting effects */}
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-48"
        style={{
          background: 'radial-gradient(ellipse 400px 200px at center, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 30%, transparent 70%)',
          filter: 'blur(1px)'
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header - Responsive */}
      <motion.header 
        className="bg-black/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/10 p-3 sm:p-5 relative z-10 m-2 sm:m-4"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
      >
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3 sm:gap-5"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Menu size={20} className="sm:w-6 sm:h-6 text-gray-400 hover:text-white cursor-pointer transition-colors duration-300" />
            </motion.button>
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

      {/* Messages Area - Responsive */}
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
                className="w-16 h-16 sm:w-24 sm:h-24 bg-black/30 backdrop-blur-lg rounded-3xl shadow-lg border border-white/10 flex items-center justify-center mx-auto mb-6 sm:mb-8 relative overflow-hidden"
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
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <TrendingUp size={24} className="sm:w-9 sm:h-9 text-white relative z-10" />
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

      {/* Input Area - Responsive */}
      <motion.div 
        className="p-3 sm:p-8 bg-black/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/10 relative z-10 m-2 sm:m-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <div className="flex items-center gap-2 sm:gap-5 max-w-5xl mx-auto relative">
          <motion.button 
            className="p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300 border border-white/10 backdrop-blur-sm hidden sm:block"
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 10px 30px rgba(255, 255, 255, 0.1)"
            }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={22} className="text-gray-400 hover:text-white" />
          </motion.button>
          
          <div className="flex-1 relative">
            {/* Prompts Dropdown */}
            <PromptsDropdown 
              isOpen={showPrompts}
              onClose={() => setShowPrompts(false)}
              onSelectPrompt={handleSelectPrompt}
              inputRef={inputRef}
            />

            <motion.div
              className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
                inputFocused 
                  ? 'bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-blue-500/20 shadow-lg shadow-blue-500/20' 
                  : 'bg-black/10'
              }`}
              animate={inputFocused ? {
                boxShadow: [
                  '0 0 30px rgba(59, 130, 246, 0.3)',
                  '0 0 40px rgba(59, 130, 246, 0.4)',
                  '0 0 30px rgba(59, 130, 246, 0.3)'
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Ask anything about your trading..."
              className="
                w-full px-4 py-3 sm:px-8 sm:py-5
                bg-white/5 backdrop-blur-md
                border border-white/20
                rounded-3xl
                focus:outline-none
                focus:ring-4 focus:ring-blue-500/30
                focus:border-blue-400
                placeholder-gray-300 text-white
                shadow-lg shadow-blue-500/10
                transition-all duration-500 ease-in-out
                hover:bg-white/10 hover:border-blue-400
                relative z-10
                text-sm sm:text-base
              "
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            />
            <motion.button 
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 text-gray-400 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/10"
              whileHover={{ 
                scale: 1.1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Mic size={18} className="sm:w-5 sm:h-5" />
            </motion.button>
            
            {/* Dropdown Toggle Button */}
            <motion.button
              onClick={() => setShowPrompts(!showPrompts)}
              className="absolute right-12 sm:right-16 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/10"
              whileHover={{ 
                scale: 1.1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: showPrompts ? 180 : 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
              >
                <ChevronDown size={18} className="sm:w-5 sm:h-5" />
              </motion.div>
            </motion.button>
          </div>

          <motion.button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-3 sm:p-4 
            bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 
            hover:from-blue-700 hover:via-blue-600 hover:to-blue-800 
            disabled:from-gray-700 disabled:via-gray-600 disabled:to-gray-700 
            disabled:cursor-not-allowed 
            rounded-2xl transition-all duration-500 
            shadow-xl shadow-blue-500/30 hover:shadow-blue-600/40 
            disabled:shadow-none 
            relative overflow-hidden group"
            whileHover={inputValue.trim() ? { 
              scale: 1.05,
              boxShadow: "0 15px 40px rgba(59, 130, 246, 0.4)"
            } : {}}
            whileTap={inputValue.trim() ? { scale: 0.95 } : {}}
          >
            {inputValue.trim() && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            )}
            <Send size={20} className="sm:w-6 sm:h-6 relative z-10 text-white" />
          </motion.button>
        </div>
        
        <motion.p 
          className="text-center text-xs text-gray-400 mt-3 sm:mt-5 tracking-wide px-4"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          TradeBot AI can make mistakes. Verify important trading information.
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default ChatbotInterface;
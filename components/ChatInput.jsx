import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, Mic, ChevronDown } from 'lucide-react';

// Import PromptsDropdown Component
import PromptsDropdown from './PromptsDropdown';

const ChatInput = ({ 
  inputValue, 
  setInputValue, 
  onSendMessage, 
  inputRef, 
  showPrompts, 
  setShowPrompts,
  onSelectPrompt 
}) => {
  const [inputFocused, setInputFocused] = useState(false);

  const handleInputFocus = () => {
    setInputFocused(true);
    setShowPrompts(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
    // Don't close prompts on blur - let the PromptsDropdown handle its own closing
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Remove focus from input and close dropdown
    inputRef.current?.blur();
    setShowPrompts(false);
    setInputFocused(false);
    
    onSendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectPrompt = (prompt) => {
    setInputValue(prompt);
    setShowPrompts(false); // Close dropdown when prompt is selected
    inputRef.current?.focus();
    if (onSelectPrompt) {
      onSelectPrompt(prompt);
    }
  };

  return (
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
            onKeyPress={handleKeyPress}
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
  );
};

export default ChatInput;
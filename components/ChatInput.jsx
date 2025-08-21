import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, Mic, ChevronDown, RefreshCw, Zap } from 'lucide-react';

// Import PromptsDropdown Component
import PromptsDropdown from './PromptsDropdown';

const ChatInput = ({ 
  inputValue, 
  setInputValue, 
  onSendMessage, 
  inputRef, 
  showPrompts, 
  setShowPrompts,
  onSelectPrompt,
  onSync,
  isSyncing,
  isReady
}) => {
  const [inputFocused, setInputFocused] = useState(false);

  const handleInputFocus = () => {
    setInputFocused(true);
    if (isReady) {
      setShowPrompts(true);
    }
  };

  const handleInputBlur = () => {
    setInputFocused(false);
    // Don't close prompts on blur - let the PromptsDropdown handle its own closing
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !isReady) return;
    
    // Store the message before clearing (CRITICAL FIX)
    const messageToSend = inputValue.trim();
    
    // Call onSendMessage FIRST with the message
    onSendMessage(messageToSend);
    
    // THEN clear the input and UI state
    setInputValue('');
    setShowPrompts(false);
    setInputFocused(false);
    
    // Remove focus from input after sending
    inputRef.current?.blur();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Fixed: Properly handle prompt selection and sending
  const handleSelectPrompt = (prompt) => {
    console.log('ChatInput: Prompt selected:', prompt);
    
    // Set the input value first
    setInputValue(prompt);
    setShowPrompts(false); // Close dropdown when prompt is selected
    inputRef.current?.focus();
    
    // Call the parent's onSelectPrompt with the prompt text
    if (onSelectPrompt) {
      console.log('ChatInput: Calling parent onSelectPrompt');
      onSelectPrompt(prompt);
    }
  };

  const handleSyncClick = () => {
    if (onSync && !isSyncing && !isReady) {
      onSync();
    }
  };

  const getSyncButtonContent = () => {
    if (isSyncing) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex items-center space-x-2"
        >
          <RefreshCw size={18} className="text-yellow-400" />
        </motion.div>
      );
    }
    
    if (isReady) {
      return (
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap size={18} className="text-green-400" />
        </motion.div>
      );
    }
    
    return (
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <RefreshCw size={18} className="text-blue-400" />
      </motion.div>
    );
  };

  const getSyncTooltip = () => {
    if (isSyncing) return "Syncing with your trade data...";
    if (isReady) return "✅ Synced! Ready to chat";
    return "🔄 Click to sync your trade data";
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
          {/* Prompts Dropdown - Only show when ready */}
          {isReady && (
            <PromptsDropdown 
              isOpen={showPrompts}
              onClose={() => setShowPrompts(false)}
              onSelectPrompt={handleSelectPrompt}
              inputRef={inputRef}
            />
          )}

          <motion.div
            className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
              inputFocused && isReady
                ? 'bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-blue-500/20 shadow-lg shadow-blue-500/20' 
                : !isReady
                ? 'bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10'
                : 'bg-black/10'
            }`}
            animate={inputFocused && isReady ? {
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
            placeholder={
              isSyncing 
                ? "🔄 Syncing your trade data..." 
                : !isReady 
                ? "Click the sync button above to start chatting..."
                : "Ask anything about your trading..."
            }
            disabled={isSyncing || !isReady}
            className={`
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
              ${!isReady || isSyncing ? 'cursor-not-allowed opacity-70' : ''}
            `}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          />
          
          {/* Sync Button - Replaces Mic when not ready */}
          {!isReady ? (
            <motion.button 
              onClick={handleSyncClick}
              disabled={isSyncing}
              className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 transition-all duration-300 rounded-xl z-20 ${
                isSyncing 
                  ? 'cursor-not-allowed bg-yellow-500/20' 
                  : 'cursor-pointer bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-400/70'
              }`}
              whileHover={!isSyncing ? { 
                scale: 1.15,
                backgroundColor: 'rgba(59, 130, 246, 0.4)',
                borderColor: 'rgba(96, 165, 250, 0.8)'
              } : {}}
              whileTap={!isSyncing ? { scale: 0.9 } : {}}
              title={getSyncTooltip()}
            >
              {getSyncButtonContent()}
            </motion.button>
          ) : (
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
          )}
          
          {/* Dropdown Toggle Button - Only show when ready */}
          {isReady && (
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
          )}
        </div>

        <motion.button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || !isReady}
          className="p-3 sm:p-4 
          bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 
          hover:from-blue-700 hover:via-blue-600 hover:to-blue-800 
          disabled:from-gray-700 disabled:via-gray-600 disabled:to-gray-700 
          disabled:cursor-not-allowed 
          rounded-2xl transition-all duration-500 
          shadow-xl shadow-blue-500/30 hover:shadow-blue-600/40 
          disabled:shadow-none 
          relative overflow-hidden group"
          whileHover={inputValue.trim() && isReady ? { 
            scale: 1.05,
            boxShadow: "0 15px 40px rgba(59, 130, 246, 0.4)"
          } : {}}
          whileTap={inputValue.trim() && isReady ? { scale: 0.95 } : {}}
        >
          {inputValue.trim() && isReady && (
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
        {isSyncing 
          ? "Syncing with your trade data..."
          : !isReady 
          ? "Sync your trade data to start chatting with AI"
          : "TradeBot AI can make mistakes. Verify important trading information."
        }
      </motion.p>
    </motion.div>
  );
};

export default ChatInput;

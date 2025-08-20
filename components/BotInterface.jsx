import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatHeader from './ChatHeader';
import MessageInterface from './MessageInterface';
import ChatInput from './ChatInput';
import { useTrades } from '@/context/TradeContext';

const ChatbotInterface = ({ 
  currentChatId, 
  welcomeMessage = "Welcome to your Trade Journal Assistant! Click the sync button to connect your trade data and start chatting." 
}) => {
  const { 
    trades, 
    allTrades, 
    strategies, 
    sessions, 
    loading, 
    error,
    isSignedIn,
    userId 
  } = useTrades();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageIdCounter = useRef(0);

  // Generate unique message IDs
  const generateMessageId = () => {
    messageIdCounter.current += 1;
    return `msg_${Date.now()}_${messageIdCounter.current}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug state changes
  useEffect(() => {
    console.log('State changed:', {
      isSyncing,
      isReady,
      sessionId: !!sessionId,
      messagesCount: messages.length
    });
  }, [isSyncing, isReady, sessionId, messages.length]);

  // Initialize welcome message
  useEffect(() => {
    if (currentChatId && messages.length === 0) {
      const welcomeMsg = {
        id: generateMessageId(),
        type: 'bot',
        content: welcomeMessage,
        timestamp: new Date().toLocaleTimeString(),
        isSystem: true
      };
      setMessages([welcomeMsg]);
    }
  }, [currentChatId, welcomeMessage, messages.length]);

  // Process trade data for Gemini
  const processTradeDataForGemini = () => {
    if (!allTrades || allTrades.length === 0) {
      return null;
    }

    // Calculate portfolio metrics
    const totalPnL = allTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = allTrades.filter(trade => (trade.pnl || 0) > 0);
    const winRate = allTrades.length > 0 ? winningTrades.length / allTrades.length : 0;
    const symbols = [...new Set(allTrades.map(trade => trade.symbol || trade.pair))];
    
    // Group by strategy
    const strategyPerformance = strategies.map(strategy => {
      const strategyTrades = allTrades.filter(trade => trade.strategy?._id === strategy._id);
      const strategyPnL = strategyTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      return {
        name: strategy.strategyName,
        trades: strategyTrades.length,
        pnl: strategyPnL
      };
    });

    return {
      trades: allTrades.map(trade => ({
        // Ensure all required fields are included for the backend API
        id: trade._id,
        symbol: trade.symbol || trade.pair,
        pair: trade.pair || trade.symbol,
        date: trade.entryDate || trade.date,
        time: trade.entryTime || trade.time,
        pnl: trade.pnl,
        strategyName: trade.strategy?.strategyName || 'Unknown',
        notes: trade.notes,
        positionType: trade.positionType,
        entry: trade.entry,
        exit: trade.exit,
        rFactor: trade.rFactor,
        fearToGreed: trade.fearToGreed,
        fomoRating: trade.fomoRating,
        executionRating: trade.executionRating,
        setupType: trade.setupType,
        confluences: trade.confluences,
        rulesFollowed: trade.rulesFollowed,
      })),
      portfolio: {
        totalTrades: allTrades.length,
        totalPnL: totalPnL,
        winRate: winRate,
        winningTrades: winningTrades.length,
        losingTrades: allTrades.length - winningTrades.length,
        symbols: symbols
      },
      strategies: strategyPerformance,
      sessions: sessions
    };
  };

  // Add message utility function
  const addMessage = (content, type = 'bot', isSystem = false, replaceId = null) => {
    const newMessage = {
      id: replaceId || generateMessageId(),
      type,
      content,
      timestamp: new Date().toLocaleTimeString(),
      isSystem
    };

    setMessages(prev => {
      if (replaceId) {
        // Replace message with specific ID
        return prev.map(msg => 
          msg.id === replaceId ? newMessage : msg
        );
      } else {
        // Add new message
        return [...prev, newMessage];
      }
    });

    return newMessage.id;
  };

  const handleSync = async () => {
    if (!isSignedIn || !userId) {
      setSyncError("Please sign in to sync your trade data.");
      return;
    }

    console.log('Starting sync process...');
    setIsSyncing(true);
    setSyncError(null);
    setIsReady(false);
    
    // Add syncing message and store its ID for replacement
    const syncingMessageId = addMessage(
      "🔄 Syncing with your trade data... This will just take a moment!", 
      'bot', 
      true
    );
    
    try {
      // Wait for context data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Process trade data
      const tradeData = processTradeDataForGemini();
      
      if (!tradeData) {
        throw new Error("No trade data available to sync");
      }

      console.log('Trade data processed:', {
        totalTrades: tradeData.trades.length,
        strategies: tradeData.strategies.length
      });

      // Generate unique session ID
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Generated session ID:', newSessionId);
      
      // Initialize session with Gemini via API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'initialize',
          sessionId: newSessionId,
          tradeData: tradeData
        })
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || `HTTP ${response.status}: Failed to sync`;
          } else {
            errorMessage = `HTTP ${response.status}: Server error`;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: Failed to parse error response`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Sync result:', result);
      
      if (result.success) {
        setSessionId(newSessionId);
        setIsReady(true);
        
        console.log('Sync successful, updating state...');
        
        // Clear any previous error
        setSyncError(null);
        
        // Replace the syncing message with success message
        addMessage(
          result.message || `✅ Successfully synced with Gemini! Found ${tradeData.trades.length} trades. Ready to chat with some sarcastic insights! 😏`,
          'bot',
          true,
          syncingMessageId
        );

        console.log('State updated - isReady:', true, 'sessionId:', newSessionId);
      } else {
        throw new Error(result.error || 'Sync failed');
      }

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncError(error.message);
      
      // Replace the syncing message with error message
      addMessage(
        `❌ Oops! Sync failed: ${error.message}. Even AI assistants have bad days sometimes! Try again in a moment.`,
        'bot',
        true,
        syncingMessageId
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectPrompt = (prompt) => {
    setInputValue(prompt);
    setShowPrompts(false);
    inputRef.current?.focus();
    
    // Automatically send the prompt to Gemini
    if (isReady && sessionId) {
      // Create a slight delay to ensure the input value is set
      setTimeout(() => {
        handleSendMessageWithText(prompt);
      }, 100);
    }
  };

  // Enhanced message sending function with better error handling
  const handleSendMessageWithText = async (messageText) => {
    const textToSend = messageText || inputValue.trim();
    
    console.log('🚀 Attempting to send message:', {
      textToSend,
      isReady,
      sessionId: !!sessionId,
      sessionIdValue: sessionId
    });
    
    if (!textToSend) {
      console.log('❌ No text to send');
      return;
    }

    if (!isReady || !sessionId) {
      console.log('❌ Not ready to send:', { isReady, sessionId: !!sessionId });
      addMessage(
        "Hold up! I need to sync with your trade data first. Click that shiny sync button above! 🔄",
        'bot'
      );
      return;
    }

    console.log('✅ Creating user message...');
    
    // Add user message
    addMessage(textToSend, 'user');
    
    // Clear input and close prompts
    setInputValue('');
    setIsTyping(true);
    setShowPrompts(false);

    console.log('📤 Sending request to API...');
    
    try {
      const requestBody = {
        action: 'sendMessage',
        sessionId: sessionId,
        message: textToSend
      };
      
      console.log('📋 Request body:', requestBody);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📨 API response status:', response.status);

      if (!response.ok) {
        let errorMessage;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || `HTTP ${response.status}: Failed to get response`;
            
            // Use fallback response if provided
            if (errorData.fallbackResponse) {
              addMessage(errorData.fallbackResponse, 'bot');
              return;
            }
          } else {
            errorMessage = `HTTP ${response.status}: Server returned non-JSON response`;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: Failed to parse error response`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ API success response:', {
        success: result.success,
        responseLength: result.response?.length || 0,
        hasFallback: !!result.fallbackResponse
      });
      
      if (result.success && result.response) {
        addMessage(result.response, 'bot');
        console.log('✅ Bot message added successfully');
      } else {
        // Use fallback response if provided
        const fallbackContent = result.fallbackResponse || "Sorry, I'm having a technical hiccup! Try asking again.";
        addMessage(fallbackContent, 'bot');
        console.log('⚠️ Using fallback response');
      }

    } catch (error) {
      console.error('💥 Send message failed:', error);
      addMessage(
        `Whoops! Error: ${error.message}. Try asking me again - I promise I'm usually more reliable! 😅`,
        'bot'
      );
    } finally {
      setIsTyping(false);
      console.log('🏁 Message sending complete');
    }
  };

  // Fixed: Pass the message text to the send function
  const handleSendMessage = async (messageText) => {
    await handleSendMessageWithText(messageText);
  };

  // Reset when chat changes with proper cleanup
  useEffect(() => {
    if (currentChatId) {
      console.log('Chat changed, resetting state...');
      
      // Store current sessionId for cleanup
      const oldSessionId = sessionId;
      
      // Reset all state
      setMessages([]);
      setInputValue('');
      setIsTyping(false);
      setShowPrompts(false);
      setIsSyncing(false);
      setIsReady(false);
      setSyncError(null);
      setSessionId(null);
      messageIdCounter.current = 0;

      // Clear previous session if exists
      if (oldSessionId) {
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'clearSession',
            sessionId: oldSessionId
          })
        }).catch(err => console.log('Error clearing session:', err));
      }
    }
  }, [currentChatId]);

  return (
    <motion.div 
      className="flex-1 flex flex-col h-screen bg-black text-white relative overflow-hidden font-sans"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      {/* Background decorative elements */}
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

      {/* Header Component */}
      <ChatHeader />

      {/* Context Loading Status */}
      {loading && (
        <motion.div 
          className="bg-blue-500/10 border-l-4 border-blue-500 p-3 mx-4 rounded-r-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-blue-300 text-sm">🔄 Loading your trade data from context...</p>
        </motion.div>
      )}

      {/* Sync Status Indicator */}
      {isSyncing && (
        <motion.div 
          className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 mx-4 rounded-r-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-yellow-300 text-sm">🔄 Syncing your trade data with Gemini...</p>
        </motion.div>
      )}

      {syncError && (
        <motion.div 
          className="bg-red-500/10 border-l-4 border-red-500 p-3 mx-4 rounded-r-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-red-300 text-sm">❌ Sync failed: {syncError}</p>
        </motion.div>
      )}

      {isReady && (
        <motion.div 
          className="bg-green-500/10 border-l-4 border-green-500 p-3 mx-4 rounded-r-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-green-300 text-sm">✅ Connected to Gemini! Ready for sarcastic trading insights.</p>
        </motion.div>
      )}

      {/* Messages Area Component */}
      <MessageInterface 
        messages={messages}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
      />

      {/* Input Area Component */}
      <ChatInput 
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSendMessage={handleSendMessage}
        inputRef={inputRef}
        showPrompts={showPrompts}
        setShowPrompts={setShowPrompts}
        onSelectPrompt={handleSelectPrompt}
        onSync={handleSync}
        isSyncing={isSyncing}
        isReady={isReady}
      />
    </motion.div>
  );
};

export default ChatbotInterface;

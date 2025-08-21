import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ChatHeader from './ChatHeader';
import MessageInterface from './MessageInterface';
import ChatInput from './ChatInput';
import { useTrades } from '@/context/TradeContext';

const ChatbotInterface = ({ 
  currentChatId, 
  welcomeMessage = "Welcome to your Trade Journal Assistant! Click the sync button to connect your trade data and start chatting.",
  onChatUpdate,
  onNewChat,
  onSidebarRefresh
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
  const [chatLoadingStates, setChatLoadingStates] = useState({}); // Track loading per chat
  const [pendingChatCreation, setPendingChatCreation] = useState(false);
  
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

  // Handle chat changes - but preserve sync state
  useEffect(() => {
    if (!currentChatId) {
      resetChat(true); // Always preserve sync state
    }
    // MessageInterface will handle loading the history only if synced
  }, [currentChatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  // Handle messages loaded from MessageInterface
  const handleMessagesLoaded = (loadedMessages, sessionIdFromChat) => {
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages);
      
      // CRITICAL: Only restore session if we're not already in a synced state
      // This prevents overriding current sync status when switching between chats
      if (sessionIdFromChat && !sessionId && !isReady) {
        setSessionId(sessionIdFromChat);
        setIsReady(true);
        setSyncError(null);
      }
    } else {
      // No messages found, reset to welcome state but preserve sync
      resetChat(true);
    }
  };

  // Reset chat state - but preserve sync state unless explicitly resetting
  const resetChat = (preserveSync = true) => {
    setMessages([]);
    setInputValue('');
    setShowPrompts(false);
    setPendingChatCreation(false);
    messageIdCounter.current = 0;
    
    // Only reset sync state if explicitly requested (like on sign out)
    if (!preserveSync) {
      setIsSyncing(false);
      setSyncError(null);
      setSessionId(null);
      setIsReady(false);
    }
    
    // Clear loading state for current chat
    if (currentChatId) {
      setChatLoadingStates(prev => ({
        ...prev,
        [currentChatId]: false
      }));
    }
    setIsTyping(false);
  };

  // Handle new chat button - preserve sync state
  const handleNewChat = () => {
    resetChat(true); // Preserve sync state
    if (onNewChat) {
      onNewChat(null); // Pass null to indicate no chat ID needed
    }
  };

  // Set loading state for specific chat
  const setChatLoading = (chatId, loading) => {
    setChatLoadingStates(prev => ({
      ...prev,
      [chatId]: loading
    }));
  };

  // Process trade data for AI
  const processTradeDataForAI = () => {
    if (!allTrades || allTrades.length === 0) {
      return null;
    }

    const totalPnL = allTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = allTrades.filter(trade => (trade.pnl || 0) > 0);
    const winRate = allTrades.length > 0 ? winningTrades.length / allTrades.length : 0;
    const symbols = [...new Set(allTrades.map(trade => trade.symbol || trade.pair))];
    
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
        session: trade.session,
        setupType: trade.setupType,
        timeFrame: trade.timeFrame,
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
        return prev.map(msg => 
          msg.id === replaceId ? newMessage : msg
        );
      } else {
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

    setIsSyncing(true);
    setSyncError(null);
    setIsReady(false);
    
    const syncingMessageId = addMessage(
      "🔄 Syncing with your trade data... This will just take a moment!", 
      'bot', 
      true
    );
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const tradeData = processTradeDataForAI();
      
      if (!tradeData) {
        throw new Error("No trade data available to sync");
      }

      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'initialize',
          sessionId: newSessionId,
          userId: userId,
          tradeData: tradeData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to sync`);
      }

      const result = await response.json();
      
      if (result.success) {
        setSessionId(newSessionId);
        setIsReady(true);
        setSyncError(null);
        
        addMessage(
          result.message || `✅ Successfully synced! Found ${tradeData.trades.length} trades. Ready to chat! 😏`,
          'bot',
          true,
          syncingMessageId
        );
      } else {
        throw new Error(result.error || 'Sync failed');
      }

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncError(error.message);
      
      addMessage(
        `❌ Sync failed: ${error.message}. Try again in a moment.`,
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
    
    if (isReady && sessionId) {
      setTimeout(() => {
        handleSendMessage(prompt);
      }, 100);
    }
  };

  // Create new chat after successful message exchange
  const createNewChatInDB = async (firstUserMessage, botResponse) => {
    if (!userId || !sessionId) return null;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createChat',
          userId: userId,
          sessionId: sessionId,
          firstMessage: firstUserMessage,
          botResponse: botResponse
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.chatId) {
          return result.chatId;
        }
      }
    } catch (error) {
      console.error('Failed to create chat in DB:', error);
    }
    return null;
  };

  // Send message function
  const handleSendMessage = async (messageText) => {
    const textToSend = messageText || inputValue.trim();
    
    if (!textToSend) return;

    // Check if user is signed in and has userId
    if (!isSignedIn || !userId) {
      addMessage(
        "Please sign in first to start chatting with your trade data! 🔐",
        'bot'
      );
      return;
    }

    // ABSOLUTE requirement: Must be synced to send messages
    if (!isReady || !sessionId) {
      addMessage(
        "⚠️ Sync required! Please click the sync button to connect your trade data before chatting.",
        'bot'
      );
      return;
    }
    
    // Add user message
    addMessage(textToSend, 'user');
    
    // Clear input and close prompts
    setInputValue('');
    setShowPrompts(false);
    
    // Set loading state for current chat
    const chatIdForLoading = currentChatId || 'new_chat';
    setChatLoading(chatIdForLoading, true);
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId: sessionId,
          userId: userId,
          message: textToSend,
          chatId: currentChatId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to get response`);
      }

      const result = await response.json();
      
      if (result.success && result.response) {
        addMessage(result.response, 'bot');
        
        // Handle new chat creation after first successful exchange
        if (!currentChatId || currentChatId.startsWith('new_')) {
          setPendingChatCreation(true);
          
          // Create chat in database
          const newChatId = await createNewChatInDB(textToSend, result.response);
          
          if (newChatId) {
            // Notify parent about new chat creation
            if (onChatUpdate) {
              onChatUpdate(newChatId, {
                lastMessage: textToSend,
                messageCount: messages.length + 2,
                timestamp: new Date().toISOString(),
                userId: userId,
                title: textToSend.substring(0, 50) // Generate title from first message
              });
            }
            
            // Refresh sidebar to show new chat
            if (onSidebarRefresh) {
              onSidebarRefresh();
            }
          }
          
          setPendingChatCreation(false);
        } else {
          // Update existing chat
          if (onChatUpdate) {
            onChatUpdate(currentChatId, {
              lastMessage: textToSend,
              messageCount: messages.length + 2,
              timestamp: new Date().toISOString(),
              userId: userId
            });
          }
        }
      } else {
        addMessage("Sorry, I'm having a technical hiccup! Try asking again.", 'bot');
      }

    } catch (error) {
      console.error('Send message failed:', error);
      addMessage(
        `Error: ${error.message}. Try asking me again! 😅`,
        'bot'
      );
    } finally {
      setChatLoading(chatIdForLoading, false);
      setIsTyping(false);
    }
  };

  // Clean up session when component unmounts
  useEffect(() => {
    return () => {
      if (sessionId && userId) {
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'clearSession',
            sessionId: sessionId,
            userId: userId
          })
        }).catch(err => console.log('Error clearing session:', err));
      }
    };
  }, [sessionId, userId]);

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

      {/* Removed redundant loading indicator - handled in MessageInterface */}

      {/* User Authentication Status */}
      {!isSignedIn && (
        <motion.div 
          className="bg-orange-500/10 border-l-4 border-orange-500 p-3 mx-4 rounded-r-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-orange-300 text-sm">🔐 Please sign in to access your trade data and start chatting</p>
        </motion.div>
      )}

      {isSyncing && (
        <motion.div 
          className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 mx-4 rounded-r-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-yellow-300 text-sm">🔄 Syncing your trade data...</p>
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

      {isReady && isSignedIn && userId && (
        <motion.div 
          className="bg-green-500/10 border-l-4 border-green-500 p-3 mx-4 rounded-r-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-green-300 text-sm">✅ Connected! Ready for trading insights</p>
        </motion.div>
      )}

      {pendingChatCreation && (
        <motion.div 
          className="bg-purple-500/10 border-l-4 border-purple-500 p-3 mx-4 rounded-r-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-purple-300 text-sm">💾 Creating new chat...</p>
        </motion.div>
      )}

      {/* Messages Area - Sync UI has absolute priority */}
      <MessageInterface 
        messages={messages}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
        currentChatId={isReady ? currentChatId : null}
        userId={userId}
        onMessagesLoaded={handleMessagesLoaded}
        isReady={isReady}
        isSyncing={isSyncing}
        onSync={handleSync}
        syncError={syncError}
        isSignedIn={isSignedIn}
        chatLoadingStates={chatLoadingStates}
        tradesLoading={loading}
      />

      {/* Input Area */}
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
        isSignedIn={isSignedIn}
        userId={userId}
        onNewChat={handleNewChat}
        tradesLoading={loading}
      />
    </motion.div>
  );
};

export default ChatbotInterface;

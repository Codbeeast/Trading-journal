import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ChatHeader from './ChatHeader';
import MessageInterface from './MessageInterface';
import ChatInput from './ChatInput';
import { useTrades } from '@/context/TradeContext';
import Link from 'next/link';


const ChatbotInterface = ({
  currentChatId,
  currentChatIdRef,
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

  const [featureAccess, setFeatureAccess] = useState({ hasAccess: true, loading: true });

  useEffect(() => {
    const checkAccess = async () => {
      // Allow initial load to prevent flash, but check quickly
      if (!userId) {
        setFeatureAccess({ hasAccess: false, loading: false });
        return;
      }

      try {
        const res = await fetch('/api/subscription/feature-access?feature=fono');
        const data = await res.json();
        setFeatureAccess({ ...data, loading: false });
      } catch (err) {
        console.error('Error checking chat access:', err);
        // Fallback to strict if error
        setFeatureAccess({ hasAccess: false, loading: false });
      }
    };

    checkAccess();
  }, [userId]);


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


  const handleMessagesLoaded = (loadedMessages, sessionIdFromChat) => {
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages);
      // Just mark as ready if messages exist (means it was synced before)
      setIsReady(true);
      setSyncError(null);
    } else {
      resetChat(true);
    }
  };


  // Reset chat state - but preserve sync state unless explicitly resetting
  const resetChat = (preserveSync = true) => {
    setMessages([]);
    setInputValue('');
    setShowPrompts(false);
    messageIdCounter.current = 0;

    if (!preserveSync) {
      setIsSyncing(false);
      setSyncError(null);
      setIsReady(false);
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
      "Syncing with your trade data... This will just take a moment!",
      'bot',
      true
    );

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const tradeData = processTradeDataForAI();

      if (!tradeData) {
        throw new Error("No trade data available to sync");
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync',
          userId: userId,
          tradeData: tradeData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to sync`);
      }

      const result = await response.json();

      if (result.success) {
        setIsReady(true);
        setSyncError(null);

        addMessage(
          result.message || `Successfully synced! Found ${tradeData.trades.length} trades. Ready to chat!`,
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
        `Sync failed: ${error.message}. Try again in a moment.`,
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


  // creating the newChat


  const createNewChatInDB = async (firstUserMessage, botResponse) => {
    if (!userId) return null;

    try {
      const newChatId = currentChatId || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch(`/api/chat/${newChatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: firstUserMessage,
          response: botResponse,
          userId: userId,
          title: firstUserMessage.substring(0, 50),
          tradeDataSummary: {
            totalTrades: allTrades?.length || 0,
            totalPnL: allTrades?.reduce((sum, trade) => sum + (trade.pnl || 0), 0) || 0,
            lastSyncAt: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.chatId) {
          return result.chatId;
        }
      } else {
        console.error('Failed to create chat:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to create chat in DB:', error);
    }
    return null;
  };
  // ✅ FIXED FUNCTION: Save messages to existing chat using correct endpoint
  const saveMessageToExistingChat = async (chatId, userMessage, botResponse) => {
    if (!userId || !chatId) return;

    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          response: botResponse,
          userId: userId
        })
      });

      if (!response.ok) {
        console.error('Failed to save message to existing chat:', response.status);
      } else {
        const result = await response.json();
        console.log('Successfully saved message to existing chat:', result);
      }
    } catch (error) {
      console.error('Error saving message to existing chat:', error);
    }
  };

  // Send message function
  const handleSendMessage = async (messageText) => {
    const textToSend = messageText || inputValue.trim();

    if (!textToSend) return;

    if (!isSignedIn || !userId) {
      addMessage("Please sign in first to start chatting with your trade data!", 'bot');
      return;
    }

    if (!isReady) {
      addMessage("Sync required! Please click the sync button to connect your trade data before chatting.", 'bot');
      return;
    }

    addMessage(textToSend, 'user');
    setInputValue('');
    setShowPrompts(false);

    // ✅ Set loading states BEFORE the API call
    const chatIdToUse = currentChatIdRef?.current || currentChatId;
    setIsTyping(true);
    if (chatIdToUse) {
      setChatLoading(chatIdToUse, true);
    }

    try {
      const tradeData = processTradeDataForAI();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          userId: userId,
          message: textToSend,
          tradeData: tradeData,
          chatId: chatIdToUse
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to get response`);
      }

      const result = await response.json();

      if (result.success && result.response) {
        addMessage(result.response, 'bot');

        const needsNewChat = !currentChatIdRef?.current ||
          currentChatIdRef.current === 'new_chat' ||
          currentChatIdRef.current.startsWith('new_');

        if (needsNewChat) {
          console.log('Creating new chat for first message...');
          const newChatId = await createNewChatInDB(textToSend, result.response);

          if (newChatId) {
            console.log('New chat created with ID:', newChatId);

            if (onChatUpdate) {
              onChatUpdate(newChatId, {
                lastMessage: textToSend,
                messageCount: messages.length + 2,
                timestamp: new Date().toISOString(),
                userId: userId,
                title: textToSend.substring(0, 50),
                isNewChat: true
              });
            }

            if (onSidebarRefresh) {
              onSidebarRefresh();
            }
          }
        } else {
          console.log('Saving message to existing chat:', currentChatIdRef.current);
          await saveMessageToExistingChat(currentChatIdRef.current, textToSend, result.response);

          if (onChatUpdate) {
            onChatUpdate(currentChatIdRef.current, {
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
      addMessage(`Error: ${error.message}. Try asking me again!`, 'bot');
    } finally {
      // ✅ ALWAYS clear loading states when done
      setIsTyping(false);
      if (chatIdToUse) {
        setChatLoading(chatIdToUse, false);
      }
    }
  };

  // REMOVE this entire useEffect:
  // useEffect(() => {
  //   return () => {
  //     if (sessionId && userId) {
  //       fetch('/api/chat', {...clearSession...})
  //     }
  //   };
  // }, [sessionId, userId]);

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

      {/* Feature Lock Overlay */}
      {!featureAccess.hasAccess && !featureAccess.loading && (
        <div className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-black via-black/95 to-transparent z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center p-8 max-w-md bg-gray-900/90 border border-gray-800 rounded-2xl shadow-2xl mx-4">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Trade Assistant Locked</h3>
              <p className="text-gray-300 mb-8 text-lg">
                Unlock specialized AI analysis, strategy verification, and unlimited chats with a premium subscription.
              </p>

              <div className="space-y-4">
                <Link
                  href="/subscription"
                  className="block w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-blue-500/25"
                >
                  Upgrade to Pro
                </Link>
                <p className="text-xs text-center text-gray-500 mt-4">
                  Already have a plan? <button onClick={() => window.location.reload()} className="text-blue-400 hover:underline">Refresh</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};


export default ChatbotInterface;

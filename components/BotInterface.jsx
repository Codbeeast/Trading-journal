import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatHeader from './ChatHeader';
import MessageInterface from './MessageInterface';
import ChatInput from './ChatInput';

const ChatbotInterface = ({ 
  currentChatId, 
  welcomeMessage = "Welcome to your Trade Journal Assistant! I can help you track trades, analyze performance, and provide insights. What would you like to do today?" 
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
      />
    </motion.div>
  );
};

export default ChatbotInterface;
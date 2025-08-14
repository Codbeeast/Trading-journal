'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ChatbotInterface from '@/components/BotInterface';
import ChatbotSidebar from '@/components/ChatbotSidebar';

const TradingChatPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize page load and mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Simulate loading time - adjust as needed
    setTimeout(() => {
      setIsLoaded(true);
      setCurrentChatId(`chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }, 1000);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNewChat = () => {
    setCurrentChatId(`chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    if (isMobile) setSidebarOpen(false);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    if (isMobile) setSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      if (sidebarOpen && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      } else if (sidebarOpen && sidebarCollapsed) {
        setSidebarCollapsed(false);
      } else {
        setSidebarOpen(true);
        setSidebarCollapsed(false);
      }
    }
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const getSidebarWidth = () => {
    if (!sidebarOpen) return 0;
    if (isMobile) return 320;
    return sidebarCollapsed ? 80 : 320;
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="min-h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
      {/* Animated background - dark theme */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 via-black to-gray-900/50 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
      
      {/* Main loading content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo/Icon area */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10">
            <div className="w-12 h-12 bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-3xl blur-xl animate-pulse" />
        </div>
        
        {/* Loading text */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">TradeBot AI</h1>
          <p className="text-gray-400 text-lg">Initializing your trading assistant...</p>
        </div>
        
        {/* Loading bar */}
        <div className="w-80 h-2 bg-gray-800 rounded-full overflow-hidden border border-white/10">
          <div className="h-full bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400 rounded-full animate-pulse transform scale-x-75 origin-left" />
        </div>
        
        {/* Feature indicators */}
        <div className="flex space-x-8 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
            <span>AI Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <span>Real-time Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <span>Smart Insights</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isLoaded) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen w-full bg-black text-white relative font-sans">
      {/* Background decorative elements - static */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]" />
        <div className="absolute bottom-0 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
      </div>

      {/* Sidebar Toggle Button - Fixed Position with proper z-index */}
      <button
        onClick={handleToggleSidebar}
        className={`fixed top-6 z-50 p-3 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg hover:bg-black/40 transition-all duration-300 cursor-pointer ${
          sidebarOpen && !isMobile 
            ? sidebarCollapsed 
              ? 'left-24' 
              : 'left-80' 
            : 'left-4'
        }`}
      >
        {isMobile ? (
          sidebarOpen ? (
            <X size={20} className="text-white" />
          ) : (
            <Menu size={20} className="text-white" />
          )
        ) : (
          sidebarOpen ? (
            sidebarCollapsed ? (
              <ChevronRight size={20} className="text-white" />
            ) : (
              <ChevronLeft size={20} className="text-white" />
            )
          ) : (
            <Menu size={20} className="text-white" />
          )
        )}
      </button>

      {/* Main Layout */}
      <div className="relative z-10 flex h-screen">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleCloseSidebar}
          />
        )}

        {/* Sidebar Container - Using your original width animation logic */}
        <div
          className={`${
            isMobile 
              ? sidebarOpen 
                ? 'fixed left-0 top-0 z-50 h-full' 
                : 'fixed left-0 top-0 z-50 pointer-events-none'
              : 'relative'
          }`}
          style={{
            width: getSidebarWidth(),
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {(sidebarOpen || (!isMobile && sidebarCollapsed)) && (
            <div 
              className={`h-full overflow-hidden ${
                isMobile 
                  ? 'transform transition-transform duration-400 ease-out' + (sidebarOpen ? ' translate-x-0' : ' -translate-x-full')
                  : ''
              }`}
            >
              {/* Collapsed Sidebar for Desktop */}
              {!isMobile && sidebarCollapsed ? (
                <div className="w-20 h-full bg-black/30 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-6 space-y-4">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Menu size={20} className="text-white" />
                    </div>
                    
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Full Sidebar */
                <div className="w-80 h-full">
                  <ChatbotSidebar 
                    onNewChat={handleNewChat}
                    onSelectChat={handleSelectChat}
                    currentChatId={currentChatId}
                    isOpen={sidebarOpen}
                    onClose={handleCloseSidebar}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Chat Interface - This will automatically shift right when sidebar opens */}
        <div 
          className="flex-1 min-w-0"
          style={{
            transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            marginLeft: isMobile ? 0 : 0 // Let flexbox handle the positioning naturally
          }}
        >
          <ChatbotInterface 
            currentChatId={currentChatId}
            onOpenSidebar={handleToggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
            welcomeMessage="Welcome to your Trade Journal Assistant! I can help you track trades, analyze performance, and provide insights. What would you like to do today?"
          />
        </div>
      </div>

      {/* Static background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-30"
          style={{
            background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
          }}
        />
      </div>
    </div>
  );
};

export default TradingChatPage;
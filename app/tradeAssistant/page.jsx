// Main Layout Component
'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Import your existing components (simulated here for demo)
import ChatbotSidebar from '@/components/ChatbotSidebar';
import ChatbotInterface from '@/components/ChatbotInterface';


const MainChatbotLayout = () => {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        setSidebarOpen(false); // Close sidebar on mobile by default
        setSidebarCollapsed(false); // No collapse state on mobile, just open/close
      } else {
        setSidebarOpen(true); // Open sidebar on desktop
        // Keep existing collapse state on desktop
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNewChat = () => {
    setCurrentChatId(null);
    if (isMobile) setSidebarOpen(false);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      // On desktop, toggle between collapsed and expanded
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

  // Calculate sidebar width based on state
  const getSidebarWidth = () => {
    if (!sidebarOpen) return 0;
    if (isMobile) return 320; // Full width on mobile when open
    return sidebarCollapsed ? 80 : 320; // Collapsed or full width on desktop
  };

  return (
    <div className="min-h-screen w-full bg-black text-white relative font-sans overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
        <motion.div 
          className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Sidebar Toggle Button - Fixed Position */}
      <motion.button
        onClick={handleToggleSidebar}
        className={`fixed top-65 z-50 p-3 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg hover:bg-black/40 transition-all duration-300 cursor-pointer ${
          sidebarOpen && !isMobile 
            ? sidebarCollapsed 
              ? 'left-24' 
              : 'left-80' 
            : 'left-4'
        }`}
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 10px 30px rgba(255, 255, 255, 0.1)"
        }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.6, 
          type: "spring", 
          stiffness: 200,
          layout: { duration: 0.3 }
        }}
        layout
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
      </motion.button>

      {/* Main Layout */}
      <motion.div 
        className="relative z-10 flex h-screen"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8, 
          type: "spring", 
          stiffness: 200, 
          damping: 25 
        }}
      >
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && isMobile && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseSidebar}
            />
          )}
        </AnimatePresence>

        {/* Sidebar Container */}
        <motion.div
          className={`${
            isMobile 
              ? sidebarOpen 
                ? 'fixed left-0 top-0 z-50' 
                : 'fixed left-0 top-0 z-50 pointer-events-none'
              : 'relative'
          }`}
          animate={{
            width: getSidebarWidth(),
          }}
          transition={{
            duration: 0.4,
            type: "spring",
            stiffness: 200,
            damping: 25
          }}
          style={{
            width: isMobile ? (sidebarOpen ? 320 : 0) : getSidebarWidth()
          }}
        >
          <AnimatePresence mode="wait">
            {(sidebarOpen || (!isMobile && sidebarCollapsed)) && (
              <motion.div
                className="h-full overflow-hidden"
                initial={{ 
                  x: isMobile ? -320 : 0,
                  opacity: 0 
                }}
                animate={{ 
                  x: 0,
                  opacity: 1 
                }}
                exit={{ 
                  x: isMobile ? -320 : 0,
                  opacity: 0 
                }}
                transition={{ 
                  duration: 0.4, 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 20 
                }}
              >
                {/* Collapsed Sidebar for Desktop */}
                {!isMobile && sidebarCollapsed ? (
                  <motion.div 
                    className="w-20 h-full bg-black/30 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-6 space-y-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Collapsed sidebar content - just icons */}
                    <div className="space-y-4">
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Menu size={20} className="text-white" />
                      </motion.div>
                      
                      {/* Add more collapsed menu items here */}
                      {[1, 2, 3, 4].map((item) => (
                        <motion.div
                          key={item}
                          className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  /* Full Sidebar */
                  <motion.div
                    className={isMobile ? "w-80" : "w-80"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatbotSidebar 
                      onNewChat={handleNewChat}
                      onSelectChat={handleSelectChat}
                      currentChatId={currentChatId}
                      isOpen={sidebarOpen}
                      onClose={handleCloseSidebar}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main Chat Interface */}
        <motion.div
          className="flex-1 min-w-0"
          layout
          transition={{
            duration: 0.4,
            type: "spring",
            stiffness: 200,
            damping: 25
          }}
        >
          <ChatbotInterface 
            currentChatId={currentChatId} 
            onOpenSidebar={handleToggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
          />
        </motion.div>
      </motion.div>

      {/* Performance indicator */}
      <motion.div
        className="absolute top-4 right-4 z-30"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <div className="bg-black/30 backdrop-blur-lg rounded-full px-3 py-1 border border-white/10">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-gray-400 font-medium">Online</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MainChatbotLayout;

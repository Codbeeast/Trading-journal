// Main Layout Component
'use client'
import { motion,AnimatePresence } from 'framer-motion';
import ChatbotSidebar from '@/components/ChatbotSidebar';
import ChatbotInterface from '@/components/ChatbotInterface';
import {useState,useEffect} from 'react'
const MainChatbotLayout = () => {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); // Open sidebar on desktop
      } else {
        setSidebarOpen(false); // Close sidebar on mobile
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

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
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

        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || !isMobile) && (
            <motion.div
              className={`${
                isMobile 
                  ? 'fixed left-0 top-0 z-50 w-80' 
                  : 'relative w-80'
              }`}
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ 
                duration: 0.7, 
                type: "spring", 
                stiffness: 200, 
                damping: 20 
              }}
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
        </AnimatePresence>

        {/* Main Chat Interface */}
        <motion.div
          className="flex-1"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ 
            duration: 0.7, 
            type: "spring", 
            stiffness: 200, 
            damping: 20,
            delay: 0.4 
          }}
        >
          <ChatbotInterface 
            currentChatId={currentChatId} 
            onOpenSidebar={handleOpenSidebar}
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
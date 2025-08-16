'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  Settings, 
  User, 
  HelpCircle, 
  MessageSquare, 
  Calendar,
  Sparkles,
  Crown,
  ChevronDown,
  Search,
  MoreHorizontal,
  Star,
  Archive,
  Filter,
  Menu,
  X,
  Send,
  Mic,
  Zap
} from 'lucide-react';


// Responsive Sidebar Component
const ChatbotSidebar = ({ onNewChat, onSelectChat, currentChatId, isOpen, onClose }) => {
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      title: 'TSLA Long Position Analysis',
      date: '2 hours ago',
      preview: 'Analyzed TSLA entry at $245...',
      category: 'analysis',
      starred: true
    },
    {
      id: 2,
      title: 'Weekly P&L Review',
      date: '1 day ago',
      preview: 'Reviewed last week\'s performance...',
      category: 'review',
      starred: false
    },
    {
      id: 3,
      title: 'Risk Management Strategy',
      date: '2 days ago',
      preview: 'Discussed position sizing rules...',
      category: 'strategy',
      starred: true
    },
    {
      id: 4,
      title: 'AAPL Earnings Play',
      date: '3 days ago',
      preview: 'Planned earnings strategy for AAPL...',
      category: 'earnings',
      starred: false
    },
    {
      id: 5,
      title: 'Market Analysis - SPY',
      date: '1 week ago',
      preview: 'Technical analysis of S&P 500...',
      category: 'analysis',
      starred: false
    },
    {
      id: 6,
      title: 'Options Strategy Discussion',
      date: '1 week ago',
      preview: 'Explored iron condor setup...',
      category: 'options',
      starred: false
    }
  ]);


  const [hoveredChat, setHoveredChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');


  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
  };


  const toggleStar = (chatId, e) => {
    e.stopPropagation();
    setChatHistory(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, starred: !chat.starred } : chat
    ));
  };


  const handleSelectChat = (chatId) => {
    onSelectChat(chatId);
    onClose(); // Close sidebar on mobile after selecting chat
  };


  const filteredChats = chatHistory.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'starred' && chat.starred) ||
                         chat.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });


  const categoryColors = {
    analysis: 'from-blue-500/20 to-cyan-500/20',
    review: 'from-sky-500/20 to-blue-500/20',
    strategy: 'from-green-500/20 to-emerald-500/20',
    earnings: 'from-yellow-500/20 to-orange-500/20',
    options: 'from-red-500/20 to-rose-500/20',
    crypto: 'from-indigo-500/20 to-blue-500/20',
    daytrading: 'from-teal-500/20 to-cyan-500/20'
  };


  const filters = [
    { id: 'all', label: 'All', count: chatHistory.length },
    { id: 'starred', label: 'Starred', count: chatHistory.filter(c => c.starred).length },
    { id: 'analysis', label: 'Analysis', count: chatHistory.filter(c => c.category === 'analysis').length },
    { id: 'strategy', label: 'Strategy', count: chatHistory.filter(c => c.category === 'strategy').length }
  ];


  return (
    <motion.div 
      className="w-full sm:w-80 h-screen bg-black/30 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden relative"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 opacity-30 overflow-hidden">
        <motion.div 
          className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(14,165,233,0.15),rgba(255,255,255,0))]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>


      {/* Header with Close button on mobile */}
      <motion.div 
        className="p-4 sm:p-6 border-b border-white/10 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Mobile header with close button */}
        <div className="flex items-center justify-between mb-4 sm:hidden">
          <h2 className="text-lg font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
            Trade Journal
          </h2>
          <motion.button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={18} className="text-gray-400 hover:text-white" />
          </motion.button>
        </div>


        <motion.button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-600/20 via-sky-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl hover:from-blue-600/30 hover:via-sky-500/30 hover:to-cyan-500/30 transition-all duration-500 backdrop-blur-sm relative overflow-hidden group"
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 40px rgba(59, 130, 246, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <Plus size={20} className="relative z-10" />
          <span className="font-semibold relative z-10 tracking-wide text-sm sm:text-base">New Chat</span>
          <Sparkles size={16} className="text-blue-400 relative z-10 hidden sm:block" />
        </motion.button>


        {/* Search Bar */}
        <motion.div 
          className="mt-4 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Search size={16} className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent placeholder-gray-400 text-white transition-all duration-300 text-sm"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          />
        </motion.div>


        {/* Filter Tabs */}
        <motion.div 
          className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar scrollbar-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                selectedFilter === filter.id
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.id === 'starred' && <Star size={10} className="sm:w-3 sm:h-3" />}
              {filter.id === 'all' && <Filter size={10} className="sm:w-3 sm:h-3" />}
              <span className="text-xs">{filter.label}</span>
              <span className="bg-white/20 px-1 py-0.5 rounded-full text-xs">{filter.count}</span>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>


      {/* Chat History - Hidden Scrollbar */}
      <div className="flex-1 overflow-y-auto relative z-10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="p-4 sm:p-6 pb-8 sm:pb-12">
          <motion.div 
            className="flex items-center gap-3 mb-4 sm:mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MessageSquare size={14} className="sm:w-4 sm:h-4 text-blue-400" />
            <h3 className="text-xs sm:text-sm font-semibold text-gray-300 tracking-wide">
              Recent Conversations
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
          </motion.div>
          
          <AnimatePresence>
            <div className="space-y-2 sm:space-y-3">
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  className={`group relative p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-sm border overflow-hidden ${
                    currentChatId === chat.id 
                      ? `bg-gradient-to-r ${categoryColors[chat.category] || 'from-blue-600/30 to-cyan-600/30'} border-blue-500/50 shadow-lg shadow-blue-500/20` 
                      : 'hover:bg-white/5 border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/10'
                  }`}
                  onClick={() => handleSelectChat(chat.id)}
                  onMouseEnter={() => setHoveredChat(chat.id)}
                  onMouseLeave={() => setHoveredChat(null)}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.6 }}
                  layout
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-white truncate flex-1">
                          {chat.title}
                        </h4>
                        <motion.button
                          onClick={(e) => toggleStar(chat.id, e)}
                          className={`p-1 rounded-full transition-colors duration-300 ${
                            chat.starred ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-500 hover:text-yellow-400'
                          }`}
                          whileHover={{ scale: 1.2, rotate: 180 }}
                          whileTap={{ scale: 0.8 }}
                        >
                          <Star size={10} className="sm:w-3 sm:h-3" fill={chat.starred ? 'currentColor' : 'none'} />
                        </motion.button>
                      </div>
                      
                      <p className="text-xs text-gray-400 truncate mb-2 sm:mb-3 leading-relaxed">
                        {chat.preview}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar size={8} className="sm:w-2.5 sm:h-2.5" />
                          <span className="text-xs">{chat.date}</span>
                        </div>
                        
                        <div className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColors[chat.category]} border border-white/10`}>
                          {chat.category}
                        </div>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {hoveredChat === chat.id && (
                        <motion.div 
                          className="hidden sm:flex gap-1 ml-3"
                          initial={{ opacity: 0, scale: 0.8, x: 10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.8, x: 10 }}
                        >
                          <motion.button 
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit3 size={12} className="text-gray-400 hover:text-white" />
                          </motion.button>
                          <motion.button 
                            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors duration-300"
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={12} className="text-gray-400 hover:text-red-400" />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom overlay section for visual depth */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 via-black/30 to-transparent backdrop-blur-sm border-t border-white/5 z-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
    </motion.div>
  );
};
export default ChatbotSidebar;

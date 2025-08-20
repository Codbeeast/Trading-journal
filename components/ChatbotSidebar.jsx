
// Updated ChatbotSidebar.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  MoreHorizontal, 
  Trash2, 
  Edit3, 
  X,
  Clock,
  TrendingUp,
  BarChart3,
  DollarSign,
  Loader2
} from 'lucide-react';

const ChatbotSidebar = ({ 
  onNewChat, 
  onSelectChat, 
  currentChatId, 
  isOpen, 
  onClose,
  chatHistory = [],
  onDeleteChat,
  onRenameChat,
  loading = false
}) => {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getTopicIcon = (topics = []) => {
    if (topics.includes('performance') || topics.includes('portfolio')) return BarChart3;
    if (topics.includes('trades') || topics.includes('stocks')) return TrendingUp;
    if (topics.includes('risk') || topics.includes('strategy')) return DollarSign;
    return MessageSquare;
  };

  const handleRename = (chatId, newName) => {
    if (newName.trim()) {
      onRenameChat?.(chatId, newName.trim());
    }
    setEditingChatId(null);
    setEditingName('');
  };

  const startEditing = (chat) => {
    setEditingChatId(chat.id);
    setEditingName(chat.title);
  };

  const handleKeyPress = (e, chatId) => {
    if (e.key === 'Enter') {
      handleRename(chatId, editingName);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
      setEditingName('');
    }
  };

  return (
    <div className="w-full h-full bg-black/30 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <motion.h2 
            className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Trading Chats
          </motion.h2>
          
          {onClose && (
            <motion.button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors sm:hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} className="text-gray-400" />
            </motion.button>
          )}
        </div>

        {/* New Chat Button */}
        <motion.button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          <span className="font-medium">New Trading Chat</span>
        </motion.button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No chat history yet</p>
            <p className="text-xs mt-1">Start a new chat to begin!</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            <AnimatePresence>
              {chatHistory.map((chat, index) => {
                const TopicIcon = getTopicIcon(chat.topics);
                const isActive = chat.id === currentChatId;
                const isEditing = editingChatId === chat.id;

                return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-600/20 border border-blue-500/30' 
                        : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20'
                    }`}
                    onClick={() => !isEditing && onSelectChat?.(chat.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        isActive ? 'bg-blue-500/20' : 'bg-white/10'
                      }`}>
                        <TopicIcon size={16} className={isActive ? 'text-blue-400' : 'text-gray-400'} />
                      </div>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => handleRename(chat.id, editingName)}
                            onKeyDown={(e) => handleKeyPress(e, chat.id)}
                            className="w-full bg-black/50 text-white text-sm font-medium rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            autoFocus
                            maxLength={50}
                          />
                        ) : (
                          <h3 className={`text-sm font-medium truncate ${
                            isActive ? 'text-white' : 'text-gray-200'
                          }`}>
                            {chat.title}
                          </h3>
                        )}
                        
                        {chat.lastMessage && !isEditing && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {chat.lastMessage}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock size={12} />
                            <span>{formatTimestamp(chat.timestamp)}</span>
                            {chat.messageCount > 0 && (
                              <>
                                <span>•</span>
                                <span>{chat.messageCount} messages</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Menu */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(chat);
                            }}
                            className="p-1 rounded hover:bg-white/20 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Rename chat"
                          >
                            <Edit3 size={12} className="text-gray-400 hover:text-white" />
                          </motion.button>
                          
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this chat?')) {
                                onDeleteChat?.(chat.id);
                              }
                            }}
                            className="p-1 rounded hover:bg-red-500/20 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete chat"
                          >
                            <Trash2 size={12} className="text-gray-400 hover:text-red-400" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-gray-400 text-center space-y-1">
          <p>🤖 TradeBot AI Assistant</p>
          <p>Your sarcastic trading companion</p>
          {chatHistory.length > 0 && (
            <p className="text-gray-500">{chatHistory.length} chat{chatHistory.length !== 1 ? 's' : ''} saved</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotSidebar;
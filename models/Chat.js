import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'bot']
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    index: true // Add index for better performance
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  messages: [messageSchema],
  sessionId: {
    type: String,
    required: true
  },
  tradeDataSummary: {
    totalTrades: Number,
    totalPnL: Number,
    winRate: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // ✅ NEW: Auto-delete tracking fields
  autoDeletedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: String,
    enum: ['user', 'admin', 'auto-cleanup'],
    default: null
  }
});

// Update the updatedAt field on save
chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create compound indexes for better performance
chatSchema.index({ chatId: 1 });
chatSchema.index({ userId: 1, createdAt: -1 }); // Compound index for user chats sorted by date
chatSchema.index({ userId: 1, sessionId: 1 }); // Compound index for user session chats
chatSchema.index({ sessionId: 1 });
chatSchema.index({ createdAt: -1 });

// ✅ NEW: Additional indexes for auto-delete functionality
chatSchema.index({ createdAt: 1, isActive: 1 }); // For efficient auto-cleanup queries
chatSchema.index({ userId: 1, isActive: 1 }); // For fetching active chats by user

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;
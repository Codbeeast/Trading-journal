import mongoose from 'mongoose';

const LeaderboardSchema = new mongoose.Schema({
  // This will be the Clerk User ID
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  username: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: ''
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  highestStreak: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Weekly streak achievements (converted from days to weeks)
  currentWeekStreak: {
    type: Number,
    default: 0
  },
  highestWeekStreak: {
    type: Number,
    default: 0
  },
  // League sub-level tracking
  league: {
    name: {
      type: String,
      default: 'Bronze'
    },
    subLevel: {
      type: Number,
      default: 1
    },
    progress: {
      type: Number,
      default: 0
    }
  },
  // Monthly performance data for wrapped feature
  monthlyPerformance: {
    month: String,
    year: Number,
    winRate: Number,
    totalTrades: Number,
    profitFactor: Number,
    consistency: Number,
    riskManagement: Number,
    compositeScore: Number
  }
}, { timestamps: true });

export default mongoose.models.Leaderboard || mongoose.model('Leaderboard', LeaderboardSchema);

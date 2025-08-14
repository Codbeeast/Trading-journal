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
  }
}, { timestamps: true });

export default mongoose.models.Leaderboard || mongoose.model('Leaderboard', LeaderboardSchema);

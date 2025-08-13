// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // use Clerk user id as primary key
  _id: { type: String, required: true },

  // Clerk-managed fields (synced by webhook)
  email: { type: String, required: true, lowercase: true, trim: true },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    set: v => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null),
  },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  imageUrl: { type: String, trim: true },

  // Custom profile fields
  bio: { type: String, maxlength: 300 },
  location: { type: String, trim: true },
  websiteUrl: { type: String, trim: true },
}, {
  timestamps: true,
});

// Avoid model recompilation in dev/hot-reload
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

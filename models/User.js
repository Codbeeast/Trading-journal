// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // use Clerk user id as primary key
  _id:           { type: String, required: true },

  // required profile fields
  email:         { type: String, required: true, lowercase: true, trim: true },
  username:      { type: String, required: true, unique: true, sparse: true, trim: true },
  firstName:     { type: String, required: true, trim: true },
  lastName:      { type: String, required: true, trim: true },
  imageUrl:         { type: String, required: true, trim: true },

}, {
  timestamps: true,    // adds createdAt and updatedAt
});

// avoid model recompilation in dev/hot-reload
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
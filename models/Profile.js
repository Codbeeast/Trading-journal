// 2. Updated Profile Model (models/Profile.js) - Optional if you want to keep it
import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
}, { timestamps: true });

export default mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

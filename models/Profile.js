import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  // This will be the Clerk User ID
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

import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  // --- Clerk-Managed Fields ---
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Enforces uniqueness only for non-null values
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  imageUrl: {
    type: String,
  },

  // --- Your Custom Profile Fields ---
  bio: {
    type: String,
    maxLength: 250, // Optional: add validation
  },
  location: {
    type: String,
  },
  websiteUrl: {
    type: String,
  },
  
}, {
  // Automatically manage createdAt and updatedAt timestamps
  timestamps: true,
});

// Avoids recompiling the model on hot reloads
const User = models.User || model('User', UserSchema);

export default User;
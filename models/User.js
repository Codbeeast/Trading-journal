import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // This is the unique ID from Clerk, acting as our primary reference.
  // It's indexed for fast lookups, which is crucial for our update logic.
  clerkId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },

  // User's primary email address.
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },

  // Optional username. It's unique if it exists.
  // `sparse: true` allows multiple documents to have a null/missing username.
  username: { 
    type: String, 
    unique: true, 
    sparse: true 
  },

  // Optional first name.
  firstName: { 
    type: String 
  },

  // Optional last name.
  lastName: { 
    type: String 
  },
  
  // We'll keep the imageUrl as it's very common to store this.
  imageUrl: {
    type: String,
  }

}, { 
  // This automatically adds `createdAt` and `updatedAt` fields.
  timestamps: true 
});

// Check if the model already exists before defining it
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;

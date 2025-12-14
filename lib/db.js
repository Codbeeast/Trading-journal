import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  // Use environment variable or fallback to localhost
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

  try {
    await mongoose.connect(mongoUri, {
      dbName: "tradejournal",
    });

    isConnected = true;
    // Removed console.log for cleaner output
  } catch (error) {
    // Silently handle connection errors in production
    if (process.env.NODE_ENV === 'development') {
      console.error("MongoDB connection error: ", error.message);
    }
  }
};

import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  // Use environment variable or fallback to localhost
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

  try {
    await mongoose.connect(mongoUri, {
      dbName: "tradejournal",
      //dbName: "ForeNotes",
    });

    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error!!: ", error);
  }
};

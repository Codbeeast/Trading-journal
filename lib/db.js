import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  // Use environment variable or fallback to localhost
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

  try {
    await mongoose.connect(mongoUri, {
      dbName: "tradejournal",
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
/*
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected',()=> console.log("Database Connected"));
        mongoose.connect(`${process.env.MONGODB_URI}`);
    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB; */
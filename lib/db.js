

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
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error!!: ", error);
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
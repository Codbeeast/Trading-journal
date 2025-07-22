// models/Trade.js
import mongoose from "mongoose";

const TradeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, 
  date: String,
  time: String,
  session: String,
  pair: String,
  buySell: String,
  setupType: String,
  entryType: String,
  timeFrameUsed: String,
  trailWorked: String,
  imageOfPlay: String,
  linkToPlay: String,
  uploadedImage: String, // Base64 encoded image data
  uploadedImageName: String, // Original filename
  entryPrice: Number,
  exitPrice: Number,
  pipsLostCaught: Number,
  pnl: Number,
  riskPerTrade: Number,
  rFactor: Number,
  typeOfTrade: String,
  entryModel: String,
  confluences: String,
  rulesFollowed: String,
  tfUsed: String,
  fearToGreed: Number,
  fomoRating: Number,
  executionRating: Number,
  imagePosting: String,
  notes: String,
}, { timestamps: true });

export default mongoose.models.Trade || mongoose.model("Trade", TradeSchema);

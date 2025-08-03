import mongoose from "mongoose";

const TradeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  date: String,
  time: String,
  pair: String,
  positionType: { type: String }, // long/short
  entry: { type: Number }, // Entry price
  exit: { type: Number }, // Exit price
  setupType: String,
  confluences: String,
  entryType: String,
  timeFrame: String,
  risk: Number,
  rFactor: Number,
  rulesFollowed: String,
  pipsLost: Number,
  pipsGain: Number,
  pnl: Number,
  image: String,
  notes: String,
}, { timestamps: true });

export default mongoose.models.Trade || mongoose.model("Trade", TradeSchema);
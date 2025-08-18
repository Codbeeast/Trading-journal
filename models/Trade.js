import mongoose from "mongoose";

const TradeSchema = new mongoose.Schema({
  userId: { type: String, default: 'default-user' },
  strategy: { type: mongoose.Schema.Types.ObjectId, ref: 'Strategy' },
  session: String,
  date: String,
  time: String,
  pair: String,
  positionType: String,
  entry: Number,
  exit: Number,
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
  imageName: String,
  notes: String,
  fearToGreed: { type: Number, min: 1, max: 10, default: 5 },
  fomoRating: { type: Number, min: 1, max: 10, default: 5 },
  executionRating: { type: Number, min: 1, max: 10, default: 5 },
  imagePosting: String,
}, { timestamps: true });

// Add indexes for better query performance
TradeSchema.index({ userId: 1, createdAt: -1 });
TradeSchema.index({ strategy: 1, createdAt: -1 });
TradeSchema.index({ userId: 1, strategy: 1 });

// Drop old problematic index if it exists
TradeSchema.pre('save', async function() {
  try {
    await this.collection.dropIndex('id_1');
  } catch (err) {
    // Index doesn't exist, ignore
  }
});

export default mongoose.models.Trade || mongoose.model("Trade", TradeSchema);

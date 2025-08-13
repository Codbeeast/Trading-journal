import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sessionName: { type: String, required: true },
  pair: { type: String, required: true },
  description: String,
  startDate: String,
  endDate: String,
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  notes: String,
  strategies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Strategy' }],
}, { timestamps: true });

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);

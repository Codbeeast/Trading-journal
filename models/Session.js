// models/Session.js
import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  sessionName: { type: String, required: true },
  balance: { type: Number, required: true },
  pair: { type: String, required: true },
  description: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);

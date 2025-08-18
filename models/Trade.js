// models/Trade.js

import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const TradeSchema = new Schema(
  {
    // Link every trade to a specific user
    userId: {
      type: String,
      required: true,
      index: true
    },

    // Reference to parent strategy, scoped per user
    strategy: {
      type: Schema.Types.ObjectId,
      ref: 'Strategy',
      required: true,
      index: true
    },

    // Core trade details
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    session: {
      type: String,
      required: true
    },
    pair: {
      type: String,
      required: true
    },
    positionType: {
      type: String,
      required: true
    },
    entry: {
      type: Number,
      required: true
    },
    exit: {
      type: Number,
      required: true
    },

    // Strategy metadata captured on the trade
    setupType: String,
    confluences: {
      type: [String],
      default: []
    },
    entryType: String,
    timeFrame: String,

    // Risk and performance metrics
    riskPerTrade: Number,
    rFactor: Number,
    rulesFollowed: String,
    pipsLost: Number,
    pipsGain: Number,
    pnl: Number,

    // Visuals and commentary
    imageOfPlay: String,
    imageName: String,
    notes: String,

    // Actions taken during the setup
    actions: {
      type: [String],
      default: []
    },

    // Behavioral and confidence ratings (1–10), in the order: patience, confidence
    fearToGreed: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    fomoRating: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    executionRating: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    patience: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    confidence: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  },
  { timestamps: true }
);

// Compound indexes for efficient per-user and per-strategy lookups
TradeSchema.index({ userId: 1, createdAt: -1 });
TradeSchema.index({ userId: 1, strategy: 1, createdAt: -1 });

export default models.Trade || model('Trade', TradeSchema);
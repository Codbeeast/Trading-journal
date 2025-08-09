import mongoose from 'mongoose';

const StrategySchema = new mongoose.Schema({
  // Section 1: Strategy Basics
  userId: { type: String, required: true },
  strategyName: { type: String, required: true, trim: true },
  strategyType: {
    type: String,
    required: true,
    enum: ['Swing', 'Intraday', 'Scalp']
  },
  strategyDescription: { type: String, default: '' },

  // Section 2: Market Details
  tradingPairs: { type: [String], required: true },
  timeframes: {
    type: [String],
    required: true,
    enum: ['1min', '5min', '15min', '1H', '4H', 'Daily', 'Weekly', 'Monthly']
  },

  // Section 3: Strategy Components
  setupType: {
    type: String,
    required: true,
    enum: ['Breakout', 'Reversal', 'Pullback', 'Trend Continuation', 'Liquidity Grab']
  },
  confluences: {
    type: [String],
    default: [],
    enum: ['Fibonacci', 'Order Block', 'Supply/Demand Zone', 'Trendline', 'Session Timing', 'News Filter']
  },
  entryType: {
    type: [String],
    default: [],
    enum: ['Candle Confirmation', 'Zone Breakout', 'Retest', 'Price Action Pattern', 'Instant Execution', 'Pending Order']
  },

  // Section 4: Risk & Backtest Settings
  initialBalance: { type: Number, required: true },
  riskPerTrade: { type: Number, required: true },

}, { timestamps: true });

export default mongoose.models.Strategy || mongoose.model('Strategy', StrategySchema);

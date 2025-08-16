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
  tradingPairs: { 
    type: [String], 
    required: true,
    validate: {
      validator: function(arr) {
        return Array.isArray(arr) && arr.length > 0;
      },
      message: 'At least one trading pair is required'
    }
  },
  timeframes: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return Array.isArray(arr) && arr.length > 0;
      },
      message: 'At least one timeframe is required'
    }
  },

  // Section 3: Strategy Components (Enhanced to support custom values)
  setupType: {
    type: String,
    required: true,
    // Removed enum constraint to allow custom setup types
    validate: {
      validator: function(value) {
        return value && value.trim().length > 0;
      },
      message: 'Setup type is required'
    }
  },
  confluences: {
    type: [String],
    default: [],
    // Removed enum constraint to allow custom confluences
    validate: {
      validator: function(arr) {
        return Array.isArray(arr);
      },
      message: 'Confluences must be an array'
    }
  },
  entryType: {
    type: [String],
    default: [],
    // Removed enum constraint to allow custom entry types
    validate: {
      validator: function(arr) {
        return Array.isArray(arr);
      },
      message: 'Entry types must be an array'
    }
  },

  // Section 4: Risk & Backtest Settings
  initialBalance: { 
    type: Number, 
    required: true,
    min: [0.01, 'Initial balance must be positive']
  },
  riskPerTrade: { 
    type: Number, 
    required: true,
    min: [0.01, 'Risk per trade must be positive'],
    max: [100, 'Risk per trade cannot exceed 100%']
  },

}, { 
  timestamps: true,
  // Add indexes for better query performance
  index: [
    { userId: 1, createdAt: -1 }, // Compound index for user queries
    { userId: 1, strategyName: 1 }, // For name-based searches
  ]
});

// Add a pre-save middleware to trim string fields
StrategySchema.pre('save', function(next) {
  if (this.strategyName) this.strategyName = this.strategyName.trim();
  if (this.strategyDescription) this.strategyDescription = this.strategyDescription.trim();
  if (this.setupType) this.setupType = this.setupType.trim();
  
  // Trim array elements
  if (this.confluences) {
    this.confluences = this.confluences.map(item => item.trim()).filter(item => item.length > 0);
  }
  if (this.entryType) {
    this.entryType = this.entryType.map(item => item.trim()).filter(item => item.length > 0);
  }
  if (this.tradingPairs) {
    this.tradingPairs = this.tradingPairs.map(item => item.trim()).filter(item => item.length > 0);
  }
  if (this.timeframes) {
    this.timeframes = this.timeframes.map(item => item.trim()).filter(item => item.length > 0);
  }
  
  next();
});

// Add a method to get predefined vs custom components
StrategySchema.methods.getComponentTypes = function() {
  const PREDEFINED_SETUP_TYPES = ['Breakout', 'Reversal', 'Pullback', 'Trend Continuation', 'Liquidity Grab'];
  const PREDEFINED_CONFLUENCES = ['Fibonacci', 'Order Block', 'Supply/Demand Zone', 'Trendline', 'Session Timing', 'News Filter'];
  const PREDEFINED_ENTRY_TYPES = ['Candle Confirmation', 'Zone Breakout', 'Retest', 'Price Action Pattern', 'Instant Execution', 'Pending Order'];
  
  return {
    setupType: {
      value: this.setupType,
      isCustom: !PREDEFINED_SETUP_TYPES.includes(this.setupType)
    },
    confluences: this.confluences.map(confluence => ({
      value: confluence,
      isCustom: !PREDEFINED_CONFLUENCES.includes(confluence)
    })),
    entryTypes: this.entryType.map(entry => ({
      value: entry,
      isCustom: !PREDEFINED_ENTRY_TYPES.includes(entry)
    }))
  };
};

export default mongoose.models.Strategy || mongoose.model('Strategy', StrategySchema);
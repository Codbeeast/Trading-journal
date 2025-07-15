// TradeEntry type (JSDoc for JS projects)
/**
 * @typedef {Object} TradeEntry
 * @property {string} id
 * @property {string} date
 * @property {string} time
 * @property {string} session
 * @property {string} pair
 * @property {string} buySell
 * @property {string} setupType
 * @property {string} entryType
 * @property {string} timeFrameUsed
 * @property {string} trailWorked
 * @property {string} imageOfPlay
 * @property {string} linkToPlay
 * @property {number|null} entryPrice
 * @property {number|null} exitPrice
 * @property {number|null} pipsLostCaught
 * @property {number|null} pnl
 * @property {number|null} riskPerTrade
 * @property {number|null} rFactor
 * @property {string} typeOfTrade
 * @property {string} entryModel
 * @property {string} confluences
 * @property {string} rulesFollowed
 * @property {string} tfUsed
 * @property {number} fearToGreed
 * @property {number} fomoRating
 * @property {number} executionRating
 * @property {string} imagePosting
 * @property {string} notes
 */

// Dropdown options for journal fields
export const DROPDOWN_OPTIONS = {
  sessions: ['NY', 'London', 'Pre NY', 'Asian', 'Frankfurt'],
  pairs: ['GBP/JPY', 'EUR/USD', 'USD/JPY', 'GBP/USD', 'EUR/GBP', 'AUD/USD', 'USD/CAD', 'NZD/USD'],
  buySell: ['Buy', 'Sell'],
  setupTypes: ['BO and Retest', 'Fast Trap', 'Double Top', 'Double Bottom', 'Fast Trap O', 'Trend Continuation', 'Reversal'],
  entryTypes: ['Current H/L', 'Previous H/L', 'Market', 'Limit'],
  timeFrames: ['Big C', 'DCC', '15M', '5M', '1M', 'H1', 'H4', 'D1'],
  trailWorked: ['YES', 'NO', 'Partial'],
  typeOfTrade: ['Scalp', 'Swing', 'Position', 'Day Trade'],
  entryModels: ['Breakout', 'Pullback', 'Reversal', 'Momentum'],
  rulesFollowed: ['All', 'Partial', 'None', 'Modified'],
  imagePosting: ['Posted', 'Not Posted', 'Pending']
};

// Named export for TradeEntry type (for IDEs/type checking)
export {}; 
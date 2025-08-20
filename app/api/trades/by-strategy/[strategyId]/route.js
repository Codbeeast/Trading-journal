// Add this debugging to your chat component (wherever you're calling the chat API)

const debugTradeData = (trades) => {
  console.log('🔍 DEBUGGING TRADE DATA FLOW:');
  console.log('=================================');
  
  console.log('1️⃣ RAW TRADES FROM API:', trades);
  console.log(`📊 Total trades received: ${trades.length}`);
  
  if (trades.length > 0) {
    const firstTrade = trades[0];
    console.log('2️⃣ FIRST TRADE DETAILED ANALYSIS:');
    console.log('Raw first trade object:', JSON.stringify(firstTrade, null, 2));
    
    console.log('3️⃣ FIELD-BY-FIELD CHECK:');
    const fieldCheck = {
      _id: firstTrade._id,
      date: {
        exists: !!firstTrade.date,
        value: firstTrade.date,
        type: typeof firstTrade.date,
        formatted: firstTrade.date ? new Date(firstTrade.date).toLocaleDateString() : 'N/A'
      },
      time: {
        exists: !!firstTrade.time,
        value: firstTrade.time,
        type: typeof firstTrade.time
      },
      session: {
        exists: !!firstTrade.session,
        value: firstTrade.session,
        type: typeof firstTrade.session
      },
      pair: {
        exists: !!firstTrade.pair,
        value: firstTrade.pair,
        type: typeof firstTrade.pair
      },
      positionType: {
        exists: !!firstTrade.positionType,
        value: firstTrade.positionType,
        type: typeof firstTrade.positionType
      },
      entry: {
        exists: !!firstTrade.entry,
        value: firstTrade.entry,
        type: typeof firstTrade.entry
      },
      exit: {
        exists: !!firstTrade.exit,
        value: firstTrade.exit,
        type: typeof firstTrade.exit
      },
      pnl: {
        exists: !!firstTrade.pnl,
        value: firstTrade.pnl,
        type: typeof firstTrade.pnl
      }
    };
    
    console.log('Field analysis:', fieldCheck);
    
    // Check for any undefined or null critical fields
    const criticalFields = ['date', 'time', 'session', 'pair', 'positionType', 'entry', 'exit', 'pnl'];
    const missingCritical = criticalFields.filter(field => !firstTrade[field]);
    
    if (missingCritical.length > 0) {
      console.error('❌ MISSING CRITICAL FIELDS:', missingCritical);
    } else {
      console.log('✅ All critical fields present');
    }
  }
  
  return trades;
};

// Use this in your sync function like this:
const syncTradeDataWithDebug = async () => {
  try {
    // 1. Fetch trades
    const trades = await fetchTradesByStrategy(currentStrategyId);
    
    // 2. Debug the trades
    const debuggedTrades = debugTradeData(trades);
    
    // 3. Build trade data object
    const tradeData = {
      portfolio: {
        totalTrades: debuggedTrades.length,
        totalPnL: debuggedTrades.reduce((sum, trade) => sum + (parseFloat(trade.pnl) || 0), 0),
        winRate: debuggedTrades.filter(trade => (parseFloat(trade.pnl) || 0) > 0).length / Math.max(debuggedTrades.length, 1),
        winningTrades: debuggedTrades.filter(trade => (parseFloat(trade.pnl) || 0) > 0).length,
        losingTrades: debuggedTrades.filter(trade => (parseFloat(trade.pnl) || 0) < 0).length,
        symbols: [...new Set(debuggedTrades.map(trade => trade.pair || trade.symbol).filter(Boolean))]
      },
      strategies: [{
        name: 'Current Strategy',
        trades: debuggedTrades.length,
        pnl: debuggedTrades.reduce((sum, trade) => sum + (parseFloat(trade.pnl) || 0), 0)
      }],
      trades: debuggedTrades
    };
    
    console.log('4️⃣ TRADE DATA OBJECT BEING SENT TO CHAT API:');
    console.log('Portfolio summary:', tradeData.portfolio);
    console.log('First few trades being sent:', tradeData.trades.slice(0, 3));
    
    // 4. Call chat API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'initialize',
        sessionId: generateSessionId(),
        tradeData
      })
    });
    
    const result = await response.json();
    console.log('5️⃣ CHAT API RESPONSE:', result);
    
    if (result.success) {
      console.log('✅ Chat initialized successfully');
      // The bot should now have all your trade data including dates and times
    } else {
      console.error('❌ Chat initialization failed:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Error in sync with debug:', error);
  }
};

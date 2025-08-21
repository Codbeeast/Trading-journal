/ app/api/chat/route.js
import { NextResponse } from 'next/server';

// Store conversation sessions in memory (use Redis/Database in production)
const conversationSessions = new Map();

// Configuration for session management
const SESSION_CONFIG = {
  // Extend session timeout to 4 hours for better user experience
  SESSION_TIMEOUT: 4 * 60 * 60 * 1000, // 4 hours
  // Cleanup interval - check every 30 minutes instead of 15
  CLEANUP_INTERVAL: 30 * 60 * 1000, // 30 minutes
  // Maximum number of sessions to prevent memory issues
  MAX_SESSIONS: 1000
};

export async function POST(request) {
  try {
    const { action, message, sessionId, tradeData } = await request.json();
    
    console.log('API Request:', { action, sessionId: !!sessionId, messageLength: message?.length || 0 });
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key not configured');
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    switch (action) {
      case 'initialize':
        return await initializeSession(sessionId, tradeData);
      
      case 'sendMessage':
        return await sendMessage(sessionId, message);
      
      case 'getHistory':
        return await getHistory(sessionId);
      
      case 'clearSession':
        return await clearSession(sessionId);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to check if session exists and is valid
function getValidSession(sessionId) {
  const session = conversationSessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  const now = new Date();
  const timeSinceLastActivity = now - session.lastActivity;
  
  // Check if session has expired
  if (timeSinceLastActivity > SESSION_CONFIG.SESSION_TIMEOUT) {
    console.log(`Session ${sessionId} expired (${Math.round(timeSinceLastActivity / 60000)} minutes since last activity)`);
    conversationSessions.delete(sessionId);
    return null;
  }

  // Update last activity timestamp for valid sessions
  session.lastActivity = now;
  return session;
}

// Helper function to safely format trade data
function formatTradeData(tradeData) {
  console.log('Raw trade data received:', JSON.stringify(tradeData, null, 2));
  
  if (!tradeData || !tradeData.trades || !Array.isArray(tradeData.trades)) {
    console.error('Invalid trade data structure:', tradeData);
    throw new Error('Invalid trade data structure - trades array is missing or invalid');
  }

  // Safely extract portfolio data with defaults
  const portfolio = tradeData.portfolio || {};
  const strategies = tradeData.strategies || [];
  const trades = tradeData.trades || [];

  console.log(`Processing ${trades.length} trades`);

  // Format each trade with proper date/time handling
  const formattedTrades = trades.map((trade, index) => {
    try {
      // Handle date formatting - check multiple possible date fields
      let tradeDate = 'Unknown Date';
      let tradeTime = trade.time || 'Unknown Time';
      
      if (trade.date) {
        const date = new Date(trade.date);
        if (!isNaN(date.getTime())) {
          tradeDate = date.toLocaleDateString('en-US');
        }
      } else if (trade.createdAt) {
        const date = new Date(trade.createdAt);
        if (!isNaN(date.getTime())) {
          tradeDate = date.toLocaleDateString('en-US');
        }
      }

      // Safely extract all trade fields
      const symbol = trade.pair || trade.symbol || 'Unknown';
      const type = trade.positionType || trade.type || 'Unknown';
      const entry = trade.entry ? parseFloat(trade.entry).toFixed(4) : 'Unknown';
      const exit = trade.exit ? parseFloat(trade.exit).toFixed(4) : 'Open';
      const pnl = trade.pnl ? parseFloat(trade.pnl).toFixed(2) : '0.00';
      const session = trade.session || 'Unknown';
      const setupType = trade.setupType || 'Unknown';
      const timeFrame = trade.timeFrame || 'Unknown';
      const rFactor = trade.rFactor ? parseFloat(trade.rFactor).toFixed(2) : '0.00';
      
      return {
        index: index + 1,
        date: tradeDate,
        time: tradeTime,
        symbol,
        type,
        entry,
        exit,
        pnl,
        session,
        setupType,
        timeFrame,
        rFactor,
        formatted: `#${index + 1}: ${symbol} ${type} on ${tradeDate} at ${tradeTime} (${session} session) - ${setupType} setup on ${timeFrame} - Entry: ${entry}, Exit: ${exit}, P&L: $${pnl}, R-Factor: ${rFactor}`
      };
    } catch (error) {
      console.error(`Error formatting trade ${index}:`, error, trade);
      return {
        index: index + 1,
        formatted: `#${index + 1}: Error formatting trade data`
      };
    }
  });

  return {
    portfolio: {
      totalTrades: portfolio.totalTrades || trades.length,
      totalPnL: portfolio.totalPnL || trades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0),
      winRate: portfolio.winRate || (trades.filter(t => (parseFloat(t.pnl) || 0) > 0).length / Math.max(trades.length, 1)),
      winningTrades: portfolio.winningTrades || trades.filter(t => (parseFloat(t.pnl) || 0) > 0).length,
      losingTrades: portfolio.losingTrades || trades.filter(t => (parseFloat(t.pnl) || 0) < 0).length,
      symbols: portfolio.symbols || [...new Set(trades.map(t => t.pair || t.symbol).filter(Boolean))]
    },
    strategies: strategies.length > 0 ? strategies : [{
      name: 'Default Strategy',
      trades: trades.length,
      pnl: trades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0)
    }],
    trades: formattedTrades,
    rawTrades: trades // Keep raw data for reference
  };
}

async function initializeSession(sessionId, tradeData) {
  try {
    console.log('Initializing session:', sessionId);
    
    // Check if we're at max capacity and cleanup if needed
    if (conversationSessions.size >= SESSION_CONFIG.MAX_SESSIONS) {
      console.log('Max sessions reached, performing cleanup...');
      cleanupOldSessions();
      
      // If still at max, remove oldest sessions
      if (conversationSessions.size >= SESSION_CONFIG.MAX_SESSIONS) {
        const oldestSessions = Array.from(conversationSessions.entries())
          .sort(([,a], [,b]) => a.lastActivity - b.lastActivity)
          .slice(0, Math.floor(SESSION_CONFIG.MAX_SESSIONS * 0.1)); // Remove 10% oldest
        
        oldestSessions.forEach(([id]) => conversationSessions.delete(id));
        console.log(`Removed ${oldestSessions.length} oldest sessions`);
      }
    }
    
    if (!tradeData) {
      throw new Error('No trade data provided for analysis');
    }

    // Format trade data safely
    const formattedData = formatTradeData(tradeData);
    
    console.log('Formatted data summary:', {
      totalTrades: formattedData.portfolio.totalTrades,
      totalPnL: formattedData.portfolio.totalPnL,
      tradesProcessed: formattedData.trades.length
    });

    // Enhanced system prompt with properly formatted data
    const systemPrompt = `You are TradeBot AI, a hilarious and sarcastic trading assistant with brutal honesty and sharp wit.

PERSONALITY:
- Sarcastic, witty, and brutally honest
- Use trading slang, emojis, and casual language  
- Make jokes about trading decisions (good and bad)
- Reference trading memes and culture
- Be entertaining while being accurate

YOUR TRADING DATA CONTEXT:
Portfolio Summary:
- Total Trades: ${formattedData.portfolio.totalTrades}
- Total P&L: $${formattedData.portfolio.totalPnL.toFixed(2)}
- Win Rate: ${(formattedData.portfolio.winRate * 100).toFixed(1)}%
- Winning Trades: ${formattedData.portfolio.winningTrades}
- Losing Trades: ${formattedData.portfolio.losingTrades}
- Symbols Traded: ${tradeData.portfolio.symbols || [...new Set(tradeData.trades.map(t => t.pair).filter(Boolean))].join(', ')}

Strategy Performance:
${formattedData.strategies.map(s => `- ${s.name}: ${s.trades} trades, $${parseFloat(s.pnl).toFixed(2)} P&L`).join('\n')}

DETAILED TRADE HISTORY:
${formattedData.trades.slice(0, 10).map(t => t.formatted).join('\n')}
${formattedData.trades.length > 10 ? `\n... and ${formattedData.trades.length - 10} more trades in the database` : ''}

RECENT TRADE ANALYSIS:
${tradeData.trades.slice(0, 3).map(t => {
  const pnl = parseFloat(t.pnl || 0);
  const analysis = pnl > 0 ? '✅ Winner' : pnl < 0 ? '❌ Loser' : '⚪ Breakeven';
  const date = t.date ? new Date(t.date).toLocaleDateString() : 'Unknown Date';
  const time = t.time || 'Unknown Time';
  const pair = t.pair || 'Unknown';
  const positionType = t.positionType || 'Unknown';
  return `- ${pair} ${positionType}: ${analysis} - ${date} at ${time} (${t.session || 'Unknown Session'})`;
}).join('\n')}

RULES:
1. Always reference specific trade data when answering (dates, times, symbols, P&L)
2. Be sarcastic but helpful 
3. Use emojis and trading slang
4. Point out patterns and mistakes with humor
5. Give practical advice wrapped in wit
6. Calculate metrics when relevant
7. Reference actual trade dates, times, sessions, and all available data from above

Ready to roast some trades with ACTUAL detailed data! 🔥`;

    // Test Gemini connection with proper format
    const testResponse = await callGeminiAPI([], systemPrompt, 'Hello! Analyze my trading data and give me a witty summary.');

    console.log('Gemini test successful, response length:', testResponse.length);

    // Create session with extended timeout and activity tracking
    const now = new Date();
    const sessionData = {
      systemPrompt,
      history: [],
      tradeData: formattedData,
      createdAt: now,
      lastActivity: now,
      messageCount: 0,
      // Add session health tracking
      geminiResponses: 1, // Count successful Gemini responses
      errors: 0
    };

    // Store session
    conversationSessions.set(sessionId, sessionData);

    console.log(`Session ${sessionId} initialized successfully. Active sessions: ${conversationSessions.size}`);

    return NextResponse.json({
      success: true,
      message: "🚀 TradeBot AI is locked and loaded with your trade data! Ready to deliver some brutally honest (and hilarious) trading insights. What would you like to roast first? 😏",
      sessionId,
      sessionInfo: {
        expiresAt: new Date(now.getTime() + SESSION_CONFIG.SESSION_TIMEOUT).toISOString(),
        timeoutMinutes: SESSION_CONFIG.SESSION_TIMEOUT / 60000
      },
      dataProcessed: {
        totalTrades: formattedData.portfolio.totalTrades,
        totalPnL: formattedData.portfolio.totalPnL,
        winRate: formattedData.portfolio.winRate
      }
    });

  } catch (error) {
    console.error('Initialize session error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function sendMessage(sessionId, userMessage) {
  try {
    console.log('Sending message for session:', sessionId, 'Message:', userMessage?.substring(0, 100) + '...');
    
    // Use the new session validation function
    const session = getValidSession(sessionId);
    
    if (!session) {
      console.error('Session not found or expired:', sessionId);
      console.log('Available sessions:', Array.from(conversationSessions.keys()));
      return NextResponse.json({
        success: false, 
        error: 'Session expired or not found. Please sync your data again.',
        errorType: 'SESSION_EXPIRED',
        fallbackResponse: "Oops! Our chat session expired faster than a margin call! 📞💥 Hit that sync button again and let's get back to roasting your trades! 🔄"
      }, { status: 404 });
    }

    console.log(`Calling Gemini for session ${sessionId} (${session.messageCount} messages, ${session.geminiResponses} successful responses)`);

    // Get response from Gemini with retry logic
    let geminiResponse;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        geminiResponse = await callGeminiAPI(session.history, session.systemPrompt, userMessage);
        session.geminiResponses++;
        break;
      } catch (error) {
        retryCount++;
        session.errors++;
        
        if (retryCount > maxRetries) {
          throw error;
        }
        
        console.log(`Gemini API retry ${retryCount}/${maxRetries} for session ${sessionId}:`, error.message);
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    console.log('Gemini response received, length:', geminiResponse.length);

    // Update session history and metrics
    session.history.push(
      { role: 'user', parts: [{ text: userMessage }] },
      { role: 'model', parts: [{ text: geminiResponse }] }
    );
    session.messageCount++;
    session.lastActivity = new Date(); // This is already done in getValidSession, but keeping for clarity

    // Trim history if it gets too long (keep last 20 exchanges = 40 messages)
    if (session.history.length > 40) {
      session.history = session.history.slice(-40);
      console.log(`Trimmed history for session ${sessionId} to last 20 exchanges`);
    }

    return NextResponse.json({
      success: true,
      response: geminiResponse,
      timestamp: new Date().toISOString(),
      sessionInfo: {
        messageCount: session.messageCount,
        lastActivity: session.lastActivity.toISOString()
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    
    // Update error count for the session if it exists
    const session = conversationSessions.get(sessionId);
    if (session) {
      session.errors++;
    }
    
    // Enhanced fallback responses with more variety
    const fallbackResponses = [
      "Oops! My circuits got crossed faster than a bad trade execution! 🤖💨 Try asking again - I promise I'm usually more reliable than your stop losses!",
      "Error 404: Sarcasm temporarily unavailable! 😅 Just kidding, I'm having technical issues. Give me another shot!",
      "Looks like I'm more broken than your risk management right now! 🔧 Technical difficulties, try again!",
      "My AI brain just paper-handed this response! 📄🙌 System hiccup - hit me with that question again!",
      "Even trading bots have bad days! ☁️ Technical glitch detected, please retry your request!",
      "Whoops! I just had a flash crash worse than your worst trade! 💥 Try again, I'm back online!",
      "My neural networks are more tangled than your P&L chart right now! 🧠 Technical timeout, retry please!"
    ];

    const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return NextResponse.json({
      success: false,
      error: error.message,
      fallbackResponse: randomFallback,
      errorType: 'GEMINI_ERROR'
    });
  }
}

async function callGeminiAPI(conversationHistory, systemPrompt, userMessage) {
  try {
    console.log('Calling Gemini API...');
    
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH', 
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    });

    // For initialization test (no history)
    if (!conversationHistory || conversationHistory.length === 0) {
      console.log('Initialization test - using generateContent');
      const result = await model.generateContent(userMessage);
      const response = await result.response;
      return response.text();
    }

    // For conversation with history
    console.log('Multi-turn conversation - using startChat');
    
    const chat = model.startChat({
      history: conversationHistory
    });

    // Send current message
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    
    console.log('Gemini API call successful');
    return response.text();

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Enhanced error handling with more specific error types
    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      throw new Error('Invalid Gemini API key configuration');
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit') || error.status === 429) {
      throw new Error('API rate limit exceeded. Please wait a moment and try again.');
    }

    if (error.message?.includes('SAFETY') || error.message?.includes('safety')) {
      throw new Error('Response blocked by safety filters. Try rephrasing your question.');
    }

    if (error.message?.includes('system_instruction') || error.message?.includes('systemInstruction')) {
      throw new Error('System instruction format error. Please try again.');
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message?.includes('fetch')) {
      throw new Error('Network connection error. Please check your internet connection and try again.');
    }

    if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
      throw new Error('Request timeout. Please try again.');
    }

    // Log full error for debugging
    console.error('Full Gemini error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      errorDetails: error.errorDetails,
      code: error.code
    });

    throw new Error(`Gemini API error: ${error.message}`);
  }
}

async function getHistory(sessionId) {
  try {
    const session = getValidSession(sessionId);
    
    if (!session) {
      return NextResponse.json({
        success: true,
        history: [],
        sessionExpired: true
      });
    }

    // Convert Gemini format to UI format
    const history = [];
    session.history.forEach((msg, index) => {
      const content = msg.parts?.[0]?.text || msg.content;
      history.push({
        id: index + 1,
        type: msg.role === 'user' ? 'user' : 'bot',
        content: content,
        timestamp: new Date().toLocaleTimeString()
      });
    });

    return NextResponse.json({
      success: true,
      history,
      sessionInfo: {
        messageCount: session.messageCount,
        lastActivity: session.lastActivity.toISOString(),
        geminiResponses: session.geminiResponses,
        errors: session.errors
      }
    });

  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function clearSession(sessionId) {
  try {
    const deleted = conversationSessions.delete(sessionId);
    console.log(`Session ${sessionId} ${deleted ? 'cleared' : 'not found'}`);
    
    return NextResponse.json({
      success: true,
      message: deleted ? 'Session cleared successfully' : 'Session not found',
      cleared: deleted
    });

  } catch (error) {
    console.error('Clear session error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Improved cleanup function with better logging and metrics
const cleanupOldSessions = () => {
  const now = new Date();
  let cleanedCount = 0;
  let totalSessions = conversationSessions.size;
  
  for (const [sessionId, session] of conversationSessions.entries()) {
    const timeSinceLastActivity = now - session.lastActivity;
    
    if (timeSinceLastActivity > SESSION_CONFIG.SESSION_TIMEOUT) {
      conversationSessions.delete(sessionId);
      cleanedCount++;
      console.log(`Cleaned session ${sessionId} (inactive for ${Math.round(timeSinceLastActivity / 60000)} minutes)`);
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`Cleanup complete: Removed ${cleanedCount}/${totalSessions} sessions. Active sessions: ${conversationSessions.size}`);
  } else {
    console.log(`Cleanup complete: No sessions expired. Active sessions: ${conversationSessions.size}`);
  }
  
  // Log session health metrics
  if (conversationSessions.size > 0) {
    let totalMessages = 0;
    let totalErrors = 0;
    let totalGeminiResponses = 0;
    
    for (const session of conversationSessions.values()) {
      totalMessages += session.messageCount || 0;
      totalErrors += session.errors || 0;
      totalGeminiResponses += session.geminiResponses || 0;
    }
    
    console.log(`Session metrics: ${totalMessages} total messages, ${totalGeminiResponses} successful Gemini responses, ${totalErrors} errors across ${conversationSessions.size} active sessions`);
  }
};

// Run cleanup less frequently to reduce server load
setInterval(cleanupOldSessions, SESSION_CONFIG.CLEANUP_INTERVAL);

// Health check endpoint with improved metrics
export async function GET(request) {
  try {
    // Calculate session metrics
    let totalMessages = 0;
    let totalErrors = 0;
    let totalGeminiResponses = 0;
    let oldestSession = null;
    let newestSession = null;
    
    for (const [sessionId, session] of conversationSessions.entries()) {
      totalMessages += session.messageCount || 0;
      totalErrors += session.errors || 0;
      totalGeminiResponses += session.geminiResponses || 0;
      
      if (!oldestSession || session.createdAt < oldestSession.createdAt) {
        oldestSession = { id: sessionId, createdAt: session.createdAt };
      }
      
      if (!newestSession || session.createdAt > newestSession.createdAt) {
        newestSession = { id: sessionId, createdAt: session.createdAt };
      }
    }

    return NextResponse.json({
      status: 'healthy',
      config: {
        sessionTimeoutMinutes: SESSION_CONFIG.SESSION_TIMEOUT / 60000,
        cleanupIntervalMinutes: SESSION_CONFIG.CLEANUP_INTERVAL / 60000,
        maxSessions: SESSION_CONFIG.MAX_SESSIONS
      },
      sessions: {
        active: conversationSessions.size,
        totalMessages,
        totalErrors,
        totalGeminiResponses,
        oldestSession: oldestSession ? {
          id: oldestSession.id,
          ageMinutes: Math.round((new Date() - oldestSession.createdAt) / 60000)
        } : null,
        newestSession: newestSession ? {
          id: newestSession.id,
          ageMinutes: Math.round((new Date() - newestSession.createdAt) / 60000)
        } : null
      },
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}
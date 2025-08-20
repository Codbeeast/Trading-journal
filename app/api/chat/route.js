// app/api/chat/route.js
import { NextResponse } from 'next/server';

// Store conversation sessions in memory (use Redis/Database in production)
const conversationSessions = new Map();

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

    // Store session with formatted data
    conversationSessions.set(sessionId, {
      systemPrompt,
      history: [],
      tradeData: formattedData,
      createdAt: new Date(),
      lastActivity: new Date()
    });

    return NextResponse.json({
      success: true,
      message: "🚀 TradeBot AI is locked and loaded with your trade data! Ready to deliver some brutally honest (and hilarious) trading insights. What would you like to roast first? 😏",
      sessionId,
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
    
    const session = conversationSessions.get(sessionId);
    
    if (!session) {
      console.error('Session not found:', sessionId);
      console.log('Available sessions:', Array.from(conversationSessions.keys()));
      return NextResponse.json({
        success: false, 
        error: 'Session not found. Please sync your data first.',
        fallbackResponse: "Looks like our connection got lost! Hit that sync button again and let's get back to roasting your trades! 🔄"
      }, { status: 404 });
    }

    console.log('Calling Gemini with history length:', session.history.length);

    // Get response from Gemini
    const geminiResponse = await callGeminiAPI(session.history, session.systemPrompt, userMessage);

    console.log('Gemini response received, length:', geminiResponse.length);

    // Update session history
    session.history.push(
      { role: 'user', parts: [{ text: userMessage }] },
      { role: 'model', parts: [{ text: geminiResponse }] }
    );
    session.lastActivity = new Date();

    return NextResponse.json({
      success: true,
      response: geminiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send message error:', error);
    
    // Enhanced fallback responses
    const fallbackResponses = [
      "Oops! My circuits got crossed faster than a bad trade execution! 🤖💨 Try asking again - I promise I'm usually more reliable than your stop losses!",
      "Error 404: Sarcasm temporarily unavailable! 😅 Just kidding, I'm having technical issues. Give me another shot!",
      "Looks like I'm more broken than your risk management right now! 🔧 Technical difficulties, try again!",
      "My AI brain just paper-handed this response! 📄🙌 System hiccup - hit me with that question again!",
      "Even trading bots have bad days! ☁️ Technical glitch detected, please retry your request!"
    ];

    const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return NextResponse.json({
      success: false,
      error: error.message,
      fallbackResponse: randomFallback
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
    
    // Enhanced error handling
    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      throw new Error('Invalid Gemini API key configuration');
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit') || error.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    if (error.message?.includes('SAFETY') || error.message?.includes('safety')) {
      throw new Error('Response blocked by safety filters. Try rephrasing your question.');
    }

    if (error.message?.includes('system_instruction') || error.message?.includes('systemInstruction')) {
      throw new Error('System instruction format error. Please try again.');
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Network error. Please check your connection.');
    }

    // Log full error for debugging
    console.error('Full Gemini error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      errorDetails: error.errorDetails
    });

    throw new Error(`Gemini API error: ${error.message}`);
  }
}

async function getHistory(sessionId) {
  try {
    const session = conversationSessions.get(sessionId);
    
    if (!session) {
      return NextResponse.json({
        success: true,
        history: []
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
      history
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

// Cleanup old sessions
const cleanupOldSessions = () => {
  const now = new Date();
  const oneHour = 60 * 60 * 1000;
  let cleanedCount = 0;
  
  for (const [sessionId, session] of conversationSessions.entries()) {
    if (now - session.lastActivity > oneHour) {
      conversationSessions.delete(sessionId);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} inactive sessions. Active sessions: ${conversationSessions.size}`);
  }
};

setInterval(cleanupOldSessions, 15 * 60 * 1000);

// Health check endpoint
export async function GET(request) {
  try {
    return NextResponse.json({
      status: 'healthy',
      activeSessions: conversationSessions.size,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      sessions: Array.from(conversationSessions.keys()),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';

// Store conversation sessions in memory (use Redis/Database in production)
const conversationSessions = new Map();

export async function POST(request) {
  try {
    const { action, message, sessionId, userId, tradeData, chatId } = await request.json();
    
    console.log('API Request:', { action, sessionId: !!sessionId, userId, messageLength: message?.length || 0, chatId });
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key not configured');
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Validate userId for all actions
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'initialize':
        return await initializeSession(sessionId, userId, tradeData);
      
      case 'sendMessage':
        return await sendMessage(sessionId, userId, message, chatId);
      
      case 'getHistory':
        return await getHistory(sessionId, userId);
      
      case 'clearSession':
        return await clearSession(sessionId, userId);
      
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

// Helper function to save chat message to database with userId
async function saveChatToDatabase(chatId, sessionId, userId, userMessage, botResponse, tradeDataSummary) {
  try {
    console.log('Saving to database:', { chatId, sessionId, userId });
    
    const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat/${chatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        response: botResponse,
        sessionId,
        userId, // Include userId in the request
        tradeDataSummary
      }),
    });

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json();
      console.error('Failed to save chat to database:', errorData);
      return false;
    }

    const saveResult = await saveResponse.json();
    console.log('Chat saved successfully:', saveResult);
    return true;

  } catch (error) {
    console.error('Error saving chat to database:', error);
    return false;
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

async function initializeSession(sessionId, userId, tradeData) {
  try {
    console.log('Initializing session:', { sessionId, userId });
    
    if (!tradeData) {
      throw new Error('No trade data provided for analysis');
    }

    // Create session key that includes userId for isolation
    const sessionKey = `${userId}_${sessionId}`;

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
8. Your response should be concise and efficient under 100 words with humor and info in perfect ratio

Ready to roast some trades with ACTUAL detailed data! 🔥`;

    // Test Gemini connection with proper format
    const testResponse = await callGeminiAPI([], systemPrompt, 'Hello! Analyze my trading data and give me a witty summary.');

    console.log('Gemini test successful, response length:', testResponse.length);

    // Store session with formatted data using user-specific key
    conversationSessions.set(sessionKey, {
      systemPrompt,
      history: [],
      tradeData: formattedData,
      userId,
      sessionId,
      createdAt: new Date(),
      lastActivity: new Date()
    });

    return NextResponse.json({
      success: true,
      message: "🚀 TradeBot AI is locked and loaded with your trade data! Ready to deliver some brutally honest (and hilarious) trading insights. What would you like to roast first? 😏",
      sessionId,
      userId,
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

async function sendMessage(sessionId, userId, userMessage, chatId) {
  try {
    console.log('Sending message for session:', { sessionId, userId, messagePreview: userMessage?.substring(0, 100) + '...', chatId });
    
    const sessionKey = `${userId}_${sessionId}`;
    const session = conversationSessions.get(sessionKey);
    
    if (!session) {
      console.error('Session not found:', sessionKey);
      console.log('Available sessions:', Array.from(conversationSessions.keys()));
      return NextResponse.json({
        success: false, 
        error: 'Session not found. Please sync your data first.',
        fallbackResponse: "Looks like our connection got lost! Hit that sync button again and let's get back to roasting your trades! 🔄"
      }, { status: 404 });
    }

    // Validate session belongs to user
    if (session.userId !== userId) {
      console.error('Session ownership mismatch:', { sessionUserId: session.userId, requestUserId: userId });
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Session does not belong to this user',
        fallbackResponse: "Whoa there! That's not your trading data to analyze! 🚫"
      }, { status: 403 });
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

    // Save to database if chatId is provided
    if (chatId) {
      const tradeDataSummary = {
        totalTrades: session.tradeData.portfolio.totalTrades,
        totalPnL: session.tradeData.portfolio.totalPnL,
        winRate: session.tradeData.portfolio.winRate
      };
      
      const saved = await saveChatToDatabase(chatId, sessionId, userId, userMessage, geminiResponse, tradeDataSummary);
      console.log('Database save result:', saved);
    }

    return NextResponse.json({
      success: true,
      response: geminiResponse,
      timestamp: new Date().toISOString(),
      chatId: chatId || null,
      userId
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
      fallbackResponse: randomFallback,
      userId
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

async function getHistory(sessionId, userId) {
  try {
    const sessionKey = `${userId}_${sessionId}`;
    const session = conversationSessions.get(sessionKey);
    
    if (!session) {
      return NextResponse.json({
        success: true,
        history: [],
        userId
      });
    }

    // Validate session belongs to user
    if (session.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Session does not belong to this user'
      }, { status: 403 });
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
      userId
    });

  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json(
      { success: false, error: error.message, userId },
      { status: 500 }
    );
  }
}

async function clearSession(sessionId, userId) {
  try {
    const sessionKey = `${userId}_${sessionId}`;
    const session = conversationSessions.get(sessionKey);
    
    // Validate session ownership before clearing
    if (session && session.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Cannot clear session belonging to another user'
      }, { status: 403 });
    }
    
    const deleted = conversationSessions.delete(sessionKey);
    console.log(`Session ${sessionKey} ${deleted ? 'cleared' : 'not found'}`);
    
    return NextResponse.json({
      success: true,
      message: deleted ? 'Session cleared successfully' : 'Session not found',
      cleared: deleted,
      userId
    });

  } catch (error) {
    console.error('Clear session error:', error);
    return NextResponse.json(
      { success: false, error: error.message, userId },
      { status: 500 }
    );
  }
}

// Cleanup old sessions with user isolation
const cleanupOldSessions = () => {
  const now = new Date();
  const oneHour = 60 * 60 * 1000;
  let cleanedCount = 0;
  
  for (const [sessionKey, session] of conversationSessions.entries()) {
    if (now - session.lastActivity > oneHour) {
      conversationSessions.delete(sessionKey);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} inactive sessions. Active sessions: ${conversationSessions.size}`);
  }
};

setInterval(cleanupOldSessions, 15 * 60 * 1000);

// Health check endpoint with session breakdown by user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Get session statistics
    let userSessions = [];
    let totalSessions = conversationSessions.size;
    
    if (userId) {
      // Filter sessions for specific user
      for (const [sessionKey, session] of conversationSessions.entries()) {
        if (session.userId === userId) {
          userSessions.push({
            sessionKey,
            sessionId: session.sessionId,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            messageCount: session.history.length / 2 // Divide by 2 since each exchange is 2 messages
          });
        }
      }
    }
    
    return NextResponse.json({
      status: 'healthy',
      totalActiveSessions: totalSessions,
      userSessions: userId ? userSessions : undefined,
      userSessionCount: userId ? userSessions.length : undefined,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
      requestedUserId: userId
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}
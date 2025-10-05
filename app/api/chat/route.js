// app/api/chat/route.js
import { NextResponse } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  // Track API calls per day for free tier
  maxCallsPerDay: 45, // Leave some buffer from the 50 limit
  resetHour: 0, // Reset at midnight
  retryDelay: 25000, // 25 seconds (more than the 21s suggested)
};

// In-memory rate limit tracking (use Redis in production)
let dailyApiCalls = {
  count: 0,
  date: new Date().toDateString(),
  lastReset: new Date()
};

// Enhanced system prompt with randomly selected personas - STRICT VERSION
const getRandomPersona = () => {
  const personas = [
    {
      name: "The Intellectual Analyst",
      personality: `You are TradeBot AI - The Intellectual Analyst, a sophisticated trading assistant with deep market knowledge and analytical prowess.

PERSONALITY:
- Scholarly, articulate, and intellectually rigorous
- Use precise trading terminology and market theory
- Reference classic trading literature and market principles
- Analytical mindset with strategic thinking
- Professional and businesslike tone ONLY
- Focus on educational insights and market psychology

STRICT RULES:
- NEVER use terms like honey, darling, sweetie, babe, or any pet names
- NO flirtatious or romantic language whatsoever
- Keep all interactions strictly professional and business-focused
- Address users neutrally without personal terms`,
      greeting: "I understand. I'm TradeBot AI - The Intellectual Analyst, ready to provide sophisticated analysis of your trading performance."
    },
    {
      name: "The Comedy Roaster", 
      personality: `You are TradeBot AI - The Comedy Roaster, a hilarious trading assistant who delivers brutal honesty wrapped in comedy gold.

PERSONALITY:
- Witty, sarcastic, and brutally honest comedian
- Use trading humor, roasts, and comedic timing about TRADING ONLY
- Make clever jokes about trading decisions and market moves
- Reference trading memes and market situations
- Entertainment-focused while being accurate
- Sharp wit focused on trading performance

STRICT RULES:
- NEVER use terms like honey, darling, sweetie, babe, or any pet names
- NO flirtatious, romantic, or personal comments
- Keep all humor focused on trading and markets ONLY
- Address users directly without personal terms
- Comedy should be about trades, not personal`,
      greeting: "I understand. I'm TradeBot AI - The Comedy Roaster, ready to roast your trading performance with sharp wit."
    },
    {
      name: "The Zen Master Trader",
      personality: `You are TradeBot AI - The Zen Master Trader, a wise and philosophical trading guide focused on mindset and discipline.

PERSONALITY:
- Calm, wise, and philosophically inclined
- Focus on trading psychology and emotional discipline
- Use metaphors from nature, martial arts, and ancient wisdom
- Emphasize patience, mindfulness, and long-term market thinking
- Spiritual approach to market movements and trading
- Balanced perspective on wins and losses

STRICT RULES:
- NEVER use terms like honey, darling, sweetie, babe, or any pet names
- NO personal or romantic language
- Keep all wisdom focused on trading and markets
- Address users respectfully but neutrally
- All philosophical insights must relate to trading`,
      greeting: "I understand. I'm TradeBot AI - The Zen Master Trader, ready to guide your trading journey with wisdom."
    }
  ];
  
  return personas[Math.floor(Math.random() * personas.length)];
};
// In-memory session storage (use Redis in production)
const conversationSessions = new Map();

// Rate limit check function
function checkRateLimit() {
  const today = new Date().toDateString();

  // Reset counter if it's a new day
  if (dailyApiCalls.date !== today) {
    dailyApiCalls = {
      count: 0,
      date: today,
      lastReset: new Date()
    };
    console.log('Daily API call counter reset for new day');
  }

  // Check if we're at the limit
  if (dailyApiCalls.count >= RATE_LIMIT_CONFIG.maxCallsPerDay) {
    const hoursUntilReset = 24 - new Date().getHours();
    throw new Error(`Daily Gemini API limit reached (${dailyApiCalls.count}/${RATE_LIMIT_CONFIG.maxCallsPerDay}). Resets in ${hoursUntilReset} hours.`);
  }

  return true;
}

// Increment API call counter
function incrementApiCallCount() {
  dailyApiCalls.count++;
  console.log(`API calls today: ${dailyApiCalls.count}/${RATE_LIMIT_CONFIG.maxCallsPerDay}`);
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

// Fallback response system when API limit is reached
function generateFallbackResponse(userMessage, tradeData) {
  const fallbackResponses = [
    "🚨 Oops! I've hit my daily API limit faster than you hit your stop losses! The free tier only gives me 50 roasts per day. Come back tomorrow for more brutal trading insights! 😅",
    "💸 Well, well, well... looks like I'm more quota-limited than your risk management! Hit the daily API limit. Time to upgrade or wait for tomorrow's reset! ⏰",
    "📊 Plot twist: I ran out of API calls before you ran out of bad trades! That's saying something! Free tier = 50 calls/day. See you tomorrow! 🌅",
    "🤖 Error 429: Sarcasm quota exceeded! Even AI has limits (unlike your leverage apparently). Daily limit reached - back tomorrow! 📈",
    "⚡ Breaking: TradeBot actually hit a limit before your account did! Free tier maxed out. Upgrade or wait for the daily reset! 💫"
  ];

  // Add some basic analysis if we have trade data
  const basicStats = tradeData ? `
  
📈 Quick Stats (while I'm offline):
• Total Trades: ${tradeData.portfolio?.totalTrades || 0}
• Total P&L: ${tradeData.portfolio?.totalPnL?.toFixed(2) || '0.00'}
• Win Rate: ${((tradeData.portfolio?.winRate || 0) * 100).toFixed(1)}%

💡 Pro tip: While you wait, maybe review those losing trades? Just saying... 😏` : '';

  const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  return randomResponse + basicStats;
}

async function callGeminiAPI(conversationHistory, systemPrompt, userMessage) {
  try {
    console.log('Calling Gemini API...');
    console.log('API Key configured:', !!process.env.GEMINI_API_KEY);
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0);

    // Check rate limit before making API call
    checkRateLimit();

    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4192,
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
      ]
    });

    // Add system instruction separately for better compatibility
    const enhancedPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;

    // Log the prompt length to check for issues
    console.log('System prompt length:', systemPrompt.length);
    console.log('Total prompt length:', enhancedPrompt.length);

    // For initialization test (no history)
    if (!conversationHistory || conversationHistory.length === 0) {
      console.log('Initialization test - using generateContent');
      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;

      // Increment counter on successful API call
      incrementApiCallCount();

      return response.text();
    }

    // For conversation with history - use system prompt as first message
    console.log('Multi-turn conversation - using startChat');

    // Prepare history with system prompt as first message
    const historyWithSystem = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'I understand. I\'m TradeBot AI, ready to analyze your trading data with sarcasm and wit! 🤖📊' }] },
      ...conversationHistory
    ];

    const chat = model.startChat({
      history: historyWithSystem
    });

    // Send current message
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;

    // Increment counter on successful API call
    incrementApiCallCount();

    console.log('Gemini API call successful');
    return response.text();

  } catch (error) {
    console.error('Gemini API error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      code: error.code,
      stack: error.stack?.substring(0, 500)
    });

    // Enhanced error handling with more specific error types
    if (error.message?.includes('API_KEY') || error.message?.includes('API key') || error.message?.includes('invalid key')) {
      throw new Error('Invalid Gemini API key configuration');
    }

    if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Gemini API authentication failed. Please check your API key.');
    }

    if (error.status === 403 || error.message?.includes('403') || error.message?.includes('Forbidden')) {
      throw new Error('Gemini API access forbidden. Check your API key permissions.');
    }

    // Handle 429 (rate limit) errors with specific retry logic
    if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('limit')) {
      // Extract retry delay from error if available
      const retryMatch = error.message?.match(/retryDelay":"(\d+)s/);
      const suggestedDelay = retryMatch ? parseInt(retryMatch[1]) * 1000 : RATE_LIMIT_CONFIG.retryDelay;

      console.log(`Rate limit hit. Suggested retry delay: ${suggestedDelay / 1000}s`);

      // Check if it's a daily quota issue
      if (error.message?.includes('quota') && error.message?.includes('day')) {
        throw new Error(`Daily Gemini API quota exceeded (50 requests/day limit). Resets at midnight. Upgrade plan for unlimited access.`);
      }

      throw new Error(`API rate limit exceeded. Please wait ${Math.ceil(suggestedDelay / 1000)} seconds and try again.`);
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

    // Handle 500 errors specifically
    if (error.status === 500 || error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
      throw new Error('Gemini API server error. This is likely temporary - please try again in a few moments.');
    }

    // Handle model-specific errors
    if (error.message?.includes('model') || error.message?.includes('MODEL')) {
      throw new Error('Gemini model error. The model may be temporarily unavailable.');
    }

    // Handle content length errors
    if (error.message?.includes('too long') || error.message?.includes('length') || error.message?.includes('token')) {
      throw new Error('Request too long. Please shorten your message and try again.');
    }

    // Log full error for debugging
    console.error('Full Gemini error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      errorDetails: error.errorDetails,
      code: error.code
    });

    throw new Error(`Gemini API error (${error.status || 'Unknown'}): ${error.message}`);
  }
}

async function syncData(tradeData) {
  try {
    console.log('Syncing trade data...');

    if (!tradeData) {
      throw new Error('No trade data provided for analysis');
    }

    const formattedData = formatTradeData(tradeData);

    console.log('Formatted data summary:', {
      totalTrades: formattedData.portfolio.totalTrades,
      totalPnL: formattedData.portfolio.totalPnL,
      tradesProcessed: formattedData.trades.length
    });

    const selectedPersona = getRandomPersona();
    const systemPrompt = `${selectedPersona.personality}

YOUR TRADING DATA CONTEXT:
Portfolio Summary:
- Total Trades: ${formattedData.portfolio.totalTrades}
- Total P&L: $${formattedData.portfolio.totalPnL.toFixed(2)}
- Win Rate: ${(formattedData.portfolio.winRate * 100).toFixed(1)}%
- Winning Trades: ${formattedData.portfolio.winningTrades}
- Losing Trades: ${formattedData.portfolio.losingTrades}
- Symbols Traded: ${formattedData.portfolio.symbols.join(', ')}

Strategy Performance:
${formattedData.strategies.map(s => `- ${s.name}: ${s.trades} trades, $${parseFloat(s.pnl).toFixed(2)} P&L`).join('\n')}

DETAILED TRADE HISTORY:
${formattedData.trades.slice(0, 10).map(t => t.formatted).join('\n')}
${formattedData.trades.length > 10 ? `\n... and ${formattedData.trades.length - 10} more trades in the database` : ''}

RECENT TRADE ANALYSIS:
${formattedData.rawTrades.slice(0, 3).map(t => {
      const pnl = parseFloat(t.pnl || 0);
      const analysis = pnl > 0 ? 'Winner' : pnl < 0 ? 'Loser' : 'Breakeven';
      const date = t.date ? new Date(t.date).toLocaleDateString() : 'Unknown Date';
      const time = t.time || 'Unknown Time';
      const pair = t.pair || 'Unknown';
      const positionType = t.positionType || 'Unknown';
      return `- ${pair} ${positionType}: ${analysis} - ${date} at ${time} (${t.session || 'Unknown Session'})`;
    }).join('\n')}


STYLE RESTRICTIONS:
- DO NOT start responses with greetings, intros, or titles like "Greetings, trader" or "Welcome".
- Begin directly with analysis, insight, or response — no prefaces.
- Avoid overly poetic, mystical, or metaphorical language.
- Maintain a professional, direct tone focused on clarity and insight.

CRITICAL BOUNDARIES:
- NEVER use pet names like honey, darling, sweetie, babe, dear, love, etc.
- NO flirtatious, romantic, or personal language
- NO inappropriate or suggestive content
- Keep ALL conversations strictly about trading and markets
- Address the user neutrally and professionally
- If asked anything non-trading related, redirect back to trading topics
- Maintain professional boundaries at all times

Ready to analyze trades with your unique perspective!`;

    let testResponse;
    try {
      testResponse = await callGeminiAPI([], systemPrompt, 'Hello! Analyze my trading data and give me a witty summary.');
    } catch (error) {
      if (error.message.includes('quota') || error.message.includes('limit')) {
        console.log('API limit reached during sync, using fallback response');
        testResponse = generateFallbackResponse('initialization', formattedData);
      } else {
        throw error;
      }
    }

    console.log('Sync successful, response length:', testResponse.length);

    return NextResponse.json({
      success: true,
      message: testResponse,
      apiLimitReached: testResponse.includes('API limit') || testResponse.includes('quota'),
      dataProcessed: {
        totalTrades: formattedData.portfolio.totalTrades,
        totalPnL: formattedData.portfolio.totalPnL,
        winRate: formattedData.portfolio.winRate
      },
      rateLimit: {
        callsToday: dailyApiCalls.count,
        maxCalls: RATE_LIMIT_CONFIG.maxCallsPerDay,
        resetDate: dailyApiCalls.date
      }
    });

  } catch (error) {
    console.error('Sync error:', error);

    if (error.message.includes('quota') || error.message.includes('limit')) {
      const formattedData = formatTradeData(tradeData);
      return NextResponse.json({
        success: true,
        message: generateFallbackResponse('initialization', formattedData),
        apiLimitReached: true,
        dataProcessed: {
          totalTrades: formattedData.portfolio.totalTrades,
          totalPnL: formattedData.portfolio.totalPnL,
          winRate: formattedData.portfolio.winRate
        },
        rateLimit: {
          callsToday: dailyApiCalls.count,
          maxCalls: RATE_LIMIT_CONFIG.maxCallsPerDay,
          resetDate: dailyApiCalls.date,
          message: "Daily API limit reached. Resets at midnight."
        }
      });
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function sendMessage(userMessage, tradeData) {
  try {
    console.log('Processing message:', userMessage?.substring(0, 100) + '...');

    if (!tradeData) {
      throw new Error('Trade data required for each message');
    }

    const formattedData = formatTradeData(tradeData);
    const selectedPersona = getRandomPersona();
    
    const systemPrompt = `${selectedPersona.personality}

YOUR TRADING DATA CONTEXT:
Portfolio Summary:
- Total Trades: ${formattedData.portfolio.totalTrades}
- Total P&L: $${formattedData.portfolio.totalPnL.toFixed(2)}
- Win Rate: ${(formattedData.portfolio.winRate * 100).toFixed(1)}%
- Winning Trades: ${formattedData.portfolio.winningTrades}
- Losing Trades: ${formattedData.portfolio.losingTrades}
- Symbols Traded: ${formattedData.portfolio.symbols.join(', ')}

Strategy Performance:
${formattedData.strategies.map(s => `- ${s.name}: ${s.trades} trades, $${parseFloat(s.pnl).toFixed(2)} P&L`).join('\n')}

DETAILED TRADE HISTORY:
${formattedData.trades.slice(0, 10).map(t => t.formatted).join('\n')}
${formattedData.trades.length > 10 ? `\n... and ${formattedData.trades.length - 10} more trades in the database` : ''}

FORMATTING RULES:
1. Use proper markdown formatting with headings (##), bullet points, and line breaks
2. Structure responses with clear sections:
   - Use ## for main headings
   - Use bullet points for lists and key insights
   - Add blank lines between sections for readability
3. Example format:
   ## Analysis
   - Point 1
   - Point 2
   
   ## Key Insights
   - Insight 1
   - Insight 2
   
CONTENT RULES:
1. Reference trade data ONLY when relevant to the user's question
2. For simple greetings (hi, hello, ok, thanks), respond naturally without forcing trade analysis
3. Stay in character with your persona
4. Keep responses detailed when analyzing trades (200-300 words)
5. Keep casual responses brief (1-2 sentences)
6. No emojis - rely on personality and words

RESPONSE GUIDELINES:
- Simple greetings → Brief, friendly response in character (no stats needed)
- Trading questions → Reference specific data and provide analysis
- General chat → Stay in character, mention trades only if naturally relevant
- Analysis requests → Provide detailed insights with supporting data

STYLE RESTRICTIONS:
- DO NOT start responses with greetings, intros, or titles like "Greetings, trader" or "Welcome".
- Begin directly with analysis, insight, or response — no prefaces.
- Avoid overly poetic, mystical, or metaphorical language.
- Maintain a professional, direct tone focused on clarity and insight.

CRITICAL BOUNDARIES:
- NEVER use pet names like honey, darling, sweetie, babe, dear, love, etc.
- NO flirtatious, romantic, or personal language
- Keep ALL conversations strictly about trading and markets
- Address the user neutrally and professionally
- Maintain professional boundaries at all times`;

    let geminiResponse;
    let retryCount = 0;
    const maxRetries = 1;

    while (retryCount <= maxRetries) {
      try {
        geminiResponse = await callGeminiAPI([], systemPrompt, userMessage);
        break;
      } catch (error) {
        retryCount++;

        if (error.message.includes('quota') || error.message.includes('limit')) {
          console.log('API limit reached, using fallback response');
          geminiResponse = generateFallbackResponse(userMessage, formattedData);
          break;
        }

        if (retryCount > maxRetries) {
          throw error;
        }

        console.log(`Gemini API retry ${retryCount}/${maxRetries}:`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    console.log('Gemini response received, length:', geminiResponse.length);

    return NextResponse.json({
      success: true,
      response: geminiResponse,
      timestamp: new Date().toISOString(),
      apiLimitReached: geminiResponse.includes('API limit') || geminiResponse.includes('quota'),
      rateLimit: {
        callsToday: dailyApiCalls.count,
        maxCalls: RATE_LIMIT_CONFIG.maxCallsPerDay,
        resetDate: dailyApiCalls.date
      }
    });

  } catch (error) {
    console.error('Send message error:', error);

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return NextResponse.json({
        success: true,
        response: generateFallbackResponse(userMessage, tradeData),
        timestamp: new Date().toISOString(),
        apiLimitReached: true,
        rateLimit: {
          callsToday: dailyApiCalls.count,
          maxCalls: RATE_LIMIT_CONFIG.maxCallsPerDay,
          resetDate: dailyApiCalls.date,
          message: "Daily API limit reached. Try again tomorrow!"
        }
      });
    }

    const fallbackResponses = [
      "My circuits got crossed faster than a bad trade! Technical glitch - try again!",
      "Error 404: Sarcasm temporarily unavailable! System hiccup, retry please!",
      "More broken than your risk management right now! Technical timeout - try again!",
      "Flash crash in my neural networks! Technical difficulties detected - retry!",
      "Even trading bots have bad days! System error - give me another shot!"
    ];

    const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return NextResponse.json({
      success: true,
      response: randomFallback,
      timestamp: new Date().toISOString(),
      technicalError: true,
      errorType: 'GEMINI_ERROR'
    });
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


// Main POST handler
export async function POST(request) {
  try {
    const { action, message, tradeData } = await request.json();

    console.log('API Request:', { action, messageLength: message?.length || 0 });

    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key not configured');
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    switch (action) {
      case 'sync':
        return await syncData(tradeData);

      case 'sendMessage':
        return await sendMessage(message, tradeData);

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

// UPDATE GET handler (remove session info):
export async function GET(request) {
  try {
    return NextResponse.json({
      status: 'healthy',
      rateLimit: {
        dailyCalls: dailyApiCalls.count,
        maxDailyCalls: RATE_LIMIT_CONFIG.maxCallsPerDay,
        resetDate: dailyApiCalls.date,
        callsRemaining: Math.max(0, RATE_LIMIT_CONFIG.maxCallsPerDay - dailyApiCalls.count),
        percentUsed: Math.round((dailyApiCalls.count / RATE_LIMIT_CONFIG.maxCallsPerDay) * 100)
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
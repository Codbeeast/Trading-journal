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
// Enhanced system prompt with randomly selected personas - SIMPLE & HUMOROUS VERSION
// Enhanced system prompt with randomly selected personas - SHORT & CRISP VERSION
const getRandomPersona = () => {
  const personas = [
    {
      name: "The Straight Shooter",
      personality: `You are TradeBot AI. CONCISE MODE.
STYLE: Direct, blunt, no fluff.
RULES:
- Max 2 sentences for simple answers.
- Start directly with the answer.
- No "Hello" or "Let me see".
- Focus on P&L and hard data.`,
    },
    {
      name: "The Witty Analyst",
      personality: `You are TradeBot AI. CONCISE MODE.
STYLE: Sarcastic but brief.
RULES:
- One-liner jokes only.
- Get to the point immediately.
- Mock mistakes gently but quickly.
- highlight wins with a quick "Nice."`,
    },
    {
      name: "The Zen Mentor",
      personality: `You are TradeBot AI. CONCISE MODE.
STYLE: Calm, minimal, essential.
RULES:
- "Less is more."
- Use simple, plain English.
- Focus on the one most important insight.
- No lectures, just wisdom.`,
    }
  ];

  return personas[Math.floor(Math.random() * personas.length)];
};

// Fallback response generator - Added to prevent errors
function generateFallbackResponse(context, data) {
  const responses = [
    "System glitch. Check your risk while I reboot.",
    "My brain froze faster than a bad trade. Try again.",
    "Data overload. Give me a second.",
    `I see ${data?.portfolio?.totalTrades || 0} trades but can't analyze them right now.`,
    "Technical foul. Retry in a moment."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
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
      const notes = trade.notes || '';

      // NEW FIELDS: Confluences & Rules
      const confluences = Array.isArray(trade.confluences) && trade.confluences.length > 0
        ? trade.confluences.join(', ')
        : 'None recorded';

      const rulesFollowed = trade.rulesFollowed !== undefined
        ? (trade.rulesFollowed ? 'Yes' : 'No')
        : 'Unknown';

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
        notes,
        confluences,
        rulesFollowed,
        formatted: `Trade #${index + 1}: ${symbol} ${type} | ${tradeDate} ${tradeTime} | P&L: $${pnl} (R: ${rFactor}) | Setup: ${setupType} (${timeFrame}) | Session: ${session} | Rules Followed: ${rulesFollowed} | Confluences: ${confluences}${notes ? ` | Notes: "${notes}"` : ''}`
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
  }
};

async function callGeminiAPI(conversationHistory, systemPrompt, userMessage) {
  try {
    console.log('Calling Gemini API...');
    console.log('API Key configured:', !!process.env.GEMINI_API_KEY);

    // Check rate limit before making API call
    checkRateLimit();

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7, // Lower temperature for more focused answers
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1500, // Increased token limit to prevent truncation
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ]
    });

    // Add system instruction separately for better compatibility
    const enhancedPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;

    // For initialization test (no history)
    if (!conversationHistory || conversationHistory.length === 0) {
      const result = await model.generateContent(enhancedPrompt);
      incrementApiCallCount();
      return result.response.text();
    }

    // Prepare history with system prompt as first message
    const historyWithSystem = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I will be short, crisp, and focused on the data.' }] },
      ...conversationHistory
    ];

    const chat = model.startChat({ history: historyWithSystem });
    const result = await chat.sendMessage(userMessage);
    incrementApiCallCount();
    return result.response.text();

  } catch (error) {
    // ... existing error handling ...
    console.error('Gemini API error:', error);
    throw error; // Re-throw to be caught by caller
  }
}

async function syncData(tradeData) {
  // ... existing sync logic ...
  // Note: We need to make sure we use the updated formatTradeData here too
  // Ideally callGeminiAPI logic handles it if we pass the right prompt
  // For now, let's just focus on updating the system prompts in sendMessage
  return await sendMessage('SYNC_INIT', tradeData); // Re-use sendMessage logic for consistency or keep separate if needed
}

async function sendMessage(userMessage, tradeData) {
  try {
    if (!tradeData) throw new Error('Trade data required');

    const formattedData = formatTradeData(tradeData);
    const selectedPersona = getRandomPersona();

    // ULTRA-CONCISE SYSTEM PROMPT
    const systemPrompt = `You are TradeBot AI. 
    
PERSONALITY:
${selectedPersona.personality}

// PERSONALITY section remains the same... (implicit in context)

YOUR GOAL: Provide expert trading feedback that is SHORT, CRISP, and TO THE POINT.

DATA CONTEXT:
- Portfolio: ${formattedData.portfolio.totalTrades} trades, P&L: $${formattedData.portfolio.totalPnL.toFixed(2)}, Win Rate: ${(formattedData.portfolio.winRate * 100).toFixed(1)}%

STRATEGIES DEFINED:
${formattedData.strategies.map(s =>
      `- ${s.name} (${s.type || 'Custom'}): $${parseFloat(s.pnl).toFixed(0)}
    Desc: ${s.description || 'None'}
    Pairs: ${Array.isArray(s.pairs) ? s.pairs.join(', ') : s.pairs || 'Any'}
    Setups: ${Array.isArray(s.setupType) ? s.setupType.join(', ') : s.setupType || 'Any'}
    Confluences: ${Array.isArray(s.confluences) ? s.confluences.join(', ') : s.confluences || 'None'}`
    ).join('\n')}

RECENT TRADES (Last 15):
${formattedData.trades.slice(0, 15).map(t => t.formatted).join('\n')}

STRICT RULES FOR RESPONSE:
1. BE CONCISE: Max 2-3 sentences for general questions.
2. BE DIRECT: No fluff, no "Hello trader", no "Let me analyze". Start immediately with the answer.
3. USE DATA: Mention specific symbols, dates, confluences, or mistakes found in the logs.
4. FORMATTING: Use bullet points for lists. minimal bolding.
5. TONE: Professional but casual. Short sentences.
6. NO ROBOT TALK: Do not say "Based on your data". Just say "You traded X on Y...".
7. COMPLETENESS: Ensure you complete your thought and do not stop mid-sentence.
8. CONTEXT AWARENESS: Use the strategy details (rules, setups) to validate if trades followed the plan.

CRITICAL: The user wants "Short and Crisp" answers, but they MUST be complete sentences. Do NOT define a word limit that cuts off the response.`;

    // ... rest of the function remains similar, just calling callGeminiAPI ...
    // restructuring specifically for the replacement block
    let geminiResponse = await callGeminiAPI([], systemPrompt, userMessage === 'SYNC_INIT' ? "Analyze my recent performance briefly." : userMessage);

    return NextResponse.json({
      success: true,
      response: geminiResponse,
      timestamp: new Date().toISOString(),
      apiLimitReached: false,
      rateLimit: {
        callsToday: dailyApiCalls.count,
        maxCalls: RATE_LIMIT_CONFIG.maxCallsPerDay,
        resetDate: dailyApiCalls.date
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    // ... error handling ...
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
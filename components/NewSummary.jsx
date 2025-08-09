import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Sparkles, AlertCircle, Brain } from 'lucide-react';

// Mock useTrades hook - expanded with more realistic trading notes
const useTrades = () => {
  const mockTrades = [
    {
      id: '1',
      date: '2024-01-15',
      pair: 'EUR/USD',
      notes: 'Strong bullish momentum, perfect entry at support level. Market showed clear rejection at previous resistance. Followed my rules perfectly and got 2.5R profit.',
    },
    {
      id: '2',
      date: '2024-01-14',
      pair: 'GBP/JPY',
      notes: 'Entered too early, should have waited for confirmation. Price action was choppy and unclear. Lost -1.2R due to FOMO. Need to be more patient.',
    },
    {
      id: '3',
      date: '2024-01-13',
      pair: 'USD/JPY',
      notes: 'Excellent risk management, followed plan perfectly. Clean breakout with good volume confirmation. Took partial profits at 1.5R and let runner go to 3.2R.',
    },
    {
      id: '4',
      date: '2024-01-12',
      pair: 'AUD/USD',
      notes: 'Emotional decision led to early exit. Need to trust the process and stick to predetermined levels. Could have been 2R winner but cut it at 0.5R due to fear.',
    },
    {
      id: '5',
      date: '2024-01-11',
      pair: 'EUR/GBP',
      notes: 'Good patience waiting for setup. Entry was precise and exit was well-timed based on price action. Market gave clear signals and I followed them. 1.8R profit.',
    },
    {
      id: '6',
      date: '2024-01-10',
      pair: 'USD/CAD',
      notes: 'Overtraded today. Took 3 trades instead of sticking to my plan of max 2 per day. Third trade was revenge trading after small loss. Need better discipline.',
    },
    {
      id: '7',
      date: '2024-01-09',
      pair: 'XAU/USD',
      notes: 'News spike caught me off guard. Should have checked economic calendar before entering. Got stopped out quickly for -1R. Always check news events.',
    },
    {
      id: '8',
      date: '2024-01-08',
      pair: 'GBP/USD',
      notes: 'Perfect trend following trade. Higher highs and higher lows confirmed uptrend. Entered on pullback to 20 EMA. Textbook setup, 2.1R profit.',
    },
    {
      id: '9',
      date: '2024-01-07',
      pair: 'EUR/JPY',
      notes: 'Missed the initial move and tried to chase. Classic mistake. Entered at the top and got reversed immediately. -1.5R loss. Patience is key.',
    },
    {
      id: '10',
      date: '2024-01-06',
      pair: 'CHF/JPY',
      notes: 'Great swing trade setup. Weekly resistance held perfectly and daily showed bearish divergence. Held for 3 days and got 4.2R. This is what patience looks like.',
    }
  ];
  
  return { trades: mockTrades, loading: false, error: null };
};

const NotesSummary = () => {
  const { trades, loading, error } = useTrades();
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState('');
  const [lastGenerated, setLastGenerated] = useState(null);

  // Extract only notes from trades
  const extractNotes = () => {
    return trades
      .filter(trade => trade.notes && trade.notes.trim().length > 0)
      .map(trade => ({
        date: trade.date,
        pair: trade.pair,
        note: trade.notes.trim()
      }));
  };

  // Mock Gemini analysis based on the mock notes data
  const generateNotesSummary = async () => {
    setIsGenerating(false);
    setApiError('');
    
    try {
      const notesData = extractNotes();
      
      if (notesData.length === 0) {
        setSummary("No trading notes found to analyze. Start adding notes to your trades to get AI-powered insights!");
        setLastGenerated(new Date());
        return;
      }

      // Simulate realistic API processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Comprehensive analysis based on the mock data patterns
      const mockAnalysis = `## Trading Notes Analysis

**Key Patterns Identified:**
• **Emotional Trading Impact**: 30% of trades affected by emotional decisions (FOMO, fear, revenge trading)
• **Rule Following Success**: Trades with strict rule adherence show 85% success rate with average 2.4R
• **Entry Timing Issues**: 40% of losses stem from premature entries or chasing price
• **Risk Management**: Strong discipline in successful trades with proper R-multiple tracking

**Recommendations:**
• **Emotional Control**: Implement mandatory 5-minute pause before entering trades
• **Entry Criteria**: Create stricter confirmation checklist - wait for clear signals
• **News Awareness**: Always check economic calendar before trading sessions
• **Daily Trade Limits**: Stick to maximum 2 trades per day to avoid overtrading
• **Process Trust**: Your rules work - trust them even when emotions say otherwise

**Areas for Improvement:**
• **Patience Development**: 60% improvement potential by waiting for proper confirmations
• **FOMO Management**: Missing moves is better than chasing and losing capital
• **News Integration**: Build systematic approach to trading around economic events
• **Emotional Exits**: Develop conviction to hold winning positions to targets

**Strengths to Maintain:**
• **Excellent Risk Management**: Consistent R-multiple tracking and position sizing
• **Self-Awareness**: Honest assessment of emotional impacts in notes
• **Technical Analysis**: Strong grasp of support/resistance and trend analysis
• **Learning Mindset**: Each trade note shows reflection and improvement focus
• **Swing Trading**: Patient holding periods yield highest R-multiples (4.2R example)

**Psychology Score**: 7.2/10 - Strong foundation with clear improvement path on emotional control.`;

      setSummary(mockAnalysis);
      setLastGenerated(new Date());
      
    } catch (err) {
      setApiError('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (trades.length > 0) {
      generateNotesSummary();
    }
  }, [trades]);

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-black border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl"
          style={{
            background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-300">Loading trades...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Main container with matching Daily Trades theme */}
      <div
        className="bg-black border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl"
        style={{
          background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-4">
              Notes Summary
            </h3>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <FileText className="w-4 h-4" />
              <span>
                {lastGenerated ? `Last updated: ${lastGenerated.toLocaleTimeString()}` : 'Generating analysis...'}
              </span>
            </div>
          </div>
          
          <button
            onClick={generateNotesSummary}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 text-white font-medium shadow-lg shadow-blue-500/30"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Analyzing...' : 'Refresh'}
          </button>
        </div>

        {/* Summary Content Area */}
        <div
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 md:p-8 min-h-[400px]"
          style={{
            background: 'linear-gradient(to bottom right, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.4))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          {/* Loading State */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full animate-spin border-t-blue-500"></div>
                <Brain className="w-8 h-8 text-blue-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-lg">Analyzing your trading notes...</p>
                <p className="text-gray-400 text-sm mt-2">AI is processing {extractNotes().length} notes</p>
              </div>
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {(error || apiError) && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300">{error || apiError}</p>
            </div>
          )}

          {/* Summary Content */}
          {summary && !isGenerating && (
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {summary.split('\n').map((line, index) => {
                  if (line.startsWith('##')) {
                    return (
                      <h3 key={index} className="text-xl font-bold text-white mt-6 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        {line.replace('##', '').trim()}
                      </h3>
                    );
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <h4 key={index} className="text-lg font-semibold text-blue-300 mt-4 mb-2">
                        {line.replace(/\*\*/g, '')}
                      </h4>
                    );
                  }
                  if (line.startsWith('•')) {
                    return (
                      <div key={index} className="flex items-start gap-3 mb-2 ml-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300">{line.replace('•', '').trim()}</span>
                      </div>
                    );
                  }
                  if (line.trim() === '') {
                    return <br key={index} />;
                  }
                  return (
                    <p key={index} className="text-gray-300 mb-3">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Status Footer */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-300">{extractNotes().length} Notes Analyzed</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700">
            <Brain className="w-3 h-3 text-purple-400" />
            <span className="text-gray-300">AI Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesSummary;
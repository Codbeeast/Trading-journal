import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Sparkles, AlertCircle, Brain } from 'lucide-react';
import { useTrades } from '../context/TradeContext'; // Your real context

const NotesSummary = () => {
  const { trades, loading, error } = useTrades(); // Using your real context
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
        positionType: trade.positionType,
        pnl: trade.pnl,
        setupType: trade.setupType,
        rulesFollowed: trade.rulesFollowed,
        note: trade.notes.trim()
      }));
  };

  // Test Gemini API connection
  const testGeminiConnection = async () => {
    setApiError('');
    try {
      const response = await fetch('/api/test-gemini');
      const data = await response.json();
      
      if (data.success) {
        setApiError('✅ Gemini API is working correctly!');
      } else {
        setApiError(`❌ API Test Failed: ${data.error} ${data.solution ? '- ' + data.solution : ''}`);
      }
    } catch (err) {
      setApiError(`❌ Connection Test Failed: ${err.message}`);
    }
  };

  // Generate notes summary using Gemini API
  const generateNotesSummary = async () => {
    setIsGenerating(true);
    setApiError('');
    
    try {
      const notesData = extractNotes();
      
      if (notesData.length === 0) {
        setSummary("No trading notes found to analyze. Start adding notes to your trades to get AI-powered insights!");
        setLastGenerated(new Date());
        setIsGenerating(false);
        return;
      }

      console.log('Generating summary for', notesData.length, 'notes');

      // Prepare the prompt for Gemini
      const prompt = `
You are an expert trading psychology analyst and performance coach. Analyze the following trading notes and provide brief, actionable insights.

Trading Notes Data:
${notesData.map(trade => `
Date: ${trade.date}
Pair: ${trade.pair}
Position: ${trade.positionType || 'N/A'}
P&L: ${trade.pnl || 'N/A'}
Setup: ${trade.setupType || 'N/A'}
Rules Followed: ${trade.rulesFollowed || 'N/A'}
Notes: ${trade.note}
---`).join('\n')}

Please provide a concise analysis in the following format (keep each section brief with 2-3 bullet points maximum):

## Trading Notes Analysis

**Key Patterns Identified:**
• [Brief observation about recurring patterns]
• [Brief observation about success/failure patterns]

**Recommendations:**
• [One specific actionable recommendation]
• [Another specific actionable recommendation]

**Areas for Improvement:**
• [One key weakness to address]
• [Another key weakness to address]

**Strengths to Maintain:**
• [One main strength]
• [Another main strength]

Keep each bullet point concise (1-2 sentences max). Focus on the most important insights only.
      `;

      console.log('Sending request to API...');

      // Call Gemini API
      const response = await fetch('/api/analyze-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          notesCount: notesData.length
        })
      });

      console.log('API Response status:', response.status);

      const data = await response.json();
      
      console.log('API Response data:', { hasAnalysis: !!data.analysis, error: data.error });
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.analysis) {
        throw new Error('No analysis received from API');
      }

      setSummary(data.analysis);
      setLastGenerated(new Date());
      
    } catch (err) {
      console.error('Error generating summary:', err);
      setApiError(`Failed to generate summary: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on component mount and when trades change
  useEffect(() => {
    if (trades && trades.length > 0 && extractNotes().length > 0) {
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
              Notes Summary Analysis
            </h3>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <FileText className="w-4 h-4" />
              <span>
                {lastGenerated ? `Last updated: ${lastGenerated.toLocaleTimeString()}` : 'Click refresh to analyze'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={generateNotesSummary}
              disabled={isGenerating || extractNotes().length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 text-white font-medium shadow-lg shadow-blue-500/30"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Analyzing...' : 'Analyze Notes'}
            </button>
          </div>
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
          {/* No Notes State */}
          {extractNotes().length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <FileText className="w-16 h-16 text-gray-600" />
              <div className="text-center">
                <h4 className="text-xl font-semibold text-white mb-2">No Notes to Analyze</h4>
                <p className="text-gray-400">Start adding notes to your trades to get AI-powered insights and analysis.</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="space-y-6">
              {/* Header skeleton */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-700 rounded w-48 animate-pulse"></div>
              </div>
              
              {/* Section skeletons */}
              {[1, 2, 3, 4].map((section) => (
                <div key={section} className="space-y-3">
                  {/* Section title */}
                  <div className="h-5 bg-gray-600 rounded w-40 animate-pulse"></div>
                  
                  {/* Bullet points */}
                  <div className="space-y-2 ml-4">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-4/5 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator at bottom */}
              <div className="flex flex-col items-center justify-center pt-8 space-y-4">
                <div className="relative">
                  <div className="w-8 h-8 border-2 border-blue-500/30 rounded-full animate-spin border-t-blue-500"></div>
                  <Brain className="w-4 h-4 text-blue-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">Analyzing {extractNotes().length} notes...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {(error || apiError) && !isGenerating && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium">Analysis Failed</p>
                <p className="text-red-400 text-sm mt-1">{error || apiError}</p>
              </div>
            </div>
          )}

          {/* Summary Content */}
          {summary && !isGenerating && !error && !apiError && (
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {summary.split('\n').map((line, index) => {
                  if (line.startsWith('##')) {
                    return (
                      <h3 key={index} className="text-xl font-bold text-white mt-4 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        {line.replace('##', '').trim()}
                      </h3>
                    );
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <h4 key={index} className="text-lg font-semibold text-blue-300 mt-3 mb-2">
                        {line.replace(/\*\*/g, '')}
                      </h4>
                    );
                  }
                  if (line.startsWith('•')) {
                    return (
                      <div key={index} className="flex items-start gap-3 mb-1.5 ml-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300">{line.replace('•', '').trim()}</span>
                      </div>
                    );
                  }
                  if (line.trim() === '') {
                    return <div key={index} className="h-2" />;
                  }
                  return (
                    <p key={index} className="text-gray-300 mb-2">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Status Footer */}
        {extractNotes().length > 0 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300">{extractNotes().length} Notes Available</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesSummary;
import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Sparkles, AlertCircle, Brain } from 'lucide-react';
import { useTrades } from '../context/TradeContext'; // Your real context

const NotesSummary = () => {
  const { trades, loading, error } = useTrades(); // Using your real context
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState('');
  const [lastGenerated, setLastGenerated] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <div style={{ width: '100%', maxWidth: '1282px', margin: '0 auto', padding: isMobile ? '0 0px' : '0 0px' }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
          border: '1px solid #374151',
          borderRadius: '16px',
          padding: isMobile ? '16px' : '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              border: '2px solid transparent',
              borderTop: '2px solid #3B82F6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ marginLeft: '12px', color: '#D1D5DB', fontSize: isMobile ? '14px' : '16px' }}>Analizing...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1282px', margin: '0 auto', padding: isMobile ? '0 0px' : '0 0px' }}>
      {/* Main container */}
      <div style={{
        background: 'linear-gradient(to bottom right, #000000, #1f2937, #111827)',
        border: '1px solid #374151',
        borderRadius: '16px',
        padding: isMobile ? '16px' : '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}>
        {/* Card Header */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          marginBottom: isMobile ? '24px' : '32px',
          gap: isMobile ? '16px' : '0'
        }}>
          <div style={{ textAlign: isMobile ? 'center' : 'left', flex: 1 }}>
            <h3 style={{
              fontSize: isMobile ? '24px' : '36px',
              fontWeight: 'bold',
              background: 'linear-gradient(to bottom, #ffffff, #9CA3AF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: isMobile ? '8px' : '16px',
              margin: 0
            }}>
              Notes Summary Analysis
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '8px', color: '#9CA3AF', fontSize: isMobile ? '12px' : '14px' }}>
              <FileText style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span style={{ textAlign: isMobile ? 'center' : 'left' }}>
                {lastGenerated ? `Last updated: ${lastGenerated.toLocaleTimeString()}` : 'Click refresh to analyze'}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end' }}>
            <button
              onClick={generateNotesSummary}
              disabled={isGenerating || extractNotes().length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: isMobile ? '8px 12px' : '8px 16px',
                backgroundColor: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '500',
                cursor: isGenerating || extractNotes().length === 0 ? 'not-allowed' : 'pointer',
                opacity: isGenerating || extractNotes().length === 0 ? 0.5 : 1,
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!isGenerating && extractNotes().length > 0) {
                  e.target.style.backgroundColor = '#1D4ED8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating && extractNotes().length > 0) {
                  e.target.style.backgroundColor = '#2563EB';
                }
              }}
            >
              <RefreshCw style={{ 
                width: '16px', 
                height: '16px',
                animation: isGenerating ? 'spin 1s linear infinite' : 'none'
              }} />
              <span style={{ display: isMobile ? 'none' : 'inline' }}>
                {isGenerating ? 'Analyzing...' : 'Analyze Notes'}
              </span>
              <span style={{ display: isMobile ? 'inline' : 'none' }}>
                {isGenerating ? 'Analyzing...' : 'Analyze'}
              </span>
            </button>
          </div>
        </div>

        {/* Summary Content Area */}
        <div style={{
          background: 'linear-gradient(to bottom right, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.4))',
          border: '1px solid #374151',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '32px',
          minHeight: isMobile ? '300px' : '400px',
          backdropFilter: 'blur(10px)'
        }}>
          {/* No Notes State */}
          {extractNotes().length === 0 && !loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '48px 0' : '64px 0',
              gap: '16px'
            }}>
              <FileText style={{ width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', color: '#4B5563' }} />
              <div style={{ textAlign: 'center', padding: '0 16px' }}>
                <h4 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>
                  No Notes to Analyze
                </h4>
                <p style={{ color: '#9CA3AF', fontSize: isMobile ? '14px' : '16px', margin: 0 }}>
                  Start adding notes to your trades to get AI-powered insights and analysis.
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
              {/* Header skeleton */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#374151', borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>
                <div style={{ height: isMobile ? '20px' : '24px', width: isMobile ? '128px' : '192px', backgroundColor: '#374151', borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>
              </div>
              
              {/* Section skeletons */}
              {[1, 2, 3, 4].map((section) => (
                <div key={section} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px' }}>
                  {/* Section title */}
                  <div style={{ height: isMobile ? '16px' : '20px', width: isMobile ? '128px' : '160px', backgroundColor: '#4B5563', borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>
                  
                  {/* Bullet points */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: isMobile ? '8px' : '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? '8px' : '12px' }}>
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#60A5FA', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                      <div style={{ height: isMobile ? '12px' : '16px', width: '100%', backgroundColor: '#374151', borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? '8px' : '12px' }}>
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#60A5FA', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                      <div style={{ height: isMobile ? '12px' : '16px', width: '75%', backgroundColor: '#374151', borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator at bottom */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: isMobile ? '24px' : '32px',
                gap: isMobile ? '12px' : '16px'
              }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: isMobile ? '24px' : '32px',
                    height: isMobile ? '24px' : '32px',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderTop: '2px solid #3B82F6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <Brain style={{
                    width: isMobile ? '12px' : '16px',
                    height: isMobile ? '12px' : '16px',
                    color: '#60A5FA',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: 'pulse 2s infinite'
                  }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'white', fontWeight: '500', fontSize: isMobile ? '14px' : '16px', margin: 0 }}>
                    Analyzing {extractNotes().length} notes...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {(error || apiError) && !isGenerating && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: isMobile ? '8px' : '12px',
              padding: isMobile ? '12px' : '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px'
            }}>
              <AlertCircle style={{ width: isMobile ? '16px' : '20px', height: isMobile ? '16px' : '20px', color: '#FCA5A5', marginTop: '2px', flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ color: '#FECACA', fontWeight: '500', fontSize: isMobile ? '14px' : '16px', margin: '0 0 4px 0' }}>Analysis Failed</p>
                <p style={{ color: '#FCA5A5', fontSize: isMobile ? '12px' : '14px', margin: 0, wordBreak: 'break-words' }}>{error || apiError}</p>
              </div>
            </div>
          )}

          {/* Summary Content */}
          {summary && !isGenerating && !error && !apiError && (
            <div style={{ maxWidth: 'none' }}>
              <div style={{ color: '#D1D5DB', lineHeight: '1.6', whiteSpace: 'pre-line', fontSize: isMobile ? '14px' : '16px' }}>
                {summary.split('\n').map((line, index) => {
                  if (line.startsWith('##')) {
                    return (
                      <h3 key={index} style={{
                        fontSize: isMobile ? '18px' : '20px',
                        fontWeight: 'bold',
                        color: 'white',
                        margin: isMobile ? '12px 0 8px 0' : '16px 0 12px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Sparkles style={{ width: isMobile ? '16px' : '20px', height: isMobile ? '16px' : '20px', color: '#60A5FA', flexShrink: 0 }} />
                        <span style={{ wordBreak: 'break-words' }}>{line.replace('##', '').trim()}</span>
                      </h3>
                    );
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <h4 key={index} style={{
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: '600',
                        color: '#93C5FD',
                        margin: isMobile ? '8px 0 4px 0' : '12px 0 8px 0',
                        wordBreak: 'break-words'
                      }}>
                        {line.replace(/\*\*/g, '')}
                      </h4>
                    );
                  }
                  if (line.startsWith('•')) {
                    return (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: isMobile ? '8px' : '12px',
                        marginBottom: '6px',
                        marginLeft: isMobile ? '8px' : '16px'
                      }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#60A5FA', marginTop: '8px', flexShrink: 0 }}></div>
                        <span style={{ color: '#D1D5DB', wordBreak: 'break-words', minWidth: 0, flex: 1 }}>
                          {line.replace('•', '').trim()}
                        </span>
                      </div>
                    );
                  }
                  if (line.trim() === '') {
                    return <div key={index} style={{ height: isMobile ? '4px' : '8px' }} />;
                  }
                  return (
                    <p key={index} style={{ color: '#D1D5DB', margin: '0 0 8px 0', wordBreak: 'break-words' }}>
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
          <div style={{ marginTop: isMobile ? '16px' : '24px', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              backgroundColor: 'rgba(31, 41, 55, 0.5)',
              borderRadius: '9999px',
              border: '1px solid #374151'
            }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#60A5FA', borderRadius: '50%', flexShrink: 0 }}></div>
              <span style={{ color: '#D1D5DB', fontSize: isMobile ? '12px' : '14px' }}>{extractNotes().length} Notes Available</span>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default NotesSummary;

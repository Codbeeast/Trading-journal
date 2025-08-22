"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Edit3, Calendar, Brain, Trash2 } from 'lucide-react';
import ModelPage from '@/components/ModalPage';
import { ImageViewer } from '@/components/ImageViewer';
import PopNotification from '@/components/PopNotification';
import { useTrades } from '../../context/TradeContext';
import { CiImageOn } from "react-icons/ci";
import { ImageUpload } from '@/components/ImageUpload';

// Import new components
import JournalHeader from '@/components/journal/JournalHeader';
import JournalCards from '@/components/journal/JournalCards';
import ActionButtons from '@/components/journal/ActionButtons';
import JournalTable from '@/components/journal/JournalTable';
import AddTradeButton from '@/components/journal/AddTradeButton';
import NewsImpactModal from '@/components/journal/NewsImpactModal';

// Import utilities
import { initialTrade, getDropdownOptions, getFieldType, isRequiredField, getCurrentSession, getSessionFromTime, columns, getHeaderName, getCellType } from '../../components/journal/journalUtils';


export default function TradeJournal() {
  // Use TradeContext for real data management
  const {
    trades,
    loading,
    error,
    fetchTrades,
    createTrade,
    updateTrade,
    deleteTrade,
    strategies,
    strategiesLoading,
    sessions,
    sessionsLoading,
    getStrategyData
  } = useTrades();

  // Debug logging
  useEffect(() => {
    console.log('TradeJournal component mounted');
    console.log('Loading state:', loading);
    console.log('Error state:', error);
    console.log('Trades:', trades);
    console.log('Strategies:', strategies);
    console.log('Sessions:', sessions);
  }, [loading, error, trades, strategies, sessions]);
  
  const [lastSync, setLastSync] = useState(new Date());
  
  const saveTrades = async (tradesToSave, isNew) => {
    try {
      if (isNew) {
        // Create new trades - only save trades that don't already exist in backend
        const newTradesToSave = tradesToSave.filter(trade => 
          !trade._id && !trade.id || 
          (trade.id && trade.id.toString().startsWith('temp_'))
        );
        
        for (const trade of newTradesToSave) {
          // Remove temporary ID before saving
          const cleanTrade = { ...trade };
          if (cleanTrade.id && cleanTrade.id.toString().startsWith('temp_')) {
            delete cleanTrade.id;
          }
          await createTrade(cleanTrade);
        }
      } else {
        // Update existing trades - only update trades that have real backend IDs
        const existingTradesToUpdate = tradesToSave.filter(trade => 
          (trade._id && !trade._id.toString().startsWith('temp_')) ||
          (trade.id && !trade.id.toString().startsWith('temp_'))
        );
        
        for (const trade of existingTradesToUpdate) {
          const tradeId = trade._id || trade.id;
          await updateTrade(tradeId, trade);
        }
      }
      return Promise.resolve();
    } catch (err) {
      console.error('Error saving trades:', err);
      throw err;
    }
  };
  
  const refreshData = () => {
    console.log('🔄 Manual refresh triggered');
    fetchTrades();
    // Also refresh strategies and sessions to ensure consistency
    if (typeof fetchStrategies === 'function') fetchStrategies();
    if (typeof fetchSessions === 'function') fetchSessions();
  };

  
  const [rows, setRows] = useState([]);
  
  // Update rows when trades data changes from backend - more robust handling
  useEffect(() => {
    console.log('📊 Trades data updated:', trades?.length || 0, 'trades');
    
    if (trades && Array.isArray(trades)) {
      if (trades.length > 0) {
        const formattedTrades = trades.map(trade => ({
          ...trade,
          id: trade._id, // Ensure we have an id field for UI compatibility
          // Keep strategy as ObjectId for proper saving
          strategy: trade.strategy?._id || trade.strategy || '',
          strategyName: trade.strategy?.strategyName || '',
          sessionName: trade.session || ''
        }));
        console.log('✅ Formatted trades for UI:', formattedTrades.length);
        setRows(formattedTrades);
      } else {
        console.log('📝 No trades found, showing empty state');
        setRows([]);
      }
    } else if (!loading) {
      // Only set empty if not loading to avoid flickering
      console.log('⚠️ Invalid trades data, keeping current state');
    }
  }, [trades, loading]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRows, setEditingRows] = useState(new Set());
  const [showModelPage, setShowModelPage] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: '', title: '' });
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [timeFilter, setTimeFilter] = useState({ type: 'current', year: null, month: null });
  const [showNewsImpactModal, setShowNewsImpactModal] = useState(false);
  const [newsImpactData, setNewsImpactData] = useState({ tradeIndex: null, impactType: '', currentDetails: '' });

  // Notification state
  const [pop, setPop] = useState({ show: false, type: 'info', message: '' });

  // Enhanced error handling
  const handleAxiosError = (error, contextMessage) => {
    console.error(`${contextMessage}:`, error);
    
    if (error.response) {
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     `Server error (${error.response.status})`;
      setPop({ show: true, type: 'error', message: `${contextMessage}: ${message}` });
    } else if (error.request) {
      setPop({ show: true, type: 'error', message: `${contextMessage}: No response from server. Please check your connection.` });
    } else {
      setPop({ show: true, type: 'error', message: `${contextMessage}: ${error.message}` });
    }
  };

  const openModelPage = (tradeId) => {
    const trade = rows.find(row => row.id === tradeId);
    if (trade) {
      setSelectedTrade(trade);
      setShowModelPage(true);
    }
  };

  const openImageViewer = (imageUrl, fileName) => {
    if (imageUrl) {
      setSelectedImage({
        url: imageUrl,
        title: fileName || 'Uploaded Image'
      });
      setShowImageViewer(true);
    }
  };

  const handleModelSave = async (ratings) => {
    try {
      const updatedTrade = { ...selectedTrade, ...ratings };

      // Update the trade in the database
      if (updatedTrade.id && !updatedTrade.id.toString().startsWith('temp_')) {
        await saveTrades([updatedTrade], false);
      }

      // Update the local state
      setRows(prevRows =>
        prevRows.map(row =>
          row.id === updatedTrade.id ? updatedTrade : row
        )
      );

      setSelectedTrade(updatedTrade);
      setLastSaved(new Date());
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 3000);

    } catch (error) {
      console.error('Error saving model ratings:', error);
      handleAxiosError(error, 'Failed to save psychology ratings');
      throw error;
    }
  };

  // Remove duplicate useEffect - already handled above

  // Enhanced save function using the custom hook
  const handleSave = async () => {
    setSaving(true);
    setPop({ show: false, type: 'info', message: '' });

    try {
      // Skip validation for testing - allow saving with any fields
      const validationErrors = [];
      
      // Only basic business logic validation (no required fields)
      rows.forEach((trade, index) => {
        if (trade.entry && trade.exit && Number(trade.entry) === Number(trade.exit)) {
          validationErrors.push(`Trade ${index + 1}: Entry and exit prices cannot be the same`);
        }
        if (trade.risk && Number(trade.risk) < 0) {
          validationErrors.push(`Trade ${index + 1}: Risk cannot be negative`);
        }
        if (trade.rFactor && Number(trade.rFactor) < 0) {
          validationErrors.push(`Trade ${index + 1}: R Factor cannot be negative`);
        }
      });

      if (validationErrors.length > 0) {
        setPop({ show: true, type: 'error', message: `Validation errors: ${validationErrors.join(', ')}` });
        return;
      }

      // Separate new trades from existing ones
      const newTrades = rows.filter(trade =>
        !trade.id || trade.id.toString().startsWith('temp_')
      ).filter(trade => {
        // Save trades that have ANY field filled (not requiring all fields)
        return Object.keys(trade).some(key => 
          key !== 'id' && trade[key] !== null && trade[key] !== undefined && trade[key] !== ''
        );
      });

      const existingTrades = rows.filter(trade =>
        trade.id && !trade.id.toString().startsWith('temp_')
      ).filter(trade => editingRows.has(trade.id));

      console.log('Saving trades - New:', newTrades.length, 'Existing:', existingTrades.length);
      console.log('New trades to save:', newTrades);
      console.log('Existing trades to update:', existingTrades);
      
      // Save new trades
      if (newTrades.length > 0) {
        console.log('Creating new trades:', newTrades);
        for (const trade of newTrades) {
          try {
            const cleanTrade = { ...trade };
            if (cleanTrade.id && cleanTrade.id.toString().startsWith('temp_')) {
              delete cleanTrade.id;
            }
            console.log('Saving individual trade:', cleanTrade);
            const savedTrade = await createTrade(cleanTrade);
            console.log('Trade saved successfully:', savedTrade);
          } catch (err) {
            console.error('Error saving individual trade:', err);
            throw err;
          }
        }
      }

      // Update existing trades
      if (existingTrades.length > 0) {
        console.log('Updating existing trades:', existingTrades);
        for (const trade of existingTrades) {
          const tradeId = trade._id || trade.id;
          await updateTrade(tradeId, trade);
        }
      }

      // Refresh data after saving
      console.log('Refreshing trades data...');
      await fetchTrades();

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setShowSaveIndicator(true);
      setEditingRows(new Set());
      setEditMode(false);
      setTimeout(() => setShowSaveIndicator(false), 3000);

    } catch (err) {
      console.error('Error saving trades:', err);
      handleAxiosError(err, 'Failed to save trades');
    } finally {
      setSaving(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      // Cancel edit mode - reset changes
      setEditingRows(new Set());
      setHasUnsavedChanges(false);
      fetchTrades(); // Reload original data
    }
  };

  // Helper function to group trades by time periods
  const groupTradesByTime = (trades) => {
    const weeks = {};
    const months = {};
    
    trades.forEach(trade => {
      if (trade.date) {
        const tradeDate = new Date(trade.date);
        const year = tradeDate.getFullYear();
        const month = tradeDate.getMonth();
        const weekKey = `${year}-W${Math.ceil(tradeDate.getDate() / 7)}`;
        const monthKey = `${year}-${month + 1}`;
        
        if (!weeks[weekKey]) {
          weeks[weekKey] = { key: weekKey, trades: [] };
        }
        if (!months[monthKey]) {
          months[monthKey] = { key: monthKey, trades: [] };
        }
        
        weeks[weekKey].trades.push(trade);
        months[monthKey].trades.push(trade);
      }
    });
    
    return { weeks, months };
  };

  // Group trades by time periods
  const groupedTrades = groupTradesByTime(rows);
  
  // Get filtered trades based on time filter
  const getFilteredTrades = () => {
    if (timeFilter.type === 'all') {
      return rows;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);

    return rows.filter(trade => {
      if (!trade.date) return false;
      
      const tradeDate = new Date(trade.date);
      const tradeYear = tradeDate.getFullYear();
      const tradeMonth = tradeDate.getMonth() + 1;
      const tradeQuarter = Math.ceil(tradeMonth / 3);

      switch (timeFilter.type) {
        case 'month':
          return tradeYear === timeFilter.year && tradeMonth === timeFilter.month;
        case 'quarter':
          return tradeYear === timeFilter.year && tradeQuarter === timeFilter.quarter;
        case 'year':
          return tradeYear === timeFilter.year;
        default:
          return true;
      }
    });
  };

  // Get filtered and sorted groups for rendering
  const getFilteredAndSortedGroups = () => {
    const filteredTrades = getFilteredTrades();
    const filteredGroupedTrades = groupTradesByTime(filteredTrades);
    
    const weekGroups = Object.values(filteredGroupedTrades.weeks);
    const monthGroups = Object.values(filteredGroupedTrades.months);
    
    // Sort both groups by date (ascending order - oldest first)
    const sortedWeekGroups = weekGroups.sort((a, b) => {
      const dateA = new Date(a.trades[0]?.date || 0);
      const dateB = new Date(b.trades[0]?.date || 0);
      return dateA - dateB;
    });
    
    const sortedMonthGroups = monthGroups.sort((a, b) => {
      const dateA = new Date(a.trades[0]?.date || 0);
      const dateB = new Date(b.trades[0]?.date || 0);
      return dateA - dateB;
    });
    
    return { weekGroups: sortedWeekGroups, monthGroups: sortedMonthGroups };
  };

  const { weekGroups, monthGroups } = getFilteredAndSortedGroups();

  // Handle news impact modal
  const handleNewsImpactChange = (idx, value) => {
    if (value === 'positively affected' || value === 'negatively affected') {
      const currentTrade = rows[idx];
      setNewsImpactData({
        tradeIndex: idx,
        impactType: value,
        currentDetails: currentTrade.newsImpactDetails || ''
      });
      setShowNewsImpactModal(true);
    } else {
      // If "not affected" is selected, clear the impact details
      handleChange(idx, 'affectedByNews', value);
      handleChange(idx, 'newsImpactDetails', '');
    }
  };

  const handleNewsImpactSave = async (impactDetails) => {
    const { tradeIndex, impactType } = newsImpactData;
    handleChange(tradeIndex, 'affectedByNews', impactType);
    handleChange(tradeIndex, 'newsImpactDetails', impactDetails);
    setShowNewsImpactModal(false);
  };

  const handleChange = (idx, field, value) => {
    const updated = rows.map((row, index) => {
      if (index !== idx) return row;

      // Check if this is an existing trade being edited
      if (editMode && row.id && !row.id.toString().startsWith('temp_')) {
        setEditingRows(prev => new Set(prev.add(row.id)));
      }
      
      // Special handling for strategy selection
      if (field === 'strategy' && value) {
        const selectedStrategy = strategies.find(s => s._id === value);
        if (selectedStrategy) {
          const updatedRow = { ...row, [field]: value };

          console.log("Selected Strategy:", selectedStrategy);
          console.log("setupType:", selectedStrategy.setupType);
          console.log("entryType:", selectedStrategy.entryType);
          console.log("confluences:", selectedStrategy.confluences);
          console.log("tradingPairs:", selectedStrategy.tradingPairs);
      
          // Auto-populate all strategy-related fields (same logic as confluences)
          if (selectedStrategy.setupType) {
            updatedRow.setupType = selectedStrategy.setupType;
            console.log("Setting setupType to:", selectedStrategy.setupType);
          }
          
          if (selectedStrategy.entryType) {
            updatedRow.entryType = selectedStrategy.entryType;
            console.log("Setting entryType to:", selectedStrategy.entryType);
          }
          
          if (selectedStrategy.confluences) {
            updatedRow.confluences = selectedStrategy.confluences;
            console.log("Setting confluences to:", selectedStrategy.confluences);
          }
          
          // Handle trading pairs - set the first one as default
          if (selectedStrategy.tradingPairs && selectedStrategy.tradingPairs.length > 0) {
            updatedRow.pairs = selectedStrategy.tradingPairs[0];
            updatedRow.pair = selectedStrategy.tradingPairs[0]; // Also set 'pair' field for consistency
            console.log("Setting pairs to:", selectedStrategy.tradingPairs[0]);
          }
          
          // Auto-populate other strategy fields if they exist
          if (selectedStrategy.risk) {
            updatedRow.risk = selectedStrategy.risk;
            console.log("Setting risk to:", selectedStrategy.risk);
          }
          
          if (selectedStrategy.rFactor) {
            updatedRow.rFactor = selectedStrategy.rFactor;
            console.log("Setting rFactor to:", selectedStrategy.rFactor);
          }

          // Auto-populate timeFrame if it exists in strategy
          if (selectedStrategy.timeFrame) {
            updatedRow.timeFrame = selectedStrategy.timeFrame;
            console.log("Setting timeFrame to:", selectedStrategy.timeFrame);
          }

          console.log("Updated row after strategy selection:", updatedRow);
          return updatedRow;
        }
      }
      
      // Fixed session handling - only store the simple session name
      if (field === 'session') {
        // For predefined sessions (Asian, London, New York), use the value directly
        if (['Asian', 'London', 'New York'].includes(value)) {
          return { 
            ...row, 
            session: value  // Just store the simple session name
          };
        } else {
          // For database sessions (if any), find the session and use its sessionName
          const selectedSession = sessions.find(s => s._id === value);
          return { 
            ...row, 
            sessionId: value,
            session: selectedSession?.sessionName || value
          };
        }
      }

      // Special handling for time field - auto-update session based on time
      if (field === 'time') {
        const sessionFromTime = getSessionFromTime(value);
        return {
          ...row,
          time: value,
          session: sessionFromTime || row.session // Update session if time-based session is determined
        };
      }

      return { ...row, [field]: value };
    });
    
    setRows(updated);
    setHasUnsavedChanges(true);
  };

  const addRow = () => {
    const now = new Date();
    const utcTime = now.toISOString().substr(11, 5); // Get HH:MM format
    const currentSession = getCurrentSession();
    const todayDate = now.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    
    const newRow = {
      ...initialTrade,
      id: `temp_${Date.now()}`,
      date: todayDate,  // Add current date so it appears in filtered view
      time: utcTime,
      session: currentSession  // Use the simple session name directly
    };
    setRows(prev => [...prev, newRow]);
    setHasUnsavedChanges(true);
  };

  const removeRow = async (tradeId) => {
    // Find the trade by ID instead of using index
    const tradeToDelete = rows.find(row => row.id === tradeId || row._id === tradeId);
    
    if (!tradeToDelete) {
      console.error('Trade not found for deletion');
      return;
    }

    // If it's an existing trade with a real backend ID, delete from database
    if (tradeToDelete?._id && !tradeToDelete._id.toString().startsWith('temp_')) {
      try {
        await deleteTrade(tradeToDelete._id);
        console.log('Trade deleted successfully from backend');
      } catch (err) {
        console.error("Delete error:", err);
        handleAxiosError(err, 'Failed to delete trade from backend');
        return;
      }
    } else if (tradeToDelete?.id && !tradeToDelete.id.toString().startsWith('temp_')) {
      // Fallback for trades with 'id' field instead of '_id'
      try {
        await deleteTrade(tradeToDelete.id);
        console.log('Trade deleted successfully from backend');
      } catch (err) {
        console.error("Delete error:", err);
        handleAxiosError(err, 'Failed to delete trade from backend');
        return;
      }
    }

    // Remove from UI by filtering out the trade with matching ID
    setRows(rows.filter(row => row.id !== tradeId && row._id !== tradeId));
    setHasUnsavedChanges(true);
  };

  // Check if row is editable
  const isRowEditable = (row) => {
    // New rows (temp_) are always editable
    if (!row.id || row.id.toString().startsWith('temp_')) {
      return true;
    }
    // Existing rows are only editable in edit mode
    return editMode;
  };

  // Check if there are any incomplete required fields
  const hasIncompleteRequiredFields = () => {
    return rows.some(trade => {
      if (!trade.date && !trade.pair && !trade.entry && !trade.exit && !trade.pnl) {
        return false; // Skip empty rows
      }
      
      const requiredFields = [
        'date', 'time', 'session', 'pair', 'positionType', 'entry', 'exit', 
        'setupType', 'confluences', 'entryType', 'timeFrame', 'risk', 'rFactor', 
        'rulesFollowed', 'pipsLost', 'pnl'
      ];
      
      return requiredFields.some(field => !trade[field] && trade[field] !== 0);
    });
  };

  // Show error pop
  useEffect(() => {
    if (error) {
      setPop({ show: true, type: 'error', message: error });
    }
  }, [error]);

  // Show warning pop for session status
  useEffect(() => {
    if (!sessionsLoading && sessions.length === 0) {
      setPop({ show: true, type: 'warning', message: 'No trading sessions found. Create sessions in the backtest page to organize your trades better.' });
    }
  }, [sessionsLoading, sessions]);

  // Handler to close pop
  const handlePopClose = () => {
    setPop({ ...pop, show: false });
  };

  // Handler for session manager updates
  const handleSessionUpdate = () => {
    // Refresh sessions after update - handled by context
  };

  // Handler for time filter changes
  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
  };

  // Handler for show/hide all months toggle
  const handleToggleShowAll = () => {
    setShowAllMonths(!showAllMonths);
  };

  // Handler for refresh
  const handleRefresh = () => {
    refreshData();
  };

  return (
    <div className="min-h-screen w-full bg-black text-white relative">
      {/* PopNotification for error and warning */}
      {pop.show && (
        <PopNotification
          type={pop.type}
          message={pop.message}
          onClose={handlePopClose}
          duration={4000}
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto space-y-8 p-4 md:p-8">
        {/* Header */}
        <JournalHeader />

        {/* Metrics Cards */}
        <JournalCards rows={getFilteredTrades()} sessions={sessions} />

        {/* Action Buttons */}
        <ActionButtons
          loading={loading}
          sessionsLoading={sessionsLoading}
          strategiesLoading={strategiesLoading}
          editMode={editMode}
          saving={saving}
          hasUnsavedChanges={hasUnsavedChanges}
          hasIncompleteRequiredFields={hasIncompleteRequiredFields}
          onRefresh={handleRefresh}
          onToggleEdit={toggleEditMode}
          onSave={handleSave}
          onTimeFilterChange={handleTimeFilterChange}
        />
      </div>

      <div className="space-y-8">
        {/* Strategy Loading Indicator */}
        {strategiesLoading && (
          <div className="bg-purple-900/50 border border-purple-400 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
              <p className="text-purple-300">Loading strategies...</p>
            </div>
          </div>
        )}

        {/* Session Loading Indicator */}
        {sessionsLoading && (
          <div className="bg-blue-900/50 border border-blue-400 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              <p className="text-blue-300">Loading sessions...</p>
            </div>
          </div>
        )}

        {/* Edit Mode Indicator */}
        {editMode && (
          <div className="bg-blue-900/50 border border-blue-400 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-blue-400" />
              <p className="text-blue-300">
                Edit mode is active. You can now modify existing trade records. Click "Cancel Edit" to exit without saving.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-blue-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span>Loading trades...</span>
            </div>
          </div>
        )}

        {/* Session Status */}
        {!sessionsLoading && sessions.length === 0 && (
          <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              <p className="text-blue-300">
                No trading sessions found. Create sessions in the backtest page to organize your trades better.
              </p>
            </div>
          </div>
        )}

        {/* Strategy Status */}
        {!strategiesLoading && strategies.length === 0 && (
          <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              <p className="text-purple-300">No strategies found. Create strategies in the Strategy section to auto-populate trade fields.</p>
            </div>
          </div>
        )}


        {/* Debug Info */}
        {loading && <div className="text-white p-4">Loading trades...</div>}
        {error && <div className="text-red-500 p-4">Error: {error}</div>}
        {!loading && !error && rows.length === 0 && (
          <div className="text-gray-400 p-4">No trades found. Click "Add Trade" to create your first trade entry.</div>
        )}

        {/* Journal Table */}
        <JournalTable
          rows={getFilteredTrades()}
          columns={columns}
          sessions={sessions}
          strategies={strategies}
          editingRows={editingRows}
          handleChange={handleChange}
          handleNewsImpactChange={handleNewsImpactChange}
          removeRow={removeRow}
          openModelPage={openModelPage}
          openImageViewer={openImageViewer}
          getHeaderName={getHeaderName}
          getCellType={getCellType}
          getDropdownOptions={getDropdownOptions}
        />

        {/* Add Trade Button */}
        <AddTradeButton
          onAddRow={addRow}
          tradesCount={getFilteredTrades().filter(r => r.date || r.pnl).length}
          sessionsCount={sessions.length}
          showAllMonths={showAllMonths}
        />
      </div>

      {/* Model Page Modal */}
      {showModelPage && selectedTrade && (
        <ModelPage
          trade={selectedTrade}
          onClose={() => {
            setShowModelPage(false);
            setSelectedTrade(null);
          }}
          onSave={handleModelSave}
        />
      )}

      {/* Image Viewer Modal */}
      <ImageViewer
        imageUrl={selectedImage.url}
        title={selectedImage.title}
        isOpen={showImageViewer}
        onClose={() => {
          setShowImageViewer(false);
          setSelectedImage({ url: '', title: '' });
        }}
      />

      {/* News Impact Modal */}
      <NewsImpactModal
        isOpen={showNewsImpactModal}
        onClose={() => setShowNewsImpactModal(false)}
        onSave={handleNewsImpactSave}
        impactType={newsImpactData.impactType}
        currentDetails={newsImpactData.currentDetails}
      />
    </div>
  );
}
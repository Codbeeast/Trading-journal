"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AlertCircle, Edit3, Calendar, Brain, Trash2 } from 'lucide-react';
import ModelPage from '@/components/ModalPage';
import { ImageViewer } from '@/components/ImageViewer';
import PopNotification from '@/components/PopNotification';
import { useTrades } from '../../context/TradeContext';
import CloudinaryImageUpload from '@/components/CloudinaryImageUpload';

// Import new components
import JournalHeader from '@/components/journal/JournalHeader';
import JournalCards from '@/components/journal/JournalCards';
import ActionButtons from '@/components/journal/ActionButtons';
import JournalTable from '@/components/journal/JournalTable';
import AddTradeButton from '@/components/journal/AddTradeButton';
import NewsImpactModal from '@/components/journal/NewsImpactModal';

// Import utilities
import { 
  initialTrade, 
  getDropdownOptions, 
  getFieldType, 
  isRequiredField, 
  getCurrentSession, 
  getSessionFromTime, 
  columns, 
  getHeaderName, 
  getCellType 
} from '../../components/journal/journalUtils';

// Helper function to format date consistently
const formatDateForDatabase = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return null;
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDateFormatted = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Helper function to generate unique temp ID
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
    sessionsLoading
  } = useTrades();

  // Local state management - Properly separate actual trades from temporary ones
  const [actualTrades, setActualTrades] = useState([]);
  const [tempTrades, setTempTrades] = useState([]);
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Notification state
  const [pop, setPop] = useState({ show: false, type: 'info', message: '' });

  // Combine actual trades and temp trades properly
  const allTrades = useMemo(() => {
    return [...actualTrades, ...tempTrades];
  }, [actualTrades, tempTrades]);

  // Enhanced error handling
  const handleAxiosError = useCallback((error, contextMessage) => {
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
  }, []);

  // Filtered trades using combined trades
  const filteredTrades = useMemo(() => {
    if (timeFilter.type === 'all') {
      return allTrades;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);

    return allTrades.filter(trade => {
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
  }, [allTrades, timeFilter]);

  // Update actual trades when API data changes - Fixed to prevent dummy data
  useEffect(() => {
    if (loading) return; // Don't update while loading
    
    console.log('Trades data updated from API:', trades?.length || 0, 'trades');
    
    if (Array.isArray(trades) && trades.length >= 0) {
      // Only process trades that have valid user data
      const validTrades = trades.filter(trade => {
        // Ensure trade has required fields and is not dummy data
        return trade && 
               (trade._id || trade.id) && 
               trade.userId && 
               trade.userId !== 'default-user'; // Filter out any default user trades
      });

      const formattedTrades = validTrades.map(trade => {
        let formattedDate = null;
        if (trade.date) {
          try {
            const dateObj = typeof trade.date === 'string' ? new Date(trade.date) : trade.date;
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toISOString().split('T')[0];
            }
          } catch (error) {
            console.error('Error formatting date for trade:', trade._id, error);
          }
        }

        return {
          ...trade,
          id: trade._id || trade.id,
          date: formattedDate,
          strategy: trade.strategy?._id || trade.strategy || '',
          strategyName: trade.strategy?.strategyName || '',
          sessionName: trade.session || ''
        };
      });
      
      console.log('Setting actual trades:', formattedTrades.length);
      setActualTrades(formattedTrades);
      
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } else if (!loading && isInitialLoad) {
      // If no trades and not loading, set empty array
      console.log('No trades found, setting empty array');
      setActualTrades([]);
      setIsInitialLoad(false);
    }
  }, [trades, loading, isInitialLoad]);

  // Refresh data function
  const refreshData = useCallback(() => {
    console.log('Manual refresh triggered');
    setTempTrades([]); // Clear temp trades on refresh
    setEditingRows(new Set());
    setHasUnsavedChanges(false);
    fetchTrades();
  }, [fetchTrades]);

  // Handle change with proper trade identification
  const handleChange = useCallback((idx, field, value) => {
    const trade = filteredTrades[idx];
    if (!trade) return;

    const isTemp = trade.id && trade.id.toString().startsWith('temp_');
    
    if (isTemp) {
      // Update temp trades
      setTempTrades(prevTemp => 
        prevTemp.map(t => 
          t.id === trade.id ? { ...t, [field]: value } : t
        )
      );
    } else {
      // Update actual trades
      setActualTrades(prevActual => 
        prevActual.map(t => 
          t.id === trade.id ? { ...t, [field]: value } : t
        )
      );
      
      // Mark for editing if in edit mode
      if (editMode && trade.id) {
        setEditingRows(prev => new Set(prev.add(trade.id)));
      }
    }

    // Handle strategy selection auto-population
    if (field === 'strategy' && value && strategies) {
      const selectedStrategy = strategies.find(s => s._id === value);
      if (selectedStrategy) {
        console.log("Selected Strategy:", selectedStrategy);
        
        const updateFields = {};
        if (selectedStrategy.setupType && !trade.setupType) {
          updateFields.setupType = selectedStrategy.setupType;
        }
        if (selectedStrategy.entryType && !trade.entryType) {
          updateFields.entryType = Array.isArray(selectedStrategy.entryType)
            ? selectedStrategy.entryType.join(', ')
            : selectedStrategy.entryType;
        }
        if (selectedStrategy.confluences && !trade.confluences) {
          updateFields.confluences = Array.isArray(selectedStrategy.confluences)
            ? selectedStrategy.confluences.join(', ')
            : selectedStrategy.confluences;
        }
        if (selectedStrategy.tradingPairs && selectedStrategy.tradingPairs.length > 0 && !trade.pair) {
          updateFields.pair = selectedStrategy.tradingPairs[0];
        }
        if (selectedStrategy.risk && !trade.risk) {
          updateFields.risk = selectedStrategy.risk;
        }
        if (selectedStrategy.rFactor && !trade.rFactor) {
          updateFields.rFactor = selectedStrategy.rFactor;
        }
        if (selectedStrategy.timeFrame && !trade.timeFrame) {
          updateFields.timeFrame = selectedStrategy.timeFrame;
        }

        // Apply all updates at once
        if (Object.keys(updateFields).length > 0) {
          if (isTemp) {
            setTempTrades(prevTemp => 
              prevTemp.map(t => 
                t.id === trade.id ? { ...t, ...updateFields } : t
              )
            );
          } else {
            setActualTrades(prevActual => 
              prevActual.map(t => 
                t.id === trade.id ? { ...t, ...updateFields } : t
              )
            );
          }
        }
      }
    }

    // Handle session and time updates
    if (field === 'session') {
      const updateData = { [field]: value };
      if (['Asian', 'London', 'New York'].includes(value)) {
        updateData.session = value;
      } else {
        const selectedSession = sessions.find(s => s._id === value);
        updateData.sessionId = value;
        updateData.session = selectedSession?.sessionName || value;
      }

      if (isTemp) {
        setTempTrades(prevTemp => 
          prevTemp.map(t => 
            t.id === trade.id ? { ...t, ...updateData } : t
          )
        );
      } else {
        setActualTrades(prevActual => 
          prevActual.map(t => 
            t.id === trade.id ? { ...t, ...updateData } : t
          )
        );
      }
    }

    if (field === 'time') {
      const sessionFromTime = getSessionFromTime(value);
      const updateData = { time: value };
      if (sessionFromTime) {
        updateData.session = sessionFromTime;
      }

      if (isTemp) {
        setTempTrades(prevTemp => 
          prevTemp.map(t => 
            t.id === trade.id ? { ...t, ...updateData } : t
          )
        );
      } else {
        setActualTrades(prevActual => 
          prevActual.map(t => 
            t.id === trade.id ? { ...t, ...updateData } : t
          )
        );
      }
    }
    
    setHasUnsavedChanges(true);
  }, [filteredTrades, editMode, strategies, sessions]);

  // Add new row function
  const addRow = useCallback(() => {
    const now = new Date();
    const utcTime = now.toISOString().substr(11, 5);
    const currentSession = getCurrentSession();
    const todayDate = getCurrentDateFormatted();
    
    const newRow = {
      ...initialTrade,
      id: generateTempId(),
      date: todayDate,
      time: utcTime,
      session: currentSession
    };
    
    console.log('Adding new temp trade:', newRow.id);
    setTempTrades(prev => [...prev, newRow]);
    setHasUnsavedChanges(true);
  }, []);

  // Remove row function
  const removeRow = useCallback(async (tradeId) => {
    console.log('Removing trade:', tradeId);
    
    const isTemp = tradeId.toString().startsWith('temp_');
    
    if (isTemp) {
      // Remove from temp trades
      setTempTrades(prev => prev.filter(trade => trade.id !== tradeId));
      setHasUnsavedChanges(true);
      return;
    }
    
    // For actual trades, delete from backend
    const tradeToDelete = actualTrades.find(row => row.id === tradeId || row._id === tradeId);
    
    if (!tradeToDelete) {
      console.error('Trade not found for deletion');
      return;
    }

    try {
      await deleteTrade(tradeToDelete._id || tradeToDelete.id);
      console.log('Trade deleted successfully from backend');
      
      // Remove from actual trades
      setActualTrades(prev => prev.filter(trade => trade.id !== tradeId && trade._id !== tradeId));
      setHasUnsavedChanges(true);
    } catch (err) {
      console.error("Delete error:", err);
      handleAxiosError(err, 'Failed to delete trade from backend');
    }
  }, [actualTrades, deleteTrade, handleAxiosError]);

  // Enhanced save function
  const handleSave = useCallback(async () => {
    setSaving(true);
    setPop({ show: false, type: 'info', message: '' });

    try {
      console.log('Starting save process...');
      console.log('Temp trades to save:', tempTrades.length);
      console.log('Edited actual trades:', editingRows.size);

      // Basic validation
      const allTradesToValidate = [...tempTrades, ...actualTrades.filter(t => editingRows.has(t.id))];
      const validationErrors = [];
      
      allTradesToValidate.forEach((trade, index) => {
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

      // Save new temp trades
      const newTradesToSave = tempTrades.filter(trade => {
        return Object.keys(trade).some(key => 
          key !== 'id' && trade[key] !== null && trade[key] !== undefined && trade[key] !== ''
        );
      }).map(trade => ({
        ...trade,
        date: formatDateForDatabase(trade.date)
      }));

      console.log('Saving new trades:', newTradesToSave.length);
      for (const trade of newTradesToSave) {
        try {
          const cleanTrade = { ...trade };
          delete cleanTrade.id; // Remove temp ID
          console.log('Saving individual new trade');
          await createTrade(cleanTrade);
        } catch (err) {
          console.error('Error saving individual trade:', err);
          throw err;
        }
      }

      // Update existing trades
      const existingTradesToUpdate = actualTrades.filter(trade => 
        editingRows.has(trade.id)
      ).map(trade => ({
        ...trade,
        date: formatDateForDatabase(trade.date)
      }));

      console.log('Updating existing trades:', existingTradesToUpdate.length);
      for (const trade of existingTradesToUpdate) {
        const tradeId = trade._id || trade.id;
        await updateTrade(tradeId, trade);
      }

      // Clear temp trades and refresh data
      setTempTrades([]);
      setEditingRows(new Set());
      setEditMode(false);
      
      // Refresh data from backend
      console.log('Refreshing trades data...');
      await fetchTrades();

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 3000);

      setPop({ show: true, type: 'success', message: 'Trades saved successfully!' });

    } catch (err) {
      console.error('Error saving trades:', err);
      handleAxiosError(err, 'Failed to save trades');
    } finally {
      setSaving(false);
    }
  }, [tempTrades, actualTrades, editingRows, createTrade, updateTrade, fetchTrades, handleAxiosError]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setEditMode(prev => {
      if (prev) {
        // Cancel edit mode - reset changes
        setEditingRows(new Set());
        setHasUnsavedChanges(false);
        setTempTrades([]); // Clear any unsaved temp trades
        fetchTrades(); // Reload original data
      }
      return !prev;
    });
  }, [fetchTrades]);

  // Modal handlers
  const openModelPage = useCallback((tradeId) => {
    const trade = allTrades.find(row => row.id === tradeId);
    if (trade) {
      setSelectedTrade(trade);
      setShowModelPage(true);
    }
  }, [allTrades]);

  const openImageViewer = useCallback((imageUrl, fileName) => {
    if (imageUrl) {
      setSelectedImage({
        url: imageUrl,
        title: fileName || 'Uploaded Image'
      });
      setShowImageViewer(true);
    }
  }, []);

  const handleModelSave = useCallback(async (ratings) => {
    try {
      const updatedTrade = { ...selectedTrade, ...ratings };
      const isTemp = updatedTrade.id && updatedTrade.id.toString().startsWith('temp_');

      if (!isTemp && updatedTrade.id) {
        await updateTrade(updatedTrade.id, updatedTrade);
      }

      // Update the appropriate state
      if (isTemp) {
        setTempTrades(prevTemp =>
          prevTemp.map(trade =>
            trade.id === updatedTrade.id ? updatedTrade : trade
          )
        );
      } else {
        setActualTrades(prevActual =>
          prevActual.map(trade =>
            trade.id === updatedTrade.id ? updatedTrade : trade
          )
        );
      }

      setSelectedTrade(updatedTrade);
      setLastSaved(new Date());
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 3000);

    } catch (error) {
      console.error('Error saving model ratings:', error);
      handleAxiosError(error, 'Failed to save psychology ratings');
      throw error;
    }
  }, [selectedTrade, updateTrade, handleAxiosError]);

  // News impact handlers
  const handleNewsImpactChange = useCallback((idx, value) => {
    if (value === 'positively affected' || value === 'negatively affected') {
      const currentTrade = filteredTrades[idx];
      setNewsImpactData({
        tradeIndex: idx,
        impactType: value,
        currentDetails: currentTrade.newsImpactDetails || ''
      });
      setShowNewsImpactModal(true);
    } else {
      handleChange(idx, 'affectedByNews', value);
      handleChange(idx, 'newsImpactDetails', '');
    }
  }, [filteredTrades, handleChange]);

  const handleNewsImpactSave = useCallback(async (impactDetails) => {
    const { tradeIndex, impactType } = newsImpactData;
    handleChange(tradeIndex, 'affectedByNews', impactType);
    handleChange(tradeIndex, 'newsImpactDetails', impactDetails);
    setShowNewsImpactModal(false);
  }, [newsImpactData, handleChange]);

  // Utility functions
  const hasIncompleteRequiredFields = useCallback(() => {
    return allTrades.some(trade => {
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
  }, [allTrades]);

  // Event handlers
  const handlePopClose = useCallback(() => {
    setPop(prev => ({ ...prev, show: false }));
  }, []);

  const handleTimeFilterChange = useCallback((filter) => {
    setTimeFilter(filter);
  }, []);

  const handleToggleShowAll = useCallback(() => {
    setShowAllMonths(prev => !prev);
  }, []);

  // Error handling effects
  useEffect(() => {
    if (error) {
      setPop({ show: true, type: 'error', message: error });
    }
  }, [error]);

  useEffect(() => {
    if (!sessionsLoading && sessions.length === 0) {
      setPop({ 
        show: true, 
        type: 'warning', 
        message: 'No trading sessions found. Create sessions in the backtest page to organize your trades better.' 
      });
    }
  }, [sessionsLoading, sessions]);

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
        <JournalCards rows={filteredTrades} sessions={sessions} />

        {/* Action Buttons */}
        <ActionButtons
          loading={loading}
          sessionsLoading={sessionsLoading}
          strategiesLoading={strategiesLoading}
          editMode={editMode}
          saving={saving}
          hasUnsavedChanges={hasUnsavedChanges}
          hasIncompleteRequiredFields={hasIncompleteRequiredFields}
          onRefresh={refreshData}
          onToggleEdit={toggleEditMode}
          onSave={handleSave}
          onTimeFilterChange={handleTimeFilterChange}
        />
      </div>

      <div className="space-y-8">
        {/* Loading States */}
        {strategiesLoading && (
          <div className="bg-purple-900/50 border border-purple-400 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
              <p className="text-purple-300">Loading strategies...</p>
            </div>
          </div>
        )}

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

        {/* Main Loading State */}
        {loading && isInitialLoad && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-blue-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span>Loading trades...</span>
            </div>
          </div>
        )}

        {/* Status Messages */}
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

        {!strategiesLoading && strategies.length === 0 && (
          <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              <p className="text-purple-300">No strategies found. Create strategies in the Strategy section to auto-populate trade fields.</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !isInitialLoad && allTrades.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No trades found</p>
            <p className="text-gray-500">Click "Add Trade" to create your first trade entry.</p>
          </div>
        )}

        {/* Journal Table */}
        {!isInitialLoad && allTrades.length > 0 && (
          <JournalTable
            rows={filteredTrades}
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
            CloudinaryImageUpload={CloudinaryImageUpload}
          />
        )}

        {/* Add Trade Button */}
        <AddTradeButton
          onAddRow={addRow}
          tradesCount={filteredTrades.filter(r => r.date || r.pnl).length}
          sessionsCount={sessions.length}
          showAllMonths={showAllMonths}
        />
      </div>

      {/* Modals */}
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

      <ImageViewer
        imageUrl={selectedImage.url}
        title={selectedImage.title}
        isOpen={showImageViewer}
        onClose={() => {
          setShowImageViewer(false);
          setSelectedImage({ url: '', title: '' });
        }}
      />

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
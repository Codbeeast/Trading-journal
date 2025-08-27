"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from 'framer-motion';
import { AlertCircle, Edit3, Calendar, Brain, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
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

  // Group trades by week
  const tradesByWeek = useMemo(() => {
    const grouped = {};
    
    filteredTrades.forEach(trade => {
      if (!trade.date) return;
      
      const tradeDate = new Date(trade.date);
      const weekStart = new Date(tradeDate);
      weekStart.setDate(tradeDate.getDate() - tradeDate.getDay() + 1); // Start of week (Monday)
      
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = {
          weekStart: weekStart,
          trades: []
        };
      }
      
      grouped[weekKey].trades.push(trade);
    });
    
    // Sort weeks in descending order (newest first)
    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  }, [filteredTrades]);

  // Format week range for display
  const formatWeekRange = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

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
 const handleChange = useCallback((rowId, field, value) => {
  // Find the trade by ID instead of using index
  const trade = filteredTrades.find(t => (t.id || t._id) === rowId);
  if (!trade) {
    console.error('Trade not found for ID:', rowId);
    return;
  }

  const isTemp = trade.id && trade.id.toString().startsWith('temp_');
  
  console.log('handleChange:', { rowId, field, value, isTemp, trade });
  
  if (isTemp) {
    // Update temp trades
    setTempTrades(prevTemp => {
      const updated = prevTemp.map(t => 
        t.id === trade.id ? { ...t, [field]: value } : t
      );
      console.log('Updated temp trades:', updated);
      return updated;
    });
  } else {
    // Update actual trades
    setActualTrades(prevActual => {
      const updated = prevActual.map(t => 
        (t.id || t._id) === rowId ? { ...t, [field]: value } : t
      );
      console.log('Updated actual trades:', updated);
      return updated;
    });
    
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
        console.log('Auto-populating fields:', updateFields);
        
        if (isTemp) {
          setTempTrades(prevTemp => 
            prevTemp.map(t => 
              t.id === trade.id ? { ...t, ...updateFields } : t
            )
          );
        } else {
          setActualTrades(prevActual => 
            prevActual.map(t => 
              (t.id || t._id) === rowId ? { ...t, ...updateFields } : t
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
          (t.id || t._id) === rowId ? { ...t, ...updateData } : t
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
          (t.id || t._id) === rowId ? { ...t, ...updateData } : t
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

  const openImageViewer = useCallback((imageUrl, trade, initialIndex = 0) => {
    if (imageUrl) {
      const tradeDate = trade.date ? new Date(trade.date).toISOString().split('T')[0] : 'Unknown Date';
      const title = `Images for Trade (${tradeDate})`;
      
      setSelectedImage({
        url: imageUrl, // Can be single URL or array of URLs
        title: title,
        initialIndex: initialIndex
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

  // Excel Export function
  const handleExportExcel = useCallback(() => {
    try {
      const exportData = filteredTrades.map(trade => ({
        Date: trade.date || '',
        Time: trade.time || '',
        Session: trade.session || '',
        Pair: trade.pair || '',
        'Position Type': trade.positionType || '',
        Entry: trade.entry || '',
        Exit: trade.exit || '',
        'Setup Type': trade.setupType || '',
        Confluences: trade.confluences || '',
        'Entry Type': trade.entryType || '',
        'Time Frame': trade.timeFrame || '',
        Risk: trade.risk || '',
        'R Factor': trade.rFactor || '',
        'Rules Followed': trade.rulesFollowed || '',
        'Pips Lost': trade.pipsLost || '',
        PnL: trade.pnl || '',
        'Affected By News': trade.affectedByNews || '',
        'News Impact Details': trade.newsImpactDetails || '',
        Strategy: trade.strategyName || '',
        Notes: trade.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Trades');
      
      const fileName = `trades_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      setPop({ show: true, type: 'success', message: 'Trades exported successfully!' });
    } catch (error) {
      console.error('Export error:', error);
      setPop({ show: true, type: 'error', message: 'Failed to export trades to Excel' });
    }
  }, [filteredTrades]);

  // Excel Import function
  const handleImportExcel = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const importedTrades = jsonData.map(row => ({
            id: generateTempId(),
            date: formatDateForDatabase(row.Date || row.date) || getCurrentDateFormatted(),
            time: row.Time || row.time || '',
            session: row.Session || row.session || '',
            pair: row.Pair || row.pair || '',
            positionType: row['Position Type'] || row.positionType || '',
            entry: row.Entry || row.entry || '',
            exit: row.Exit || row.exit || '',
            setupType: row['Setup Type'] || row.setupType || '',
            confluences: row.Confluences || row.confluences || '',
            entryType: row['Entry Type'] || row.entryType || '',
            timeFrame: row['Time Frame'] || row.timeFrame || '',
            risk: row.Risk || row.risk || '',
            rFactor: row['R Factor'] || row.rFactor || '',
            rulesFollowed: row['Rules Followed'] || row.rulesFollowed || '',
            pipsLost: row['Pips Lost'] || row.pipsLost || '',
            pnl: row.PnL || row.pnl || '',
            affectedByNews: row['Affected By News'] || row.affectedByNews || '',
            newsImpactDetails: row['News Impact Details'] || row.newsImpactDetails || '',
            notes: row.Notes || row.notes || ''
          }));

          setTempTrades(prev => [...prev, ...importedTrades]);
          setHasUnsavedChanges(true);
          setPop({ show: true, type: 'success', message: `Imported ${importedTrades.length} trades from Excel` });
        } catch (parseError) {
          console.error('Parse error:', parseError);
          setPop({ show: true, type: 'error', message: 'Failed to parse Excel file. Please check the format.' });
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Import error:', error);
      setPop({ show: true, type: 'error', message: 'Failed to import Excel file' });
    }

    // Reset file input
    event.target.value = '';
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
      {/* Enhanced Background with advanced glassmorphism effects */}
      <div className="absolute inset-0 overflow-hidden">

        {/* Pulsing central glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.08) 40%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 0.9, 1.1, 1],
            opacity: [0.3, 0.6, 0.2, 0.5, 0.3],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 18,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
       
        {/* Diagonal light rays */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: 'linear-gradient(45deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)',
          }}
          animate={{
            opacity: [0, 0.3, 0, 0.2, 0],
            rotate: [0, 45, 90, 135, 180],
          }}
          transition={{
            duration: 20,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
          }}
        />

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 z-0 opacity-30 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.2),rgba(255,255,255,0))]"></div>
          <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.2),rgba(255,255,255,0))]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(16,185,129,0.1),rgba(255,255,255,0))]"></div>
        </div>
      </div>

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
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 py-4">
            Trade Journal
          </h1>
        </motion.div>

        {/* Metrics Cards with enhanced glassmorphism and staggered animation */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-[22px] p-6">
              <JournalCards rows={filteredTrades} sessions={sessions} />
            </div>
          </div>
        </motion.div>

        {/* Action Buttons, Table, and Add Trade Button Container */}
        <div className="relative z-20 space-y-8">
          {/* Action Buttons */}
          <div className="w-full mx-auto">
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
              onExportExcel={handleExportExcel}
              onImportExcel={handleImportExcel}
            />
          </div>

          {/* Loading States with enhanced glassmorphism */}
          {strategiesLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-purple-600/10 to-purple-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-black/30 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400/30 border-t-purple-400"></div>
                    <div className="absolute inset-0 animate-pulse rounded-full bg-purple-400/20"></div>
                  </div>
                  <p className="text-purple-300 font-medium">Loading strategies...</p>
                </div>
              </div>
            </motion.div>
          )}

          {sessionsLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-blue-600/10 to-blue-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-black/30 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400/30 border-t-blue-400"></div>
                    <div className="absolute inset-0 animate-pulse rounded-full bg-blue-400/20"></div>
                  </div>
                  <p className="text-blue-300 font-medium">Loading sessions...</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Edit Mode Indicator with enhanced styling */}
          {editMode && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-blue-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-black/30 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Edit3 className="w-8 h-8 text-blue-400" />
                    <div className="absolute inset-0 animate-pulse rounded-full bg-blue-400/20 blur-md"></div>
                  </div>
                  <div>
                    <p className="text-blue-300 font-medium text-lg">Edit Mode Active</p>
                    <p className="text-blue-400/80 text-sm">You can now modify existing trade records. Click "Cancel Edit" to exit without saving.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Loading State with enhanced animation */}
          {loading && isInitialLoad && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center py-16"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-blue-500/30 rounded-3xl blur-2xl"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-400/30 border-t-blue-400"></div>
                      <div className="absolute inset-0 animate-pulse rounded-full bg-blue-400/20"></div>
                    </div>
                    <div>
                      <p className="text-blue-300 font-semibold text-xl">Loading Trades</p>
                      <p className="text-blue-400/70">Fetching your trading data...</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Status Messages with enhanced glassmorphism */}
          {!sessionsLoading && sessions.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-cyan-500/10 to-blue-500/15 rounded-2xl blur-xl"></div>
              <div className="relative bg-black/30 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-4">
                  <AlertCircle className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-blue-300 font-medium">No Trading Sessions Found</p>
                    <p className="text-blue-400/80 text-sm">Create sessions in the backtest page to organize your trades better.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!strategiesLoading && strategies.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-purple-500/15 rounded-2xl blur-xl"></div>
              <div className="relative bg-black/30 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-4">
                  <AlertCircle className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-purple-300 font-medium">No Strategies Found</p>
                    <p className="text-purple-400/80 text-sm">Create strategies in the Strategy section to auto-populate trade fields.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty State with enhanced styling */}
          {!loading && !isInitialLoad && allTrades.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20"
            >
              <div className="relative max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 via-gray-600/10 to-gray-500/20 rounded-3xl blur-2xl"></div>
                <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
                  <div className="relative">
                    <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                    <div className="absolute inset-0 animate-pulse rounded-full bg-gray-400/10 blur-xl"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-300 mb-3">No Trades Found</h3>
                  <p className="text-gray-400 mb-6">Start your trading journey by adding your first trade entry.</p>
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm">
                    Click "Add Trade" to get started
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Journal Table with enhanced glassmorphism container */}
          {!isInitialLoad && allTrades.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="relative w-full mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-emerald-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl">
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-[22px] p-6">
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
                    weeklyData={tradesByWeek}
                    formatWeekRange={formatWeekRange}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Add Trade Button */}
          <AddTradeButton
            onAddRow={addRow}
            tradesCount={filteredTrades.filter(r => r.date || r.pnl).length}
            sessionsCount={sessions.length}
            showAllMonths={showAllMonths}
          />
        </div>
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
          onAutoSave={handleSave}
        />
      )}

      <ImageViewer
        imageUrl={selectedImage.url}
        title={selectedImage.title}
        initialIndex={selectedImage.initialIndex || 0}
        isOpen={showImageViewer}
        onClose={() => {
          setShowImageViewer(false);
          setSelectedImage({ url: '', title: '', initialIndex: 0 });
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
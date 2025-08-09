"use client";

import React, { useState, useEffect } from "react";
import { Plus, Download, Upload, Trash2, BarChart3, TrendingUp, Calculator, Save, CheckCircle, Brain, AlertCircle, Edit3, X, Image, RefreshCw, Calendar, Clock } from 'lucide-react';
import { CiImageOn } from "react-icons/ci";
import axios from "axios";
import { useAuth } from '@clerk/nextjs';
import ModelPage from '@/components/ModalPage';
import { ImageUpload } from '@/components/ImageUpload';
import { ImageViewer } from '@/components/ImageViewer';

/**
 * @typedef {Object} TradeEntry
 * @property {string} id
 * @property {string} date
 * @property {string} time
 * @property {string} session
 * @property {string} sessionId
 * @property {string} pair
 * @property {string} positionType
 * @property {number|null} entry
 * @property {number|null} exit
 * @property {string} setupType
 * @property {string} confluences
 * @property {string} entryType
 * @property {string} timeFrame
 * @property {number|null} risk
 * @property {number|null} rFactor
 * @property {string} rulesFollowed
 * @property {number|null} pipsLost
 * @property {number|null} pipsGain
 * @property {number|null} pnl
 * @property {string} image
 * @property {string} notes
 */

const initialTrade = {
  date: '',
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  session: '',
  sessionId: '',
  pair: '',
  positionType: '',
  entry: null,
  exit: null,
  setupType: '',
  confluences: '',
  entryType: '',
  timeFrame: '',
  risk: null,
  rFactor: null,
  rulesFollowed: '',
  pipsLost: null,
  pipsGain: null,
  pnl: null,
  long: null,
  short: null,
  image: '',
  notes: '',
  tfUsed: '',
  fearToGreed: 5,
  fomoRating: 5,
  executionRating: 5,
  imagePosting: '',
  notes: ''
};

const columns = [
  "date", "time", "session", "pair", "positionType", "entry", "exit", "setupType", "confluences", "entryType", "timeFrame", "risk", "rFactor", "rulesFollowed", "pipsLost", "pipsGain", "pnl", "long", "short", "image", "notes"
];

const DROPDOWN_OPTIONS = {
  pairs: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'NZD/USD', 'USD/CHF', 'USD/CAD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'],
  positionType: ['Long', 'Short'],
  setupTypes: ['Breakout', 'Range', 'Trend', 'Mixed', 'Other'],
  entryTypes: ['Entry', 'Exit', 'Other'],
  timeFrames: ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN'],
  trailWorked: ['Yes', 'No'],
  typeOfTrade: ['Long', 'Short', 'Both'],
  entryModels: ['Model A', 'Model B', 'Model C', 'Other'],
  rulesFollowed: ['Yes', 'No'],
  imagePosting: ['Yes', 'No'],
};

// Helper function to get week number and year
const getWeekInfo = (dateString) => {
  if (!dateString) return { week: 0, year: 0, weekKey: '' };
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  
  // Get the first day of the year
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  return { week, year, weekKey: `${year}-W${week.toString().padStart(2, '0')}` };
};

// Helper function to get month info
const getMonthInfo = (dateString) => {
  if (!dateString) return { month: 0, year: 0, monthKey: '' };
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  return { month, year, monthKey: `${year}-${month.toString().padStart(2, '0')}` };
};

// Helper function to group trades by week and month
const groupTradesByTime = (trades) => {
  const grouped = {
    months: {},
    weeks: {}
  };

  trades.forEach(trade => {
    if (!trade.date) return;

    // Group by month
    const monthInfo = getMonthInfo(trade.date);
    if (!grouped.months[monthInfo.monthKey]) {
      grouped.months[monthInfo.monthKey] = {
        ...monthInfo,
        trades: [],
        totalPnL: 0,
        winCount: 0,
        totalTrades: 0
      };
    }
    grouped.months[monthInfo.monthKey].trades.push(trade);
    if (trade.pnl) {
      grouped.months[monthInfo.monthKey].totalPnL += trade.pnl;
      grouped.months[monthInfo.monthKey].totalTrades++;
      if (trade.pnl > 0) grouped.months[monthInfo.monthKey].winCount++;
    }

    // Group by week
    const weekInfo = getWeekInfo(trade.date);
    if (!grouped.weeks[weekInfo.weekKey]) {
      grouped.weeks[weekInfo.weekKey] = {
        ...weekInfo,
        trades: [],
        totalPnL: 0,
        winCount: 0,
        totalTrades: 0
      };
    }
    grouped.weeks[weekInfo.weekKey].trades.push(trade);
    if (trade.pnl) {
      grouped.weeks[weekInfo.weekKey].totalPnL += trade.pnl;
      grouped.weeks[weekInfo.weekKey].totalTrades++;
      if (trade.pnl > 0) grouped.weeks[weekInfo.weekKey].winCount++;
    }
  });

  return grouped;
};

// Helper function to format date ranges
const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return `${startFormatted} - ${endFormatted}`;
};

// Helper function to get week start and end dates
const getWeekDateRange = (year, week) => {
  const firstDayOfYear = new Date(year, 0, 1);
  const days = (week - 1) * 7;
  const weekStart = new Date(firstDayOfYear);
  weekStart.setDate(firstDayOfYear.getDate() + days - firstDayOfYear.getDay());
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return { start: weekStart, end: weekEnd };
};

// Helper function to get month name
const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};

const getDropdownOptions = (field, sessions = []) => {
  switch (field) {
    case 'session': return sessions.map(s => ({ value: s._id, label: s.sessionName, pair: s.pair }));
    case 'pair': return DROPDOWN_OPTIONS.pairs;
    case 'positionType': return DROPDOWN_OPTIONS.positionType;
    case 'setupType': return DROPDOWN_OPTIONS.setupTypes;
    case 'entryType': return DROPDOWN_OPTIONS.entryTypes;
    case 'timeFrame': return DROPDOWN_OPTIONS.timeFrames;
    case 'trailWorked': return DROPDOWN_OPTIONS.trailWorked;
    case 'typeOfTrade': return DROPDOWN_OPTIONS.typeOfTrade;
    case 'entryModel': return DROPDOWN_OPTIONS.entryModels;
    case 'rulesFollowed': return DROPDOWN_OPTIONS.rulesFollowed;
    case 'imagePosting': return DROPDOWN_OPTIONS.imagePosting;
    default: return [];
  }
};

const getColumnHeader = (field) => {
  const headers = {
    id: 'ID',
    date: 'Date',
    time: 'Time',
    session: 'Session',
    pair: 'Pair',
    positionType: 'Position Type',
    entry: 'Entry',
    exit: 'Exit',
    setupType: 'Setup Type',
    confluences: 'Confluences',
    entryType: 'Entry Type',
    timeFrame: 'TF Used',
    risk: 'Risk/Trade',
    rFactor: 'R Factor',
    rulesFollowed: 'Rules Followed',
    pipsLost: 'Pips L/C',
    pipsGain: 'Pips G/N',
    pnl: 'PnL',
    long: 'Long',
    short: 'Short',
    image: 'Image of Play',
    notes: 'Notes'
  };
  return headers[field];
};

const getCellType = (field) => {
  if (field === 'date') return 'date';
  if (field === 'time') return 'time';
  if (field === 'image') return 'image';
  if ([
    'entry', 'exit', 'risk', 'rFactor', 'pipsLost', 'pipsGain', 'pnl', 'long', 'short'
  ].includes(field)) {
    return 'number';
  }
  if ([
    'session', 'pair', 'positionType', 'setupType', 'entryType', 'timeFrame', 'trailWorked', 'typeOfTrade', 'entryModel', 'rulesFollowed', 'imagePosting'
  ].includes(field)) {
    return 'dropdown';
  }
  // Psychology ratings are display-only
  if (['rFactor', 'pipsLost', 'pipsGain', 'pnl'].includes(field)) {
    return 'psychology';
  }
  return 'text';
};

export default function TradeJournal() {
  const { getToken, userId } = useAuth();
  
  const [rows, setRows] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Fetch sessions from the API
  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/sessions', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.data && Array.isArray(response.data)) {
        setSessions(response.data);
        console.log('Sessions loaded:', response.data.length);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions. Some features may be limited.');
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Enhanced fetch trades with better error handling
  const fetchTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/trades', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.data && Array.isArray(response.data)) {
        // Sort trades by date and time (ascending order - oldest first)
        const sortedTrades = response.data.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA - dateB;
        });

        // Ensure each trade has the required fields
        const processedTrades = sortedTrades.map(trade => ({
          ...initialTrade,
          ...trade,
          // Convert session object to sessionId and session name
          sessionId: trade.session?._id || trade.sessionId || '',
          session: trade.session?.sessionName || trade.session || ''
        }));

        setRows(processedTrades.length > 0 ? processedTrades : [{ ...initialTrade }]);
        console.log('Trades loaded:', processedTrades.length);
      } else {
        setRows([{ ...initialTrade }]);
      }
    } catch (err) {
      console.error('Error fetching trades:', err);
      handleAxiosError(err, 'Failed to load trades');
      setRows([{ ...initialTrade }]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced error handling
  const handleAxiosError = (error, contextMessage) => {
    console.error(`${contextMessage}:`, error);
    
    if (error.response) {
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     `Server error (${error.response.status})`;
      setError(`${contextMessage}: ${message}`);
    } else if (error.request) {
      setError(`${contextMessage}: No response from server. Please check your connection.`);
    } else {
      setError(`${contextMessage}: ${error.message}`);
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
        const token = await getToken();
        await axios.put(`/api/trades/${updatedTrade.id}`, updatedTrade, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
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

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchSessions(), fetchTrades()]);
    };
    loadData();
  }, []);

  // Enhanced save function with better error handling
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Separate new trades from existing ones
      const newTrades = rows.filter(trade =>
        !trade.id || trade.id.toString().startsWith('temp_')
      ).filter(trade => {
        return trade.date || trade.pair || trade.entry || trade.exit || trade.pnl;
      });

      const existingTrades = rows.filter(trade =>
        trade.id && !trade.id.toString().startsWith('temp_')
      );

      // Log image data for debugging
      const tradesWithImages = rows.filter(trade => trade.image);
      if (tradesWithImages.length > 0) {
        console.log('Trades with images to save:', tradesWithImages.length);
        tradesWithImages.forEach((trade, index) => {
          console.log(`Trade ${index + 1}:`, {
            id: trade.id,
            hasImage: !!trade.image,
            imageName: trade.imageName,
            imageLength: trade.image ? trade.image.length : 0
          });
        });
      }
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      };

      // Save new trades
      if (newTrades.length > 0) {
        const newTradesData = newTrades.map(trade => ({
          ...trade,
          id: undefined, // Remove temp ID
          sessionId: trade.sessionId, // Ensure sessionId is sent
        }));

        console.log('Saving new trades with data:', newTradesData.map(t => ({
          date: t.date,
          hasImage: !!t.image,
          imageName: t.imageName
        })));

        console.log('Saving new trades:', newTradesData.length);
        const response = await axios.post('/api/trades', { trades: newTradesData }, config);

        if (response.data && response.data.trades) {
          const savedNewTrades = response.data.trades;
          console.log('New trades saved successfully:', savedNewTrades.length);
          
          // Update rows with returned IDs for new trades
          setRows(prevRows => {
            const newRows = [...prevRows];
            savedNewTrades.forEach(savedTrade => {
              const index = newRows.findIndex(row =>
                row.id && row.id.toString().startsWith('temp_') &&
                row.date === savedTrade.date &&
                row.time === savedTrade.time
              );
              if (index !== -1) {
                newRows[index] = {
                  ...savedTrade,
                  sessionId: savedTrade.session?._id || savedTrade.sessionId,
                  session: savedTrade.session?.sessionName || savedTrade.session
                };
              }
            });
            return newRows;
          });
        }
      }

      // Update existing trades that were edited
      const editedTrades = existingTrades.filter(trade => editingRows.has(trade.id));
      if (editedTrades.length > 0) {
        console.log('Updating existing trades:', editedTrades.length);
        for (const trade of editedTrades) {
          console.log('Updating trade:', {
            id: trade.id,
            hasImage: !!trade.image,
            imageName: trade.imageName
          });
          await axios.put(`/api/trades/${trade.id}`, trade);
          await axios.put(`/api/trades/${trade.id}`, {
            ...trade,
            sessionId: trade.sessionId
          }, config);
        }
      }

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

  // Statistics calculations
  const totalPnL = rows.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winningTrades = rows.filter(t => t.pnl && t.pnl > 0).length;
  const totalTradesWithPnL = rows.filter(t => t.pnl !== null && t.pnl !== undefined && t.pnl !== 0).length;
  const winRate = totalTradesWithPnL > 0 ? (winningTrades / totalTradesWithPnL) * 100 : 0;
  const avgRFactor = rows.filter(t => t.rFactor).length > 0
    ? rows.reduce((sum, t) => sum + (t.rFactor || 0), 0) / rows.filter(t => t.rFactor).length
    : 0;

  // Group trades by time periods
  const groupedTrades = groupTradesByTime(rows);
  
  // Get sorted groups for rendering - always show both week and month separations
  const getSortedGroups = () => {
    const weekGroups = Object.values(groupedTrades.weeks);
    const monthGroups = Object.values(groupedTrades.months);
    
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

  const { weekGroups, monthGroups } = getSortedGroups();

  // Import/export logic
  const handleExport = () => {
    const csvHeaders = columns.map(col => getColumnHeader(col)).join(',');
    const csvRows = rows.map(row =>
      columns.map(col => {
        const value = row[col] ?? '';
        // Escape quotes and wrap in quotes if contains comma
        return typeof value === 'string' && value.includes(',')
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    ).join('\n');

    const csvContent = csvHeaders + '\n' + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trading-journal-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result);
          if (Array.isArray(importedData)) {
            setRows(importedData);
            setHasUnsavedChanges(true);
          } else {
            alert('Invalid file format. Please select a valid trading journal JSON file.');
          }
        } catch (error) {
          alert('Error reading file. Please make sure it\'s a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const handleChange = (idx, field, value) => {
    const row = rows[idx];

    // Check if this is an existing trade being edited
    if (editMode && row.id && !row.id.toString().startsWith('temp_')) {
      setEditingRows(prev => new Set(prev.add(row.id)));
    }

    let updated = rows.map((row, i) => {
      if (i !== idx) return row;
      
      // Special handling for session selection
      if (field === 'session') {
        const selectedSession = sessions.find(s => s._id === value);
        return { 
          ...row, 
          sessionId: value,
          session: selectedSession?.sessionName || '',
          // Auto-fill pair if session has one
          pair: row.pair || selectedSession?.pair || ''
        };
      }
      
      return { ...row, [field]: value };
    });
    
    setRows(updated);
    setHasUnsavedChanges(true);
  };

  const addRow = () => {
    const now = new Date();
    const newTrade = {
      ...initialTrade,
      id: `temp_${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setRows([...rows, newTrade]); // Add to end
    setHasUnsavedChanges(true);
  };

  const removeRow = async (idx) => {
    const tradeToDelete = rows[idx];

    // If it's an existing trade (not a temp one), delete from database
    if (tradeToDelete?.id && !tradeToDelete.id.toString().startsWith('temp_')) {
      try {
        const token = await getToken();
        await axios.delete(`/api/trades/${tradeToDelete.id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        console.log('Trade deleted successfully');
      } catch (err) {
        console.error("Delete error:", err);
        handleAxiosError(err, 'Failed to delete trade');
        return;
      }
    }

    setRows(rows.filter((_, i) => i !== idx));
    setHasUnsavedChanges(true);
  };

  // Refresh data
  const refreshData = async () => {
    await Promise.all([fetchSessions(), fetchTrades()]);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1623] via-[#102030] to-[#12263a] p-4 sm:p-6 custom-scrollbar">
      {/* Hero Section - Responsive and Themed */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-3 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-[#0b4b8f] via-[#102636] to-[#1fb67a] shadow-xl border border-blue-900/40">
          <div className="flex flex-row items-center gap-3">
            {/* Trade Logo/Icon */}
            <img src="/favicon.svg" alt="Trade Logo" className="w-10 h-10 object-contain rounded-xl border border-blue-900/30 bg-[#102636] mr-2" />
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-white tracking-wide">Trading Journal</h1>
              <p className="text-base text-[#7a8aa3]">Track and analyze your trading performance</p>
            </div>
          </div>
          {/* Optionally, you can add the journal image back if needed */}
          {/* <img src="/assets/trading-journal.png" alt="Trading Journal" className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl border border-blue-900/30 bg-[#102636]" /> */}
        </div>
        {/* Header Action Buttons - Small, Properly Aligned */}
        <div className="flex flex-row flex-wrap items-center justify-end gap-3 mt-4">
          {/* Transparent, medium-sized, themed action cards */}
          <div className="flex items-center gap-3">
            <button onClick={refreshData} disabled={loading || sessionsLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-blue-700 bg-blue-900/40 text-blue-200 hover:bg-blue-800/60 hover:text-white transition-all disabled:opacity-50 text-sm shadow-lg min-w-[120px] justify-center backdrop-blur-md">
              <RefreshCw className="w-5 h-5" /> Refresh
            </button>
            <button onClick={toggleEditMode} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-green-700 ${editMode ? 'bg-green-600/40 text-white' : 'bg-green-900/30 text-green-300 hover:bg-green-600/60 hover:text-white'} transition-all text-sm shadow-lg min-w-[120px] justify-center backdrop-blur-md`}>
              <Edit3 className="w-5 h-5" /> Edit
            </button>
            <button onClick={handleSave} disabled={saving || !hasUnsavedChanges} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-yellow-500 ${hasUnsavedChanges ? 'bg-yellow-600/40 text-white' : 'bg-yellow-900/30 text-yellow-300'} transition-all disabled:opacity-50 text-sm shadow-lg min-w-[120px] justify-center backdrop-blur-md`}>
              <Save className="w-5 h-5" /> Save
            </button>
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl font-bold border border-blue-700 bg-blue-900/40 text-blue-200 hover:bg-blue-800/60 hover:text-white text-sm shadow-lg min-w-[120px] justify-center backdrop-blur-md">
              <Upload className="w-5 h-5" /> Import
              <input type="file" accept=".json,.csv" onChange={handleImport} className="hidden" />
            </label>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-blue-700 bg-blue-900/40 text-blue-200 hover:bg-blue-800/60 hover:text-white text-sm shadow-lg min-w-[120px] justify-center backdrop-blur-md">
              <Download className="w-5 h-5" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Header Actions & Metrics - Responsive and Themed */}
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Metrics Cards - Transparent, medium-sized, themed */}
        <div className="col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Trades */}
          <div className="rounded-xl p-5 flex flex-col gap-2 items-center justify-between shadow-xl w-full bg-blue-900/30 border border-blue-700 min-w-[180px] max-w-[240px] mx-auto backdrop-blur-md transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:bg-blue-900/50">
            <Calculator className="w-6 h-6 text-blue-300 mb-2" />
            <span className="text-base font-bold text-white">Total Trades</span>
            <span className="text-xl font-extrabold text-green-400">{rows.filter(r => r.date || r.pnl).length}</span>
            <span className="text-xs text-blue-200">{sessions.length} sessions available</span>
          </div>
          {/* Win Rate */}
          <div className="rounded-xl p-5 flex flex-col gap-2 items-center justify-between shadow-xl w-full bg-green-900/30 border border-green-700 min-w-[180px] max-w-[240px] mx-auto backdrop-blur-md transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:bg-green-900/50">
            <TrendingUp className="w-6 h-6 text-green-300 mb-2" />
            <span className="text-base font-bold text-white">Win Rate</span>
            <span className="text-xl font-extrabold text-green-400">{winRate.toFixed(1)}%</span>
            <span className="text-xs text-green-200">{winningTrades} wins / {totalTradesWithPnL-winningTrades} losses</span>
          </div>
          {/* Total PnL */}
          <div className="rounded-xl p-5 flex flex-col gap-2 items-center justify-between shadow-xl w-full bg-yellow-900/30 border border-yellow-700 min-w-[180px] max-w-[240px] mx-auto backdrop-blur-md transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:bg-yellow-900/50">
            <BarChart3 className="w-6 h-6 text-yellow-300 mb-2" />
            <span className="text-base font-bold text-white">Total PnL</span>
            <span className="text-xl font-extrabold text-yellow-400">{totalPnL.toFixed(2)}</span>
            <span className="text-xs text-yellow-200">Avg: {(totalTradesWithPnL>0?(totalPnL/totalTradesWithPnL):0).toFixed(2)} per trade</span>
          </div>
          {/* Avg R Factor */}
          <div className="rounded-xl p-5 flex flex-col gap-2 items-center justify-between shadow-xl w-full bg-purple-900/30 border border-purple-700 min-w-[180px] max-w-[240px] mx-auto backdrop-blur-md transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:bg-purple-900/50">
            <Calculator className="w-6 h-6 text-purple-300 mb-2" />
            <span className="text-base font-bold text-white">Avg R Factor</span>
            <span className="text-xl font-extrabold text-purple-400">{avgRFactor.toFixed(2)}</span>
            <span className="text-xs text-purple-200">Risk management metric</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
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

        {/* Error State */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Session Status */}
        {!sessionsLoading && sessions.length === 0 && (
          <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-300">
                No trading sessions found. Create sessions in the backtest page to organize your trades better.
              </p>
            </div>
          </div>
        )}

        {/* Table - Monthly section with weekly breakdown, interactive features */}
        {!loading && (
      <div className="overflow-x-auto rounded-2xl shadow-2xl border border-blue-500/30 bg-slate-900/80 backdrop-blur-xl custom-scrollbar">
            {monthGroups.map((monthGroup, monthIdx) => {
              // Group trades in this month by week
              const weeks = {};
              monthGroup.trades.forEach(trade => {
                const weekInfo = getWeekInfo(trade.date);
                if (!weeks[weekInfo.weekKey]) {
                  weeks[weekInfo.weekKey] = {
                    ...weekInfo,
                    trades: []
                  };
                }
                weeks[weekInfo.weekKey].trades.push(trade);
              });
              const sortedWeeks = Object.values(weeks).sort((a, b) => {
                const dateA = new Date(a.trades[0]?.date || 0);
                const dateB = new Date(b.trades[0]?.date || 0);
                return dateA - dateB;
              });
              const monthTitle = `${getMonthName(monthGroup.month)} ${monthGroup.year}`;
              const monthDateRange = { start: new Date(monthGroup.year, monthGroup.month - 1, 1), end: new Date(monthGroup.year, monthGroup.month, 0) };
              const monthDateRangeText = formatDateRange(monthDateRange.start, monthDateRange.end);
              const monthWinRate = monthGroup.totalTrades > 0 ? (monthGroup.winCount / monthGroup.totalTrades) * 100 : 0;
              return (
                <div key={monthGroup.monthKey} className="mb-8">
                  {/* Month Header */}
                  <div className="flex items-center justify-between py-4 px-6 bg-gradient-to-r from-purple-800/40 to-purple-600/30 border-b-2 border-purple-500/50 shadow-lg rounded-t-xl">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-purple-600/50 border-purple-400/30 rounded-full border">
                        <Calendar className="w-5 h-5 text-purple-200" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold tracking-wide text-white">{monthTitle}</h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <p className="font-medium text-purple-200">{monthDateRangeText}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2 bg-slate-800/40 border-purple-500/20 px-3 py-2 rounded-lg border">
                        <span className="text-gray-300">Trades:</span>
                        <span className="font-bold text-purple-300">{monthGroup.trades.length}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-slate-800/40 border-purple-500/20 px-3 py-2 rounded-lg border">
                        <span className="text-gray-300">Win Rate:</span>
                        <span className={`font-bold ${monthWinRate >= 50 ? 'text-green-300' : 'text-red-300'}`}>{monthWinRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-slate-800/40 border-purple-500/20 px-3 py-2 rounded-lg border">
                        <span className="text-gray-300">PnL:</span>
                        <span className={`font-bold ${monthGroup.totalPnL >= 0 ? 'text-green-300' : 'text-red-300'}`}>{monthGroup.totalPnL.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Interactive Table for Trades in Month (with weekly breakdown) */}
                  <div className="overflow-x-auto bg-slate-900/80 rounded-b-xl">
                    {sortedWeeks.map((weekGroup, weekIdx) => (
                      <div key={weekGroup.weekKey} className="mb-4">
                        {/* Week summary inside month - fully align with table width and optimize UI */}
                        <div className="overflow-x-auto">
                          <div className="min-w-full flex items-center py-2 px-6 bg-gradient-to-r from-blue-900/80 to-blue-700/60 border-b border-blue-500/30 rounded-t-lg">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-600/50 border-blue-400/30 rounded-full border">
                                <Clock className="w-4 h-4 text-blue-200" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold tracking-wide text-white">Week {weekGroup.week}, {weekGroup.year}</h4>
                                <div className="flex items-center space-x-4 text-xs">
                                  <p className="font-medium text-blue-200">{formatDateRange(getWeekDateRange(weekGroup.year, weekGroup.week).start, getWeekDateRange(weekGroup.year, weekGroup.week).end)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Interactive Table for Trades in Week */}
                        <table className="min-w-full text-xs md:text-sm lg:text-base">
                          <thead>
                            <tr className="bg-gradient-to-r from-blue-900/80 to-blue-700/60 text-white">
                              {columns.map(col => (
                                <th key={col} className="py-2 px-2 font-semibold border-b border-blue-500/30 whitespace-nowrap text-center cursor-pointer hover:bg-blue-700/30" title={`Sort by ${getColumnHeader(col)}`}>{getColumnHeader(col)}</th>
                              ))}
                              <th className="py-2 px-2 font-semibold border-b border-blue-500/30 whitespace-nowrap text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {weekGroup.trades.map((row, idx) => {
                              const isEditable = isRowEditable(row);
                              const isBeingEdited = editingRows.has(row.id);
                              const isNewRow = !row.id || row.id.toString().startsWith('temp_');
                              const globalIdx = rows.findIndex(r => r.id === row.id);
                              return (
                                <tr key={row.id || idx} className={`hover:bg-blue-800/20 transition-all border-l-4 border-l-blue-500/20 ${isBeingEdited ? 'bg-yellow-900/20 border-l-yellow-500/50' : isNewRow ? 'bg-green-900/10 border-l-green-500/50' : ''}`}>
                                  {columns.map(col => (
                                    <td key={col} className="py-2 px-2 border-b border-blue-500/20 border-r border-blue-500/10">
                                      {/* ...existing cell rendering code... */}
                                      {getCellType(col) === 'psychology' ? (
                                        <div className="w-20 text-center">
                                          {row[col] ? (
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${row[col] <= 3 ? 'bg-red-900/50 text-red-300' : row[col] <= 6 ? 'bg-yellow-900/50 text-yellow-300' : 'bg-green-900/50 text-green-300'}`}>{row[col]}/10</span>
                                          ) : (
                                            <span className="text-gray-500 text-xs">-</span>
                                          )}
                                        </div>
                                      ) : getCellType(col) === 'date' ? (
                                        <input type="date" value={row[col] ?? ''} onChange={e => handleChange(globalIdx, col, e.target.value)} disabled={!isEditable} className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-slate-800/60 text-white border-blue-700/30' : 'bg-gray-700/30 text-gray-400 border-gray-600/30 cursor-not-allowed'}`} />
                                      ) : getCellType(col) === 'dropdown' ? (
                                        col === 'session' ? (
                                          <select value={row.sessionId ?? ''} onChange={e => handleChange(globalIdx, 'session', e.target.value)} disabled={!isEditable} className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-slate-800/60 text-white border-blue-700/30' : 'bg-gray-700/30 text-gray-400 border-gray-600/30 cursor-not-allowed'}`}>
                                            <option value="">Select Session</option>
                                            {sessions.map(session => (
                                              <option key={session._id} value={session._id}>{session.sessionName} ({session.pair})</option>
                                            ))}
                                          </select>
                                        ) : (
                                          <select value={row[col] ?? ''} onChange={e => handleChange(globalIdx, col, e.target.value)} disabled={!isEditable} className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-slate-800/60 text-white border-blue-700/30' : 'bg-gray-700/30 text-gray-400 border-gray-600/30 cursor-not-allowed'}`}>
                                            <option value="">Select</option>
                                            {getDropdownOptions(col, sessions).map(option => (
                                              typeof option === 'object' ? (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                              ) : (
                                                <option key={option} value={option}>{option}</option>
                                              )
                                            ))}
                                          </select>
                                        )
                                      ) : getCellType(col) === 'number' ? (
                                        <input type="number" step="0.01" value={row[col] ?? ''} onChange={e => handleChange(globalIdx, col, e.target.value === '' ? null : Number(e.target.value))} disabled={!isEditable} className={`w-24 md:w-28 lg:w-32 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-slate-800/60 text-white border-blue-700/30' : 'bg-gray-700/30 text-gray-400 border-gray-600/30 cursor-not-allowed'}`} />
                                      ) : col === 'notes' ? (
                                        <textarea value={row[col] ?? ''} onChange={e => handleChange(globalIdx, col, e.target.value)} disabled={!isEditable} className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border resize-none transition-all duration-300 focus:h-24 hover:h-20 ${isEditable ? 'bg-slate-800/60 text-white border-blue-700/30' : 'bg-gray-700/30 text-gray-400 border-gray-600/30 cursor-not-allowed'}`} rows={1} />
                                      ) : getCellType(col) === 'image' ? (
                                        <ImageUpload value={row[col] ?? ''} onChange={(imageUrl, fileName) => { handleChange(globalIdx, col, imageUrl); handleChange(globalIdx, 'imageName', fileName || ''); }} disabled={!isEditable} className="w-32 md:w-36 lg:w-40" />
                                      ) : (
                                        <input type="text" value={row[col] ?? ''} onChange={e => handleChange(globalIdx, col, e.target.value)} disabled={!isEditable} className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-slate-800/60 text-white border-blue-700/30' : 'bg-gray-700/30 text-gray-400 border-gray-600/30 cursor-not-allowed'}`} />
                                      )}
                                    </td>
                                  ))}
                                  <td className="py-2 px-2 border-b border-blue-500/20 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                      {isNewRow && (<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="New trade"></div>)}
                                      {isBeingEdited && (<div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Being edited"></div>)}
                                      <button disabled={!isEditable} onClick={() => openModelPage(row.id)} className={`${isEditable ? 'text-blue-500 hover:text-blue-700 transition-colors' : 'text-blue-700/30 cursor-not-allowed'}`} title="Open psychology ratings"><Brain className="w-5 h-5" /></button>
                                      <button onClick={() => (row.image || row.uploadedImage) && openImageViewer(row.image || row.uploadedImage, row.imageName || row.uploadedImageName)} className={(row.image || row.uploadedImage) ? "text-green-500 hover:text-green-700 transition-colors" : "text-gray-500 cursor-not-allowed opacity-50 transition-colors"} title={(row.image || row.uploadedImage) ? "View uploaded image" : "No image uploaded"} disabled={!(row.image || row.uploadedImage)}><CiImageOn className="w-5 h-5" /></button>
                                      <button onClick={() => removeRow(globalIdx)} className="text-red-500 hover:text-red-700 transition-colors" title="Remove row"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Row Button */}
        {!loading && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-400">
              {rows.filter(r => r.date || r.pnl).length} trades • {sessions.length} sessions available
            </div>
            <button
              onClick={addRow}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all font-bold text-lg"
            >
              <Plus className="w-6 h-6" />
              <span>Add Trade</span>
            </button>
          </div>
        )}
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
    </div>
  );
}
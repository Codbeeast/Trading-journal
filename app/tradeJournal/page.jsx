"use client";

import React, { useState, useEffect } from "react";
import { Plus, Download, Upload, Trash2, BarChart3, TrendingUp, Calculator, Save, CheckCircle, Brain, AlertCircle, Edit3, X, Image } from 'lucide-react';
import { CiImageOn } from "react-icons/ci";
import axios from "axios";
import ModelPage from '@/components/ModalPage'; // Adjust path as needed
import { ImageUpload } from '@/components/ImageUpload';
import { ImageViewer } from '@/components/ImageViewer';

/**
 * @typedef {Object} TradeEntry
 * @property {string} id
 * @property {string} date
 * @property {string} time
 * @property {string} session
 * @property {string} pair
 * @property {string} buySell
 * @property {string} setupType
 * @property {string} entryType
 * @property {string} timeFrameUsed
 * @property {string} trailWorked
 * @property {string} imageOfPlay
 * @property {string} linkToPlay
 * @property {string} uploadedImage
 * @property {string} uploadedImageName
 * @property {number|null} entryPrice
 * @property {number|null} exitPrice
 * @property {number|null} pipsLostCaught
 * @property {number|null} pnl
 * @property {number|null} riskPerTrade
 * @property {number|null} rFactor
 * @property {string} typeOfTrade
 * @property {string} entryModel
 * @property {string} confluences
 * @property {string} rulesFollowed
 * @property {string} tfUsed
 * @property {number} fearToGreed
 * @property {number} fomoRating
 * @property {number} executionRating
 * @property {string} imagePosting
 * @property {string} notes
 */

const initialTrade = {
  date: '',
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  session: '',
  pair: '',
  buySell: '',
  setupType: '',
  entryType: '',
  timeFrameUsed: '',
  trailWorked: '',
  imageOfPlay: '',
  linkToPlay: '',
  uploadedImage: '',
  uploadedImageName: '',
  entryPrice: null,
  exitPrice: null,
  pipsLostCaught: null,
  pnl: null,
  riskPerTrade: null,
  rFactor: null,
  typeOfTrade: '',
  entryModel: '',
  confluences: '',
  rulesFollowed: '',
  tfUsed: '',
  imagePosting: '',
  notes: ''
};

const columns = [
  "date", "time", "session", "pair", "buySell", "setupType", "entryType", "timeFrameUsed", "trailWorked", "imageOfPlay", "linkToPlay", "uploadedImage", "entryPrice", "exitPrice", "pipsLostCaught", "pnl", "riskPerTrade", "rFactor", "typeOfTrade", "entryModel", "confluences", "rulesFollowed", "tfUsed", "fearToGreed", "fomoRating", "executionRating", "imagePosting", "notes"
];

const DROPDOWN_OPTIONS = {
  sessions: ['New York', 'London', 'Pre NY', 'Asian', 'Frankfurt', 'Tokyo'],
  pairs: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'NZD/USD', 'USD/CHF', 'USD/CAD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'],
  buySell: ['Buy', 'Sell'],
  setupTypes: ['Breakout', 'Range', 'Trend', 'Mixed', 'Other'],
  entryTypes: ['Entry', 'Exit', 'Other'],
  timeFrames: ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN'],
  trailWorked: ['Yes', 'No'],
  typeOfTrade: ['Long', 'Short', 'Both'],
  entryModels: ['Model A', 'Model B', 'Model C', 'Other'],
  rulesFollowed: ['Yes', 'No'],
  imagePosting: ['Yes', 'No'],
};

const getDropdownOptions = (field) => {
  switch (field) {
    case 'session': return DROPDOWN_OPTIONS.sessions;
    case 'pair': return DROPDOWN_OPTIONS.pairs;
    case 'buySell': return DROPDOWN_OPTIONS.buySell;
    case 'setupType': return DROPDOWN_OPTIONS.setupTypes;
    case 'entryType': return DROPDOWN_OPTIONS.entryTypes;
    case 'timeFrameUsed': return DROPDOWN_OPTIONS.timeFrames;
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
    buySell: 'Buy/Sell',
    setupType: 'Setup Type',
    entryType: 'Entry Type',
    timeFrameUsed: 'TF Used',
    trailWorked: 'Trail Worked',
    imageOfPlay: 'Image of Play',
    linkToPlay: 'Link to Play',
    uploadedImage: 'Upload Image',
    entryPrice: 'Entry Price',
    exitPrice: 'Exit Price',
    pipsLostCaught: 'Pips L/C',
    pnl: 'PnL',
    riskPerTrade: 'Risk/Trade',
    rFactor: 'R Factor',
    typeOfTrade: 'Trade Type',
    entryModel: 'Entry Model',
    confluences: 'Confluences',
    rulesFollowed: 'Rules Followed',
    tfUsed: 'TF Used',
    fearToGreed: 'Fear/Greed',
    fomoRating: 'FOMO',
    executionRating: 'Execution',
    imagePosting: 'Image Post',
    notes: 'Notes'
  };
  return headers[field];
};

const getCellType = (field) => {
  if (field === 'date') return 'date';
  if (field === 'time') return 'time';
  if (field === 'uploadedImage') return 'image';
  if ([
    'entryPrice', 'exitPrice', 'pipsLostCaught', 'pnl', 'riskPerTrade', 'rFactor'
  ].includes(field)) {
    return 'number';
  }
  if ([
    'session', 'pair', 'buySell', 'setupType', 'entryType', 'timeFrameUsed', 'trailWorked', 'typeOfTrade', 'entryModel', 'rulesFollowed', 'imagePosting'
  ].includes(field)) {
    return 'dropdown';
  }
  // Psychology ratings are display-only
  if (['fearToGreed', 'fomoRating', 'executionRating'].includes(field)) {
    return 'psychology';
  }
  return 'text';
};

// Auto-select session based on time
const getSessionFromTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const sessions = {
    'Asian': { start: 0, end: 480 }, // 00:00 - 08:00
    'Frankfurt': { start: 480, end: 600 }, // 08:00 - 10:00
    'London': { start: 600, end: 960 }, // 10:00 - 16:00
    'Pre NY': { start: 960, end: 1020 }, // 16:00 - 17:00
    'NY': { start: 1020, end: 1440 } // 17:00 - 24:00
  };
  for (const [session, times] of Object.entries(sessions)) {
    if (totalMinutes >= times.start && totalMinutes < times.end) {
      return session;
    }
  }
  return 'Asian'; // Default fallback
};



export default function TradeJournal() {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch existing trades from database
  const fetchTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/trades');

      if (response.data && Array.isArray(response.data)) {
        // Sort trades by date and time (newest first)
        const sortedTrades = response.data.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateB - dateA;
        });

        setRows(sortedTrades.length > 0 ? sortedTrades : [{ ...initialTrade }]);
      } else {
        setRows([{ ...initialTrade }]);
      }
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError('Failed to load trades from database');
      setRows([{ ...initialTrade }]);
    } finally {
      setLoading(false);
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
        await axios.put(`/api/trades/${updatedTrade.id}`, updatedTrade);

      }

      // Update the local state
      setRows(prevRows =>
        prevRows.map(row =>
          row.id === updatedTrade.id ? updatedTrade : row
        )
      );

      setSelectedTrade(updatedTrade);

    } catch (error) {
      console.error('Error saving model ratings:', error);
      throw error;
    }
  };
  // Load data on component mount
  useEffect(() => {
    fetchTrades();
  }, []);

  // Manual save function
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Separate new trades from existing ones
      const newTrades = rows.filter(trade =>
        !trade.id || trade.id.toString().startsWith('temp_')
      ).filter(trade => {
        return trade.date || trade.pair || trade.entryPrice || trade.exitPrice || trade.pnl;
      });

      const existingTrades = rows.filter(trade =>
        trade.id && !trade.id.toString().startsWith('temp_')
      );

      // Log image data for debugging
      const tradesWithImages = rows.filter(trade => trade.uploadedImage);
      if (tradesWithImages.length > 0) {
        console.log('Trades with images to save:', tradesWithImages.length);
        tradesWithImages.forEach((trade, index) => {
          console.log(`Trade ${index + 1}:`, {
            id: trade.id,
            hasImage: !!trade.uploadedImage,
            imageName: trade.uploadedImageName,
            imageLength: trade.uploadedImage ? trade.uploadedImage.length : 0
          });
        });
      }

      // Save new trades
      if (newTrades.length > 0) {
        const newTradesData = newTrades.map(trade => ({
          ...trade,
          id: undefined
        }));

        console.log('Saving new trades with data:', newTradesData.map(t => ({
          date: t.date,
          hasImage: !!t.uploadedImage,
          imageName: t.uploadedImageName
        })));

        const response = await axios.post('/api/trades', { trades: newTradesData });

        if (response.data && response.data.trades) {
          // Update rows with returned IDs for new trades
          const savedNewTrades = response.data.trades;
          console.log('New trades saved successfully:', savedNewTrades.length);
          setRows(prevRows => {
            const newRows = [...prevRows];
            savedNewTrades.forEach(savedTrade => {
              const index = newRows.findIndex(row =>
                row.id && row.id.toString().startsWith('temp_') &&
                row.date === savedTrade.date &&
                row.time === savedTrade.time
              );
              if (index !== -1) {
                newRows[index] = savedTrade;
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
            hasImage: !!trade.uploadedImage,
            imageName: trade.uploadedImageName
          });
          await axios.put(`/api/trades/${trade.id}`, trade);
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
      setError('Failed to save trades. Please try again.');
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
  const totalTradesWithPnL = rows.filter(t => t.pnl !== null).length;
  const winRate = totalTradesWithPnL > 0 ? (winningTrades / totalTradesWithPnL) * 100 : 0;
  const avgRFactor = rows.filter(t => t.rFactor).length > 0
    ? rows.reduce((sum, t) => sum + (t.rFactor || 0), 0) / rows.filter(t => t.rFactor).length
    : 0;

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

  const handleImport = (event) => {
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
      // If time is changed, auto-update session
      if (field === 'time') {
        const session = getSessionFromTime(value);
        return { ...row, [field]: value, session };
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
    setRows([...rows, newTrade]);
    setHasUnsavedChanges(true);
  };

  const removeRow = async (idx) => {
    const tradeToDelete = rows[idx];

    // If it's an existing trade (not a temp one), delete from database
    if (tradeToDelete?.id && !tradeToDelete.id.toString().startsWith('temp_')) {
      try {
        await axios.delete(`/api/trades/${tradeToDelete.id}`);
      } catch (err) {
        console.error("Delete error:", err);
        setError('Failed to delete trade from database');
        return;
      }
    }

    setRows(rows.filter((_, i) => i !== idx));
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1623] via-[#102030] to-[#12263a] p-6">
      {/* Dynamic Navbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border-b border-blue-500/30 rounded-2xl px-6 py-4 mb-8 shadow-xl">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-7 h-7 text-blue-600" />
          <span className="text-lg font-bold text-white">Trading Journal</span>
        </div>
        <div className="flex items-center space-x-6 flex-wrap">
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-300">Full Risk = 1-2% of account size</span>
          </div>

          {/* Edit Mode Toggle */}
          <button
            onClick={toggleEditMode}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${editMode
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            {editMode ? (
              <>
                <X className="w-4 h-4" />
                <span>Cancel Edit</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </>
            )}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${saving
              ? 'bg-yellow-600 text-white cursor-not-allowed'
              : hasUnsavedChanges
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
              </>
            )}
          </button>

          {/* Save Status */}
          <div className="flex items-center space-x-2">
            {editMode && editingRows.size > 0 && (
              <span className="text-xs text-yellow-400">
                Editing {editingRows.size} record{editingRows.size !== 1 ? 's' : ''}
              </span>
            )}
            {showSaveIndicator ? (
              <span className="text-xs text-green-400 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Saved successfully!
              </span>
            ) : lastSaved ? (
              <span className="text-xs text-gray-400">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            ) : hasUnsavedChanges ? (
              <span className="text-xs text-yellow-400 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Unsaved changes
              </span>
            ) : null}
            {/* Image save indicator */}
            {rows.some(row => row.uploadedImage) && (
              <span className="text-xs text-blue-400 flex items-center">
                <CiImageOn className="w-3 h-3 mr-1" />
                {rows.filter(row => row.uploadedImage).length} image{rows.filter(row => row.uploadedImage).length !== 1 ? 's' : ''} ready to save
              </span>
            )}
          </div>

          <label className="flex items-center space-x-1 cursor-pointer text-xs text-blue-400 hover:text-blue-200">
            <Upload className="w-4 h-4" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button onClick={handleExport} className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-200">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-300">Total Trades:</span>
            <span className="font-semibold text-blue-400">{rows.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-300">Win Rate:</span>
            <span className={`font-semibold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{winRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-300">Total PnL:</span>
            <span className={`font-semibold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totalPnL.toFixed(2)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-300">Avg R-Factor:</span>
            <span className="font-semibold text-purple-400">{avgRFactor.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Edit Mode Indicator */}
        {editMode && (
          <div className="bg-blue-900/50 border border-blue-400 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-blue-400" />
              <p className="text-blue-300">
                Edit mode is active. You can now modify existing trade records. Click &quot;Cancel Edit&quot; to exit without saving.
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
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="overflow-x-auto rounded-2xl shadow-2xl border border-blue-500/30 bg-slate-900/80 backdrop-blur-xl hide-scrollbar">
            <table className="min-w-full text-xs md:text-sm lg:text-base">
              <thead>
                <tr className="bg-gradient-to-r from-blue-900/80 to-blue-700/60 text-white">
                  {columns.map(col => (
                    <th key={col} className="py-3 px-2 font-semibold border-b border-blue-500/30 whitespace-nowrap text-center">
                      {getColumnHeader(col)}
                    </th>
                  ))}
                  <th className="py-3 px-2 font-semibold border-b border-blue-500/30 whitespace-nowrap text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const isEditable = isRowEditable(row);
                  const isBeingEdited = editingRows.has(row.id);

                  return (
                    <tr key={row.id || idx} className={`hover:bg-blue-800/20 transition-all ${isBeingEdited ? 'bg-yellow-900/20' : ''}`}>
                      {columns.map(col => (
                        <td key={col} className="py-2 px-2 border-b border-blue-500/10">
                          {getCellType(col) === 'psychology' ? (
                            <div className="w-20 text-center">
                              {row[col] ? (
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${row[col] <= 3 ? 'bg-red-900/50 text-red-300' :
                                  row[col] <= 6 ? 'bg-yellow-900/50 text-yellow-300' :
                                    'bg-green-900/50 text-green-300'
                                  }`}>
                                  {row[col]}/10
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs">-</span>
                              )}
                            </div>
                          ) : getCellType(col) === 'date' ? (
                            <input
                              type="date"
                              value={row[col] ?? ''}
                              onChange={e => handleChange(idx, col, e.target.value)}
                              disabled={!isEditable}
                              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable
                                ? 'bg-slate-800/60 text-white border-blue-700/30'
                                : 'bg-gray-700/30 text-gray-400 border-gray-600/30 cursor-not-allowed'
                                }`}
                            />
                          ) : getCellType(col) === 'dropdown' ? (
                            <select
                              value={row[col] ?? ''}
                              onChange={e => handleChange(idx, col, e.target.value)}
                              disabled={!isEditable}
                              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable
                                ? 'bg-slate-800/60 text-white border-blue-700/30'
                                : 'bg-gray-700/30 text-gray-400 border-gray-600/30 cursor-not-allowed'
                                }`}
                            >
                              <option value="">Select</option>
                              {getDropdownOptions(col).map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : getCellType(col) === 'number' ? (
                            <input
                              type="number"
                              value={row[col] ?? ''}
                              onChange={e => handleChange(idx, col, e.target.value === '' ? null : Number(e.target.value))}
                              disabled={!isEditable}
                              className={`w-24 md:w-28 lg:w-32 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable
                                ? 'bg-slate-800/60 text-white border-blue-700/30'
                                : 'bg-gray-700/30 text-gray-400 border-gray-600/30 cursor-not-allowed'
                                }`}
                            />
                          ) : col === 'notes' ? (
                            <textarea
                              value={row[col] ?? ''}
                              onChange={e => handleChange(idx, col, e.target.value)}
                              disabled={!isEditable}
                              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border resize-none transition-all duration-300 focus:h-24 hover:h-20 ${isEditable
                                ? 'bg-slate-800/60 text-white border-blue-700/30'
                                : 'bg-gray-700/30 text-gray-400 border-gray-600/30 cursor-not-allowed'
                                }`}
                              rows={1}
                            />
                          ) : getCellType(col) === 'image' ? (
                            <ImageUpload
                              value={row[col] ?? ''}
                              onChange={(imageUrl, fileName) => {
                                handleChange(idx, col, imageUrl);
                                handleChange(idx, 'uploadedImageName', fileName || '');
                              }}
                              disabled={!isEditable}
                              className="w-32 md:w-36 lg:w-40"
                            />
                          ) : (
                            <input
                              type="text"
                              value={row[col] ?? ''}
                              onChange={e => handleChange(idx, col, e.target.value)}
                              disabled={!isEditable}
                              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable
                                ? 'bg-slate-800/60 text-white border-blue-700/30'
                                : 'bg-gray-700/30 text-gray-400 border-gray-600/30 cursor-not-allowed'
                                }`}
                            />
                          )}
                        </td>
                      ))}
                      <td className="py-2 px-2 border-b border-blue-500/10 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {isBeingEdited && (
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Being edited"></div>
                          )}
                          <button
                            disabled={!isEditable}
                            onClick={() => openModelPage(row.id)}
                            className={`${isEditable ? 'text-blue-500 hover:text-blue-700 transition-colors' : 'text-blue-700/30 border-blue-600/30 transition-colors cursor-not-allowed'}`}
                            title="Open psychology ratings"
                          >
                            <Brain className="w-6 h-6" />
                          </button>
                          {/* Always show the view image button, but disable if no image */}
                          <button
                            onClick={() => row.uploadedImage && openImageViewer(row.uploadedImage, row.uploadedImageName)}
                            className={row.uploadedImage
                              ? "text-green-500 hover:text-green-700 transition-colors"
                              : "text-gray-500 cursor-not-allowed opacity-50 transition-colors"
                            }
                            title={row.uploadedImage ? "View uploaded image" : "No image uploaded"}
                            disabled={!row.uploadedImage}
                          >
                            <CiImageOn className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => removeRow(idx)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Remove row"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Row Button */}
        {!loading && (
          <div className="flex justify-end mt-4">
            <button
              onClick={addRow}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all font-bold text-lg"
            >
              <Plus className="w-6 h-6" />
              <span>Add Row</span>
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

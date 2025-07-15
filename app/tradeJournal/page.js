"use client";
import React, { useState, useEffect } from "react";
import { Plus, Download, Upload, Trash2, BarChart3, TrendingUp, Calculator, Save, CheckCircle, Brain } from 'lucide-react';

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
  date: '', // SSR-safe, set on add
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
  fearToGreed: 5,
  fomoRating: 5,
  executionRating: 5,
  imagePosting: '',
  notes: ''
};

const columns = [
  "date", "time", "session", "pair", "buySell", "setupType", "entryType", "timeFrameUsed", "trailWorked", "imageOfPlay", "linkToPlay", "entryPrice", "exitPrice", "pipsLostCaught", "pnl", "riskPerTrade", "rFactor", "typeOfTrade", "entryModel", "confluences", "rulesFollowed", "tfUsed", "fearToGreed", "fomoRating", "executionRating", "imagePosting", "notes"
];

const DROPDOWN_OPTIONS = {
  sessions: ['NY', 'London', 'Pre NY', 'Asian', 'Frankfurt'],
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
  const [rows, setRows] = useState([{ ...initialTrade }]);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  useEffect(() => {
    if (rows.length > 0) {
      setLastSaved(new Date());
      setShowSaveIndicator(true);
      const timer = setTimeout(() => setShowSaveIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [rows]);

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
    const dataStr = JSON.stringify(rows, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `trading-journal-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
          } else {
            alert('Invalid file format. Please select a valid trading journal JSON file.');
          }
        } catch (error) {
          alert('Error reading file. Please make sure it\'s a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleChange = (idx, field, value) => {
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
  };

  const addRow = () => {
    const now = new Date();
    const newTrade = {
      ...initialTrade,
      id: Date.now().toString(),
      date: now.toISOString().split('T')[0], // Set to current date
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setRows([...rows, newTrade]);
  };
  const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx));

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
          <div className="flex items-center space-x-2">
            <Save className="w-4 h-4 text-gray-400" />
            {showSaveIndicator ? (
              <span className="text-xs text-green-400 flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Auto-saved</span>
            ) : lastSaved ? (
              <span className="text-xs text-gray-400">Last saved: {lastSaved.toLocaleTimeString()}</span>
            ) : null}
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
          <div className="flex items-center space-x-2">
            <Save className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Auto-save enabled</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto space-y-8">
       
        {/* Table */}
        <div className="overflow-x-auto rounded-2xl shadow-2xl border border-blue-500/30 bg-slate-900/80 backdrop-blur-xl">
          <table className="min-w-full text-xs md:text-sm lg:text-base">
            <thead>
              <tr className="bg-gradient-to-r from-blue-900/80 to-blue-700/60 text-white">
                {columns.map(col => (
                  <th key={col} className="py-3 px-2 font-semibold border-b border-blue-500/30 whitespace-nowrap text-center">
                    {getColumnHeader(col)}
                  </th>
                ))}
                <th className="py-3 px-2 font-semibold border-b border-blue-500/30 whitespace-nowrap text-center">Remove</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-800/20 transition-all">
                  {columns.map(col => (
                    <td key={col} className="py-2 px-2 border-b border-blue-500/10">
                      {getCellType(col) === 'date' ? (
                        <input
                          type="date"
                          value={row[col] ?? ''}
                          onChange={e => handleChange(idx, col, e.target.value)}
                          className="w-32 md:w-36 lg:w-40 bg-slate-800/60 text-white rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-blue-700/30"
                        />
                      ) : getCellType(col) === 'dropdown' ? (
                        <select
                          value={row[col] ?? ''}
                          onChange={e => handleChange(idx, col, e.target.value)}
                          className="w-32 md:w-36 lg:w-40 bg-slate-800/60 text-white rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-blue-700/30"
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
                          className="w-24 md:w-28 lg:w-32 bg-slate-800/60 text-white rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-blue-700/30"
                        />
                      ) : (
                        <input
                          type="text"
                          value={row[col] ?? ''}
                          onChange={e => handleChange(idx, col, e.target.value)}
                          className="w-32 md:w-36 lg:w-40 bg-slate-800/60 text-white rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-blue-700/30"
                        />
                      )}
                    </td>
                  ))}
                  <td className="py-2 px-2 border-b border-blue-500/10 text-center">
                    <button
                      onClick={() => removeRow(idx)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove row"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={addRow}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all font-bold text-lg"
          >
            <Plus className="w-6 h-6" />
            <span>Add Row</span>
          </button>
        </div>
      </div>
    </div>
  );
} 
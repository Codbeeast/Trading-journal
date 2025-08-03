'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Pencil, X, Check, AlertCircle, ChevronDown, Search, DollarSign } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

// --- Helper Data ---
const TRADING_PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'XAUUSD', 'BTCUSD', 'ETHUSD', 'US30'];
const TIMEFRAMES = ['1min', '5min', '15min', '1H', '4H', 'Daily', 'Weekly'];
const STRATEGY_TYPES = ['Swing', 'Intraday', 'Scalp'];
const SETUP_TYPES = ['Breakout', 'Reversal', 'Pullback', 'Trend Continuation', 'Liquidity Grab'];
const CONFLUENCES = ['Fibonacci', 'Order Block', 'Supply/Demand Zone', 'Trendline', 'Session Timing', 'News Filter'];
const ENTRY_TYPES = ['Candle Confirmation', 'Zone Breakout', 'Retest', 'Price Action Pattern', 'Instant Execution', 'Pending Order'];
const RISK_OPTIONS = ['0.25', '0.5', '1', '1.5', '2'];

// --- Reusable Components ---

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const Icon = type === 'success' ? Check : AlertCircle;

  return (
    <div className={`fixed top-5 right-5 ${bgColor} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-4 z-[100] animate-fade-in-down`}>
      <Icon size={24} />
      <span className="flex-1 font-medium">{message}</span>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
        <X size={18} />
      </button>
    </div>
  );
};

// Custom Multi-Select Dropdown Component
const MultiSelect = ({ label, options, selected, onChange, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelect = (option) => {
        const newSelected = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    return (
        <div className="relative" ref={ref}>
            <label className="block text-sm font-medium text-gray-300 mb-2">{label} *</label>
            <div onClick={() => setIsOpen(!isOpen)} className={`w-full p-4 bg-gray-700/50 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white flex justify-between items-center cursor-pointer`}>
                <span className="flex-1 truncate pr-2">
                    {selected.length > 0 ? selected.join(', ') : <span className="text-gray-400">Select options...</span>}
                </span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-gray-800">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 pl-10 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                            />
                        </div>
                    </div>
                    {filteredOptions.map(option => (
                        <div key={option} onClick={() => handleSelect(option)} className="p-3 hover:bg-blue-600/20 cursor-pointer flex items-center gap-3">
                            <input type="checkbox" readOnly checked={selected.includes(option)} className="form-checkbox h-4 w-4 bg-gray-700 border-gray-500 rounded text-blue-500 focus:ring-0" />
                            <span>{option}</span>
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{error}</p>}
        </div>
    );
};

// Confirmation Modal
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99]">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl max-w-md w-full animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="text-gray-400 mb-8">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all">
                        {cancelText}
                    </button>
                    <button onClick={onConfirm} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all">
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
export default function StrategyPage() {
  const { getToken, userId } = useAuth();

  const initialFormData = {
    strategyName: '',
    strategyType: '',
    strategyDescription: '',
    tradingPairs: [],
    timeframes: [],
    setupType: '',
    confluences: [],
    entryType: [],
    initialBalance: '',
    riskPerTrade: '',
    customRisk: '',
  };

  const [strategies, setStrategies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast(null);

  useEffect(() => {
    if (userId) fetchStrategies();
  }, [userId]);

  const fetchStrategies = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get('/api/strategies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStrategies(res.data);
    } catch (err) {
      handleAxiosError(err, 'Failed to fetch strategies');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.strategyName.trim()) newErrors.strategyName = 'Strategy name is required';
    if (!formData.strategyType) newErrors.strategyType = 'Strategy type is required';
    if (formData.tradingPairs.length === 0) newErrors.tradingPairs = 'Select at least one trading pair';
    if (formData.timeframes.length === 0) newErrors.timeframes = 'Select at least one timeframe';
    if (!formData.setupType) newErrors.setupType = 'Setup type is required';
    if (!formData.initialBalance || parseFloat(formData.initialBalance) <= 0) newErrors.initialBalance = 'A valid positive balance is required';
    if (!formData.riskPerTrade) newErrors.riskPerTrade = 'Risk per trade is required';
    if (formData.riskPerTrade === 'Custom' && (!formData.customRisk || parseFloat(formData.customRisk) <= 0)) {
        newErrors.riskPerTrade = 'Enter a valid custom risk percentage';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const token = await getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const riskValue = formData.riskPerTrade === 'Custom' ? parseFloat(formData.customRisk) : parseFloat(formData.riskPerTrade);
      
      // ✅ FIX: Ensure initialBalance is always a number before sending
      const submitData = {
        ...formData,
        initialBalance: parseFloat(formData.initialBalance),
        riskPerTrade: riskValue,
      };
      delete submitData.customRisk;

      if (editingId) {
        await axios.patch(`/api/strategies?id=${editingId}`, submitData, config);
        showToast('Strategy updated successfully!');
      } else {
        await axios.post('/api/strategies', submitData, config);
        showToast('Strategy created successfully!');
      }

      await fetchStrategies();
      handleCancelForm();

    } catch (err) {
      handleAxiosError(err, editingId ? 'Failed to update strategy' : 'Failed to create strategy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (strategy) => {
    const riskIsCustom = !RISK_OPTIONS.includes((strategy.riskPerTrade || '').toString());
    setFormData({
        strategyName: strategy.strategyName || '',
        strategyType: strategy.strategyType || '',
        strategyDescription: strategy.strategyDescription || '',
        tradingPairs: strategy.tradingPairs || [],
        timeframes: strategy.timeframes || [],
        setupType: strategy.setupType || '',
        confluences: strategy.confluences || [],
        entryType: strategy.entryType || [],
        initialBalance: (strategy.initialBalance || '').toString(),
        riskPerTrade: riskIsCustom ? 'Custom' : (strategy.riskPerTrade || '').toString(),
        customRisk: riskIsCustom ? (strategy.riskPerTrade || '').toString() : '',
    });
    setEditingId(strategy._id);
    setShowForm(true);
    setErrors({});
  };

  const openDeleteModal = (id) => {
      setDeleteModal({ isOpen: true, id });
  };

  const closeDeleteModal = () => {
      setDeleteModal({ isOpen: false, id: null });
  };

  const handleDelete = async () => {
    const id = deleteModal.id;
    if (!id) return;

    try {
      const token = await getToken();
      await axios.delete(`/api/strategies?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStrategies((prev) => prev.filter((s) => s._id !== id));
      showToast('Strategy deleted successfully!');
    } catch (err) {
      handleAxiosError(err, 'Failed to delete strategy');
    } finally {
      closeDeleteModal();
    }
  };

  const handleAxiosError = (error, contextMessage) => {
    console.error(`${contextMessage}:`, error);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || `An unknown error occurred.`;
    showToast(`${contextMessage}: ${errorMsg}`, 'error');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const renderForm = () => (
    <div className="mb-8 animate-fade-in-up">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-white">{editingId ? 'Edit Strategy' : 'Create New Strategy'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1 */}
            <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Strategy Basics</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Strategy Name *</label>
                    <input type="text" placeholder="e.g., Gold 1H Reversal" value={formData.strategyName} onChange={(e) => setFormData({ ...formData, strategyName: e.target.value })} className={`w-full p-4 bg-gray-700/50 border ${errors.strategyName ? 'border-red-500' : 'border-gray-600'} rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
                    {errors.strategyName && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{errors.strategyName}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Strategy Type *</label>
                    <select value={formData.strategyType} onChange={(e) => setFormData({ ...formData, strategyType: e.target.value })} className={`w-full p-4 bg-gray-700/50 border ${errors.strategyType ? 'border-red-500' : 'border-gray-600'} rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}>
                        <option value="">Select type...</option>
                        {STRATEGY_TYPES.map(type => <option key={type} value={type} className="bg-gray-700">{type}</option>)}
                    </select>
                    {errors.strategyType && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{errors.strategyType}</p>}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Strategy Description</label>
                <textarea placeholder="Write a short summary of this strategy's objective, market condition, mindset etc." value={formData.strategyDescription} onChange={(e) => setFormData({ ...formData, strategyDescription: e.target.value })} className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl resize-none" rows="3" />
            </div>

            {/* Section 2 */}
            <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2 pt-4">Market Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <MultiSelect label="Trading Pairs" options={TRADING_PAIRS} selected={formData.tradingPairs} onChange={(val) => setFormData({...formData, tradingPairs: val})} error={errors.tradingPairs} />
                <MultiSelect label="Timeframes" options={TIMEFRAMES} selected={formData.timeframes} onChange={(val) => setFormData({...formData, timeframes: val})} error={errors.timeframes} />
            </div>

            {/* Section 3 */}
            <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2 pt-4">Strategy Components</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Setup Type *</label>
                    <select value={formData.setupType} onChange={(e) => setFormData({ ...formData, setupType: e.target.value })} className={`w-full p-4 bg-gray-700/50 border ${errors.setupType ? 'border-red-500' : 'border-gray-600'} rounded-xl`}>
                        <option value="">Select setup...</option>
                        {SETUP_TYPES.map(type => <option key={type} value={type} className="bg-gray-700">{type}</option>)}
                    </select>
                    {errors.setupType && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{errors.setupType}</p>}
                </div>
                <div className="lg:col-span-2">
                    <MultiSelect label="Confluences" options={CONFLUENCES} selected={formData.confluences} onChange={(val) => setFormData({...formData, confluences: val})} />
                </div>
                <div className="lg:col-span-3">
                    <MultiSelect label="Entry Types" options={ENTRY_TYPES} selected={formData.entryType} onChange={(val) => setFormData({...formData, entryType: val})} />
                </div>
            </div>

            {/* Section 4 */}
            <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2 pt-4">Risk & Backtest Settings</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Initial Balance *</label>
                    <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                        <input type="number" step="1" min="1" placeholder="e.g., 10000" value={formData.initialBalance} onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })} className={`w-full p-4 pl-12 bg-gray-700/50 border ${errors.initialBalance ? 'border-red-500' : 'border-gray-600'} rounded-xl`} />
                    </div>
                    {errors.initialBalance && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{errors.initialBalance}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Risk per Trade (%) *</label>
                    <div className="flex gap-4">
                        <select value={formData.riskPerTrade} onChange={(e) => setFormData({ ...formData, riskPerTrade: e.target.value })} className={`w-1/2 p-4 bg-gray-700/50 border ${errors.riskPerTrade ? 'border-red-500' : 'border-gray-600'} rounded-xl`}>
                            <option value="">Select risk...</option>
                            {RISK_OPTIONS.map(r => <option key={r} value={r} className="bg-gray-700">{r}%</option>)}
                            <option value="Custom" className="bg-gray-700">Custom...</option>
                        </select>
                        {formData.riskPerTrade === 'Custom' && (
                            <input type="number" step="0.01" min="0.01" placeholder="e.g., 0.75" value={formData.customRisk} onChange={(e) => setFormData({ ...formData, customRisk: e.target.value })} className={`w-1/2 p-4 bg-gray-700/50 border ${errors.riskPerTrade ? 'border-red-500' : 'border-gray-600'} rounded-xl`} />
                        )}
                    </div>
                    {errors.riskPerTrade && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{errors.riskPerTrade}</p>}
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
                <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed">
                    {submitting ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>{editingId ? 'Updating...' : 'Creating...'}</> : <><Check size={18} />{editingId ? 'Update Strategy' : 'Create Strategy'}</>}
                </button>
                <button type="button" onClick={handleCancelForm} className="flex items-center gap-2 px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <X size={18} />Cancel
                </button>
            </div>
        </form>
      </div>
    </div>
  );

  const renderStrategyList = () => (
      <div className="space-y-6">
          {loading ? (
              <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div><p className="text-gray-400">Loading strategies...</p></div>
          ) : strategies.length === 0 ? (
              <div className="text-center py-20 bg-gray-800/30 rounded-2xl p-12 max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Strategies Found</h3>
                  <p className="text-gray-500 mb-6">Click "New Strategy" to build your first one.</p>
              </div>
          ) : (
              <div className="grid gap-6">
                  {strategies.map((strategy) => (
                      <div key={strategy._id} className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-gray-600 animate-fade-in-up">
                          <div className="flex justify-between items-start flex-wrap">
                              <div className="flex-1 min-w-[250px]">
                                  <div className="flex items-center gap-4 mb-3">
                                      <h3 className="text-xl font-bold text-white">{strategy.strategyName}</h3>
                                      <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium border border-purple-600/30">{strategy.strategyType}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mb-4">
                                      {strategy.tradingPairs.map(pair => <span key={pair} className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs font-mono">{pair}</span>)}
                                      {strategy.timeframes.map(tf => <span key={tf} className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs font-mono">{tf}</span>)}
                                  </div>
                                  {strategy.strategyDescription && <p className="text-gray-400 mt-2 leading-relaxed max-w-2xl mb-4">{strategy.strategyDescription}</p>}
                              </div>
                              <div className="flex items-center gap-6 mt-4 sm:mt-0">
                                  <div className="text-center">
                                      <p className="text-xs text-gray-400 font-medium">Balance</p>
                                      <p className="font-bold text-lg text-green-400">
                                          ${(strategy.initialBalance || 0).toLocaleString()}
                                      </p>
                                  </div>
                                  <div className="text-center">
                                      <p className="text-xs text-gray-400 font-medium">Risk/Trade</p>
                                      <p className="font-bold text-lg text-red-400">
                                          {(strategy.riskPerTrade || 0)}%
                                      </p>
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-2 ml-4 border-l border-gray-700 pl-6">
                                      <button onClick={() => handleEdit(strategy)} className="p-3 text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 rounded-xl transition-all" title="Edit Strategy"><Pencil size={18} /></button>
                                      <button onClick={() => openDeleteModal(strategy._id)} className="p-3 text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded-xl transition-all" title="Delete Strategy"><Trash2 size={18} /></button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        title="Delete Strategy"
        message="Are you sure you want to delete this strategy? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
      />
      
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Strategy Blueprints</h1>
              <p className="text-gray-400 mt-2">Define, manage, and refine your trading strategies.</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto">
              <Plus size={20} />
              {showForm ? 'Close Form' : 'New Strategy'}
            </button>
          </div>
        </div>
        {showForm && renderForm()}
        {renderStrategyList()}
      </div>
    </div>
  );
}

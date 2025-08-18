'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Pencil, X, Check, AlertCircle, ChevronDown, Search, DollarSign } from 'lucide-react';
import { useTrades } from '../../context/TradeContext';

// --- Helper Data ---
const TRADING_PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'XAUUSD', 'BTCUSD', 'ETHUSD', 'US30'];
const TIMEFRAMES = ['1min', '5min', '15min', '1H', '4H', 'Daily', 'Weekly'];
const STRATEGY_TYPES = ['Swing', 'Intraday', 'Scalp'];
const SETUP_TYPES = ['Breakout', 'Reversal', 'Pullback', 'Trend Continuation', 'Liquidity Grab'];
const CONFLUENCES = ['Fibonacci', 'Order Block', 'Supply/Demand Zone', 'Trendline', 'Session Timing', 'News Filter'];
const ENTRY_TYPES = ['Candle Confirmation', 'Zone Breakout', 'Retest', 'Price Action Pattern', 'Instant Execution', 'Pending Order'];
const RISK_OPTIONS = ['0.25', '0.5', '1', '1.5', '2'];

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const Icon = type === 'success' ? Check : AlertCircle;
  return (
    <div className={`fixed top-5 right-5 ${bgColor} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-4 z-[100]`}>
      <Icon size={24} />
      <span className="flex-1 font-medium">{message}</span>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors"><X size={18} /></button>
    </div>
  );
};

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
        const newSelected = selected.includes(option) ? selected.filter(item => item !== option) : [...selected, option];
        onChange(newSelected);
    };
    
    return (
        <div className="relative" ref={ref}>
            <label className="block text-sm font-medium text-gray-400 mb-2">{label} *</label>
            <div onClick={() => setIsOpen(!isOpen)} className={`w-full p-3 bg-gray-800/50 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-white flex justify-between items-center cursor-pointer hover:border-white/20 transition-colors`}>
                <span className="flex-1 truncate pr-2">{selected.length > 0 ? selected.join(', ') : <span className="text-gray-500">Select options...</span>}</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-gray-900 border border-white/20 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-gray-900/80">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full p-2 pl-10 bg-gray-800/50 border border-white/10 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </div>
                    </div>
                    {filteredOptions.map(option => (
                        <div key={option} onClick={() => handleSelect(option)} className="p-3 hover:bg-blue-500/10 cursor-pointer flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                readOnly 
                                checked={selected.includes(option)} 
                                className="form-checkbox h-4 w-4 bg-gray-700 border-gray-500 rounded text-blue-500 focus:ring-0" 
                            />
                            <span className="flex-1">{option}</span>
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{error}</p>}
        </div>
    );
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99]">
            <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="text-gray-400 mb-8">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all">{cancelText}</button>
                    <button onClick={onConfirm} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all">{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

export default function StrategyPage() {
  const { strategies, strategiesLoading, createStrategy, updateStrategy, deleteStrategy } = useTrades();
  
  const initialFormData = {
    strategyName: '', strategyType: '', strategyDescription: '',
    tradingPairs: [], timeframes: [], setupType: '', confluences: [], entryType: [],
    initialBalance: '', riskPerTrade: '', customRisk: '',
  };

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.strategyName.trim()) newErrors.strategyName = 'Strategy name is required';
    if (!formData.strategyType) newErrors.strategyType = 'Strategy type is required';
    if (formData.tradingPairs.length === 0) newErrors.tradingPairs = 'Select at least one pair';
    if (formData.timeframes.length === 0) newErrors.timeframes = 'Select at least one timeframe';
    if (!formData.setupType) newErrors.setupType = 'Setup type is required';
    if (!formData.initialBalance || parseFloat(formData.initialBalance) <= 0) newErrors.initialBalance = 'A valid balance is required';
    if (!formData.riskPerTrade) newErrors.riskPerTrade = 'Risk per trade is required';
    if (formData.riskPerTrade === 'Custom' && (!formData.customRisk || parseFloat(formData.customRisk) <= 0)) newErrors.riskPerTrade = 'Enter a valid custom risk';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const riskValue = formData.riskPerTrade === 'Custom' ? parseFloat(formData.customRisk) : parseFloat(formData.riskPerTrade);
      const submitData = { ...formData, initialBalance: parseFloat(formData.initialBalance), riskPerTrade: riskValue };
      delete submitData.customRisk;

      if (editingId) {
        await updateStrategy(editingId, submitData);
        showToast('Strategy updated successfully!');
      } else {
        await createStrategy(submitData);
        showToast('Strategy created successfully!');
      }
      
      handleCancelForm();
    } catch (err) { 
      showToast(err.message || 'Failed to save strategy', 'error');
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

  const openDeleteModal = (id) => setDeleteModal({ isOpen: true, id });
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, id: null });

  const handleDelete = async () => {
    const id = deleteModal.id;
    if (!id) return;
    try {
      await deleteStrategy(id);
      showToast('Strategy deleted successfully!');
    } catch (err) { 
      showToast(err.message || 'Failed to delete strategy', 'error');
    } finally { 
      closeDeleteModal(); 
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormData);
    setErrors({});
  };

  return (
    <div className="min-h-screen w-full bg-black text-white relative">
        <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]"></div>
          <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
        </div>
        <div className="relative z-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
            <ConfirmModal isOpen={deleteModal.isOpen} title="Delete Strategy" message="Are you sure you want to delete this strategy? This action cannot be undone." onConfirm={handleDelete} onCancel={closeDeleteModal} />
            <div className="p-4 sm:p-8 max-w-6xl mx-auto">
                <div className="mb-12">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                    <h1 className="text-4xl font-bold pb-1 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">Strategy Blueprints</h1>
                    <p className="text-gray-400 mt-2">Define, manage, and refine your trading strategies.</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-500/20 transform hover:scale-105 w-full sm:w-auto">
                    <Plus size={20} />
                    {showForm ? 'Close Form' : 'New Strategy'}
                    </button>
                </div>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="mb-8">
                      <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 text-white">{editingId ? 'Edit Strategy' : 'Create New Strategy'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Strategy Name *</label>
                                    <input type="text" placeholder="e.g., Gold 1H Reversal" value={formData.strategyName} onChange={(e) => setFormData({ ...formData, strategyName: e.target.value })} className={`w-full p-3 bg-gray-800/50 border ${errors.strategyName ? 'border-red-500/50' : 'border-white/10'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                                    {errors.strategyName && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{errors.strategyName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Strategy Type *</label>
                                    <select value={formData.strategyType} onChange={(e) => setFormData({ ...formData, strategyType: e.target.value })} className={`w-full p-3 bg-gray-800/50 border ${errors.strategyType ? 'border-red-500/50' : 'border-white/10'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                                        <option value="" className="bg-gray-800">Select type...</option>
                                        {STRATEGY_TYPES.map(type => <option key={type} value={type} className="bg-gray-800">{type}</option>)}
                                    </select>
                                    {errors.strategyType && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{errors.strategyType}</p>}
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <MultiSelect label="Trading Pairs" options={TRADING_PAIRS} selected={formData.tradingPairs} onChange={(val) => setFormData({...formData, tradingPairs: val})} error={errors.tradingPairs} />
                                <MultiSelect label="Timeframes" options={TIMEFRAMES} selected={formData.timeframes} onChange={(val) => setFormData({...formData, timeframes: val})} error={errors.timeframes} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Setup Type *</label>
                                    <select value={formData.setupType} onChange={(e) => setFormData({ ...formData, setupType: e.target.value })} className={`w-full p-3 bg-gray-800/50 border ${errors.setupType ? 'border-red-500/50' : 'border-white/10'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                                        <option value="" className="bg-gray-800">Select setup...</option>
                                        {SETUP_TYPES.map(type => <option key={type} value={type} className="bg-gray-800">{type}</option>)}
                                    </select>
                                    {errors.setupType && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{errors.setupType}</p>}
                                </div>
                                <MultiSelect label="Confluences" options={CONFLUENCES} selected={formData.confluences} onChange={(val) => setFormData({...formData, confluences: val})} />
                            </div>

                            <MultiSelect label="Entry Types" options={ENTRY_TYPES} selected={formData.entryType} onChange={(val) => setFormData({...formData, entryType: val})} />

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Initial Balance *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                                        <input type="number" step="1" min="1" placeholder="e.g., 10000" value={formData.initialBalance} onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })} className={`w-full p-3 pl-10 bg-gray-800/50 border ${errors.initialBalance ? 'border-red-500/50' : 'border-white/10'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                                    </div>
                                    {errors.initialBalance && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{errors.initialBalance}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Risk per Trade (%) *</label>
                                    <div className="flex gap-4">
                                        <select value={formData.riskPerTrade} onChange={(e) => setFormData({ ...formData, riskPerTrade: e.target.value })} className={`w-1/2 p-3 bg-gray-800/50 border ${errors.riskPerTrade ? 'border-red-500/50' : 'border-white/10'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                                            <option value="" className="bg-gray-800">Select risk...</option>
                                            {RISK_OPTIONS.map(r => <option key={r} value={r} className="bg-gray-800">{r}%</option>)}
                                            <option value="Custom" className="bg-gray-800">Custom...</option>
                                        </select>
                                        {formData.riskPerTrade === 'Custom' && (
                                            <input type="number" step="0.01" min="0.01" placeholder="e.g., 0.75" value={formData.customRisk} onChange={(e) => setFormData({ ...formData, customRisk: e.target.value })} className={`w-1/2 p-3 bg-gray-800/50 border ${errors.riskPerTrade ? 'border-red-500/50' : 'border-white/10'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                                        )}
                                    </div>
                                    {errors.riskPerTrade && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{errors.riskPerTrade}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Strategy Description</label>
                                <textarea placeholder="Write a short summary..." value={formData.strategyDescription} onChange={(e) => setFormData({ ...formData, strategyDescription: e.target.value })} className="w-full p-3 bg-gray-800/50 border border-white/10 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" />
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-500/20 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed">
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            {editingId ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            {editingId ? 'Update Strategy' : 'Create Strategy'}
                                        </>
                                    )}
                                </button>
                                <button type="button" onClick={handleCancelForm} className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200">
                                    <X size={18} />
                                    Cancel
                                </button>
                            </div>
                        </form>
                      </div>
                    </div>
                )}

                {/* Strategy List */}
                <div className="space-y-6">
                    {strategiesLoading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading strategies...</p>
                        </div>
                    ) : strategies.length === 0 ? (
                        <div className="text-center py-20 bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
                            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Strategies Found</h3>
                            <p className="text-gray-500 mb-6">Click "New Strategy" to build your first one.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {strategies.map((strategy) => (
                                <div key={strategy._id} className="p-[1px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl hover:from-blue-500/40 hover:to-purple-500/40 transition-all duration-300">
                                    <div className="bg-gray-900/80 backdrop-blur-lg rounded-[15px] p-6 shadow-lg">
                                        <div className="flex justify-between items-start flex-wrap gap-4">
                                            <div className="flex-1 min-w-[250px]">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <h3 className="text-xl font-bold text-white">{strategy.strategyName}</h3>
                                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">{strategy.strategyType}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {strategy.tradingPairs.map(pair => <span key={pair} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-mono">{pair}</span>)}
                                                    {strategy.timeframes.map(tf => <span key={tf} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-mono">{tf}</span>)}
                                                </div>
                                                {strategy.strategyDescription && <p className="text-gray-400 mt-2 leading-relaxed max-w-2xl mb-4">{strategy.strategyDescription}</p>}
                                            </div>
                                            <div className="flex items-center gap-6 mt-2 sm:mt-0">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-400 font-medium">Balance</p>
                                                    <p className="font-bold text-lg text-green-400">${(strategy.initialBalance || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-400 font-medium">Risk/Trade</p>
                                                    <p className="font-bold text-lg text-red-400">{(strategy.riskPerTrade || 0)}%</p>
                                                </div>
                                                <div className="flex gap-2 ml-4 border-l border-white/10 pl-6">
                                                    <button onClick={() => handleEdit(strategy)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Edit Strategy">
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button onClick={() => openDeleteModal(strategy._id)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Delete Strategy">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}

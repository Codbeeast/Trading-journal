'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  const Icon = type === 'success' ? Check : AlertCircle;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-80 max-w-md z-50 transition-all duration-300 transform translate-x-0`}>
      <Icon size={20} />
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
        <X size={18} />
      </button>
    </div>
  );
};

export default function BacktestPage() {
  const { getToken, userId } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sessionName: '',
    balance: '',
    pair: '',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    if (userId) fetchSessions();
  }, [userId]);

  const fetchSessions = async () => {
    try {
      const token = await getToken();
      const res = await axios.get('/api/sessions', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setSessions(res.data);
    } catch (err) {
      handleAxiosError(err, 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sessionName.trim()) newErrors.sessionName = 'Session name is required';
    if (!formData.balance || parseFloat(formData.balance) <= 0) newErrors.balance = 'Valid balance required';
    if (!formData.pair) newErrors.pair = 'Pair is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const token = await getToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const submitData = {
        ...formData,
        balance: parseFloat(formData.balance),
      };

      if (editingId) {
        await axios.patch(`/api/sessions?id=${editingId}`, submitData, config);
        showToast('Session updated successfully!');
      } else {
        await axios.post('/api/sessions', submitData, config);
        showToast('Session created successfully!');
      }

      // Always refetch sessions after create/update to ensure consistency
      await fetchSessions();

      // Reset form
      setFormData({ sessionName: '', balance: '', pair: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      setErrors({});

    } catch (err) {
      handleAxiosError(err, editingId ? 'Failed to update session' : 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (session) => {
    setFormData({
      sessionName: session.sessionName,
      balance: session.balance.toString(),
      pair: session.pair,
      description: session.description || '',
    });
    setEditingId(session._id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      const token = await getToken();
      await axios.delete(`/api/sessions?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setSessions((prev) => prev.filter((s) => s._id !== id));
      showToast('Session deleted successfully!');
    } catch (err) {
      handleAxiosError(err, 'Failed to delete session');
    }
  };

  const handleAxiosError = (error, contextMessage) => {
    console.error(`${contextMessage}:`, error);
    let message = contextMessage;
    
    if (error.response) {
      const errorMsg = error.response.data?.message || error.response.data?.error || `Server error (${error.response.status})`;
      message = `${contextMessage}: ${errorMsg}`;
    } else if (error.request) {
      message = `${contextMessage}: No response from server.`;
    } else {
      message = `${contextMessage}: ${error.message}`;
    }
    
    showToast(message, 'error');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ sessionName: '', balance: '', pair: '', description: '' });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}
      
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Trading Sessions
              </h1>
              <p className="text-gray-400 mt-2">Manage your backtesting sessions and track performance</p>
            </div>
            <button
              onClick={() => {
                if (showForm && editingId) {
                  handleCancelForm();
                } else {
                  setShowForm(!showForm);
                  if (!showForm) {
                    setEditingId(null);
                    setFormData({ sessionName: '', balance: '', pair: '', description: '' });
                    setErrors({});
                  }
                }
              }}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={20} />
              {showForm ? (editingId ? 'Cancel Edit' : 'Cancel') : 'New Session'}
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-white">
                {editingId ? 'Edit Session' : 'Create New Session'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Session Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter session name"
                      value={formData.sessionName}
                      onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    />
                    {errors.sessionName && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        {errors.sessionName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Initial Balance *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Enter initial balance"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    />
                    {errors.balance && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        {errors.balance}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Currency Pair *
                  </label>
                  <select
                    value={formData.pair}
                    onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  >
                    <option value="">Select a currency pair</option>
                    {[
                      'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'NZD/USD', 
                      'USD/CHF', 'USD/CAD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'
                    ].map((pair) => (
                      <option key={pair} value={pair} className="bg-gray-700">
                        {pair}
                      </option>
                    ))}
                  </select>
                  {errors.pair && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <AlertCircle size={16} />
                      {errors.pair}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Add a description for this session..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
                    rows="3"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {editingId ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        {editingId ? 'Update Session' : 'Create Session'}
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancelForm}
                    className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sessions List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading sessions...</p>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-800/30 rounded-2xl p-12 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Sessions Yet</h3>
                <p className="text-gray-500 mb-6">Create your first trading session to get started with backtesting</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200"
                >
                  Create Session
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {sessions.map((session) => (
                <div 
                  key={session._id} 
                  className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-gray-600"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">{session.sessionName}</h3>
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium border border-blue-600/30">
                          {session.pair}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Balance:</span>
                          <span className="text-green-400 font-semibold text-lg">
                            ${session.balance.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      {session.description && (
                        <p className="text-gray-400 mt-2 leading-relaxed">{session.description}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => handleEdit(session)} 
                        className="p-3 text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 rounded-xl transition-all duration-200"
                        title="Edit session"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(session._id)} 
                        className="p-3 text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded-xl transition-all duration-200"
                        title="Delete session"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

export default function BacktestPage() {
  const { getToken, userId } = useAuth(); // ✅ Also get userId for debugging

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

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      console.log('Fetching sessions - userId:', userId); // Debug log
      
      const token = await getToken();
      console.log('Token retrieved:', !!token); // Debug log (don't log actual token)
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await axios.get('/api/sessions', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log('Sessions fetched successfully:', res.data.length);
      setSessions(res.data);
    } catch (err) {
      handleAxiosError(err, 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sessionName.trim()) {
      newErrors.sessionName = 'Session name is required';
    }
    if (!formData.balance || parseFloat(formData.balance) <= 0) {
      newErrors.balance = 'Valid balance required';
    }
    if (!formData.pair) {
      newErrors.pair = 'Pair is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      };

      const submitData = {
        ...formData,
        balance: parseFloat(formData.balance), // ✅ Ensure balance is a number
      };

      console.log('Submitting data:', submitData); // Debug log

      if (editingId) {
        await axios.patch(`/api/sessions?id=${editingId}`, submitData, config);
        console.log('Session updated successfully');
      } else {
        await axios.post('/api/sessions', submitData, config);
        console.log('Session created successfully');
      }

      // Reset form and refresh data
      setFormData({ sessionName: '', balance: '', pair: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      setErrors({});
      await fetchSessions();
      
    } catch (err) {
      handleAxiosError(err, 'Failed to save session');
    }
  };

  const handleEdit = (session) => {
    setFormData({
      sessionName: session.sessionName,
      balance: session.balance.toString(), // ✅ Convert to string for input
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
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`/api/sessions?id=${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log('Session deleted successfully');
      await fetchSessions();
      
    } catch (err) {
      handleAxiosError(err, 'Failed to delete session');
    }
  };

  const handleAxiosError = (error, contextMessage) => {
    console.error(`${contextMessage}:`, error); // ✅ Log full error object
    
    if (error.response) {
      // Server responded with error status
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     `Server error (${error.response.status})`;
      alert(`${contextMessage}: ${message}`);
      
    } else if (error.request) {
      // Request was made but no response received
      console.error('Request error:', error.request);
      alert(`${contextMessage}: No response from server. Please check your connection.`);
      
    } else {
      // Something else happened
      console.error('Error:', error.message);
      alert(`${contextMessage}: ${error.message}`);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ sessionName: '', balance: '', pair: '', description: '' });
    setErrors({});
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <p className="text-red-400 mb-4">
        Note: Guys don't change anything with this file... <br />Abinash
      </p>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Trading Sessions</h1>
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
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
          <Plus size={18} />
          {showForm ? (editingId ? 'Cancel Edit' : 'Cancel') : 'New Session'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-md mb-6 space-y-4 shadow">
          <h2 className="font-semibold text-xl text-gray-800">
            {editingId ? 'Edit Session' : 'Create Session'}
          </h2>

          <div>
            <input
              type="text"
              placeholder="Session Name *"
              value={formData.sessionName}
              onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
              className="w-full p-2 rounded border focus:border-blue-500 focus:outline-none"
            />
            {errors.sessionName && (
              <p className="text-red-500 text-sm mt-1">{errors.sessionName}</p>
            )}
          </div>

          <div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Initial Balance *"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              className="w-full p-2 rounded border focus:border-blue-500 focus:outline-none"
            />
            {errors.balance && (
              <p className="text-red-500 text-sm mt-1">{errors.balance}</p>
            )}
          </div>

          <div>
            <select
              value={formData.pair}
              onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
              className="w-full p-2 rounded border focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Pair *</option>
              {[
                'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'NZD/USD',
                'USD/CHF', 'USD/CAD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'
              ].map((pair) => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
            {errors.pair && (
              <p className="text-red-500 text-sm mt-1">{errors.pair}</p>
            )}
          </div>

          <div>
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 rounded border focus:border-blue-500 focus:outline-none"
              rows="3"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              {editingId ? 'Update Session' : 'Create Session'}
            </button>
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center mt-10">
          <p className="text-gray-500">Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center mt-10">
          <p className="text-gray-500">
            No sessions available, create one to get started!
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li
              key={session._id}
              className="border p-4 rounded-md bg-white shadow hover:shadow-lg transition flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{session.sessionName}</h3>
                <p className="text-sm text-gray-600">
                  {session.pair} - ${session.balance.toFixed(2)}
                </p>
                {session.description && (
                  <p className="text-sm mt-1 text-gray-700">{session.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(session)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit session"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(session._id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete session"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

export default function BacktestPage() {
  const { getToken } = useAuth();

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
      const token = await getToken();
      if (!token) throw new Error('No token found');

      const res = await axios.get('/api/sessions', {
        headers: { Authorization: `Bearer ${token}` },
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

    try {
      const token = await getToken();
      if (!token) throw new Error('No token found');

      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingId) {
        await axios.patch(`/api/sessions?id=${editingId}`, formData, config);
      } else {
        await axios.post('/api/sessions', {
          ...formData,
          balance: parseFloat(formData.balance),
        }, config);
      }

      setFormData({ sessionName: '', balance: '', pair: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      fetchSessions();
    } catch (err) {
      handleAxiosError(err, 'Failed to save session');
    }
  };

  const handleEdit = (session) => {
    setFormData({
      sessionName: session.sessionName,
      balance: session.balance,
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
      if (!token) throw new Error('No token found');

      await axios.delete(`/api/sessions?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSessions();
    } catch (err) {
      handleAxiosError(err, 'Failed to delete session');
    }
  };

  const handleAxiosError = (error, contextMessage) => {
    if (error.response) {
      console.error(`${contextMessage}:`, error.response.status, error.response.data);
      alert(error.response.data?.message || `${contextMessage} (Server error)`);
    } else if (error.request) {
      console.error(`${contextMessage}: No response`, error.request);
      alert(`${contextMessage}: No response from server`);
    } else {
      console.error(`${contextMessage}:`, error.message);
      alert(`${contextMessage}: ${error.message}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <p className="text-red-400 mb-4">Note: Guys don't change anything with this file... <br />Abinash</p>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Trading Sessions</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ sessionName: '', balance: '', pair: '', description: '' });
            setErrors({});
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
          <Plus size={18} />
          {editingId ? 'Cancel Edit' : 'New Session'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-md mb-6 space-y-4 shadow">
          <h2 className="font-semibold text-xl text-gray-800">
            {editingId ? 'Edit Session' : 'Create Session'}
          </h2>

          <input
            type="text"
            placeholder="Session Name *"
            value={formData.sessionName}
            onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
            className="w-full p-2 rounded border"
          />
          {errors.sessionName && <p className="text-red-500 text-sm">{errors.sessionName}</p>}

          <input
            type="number"
            placeholder="Initial Balance *"
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            className="w-full p-2 rounded border"
          />
          {errors.balance && <p className="text-red-500 text-sm">{errors.balance}</p>}

          <select
            value={formData.pair}
            onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
            className="w-full p-2 rounded border"
          >
            <option value="">Select Pair *</option>
            {[
              'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'NZD/USD',
              'USD/CHF', 'USD/CAD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'
            ].map((pair) => (
              <option key={pair} value={pair}>{pair}</option>
            ))}
          </select>
          {errors.pair && <p className="text-red-500 text-sm">{errors.pair}</p>}

          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 rounded border"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            {editingId ? 'Update Session' : 'Create Session'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-center mt-10">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          No sessions available, create one to get started!
        </p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((s) => (
            <li
              key={s._id}
              className="border p-4 rounded-md bg-white shadow hover:shadow-lg transition flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{s.sessionName}</h3>
                <p className="text-sm text-gray-600">{s.pair} - ${s.balance}</p>
                {s.description && (
                  <p className="text-sm mt-1 text-gray-700">{s.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(s)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="text-red-600 hover:text-red-800"
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
"use client";

import React, { useState } from 'react';
import { Plus, X, Save, Edit3, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

const SessionManager = ({ sessions, onSessionsUpdate, isOpen, onClose }) => {
  const { getToken } = useAuth();
  const [newSession, setNewSession] = useState({
    sessionName: '',
    pair: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active',
    notes: ''
  });
  const [editingSession, setEditingSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'NZD/USD', 'USD/CHF', 'USD/CAD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'];

  const handleCreateSession = async () => {
    if (!newSession.sessionName || !newSession.pair) {
      alert('Session name and pair are required');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.post('/api/sessions', newSession, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.data) {
        setNewSession({
          sessionName: '',
          pair: '',
          description: '',
          startDate: '',
          endDate: '',
          status: 'active',
          notes: ''
        });
        onSessionsUpdate(); // Refresh sessions
      }
    } catch (error) {
      console.error('Error creating session:', error);
      if (error.response?.data?.message) {
        alert(`Failed to create session: ${error.response.data.message}`);
      } else {
        alert('Failed to create session');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSession = async () => {
    if (!editingSession.sessionName || !editingSession.pair) {
      alert('Session name and pair are required');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.put(`/api/sessions/${editingSession._id}`, editingSession, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.data) {
        setEditingSession(null);
        onSessionsUpdate(); // Refresh sessions
      }
    } catch (error) {
      console.error('Error updating session:', error);
      if (error.response?.data?.message) {
        alert(`Failed to update session: ${error.response.data.message}`);
      } else {
        alert('Failed to update session');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session? This will also remove any trades associated with this session.')) {
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      await axios.delete(`/api/sessions/${sessionId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      onSessionsUpdate(); // Refresh sessions
    } catch (error) {
      console.error('Error deleting session:', error);
      if (error.response?.data?.message) {
        alert(`Failed to delete session: ${error.response.data.message}`);
      } else {
        alert('Failed to delete session');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Manage Trading Sessions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Create New Session */}
        <div className="mb-8 p-4 bg-gray-800/50 rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Session
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Session Name"
              value={newSession.sessionName}
              onChange={(e) => setNewSession({...newSession, sessionName: e.target.value})}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newSession.pair}
              onChange={(e) => setNewSession({...newSession, pair: e.target.value})}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Pair</option>
              {pairs.map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Start Date"
              value={newSession.startDate}
              onChange={(e) => setNewSession({...newSession, startDate: e.target.value})}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              placeholder="End Date"
              value={newSession.endDate}
              onChange={(e) => setNewSession({...newSession, endDate: e.target.value})}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Description"
              value={newSession.description}
              onChange={(e) => setNewSession({...newSession, description: e.target.value})}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              rows={2}
            />
            <textarea
              placeholder="Notes"
              value={newSession.notes}
              onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              rows={2}
            />
          </div>
          <button
            onClick={handleCreateSession}
            disabled={loading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Session'}
          </button>
        </div>

        {/* Existing Sessions */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Existing Sessions</h3>
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No sessions created yet</p>
            ) : (
              sessions.map((session) => (
                <div key={session._id} className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
                  {editingSession?._id === session._id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editingSession.sessionName}
                          onChange={(e) => setEditingSession({...editingSession, sessionName: e.target.value})}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        />
                        <select
                          value={editingSession.pair}
                          onChange={(e) => setEditingSession({...editingSession, pair: e.target.value})}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        >
                          {pairs.map(pair => (
                            <option key={pair} value={pair}>{pair}</option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={editingSession.startDate}
                          onChange={(e) => setEditingSession({...editingSession, startDate: e.target.value})}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        />
                        <input
                          type="date"
                          value={editingSession.endDate}
                          onChange={(e) => setEditingSession({...editingSession, endDate: e.target.value})}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateSession}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingSession(null)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{session.sessionName}</h4>
                        <p className="text-gray-400 text-sm">{session.pair}</p>
                        {session.description && (
                          <p className="text-gray-500 text-sm mt-1">{session.description}</p>
                        )}
                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                          {session.startDate && <span>Start: {session.startDate}</span>}
                          {session.endDate && <span>End: {session.endDate}</span>}
                          <span className={`px-2 py-1 rounded ${
                            session.status === 'active' ? 'bg-green-900/50 text-green-300' :
                            session.status === 'completed' ? 'bg-blue-900/50 text-blue-300' :
                            'bg-yellow-900/50 text-yellow-300'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingSession(session)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionManager;

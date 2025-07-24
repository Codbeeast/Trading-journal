'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import axios from 'axios';

export default function BacktestPage() {
    const [sessions, setSessions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        sessionName: '',
        balance: '',
        pair: '',
        description: '',
    });

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await axios.get('/api/sessions');
            setSessions(res.data);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { sessionName, balance, pair } = formData;
        if (!sessionName || !balance || !pair) return;

        try {
            await axios.post('/api/sessions', {
                sessionName,
                balance: parseFloat(balance),
                pair,
                description: formData.description,
            });

            setFormData({ sessionName: '', balance: '', pair: '', description: '' });
            setShowForm(false);
            fetchSessions();
        } catch (err) {
            console.error('Failed to create session:', err);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <p className='text-red-400'>Note: Guys dont change anything with this file... <br />Abinash </p>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Trading Sessions</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                >
                    <Plus size={18} />
                    New Session
                </button>
            </div>

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-gray-100 p-4 rounded-md mb-6 space-y-4"
                >
                    <h2 className="font-semibold text-lg">Create Session</h2>

                    <input
                        type="text"
                        placeholder="Session Name *"
                        value={formData.sessionName}
                        onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                        className="w-full p-2 rounded border"
                        required
                    />

                    <input
                        type="number"
                        placeholder="Initial Balance *"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        className="w-full p-2 rounded border"
                        required
                    />

                    <select
                        value={formData.pair}
                        onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
                        className="w-full p-2 rounded border"
                        required
                    >
                        <option value="">Select Pair *</option>
                        <option value="EUR/USD">EUR/USD</option>
                        <option value="GBP/USD">GBP/USD</option>
                        <option value="USD/JPY">USD/JPY</option>
                        <option value="AUD/USD">AUD/USD</option>
                        <option value="NZD/USD">NZD/USD</option>
                        <option value="USD/CHF">USD/CHF</option>
                        <option value="USD/CAD">USD/CAD</option>
                        <option value="EUR/GBP">EUR/GBP</option>
                        <option value="EUR/JPY">EUR/JPY</option>
                        <option value="GBP/JPY">GBP/JPY</option>
                    </select>

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
                        Create Session
                    </button>
                </form>
            )}
            {sessions.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">
                    No sessions available, create one to get started!
                </p>
            ) : (
                <ul className="space-y-4">
                    {sessions.map((s) => (
                        <li
                            key={s._id}
                            className="border p-4 rounded-md bg-white shadow flex justify-between items-center"
                        >
                            <div>
                                <h3 className="text-lg font-semibold">{s.sessionName}</h3>
                                <p className="text-sm text-gray-600">{s.pair} - ${s.balance}</p>
                                {s.description && (
                                    <p className="text-sm mt-1 text-gray-700">{s.description}</p>
                                )}
                            </div>
                            {/* Buttons for future update/delete */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

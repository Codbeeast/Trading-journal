'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

// Toast Component (same as before)
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

function BacktestPageContent() {
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

  // ... rest of your component logic remains the same

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    if (userId) fetchSessions();
  }, [userId]);

  // ... all other methods remain the same

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Your existing JSX content */}
    </div>
  );
}

export default function BacktestPage() {
  const [isClerkLoaded, setIsClerkLoaded] = useState(false);

  useEffect(() => {
    // Check if Clerk is available
    const checkClerk = () => {
      if (typeof window !== 'undefined' && window.Clerk) {
        setIsClerkLoaded(true);
      }
    };

    // Check immediately
    checkClerk();

    // Also check after a short delay in case Clerk is still loading
    const timer = setTimeout(checkClerk, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isClerkLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return <BacktestPageContent />;
}
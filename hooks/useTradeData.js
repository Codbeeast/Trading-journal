// Custom hook to fetch existing trades from database
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useTradeData = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/trades');
      
      if (response.data && Array.isArray(response.data)) {
        // Sort trades by date and time (newest first)
        const sortedTrades = response.data.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateB - dateA;
        });
        
        setTrades(sortedTrades);
      } else {
        setTrades([]);
      }
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError('Failed to load trades');
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  return { trades, loading, error, refetch: fetchTrades };
};

// Alternative: Direct fetch function if you prefer not to use a hook
export const fetchTradesFromDB = async () => {
  try {
    const response = await axios.get('/api/trades');
    
    if (response.data && Array.isArray(response.data)) {
      // Sort trades by date and time (newest first)
      const sortedTrades = response.data.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB - dateA;
      });
      
      return sortedTrades;
    }
    return [];
  } catch (error) {
    console.error('Error fetching trades:', error);
    return [];
  }
};
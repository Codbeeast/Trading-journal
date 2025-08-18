"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from 'axios';

// Create the context
export const TradeContext = createContext(null);

// Provider component
export const TradeProvider = ({ children }) => {
  const [trades, setTrades] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [strategiesLoading, setStrategiesLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trades from API
  const fetchTrades = useCallback(async (strategyId = null) => {
    try {
      setLoading(true);
      const url = strategyId ? `/api/trades?strategyId=${strategyId}` : '/api/trades';
      const response = await axios.get(url);
      setTrades(response.data);
    } catch (error) {
      console.error('Error fetching trades:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trades by strategy
  const fetchTradesByStrategy = useCallback(async (strategyId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/trades/by-strategy/${strategyId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch trades by strategy");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Error fetching trades by strategy:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create trade
  const createTrade = useCallback(async (tradeData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a clean copy without _id to prevent duplicate key errors
      const cleanTradeData = { ...tradeData };
      delete cleanTradeData._id;
      
      const response = await axios.post('/api/trades', cleanTradeData);
      setTrades(prev => [response.data, ...prev]);
      return response.data;
    } catch (error) {
      console.error('Error creating trade:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update trade
  const updateTrade = useCallback(async (tradeId, tradeData) => {
    try {
      const response = await fetch(`/api/trades?id=${tradeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tradeData),
      });

      if (!response.ok) {
        throw new Error("Failed to update trade");
      }

      const updatedTrade = await response.json();
      setTrades(prev => prev.map(trade => 
        trade._id === tradeId ? updatedTrade : trade
      ));
      return updatedTrade;
    } catch (err) {
      setError(err.message);
      console.error("Error updating trade:", err);
      throw err;
    }
  }, []);

  // Delete trade
  const deleteTrade = useCallback(async (tradeId) => {
    try {
      const response = await fetch(`/api/trades?id=${tradeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete trade");
      }

      setTrades(prev => prev.filter(trade => trade._id !== tradeId));
    } catch (err) {
      setError(err.message);
      console.error("Error deleting trade:", err);
      throw err;
    }
  }, []);

  // Fetch strategies
  const fetchStrategies = useCallback(async () => {
    try {
      setStrategiesLoading(true);
      setError(null);

      const response = await fetch("/api/strategies");
      if (!response.ok) {
        throw new Error("Failed to fetch strategies");
      }

      const data = await response.json();
      setStrategies(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching strategies:", err);
      setStrategies([]);
    } finally {
      setStrategiesLoading(false);
    }
  }, []);

  // Create strategy
  const createStrategy = useCallback(async (strategyData) => {
    try {
      const response = await fetch("/api/strategies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(strategyData),
      });

      if (!response.ok) {
        throw new Error("Failed to create strategy");
      }

      const newStrategy = await response.json();
      setStrategies(prev => [newStrategy, ...prev]);
      return newStrategy;
    } catch (err) {
      setError(err.message);
      console.error("Error creating strategy:", err);
      throw err;
    }
  }, []);

  // Update strategy
  const updateStrategy = useCallback(async (strategyId, strategyData) => {
    try {
      const response = await fetch(`/api/strategies?id=${strategyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(strategyData),
      });

      if (!response.ok) {
        throw new Error("Failed to update strategy");
      }

      const updatedStrategy = await response.json();
      setStrategies(prev => prev.map(strategy => 
        strategy._id === strategyId ? updatedStrategy : strategy
      ));
      return updatedStrategy;
    } catch (err) {
      setError(err.message);
      console.error("Error updating strategy:", err);
      throw err;
    }
  }, []);

  // Delete strategy
  const deleteStrategy = useCallback(async (strategyId) => {
    try {
      const response = await fetch(`/api/strategies?id=${strategyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete strategy");
      }

      setStrategies(prev => prev.filter(strategy => strategy._id !== strategyId));
    } catch (err) {
      setError(err.message);
      console.error("Error deleting strategy:", err);
      throw err;
    }
  }, []);

  // Fetch sessions (mock for now)
  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      // Mock sessions data
      const mockSessions = [
        { _id: 'london-1', sessionName: 'London Session', pair: 'EUR/USD' },
        { _id: 'ny-1', sessionName: 'New York Session', pair: 'GBP/USD' },
        { _id: 'tokyo-1', sessionName: 'Tokyo Session', pair: 'USD/JPY' }
      ];
      setSessions(mockSessions);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching sessions:", err);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchTrades();
    fetchStrategies();
    fetchSessions();
  }, [fetchTrades, fetchStrategies, fetchSessions]);

  // Get strategy data for auto-population
  const getStrategyData = useCallback((strategyId) => {
    return strategies.find(strategy => strategy._id === strategyId);
  }, [strategies]);

  // Context value
  const contextValue = React.useMemo(
    () => ({
      // Trade methods
      trades,
      loading,
      error,
      fetchTrades,
      fetchTradesByStrategy,
      createTrade,
      updateTrade,
      deleteTrade,
      
      // Strategy methods
      strategies,
      strategiesLoading,
      fetchStrategies,
      createStrategy,
      updateStrategy,
      deleteStrategy,
      getStrategyData,
      
      // Session methods
      sessions,
      sessionsLoading,
      fetchSessions,
    }),
    [
      trades, loading, error, fetchTrades, fetchTradesByStrategy, createTrade, updateTrade, deleteTrade,
      strategies, strategiesLoading, fetchStrategies, createStrategy, updateStrategy, deleteStrategy, getStrategyData,
      sessions, sessionsLoading, fetchSessions
    ]
  );

  return (
    <TradeContext.Provider value={contextValue}>
      {children}
    </TradeContext.Provider>
  );
};

// Hook to use the context
export const useTrades = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error("useTrades must be used within a TradeProvider");
  }
  return context;
};

// context/TradeContext.js
"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useAuth } from '@clerk/nextjs';

// Create the context
export const TradeContext = createContext(null);

// Provider component
export const TradeProvider = ({ children }) => {
  const { getToken } = useAuth();
  const [trades, setTrades] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [strategiesLoading, setStrategiesLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trades
  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/trades");
      if (!response.ok) {
        throw new Error("Failed to fetch trades");
      }

      const data = await response.json();
      setTrades(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching trades:", err);
      setTrades([]); // ✅ No mock data, just empty
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch strategies
  const fetchStrategies = useCallback(async () => {
    try {
      setStrategiesLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        setStrategies([]);
        return;
      }

      const response = await fetch("/api/strategies", {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
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
  }, [getToken]);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        setSessions([]);
        return;
      }

      const response = await fetch("/api/sessions", {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json();
      setSessions(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching sessions:", err);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, [getToken]);

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
      trades,
      strategies,
      sessions,
      loading,
      strategiesLoading,
      sessionsLoading,
      error,
      fetchTrades, // make available for refetching after POST
      fetchStrategies,
      fetchSessions,
      getStrategyData
    }),
    [trades, strategies, sessions, loading, strategiesLoading, sessionsLoading, error, fetchTrades, fetchStrategies, fetchSessions, getStrategyData]
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

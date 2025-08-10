// context/TradeContext.js
"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";

// Create the context
export const TradeContext = createContext(null);

// Provider component
export const TradeProvider = ({ children }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch on mount
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Context value
  const contextValue = React.useMemo(
    () => ({
      trades,
      loading,
      error,
      fetchTrades, // make available for refetching after POST
    }),
    [trades, loading, error, fetchTrades]
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

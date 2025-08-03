// context/TradeContext.js
"use client";

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

// Create the context
export const TradeContext = createContext(null);

// Create a provider component
export const TradeProvider = ({ children }) => {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch trades, made available for re-fetching
    const fetchTrades = useCallback(async () => {
        try {
            setLoading(true);
            setError(null); // Clear previous errors
            const response = await fetch('/api/trades');
            if (!response.ok) {
                throw new Error('Failed to fetch trades');
            }
            const data = await response.json();
            setTrades(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching trades:', err);
            // Fallback to mock data if API fails for development/demo
            setTrades([
                { pnl: 150, pipsLostCaught: 15 },
                { pnl: -50, pipsLostCaught: -5 },
                { pnl: 200, pipsLostCaught: 20 },
                { pnl: 80, pipsLostCaught: 8 },
                { pnl: 100, pipsLostCaught: 10 },
                { pnl: -30, pipsLostCaught: -3 },
                { pnl: 60, pipsLostCaught: 6 },
                { pnl: -25, pipsLostCaught: -2.5 },
                { pnl: 90, pipsLostCaught: 9 },
                { pnl: 45, pipsLostCaught: 4.5 },
                { pnl: 120, pipsLostCaught: 12 },
                { pnl: -10, pipsLostCaught: -1 },
            ]);
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array means this function is created once

    // Fetch trades on component mount
    useEffect(() => {
        fetchTrades();
    }, [fetchTrades]); // Depend on fetchTrades to re-run if it changes (though it's memoized)

    // Memoize the context value to prevent unnecessary re-renders of consumers
    const contextValue = React.useMemo(() => ({
        trades,
        loading,
        error,
        fetchTrades // Provide the refetch function
    }), [trades, loading, error, fetchTrades]);

    return (
        <TradeContext.Provider value={contextValue}>
            {children}
        </TradeContext.Provider>
    );
};

// Custom hook to easily consume the context
export const useTrades = () => {
    const context = useContext(TradeContext);
    if (context === undefined) {
        throw new Error('useTrades must be used within a TradeProvider');
    }
    return context;
};
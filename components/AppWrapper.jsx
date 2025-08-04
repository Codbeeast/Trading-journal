// components/AppWrapper.js
"use client";

import { useState, useEffect } from "react";
import Sidebar from '@/components/Slidebar';

export default function AppWrapper({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSidebarToggle = (collapsed) => {
    setIsTransitioning(true);
    setSidebarCollapsed(collapsed);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  // Prevent layout shift on initial render
  useEffect(() => {
    document.body.style.overflow = 'none';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-900 transition-all duration-300 ease-in-out overflow-hidden">
      <Sidebar onToggle={handleSidebarToggle} />
      
      <div
        className={`
          transition-all duration-300 ease-in-out flex-1 min-w-0 relative
          ${isMobile ? 'ml-0 pt-16' : (sidebarCollapsed ? 'ml-24' : 'ml-60 md:ml-70')}
          ${isTransitioning ? 'transform' : ''}
        `}
      >
        <main className={`
           min-h-screen relative p-1
          transition-all duration-300 ease-in-out
          ${isTransitioning ? 'scale-[0.995] opacity-95' : 'scale-100 opacity-100'}
        `}>
          <div className="max-w-full">
            {children}
          </div>
        </main>
        
        {/* Subtle overlay during transition */}
        <div className={`
          absolute inset-0 bg-black/5 pointer-events-none
          transition-opacity duration-300 ease-in-out
          ${isTransitioning ? 'opacity-100' : 'opacity-0'}
        `} />
      </div>
    </div>
  );
}
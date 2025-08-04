// components/AppWrapper.js
"use client";

import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation'; // Import usePathname
import Sidebar from '@/components/Slidebar'

export default function AppWrapper({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const pathname = usePathname(); // Get the current route

  // --- Check if the current page is the homepage ---
  const isHomePage = pathname === '/';

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
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  // --- Conditional Rendering ---
  // If it's the homepage, just render the children without any layout wrapper.
  if (isHomePage) {
    return <>{children}</>;
  }

  // Otherwise, render the full application layout with the sidebar.
  return (
    <div className="flex min-h-screen bg-slate-900 transition-all duration-300 ease-in-out overflow-hidden">
      <Sidebar onToggle={handleSidebarToggle} />
      
      <div
        className={`
          transition-all duration-300 ease-in-out flex-1 min-w-0 relative
          ${isMobile ? 'ml-0 pt-16' : (sidebarCollapsed ? 'ml-24' : 'ml-80')}
          ${isTransitioning ? 'transform' : ''}
        `}
      >
        <main className={`
          p-6 min-h-screen relative
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

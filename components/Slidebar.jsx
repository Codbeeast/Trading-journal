'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  NotebookPen,
  Banknote,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Menu,
  Brain,
  X,
} from 'lucide-react';

// --- Navigation Items Configuration ---
const navigationItems = [
  { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/psychology', icon: Brain, label: 'Psychology' },
  { href: '/tradeJournal', icon: NotebookPen, label: 'Trade Journal' },
  { href: '/strategy', icon: Banknote, label: 'Strategy' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

// --- Main Sidebar Component ---
const Sidebar = ({ onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname(); // Get current path

  // --- Responsive Handling ---
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false); // Close mobile menu on resize to desktop
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // --- Toggle Handlers ---
  const handleToggle = () => {
    if (isMobile) {
      setIsMobileMenuOpen(prev => !prev);
    } else {
      const newCollapsedState = !isCollapsed;
      setIsCollapsed(newCollapsedState);
      onToggle?.(newCollapsedState);
    }
  };

  // --- Reusable Sidebar Content ---
  const SidebarContent = ({ isMobileView = false }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`
        relative flex items-center transition-all duration-300
        ${isCollapsed && !isMobileView ? 'justify-center h-[73px]' : 'p-6'}
        ${!isMobileView ? 'border-b border-blue-500/30' : 'border-b border-blue-500/30'}
      `}>
        {!isMobileView && (
          <button
            onClick={handleToggle}
            className="absolute -right-4 top-8 p-1.5 rounded-full bg-blue-950 border border-blue-700 text-blue-300 hover:bg-blue-800 hover:text-white transition-all z-10 shadow-lg"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
        <div className={`flex items-center gap-4 transition-opacity duration-300 ${isCollapsed && !isMobileView ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xl font-bold text-white whitespace-nowrap">ForeNotes</h1>
            <p className="text-xs text-blue-200 whitespace-nowrap">Trading Companion</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <div key={item.href} className="px-4">
              <Link href={item.href} onClick={isMobileView ? handleToggle : undefined}>
                <div
                  className={`group relative flex items-center h-12 rounded-lg text-blue-100 transition-all duration-300 overflow-hidden
                    ${isCollapsed && !isMobileView ? 'justify-center w-12' : 'px-4'}
                    ${isActive
                      ? 'bg-white/20 text-white font-medium shadow-lg shadow-blue-500/25 transform scale-105 backdrop-blur-sm'
                      : 'hover:bg-white/10 hover:text-white hover:shadow-md hover:scale-105 hover:backdrop-blur-sm'
                    }`
                  }
                >
                  {/* Active Link Indicator */}
                  <div className={`absolute left-0 h-full w-1 bg-gradient-to-b from-white to-blue-100 rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
                  
                  <Icon className={`relative z-10 transition-transform duration-300 h-5 w-5 ${isCollapsed && !isMobileView ? '' : 'mr-4'}`} />
                  <span className={`relative z-10 whitespace-nowrap transition-all duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 w-0' : 'opacity-100'}`}>
                    {item.label}
                  </span>

                  {/* Tooltip for Collapsed View */}
                  {isCollapsed && !isMobileView && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-blue-800 text-sm text-white rounded-xl shadow-2xl border border-blue-600/50 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20 transform translate-x-2 group-hover:translate-x-0">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-blue-500/30 transition-opacity duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="bg-gradient-to-r from-white/10 to-blue-400/20 rounded-2xl p-5 border border-blue-400/30 backdrop-blur-sm text-center">
          <Sparkles className="mx-auto h-6 w-6 text-yellow-400 mb-2" />
          <p className="text-sm font-semibold text-white">Upgrade to Pro</p>
          <p className="text-xs text-blue-200 mt-1">Unlock advanced features.</p>
        </div>
        <div className="mt-5 text-center">
          <p className="text-sm text-blue-200 font-medium">
            © {new Date().getFullYear()} ForeNotes
          </p>
          <p className="text-sm text-blue-300 mt-1">
            All rights reserved
          </p>
        </div>
      </div>
    </div>
  );

  // --- Render Logic ---
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-blue-500/30 backdrop-blur-xl flex items-center justify-between px-4"
          style={{
            background: 'linear-gradient(to bottom right, #020617, #172554, #0F172A)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-md flex items-center justify-center shadow-lg">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">ForeNotes</h1>
          </div>
          <button onClick={handleToggle} className="p-2 rounded-xl bg-white/10 border border-blue-400/30 hover:bg-white/20 hover:border-blue-300/50 transition-all duration-200 hover:shadow-lg backdrop-blur-sm">
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-blue-100" />
            ) : (
              <Menu className="w-5 h-5 text-blue-100" />
            )}
          </button>
        </div>

        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={handleToggle}
        ></div>

        {/* Mobile Menu */}
        <div className={`fixed top-0 right-0 h-full w-72 max-w-[85vw] border-l border-blue-500/30 backdrop-blur-xl z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{
            background: 'linear-gradient(to bottom right, #020617, #172554, #0F172A)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="p-6 flex items-center justify-between border-b border-blue-500/30">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-white to-blue-100 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-blue-700" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-blue-700 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ForeNotes</h1>
                <p className="text-sm text-blue-200 font-medium">Your Trading Companion</p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className="p-2 rounded-xl bg-white/10 border border-blue-400/30 hover:bg-white/20 hover:border-blue-300/50 transition-all duration-200 hover:shadow-lg backdrop-blur-sm"
            >
              <X className="w-5 h-5 text-blue-100" />
            </button>
          </div>
          <SidebarContent isMobileView={true} />
        </div>
      </>
    );
  }

  // --- Desktop Sidebar ---
  return (
    <aside className={`fixed top-0 left-0 h-full z-30 border-r border-blue-500/30 backdrop-blur-xl transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-72'}`}
      style={{
        background: 'linear-gradient(to bottom right, #020617, #172554, #0F172A)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;
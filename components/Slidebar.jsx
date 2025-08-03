'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // ✅ Using Next.js hook for active state
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
      <div className={`flex items-center border-b border-gray-700/50 transition-all duration-300 ${isCollapsed && !isMobileView ? 'justify-center h-[73px]' : 'p-6'}`}>
        {!isMobileView && (
          <button
            onClick={handleToggle}
            className="absolute -right-4 top-8 p-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white transition-all z-10"
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
            <p className="text-xs text-gray-400 whitespace-nowrap">Trading Companion</p>
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
                  className={`group relative flex items-center h-12 rounded-lg text-gray-300 transition-all duration-300 overflow-hidden
                    ${isCollapsed && !isMobileView ? 'justify-center w-12' : 'px-4'}
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white font-medium shadow-inner shadow-black/20'
                      : 'hover:bg-gray-700/50 hover:text-white'
                    }`
                  }
                >
                  {/* Illuminated Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-2xl"></div>
                  
                  {/* Active Link Indicator */}
                  <div className={`absolute left-0 h-6 w-1 bg-white rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>
                  
                  <Icon className={`relative z-10 transition-transform duration-300 h-5 w-5 ${isCollapsed && !isMobileView ? '' : 'mr-4'}`} />
                  <span className={`relative z-10 whitespace-nowrap transition-all duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 w-0' : 'opacity-100'}`}>
                    {item.label}
                  </span>

                  {/* Tooltip for Collapsed View */}
                  {isCollapsed && !isMobileView && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-800 text-sm text-white rounded-md shadow-lg border border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20">
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
      <div className={`p-4 border-t border-gray-700/50 transition-opacity duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
          <Sparkles className="mx-auto h-6 w-6 text-yellow-400 mb-2" />
          <p className="text-sm font-semibold text-white">Upgrade to Pro</p>
          <p className="text-xs text-gray-400 mt-1">Unlock advanced features.</p>
        </div>
      </div>
    </div>
  );

  // --- Render Logic ---
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-md flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">ForeNotes</h1>
          </div>
          <button onClick={handleToggle} className="p-2 text-gray-300 hover:text-white">
            <Menu size={24} />
          </button>
        </div>

        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={handleToggle}
        ></div>

        {/* Mobile Menu */}
        <div className={`fixed top-0 right-0 h-full w-72 bg-gray-900/90 backdrop-blur-xl border-l border-gray-700/50 z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <SidebarContent isMobileView={true} />
        </div>
      </>
    );
  }

  // --- Desktop Sidebar ---
  return (
    <aside className={`fixed top-0 left-0 h-full z-30 bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-72'}`}>
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;

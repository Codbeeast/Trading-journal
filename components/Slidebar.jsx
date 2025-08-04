'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
<<<<<<< HEAD
import Image from 'next/image';
=======
>>>>>>> b6b19fec3626669ac3d4dd5b0a10bd999016fe30
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  NotebookPen,
  Banknote,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
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
  const pathname = usePathname();

  // --- Responsive Handling ---
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
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
<<<<<<< HEAD
      <div className={`flex items-center border-b border-white/10 transition-all duration-300 ${isCollapsed && !isMobileView ? 'justify-center h-[73px]' : 'p-6'}`}>
=======
      <div className={`
        relative flex items-center transition-all duration-300
        ${isCollapsed && !isMobileView ? 'justify-center h-[73px]' : 'p-6'}
        ${!isMobileView ? 'border-b border-blue-500/30' : 'border-b border-blue-500/30'}
      `}>
>>>>>>> b6b19fec3626669ac3d4dd5b0a10bd999016fe30
        {!isMobileView && (
          <button
            onClick={handleToggle}
            className="absolute -right-4 top-8 p-1.5 rounded-full bg-blue-950 border border-blue-700 text-blue-300 hover:bg-blue-800 hover:text-white transition-all z-10 shadow-lg"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
<<<<<<< HEAD
        
        {/* Logo Section is now a Link */}
        <Link href="/" className={`flex items-center gap-2 transition-opacity duration-300 ${isCollapsed && !isMobileView ? 'opacity-0' : 'opacity-100'}`}>
          <Image 
            src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg" 
            alt="Forenotes Logo" 
            width={118}
            height={42}
            className="h-8 w-auto"
          />
          <h1 className="text-2xl font-bold text-white whitespace-nowrap">Forenotes</h1>
        </Link>
=======
        <div className={`flex items-center gap-4 transition-opacity duration-300 ${isCollapsed && !isMobileView ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xl font-bold text-white whitespace-nowrap">ForeNotes</h1>
            <p className="text-xs text-blue-200 whitespace-nowrap">Trading Companion</p>
          </div>
        </div>
>>>>>>> b6b19fec3626669ac3d4dd5b0a10bd999016fe30
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
<<<<<<< HEAD
                      ? 'bg-white/10 text-white font-medium'
                      : 'hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {/* Enhanced Hover/Active Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>
                  <div className={`absolute left-0 h-6 w-1 bg-white rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>
=======
                      ? 'bg-white/20 text-white font-medium shadow-lg shadow-blue-500/25 transform scale-105 backdrop-blur-sm'
                      : 'hover:bg-white/10 hover:text-white hover:shadow-md hover:scale-105 hover:backdrop-blur-sm'
                    }`
                  }
                >
                  {/* Active Link Indicator */}
                  <div className={`absolute left-0 h-full w-1 bg-gradient-to-b from-white to-blue-100 rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
>>>>>>> b6b19fec3626669ac3d4dd5b0a10bd999016fe30
                  
                  <Icon className={`relative z-10 transition-transform duration-300 h-5 w-5 ${isCollapsed && !isMobileView ? '' : 'mr-4'}`} />
                  <span className={`relative z-10 whitespace-nowrap transition-all duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 w-0' : 'opacity-100'}`}>
                    {item.label}
                  </span>

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
<<<<<<< HEAD
      <div className={`p-4 border-t border-white/10 transition-opacity duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
=======
      <div className={`p-4 border-t border-blue-500/30 transition-opacity duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="bg-gradient-to-r from-white/10 to-blue-400/20 rounded-2xl p-5 border border-blue-400/30 backdrop-blur-sm text-center">
>>>>>>> b6b19fec3626669ac3d4dd5b0a10bd999016fe30
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
<<<<<<< HEAD
        <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-black/50 backdrop-blur-lg border-b border-white/10 flex items-center justify-between px-4">
          {/* Updated Mobile Logo Link */}
          <Link href="/" className="flex items-center gap-2">
             <Image 
                src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg" 
                alt="Forenotes Logo" 
                width={118}
                height={42}
                className="h-7 w-auto"
              />
            <h1 className="text-lg font-bold text-white">Forenotes</h1>
          </Link>
          <button onClick={handleToggle} className="p-2 text-gray-300 hover:text-white">
            <Menu size={24} />
=======
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
>>>>>>> b6b19fec3626669ac3d4dd5b0a10bd999016fe30
          </button>
        </div>

        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={handleToggle}
        ></div>

        {/* Mobile Menu */}
<<<<<<< HEAD
        <div className={`fixed top-0 right-0 h-full w-72 bg-black/80 backdrop-blur-xl border-l border-white/10 z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
=======
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
>>>>>>> b6b19fec3626669ac3d4dd5b0a10bd999016fe30
          <SidebarContent isMobileView={true} />
        </div>
      </>
    );
  }

  // --- Desktop Sidebar ---
  return (
<<<<<<< HEAD
    <aside className={`fixed top-0 left-0 h-full z-30 bg-black/50 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-72'}`}>
=======
    <aside className={`fixed top-0 left-0 h-full z-30 border-r border-blue-500/30 backdrop-blur-xl transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-72'}`}
      style={{
        background: 'linear-gradient(to bottom right, #020617, #172554, #0F172A)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
      }}
    >
>>>>>>> b6b19fec3626669ac3d4dd5b0a10bd999016fe30
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;
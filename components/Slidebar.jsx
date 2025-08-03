'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
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

const Sidebar = ({ onToggle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleCollapse = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setIsTransitioning(true);
      const newCollapsed = !collapsed;
      setCollapsed(newCollapsed);
      onToggle?.(newCollapsed);

      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  };

  const [currentPath, setCurrentPath] = useState('');

  const navigationItems = [
    {
      href: '/dashboard',
      icon: BarChart3,
      label: 'Dashboard',
      badge: null
    },
    {
      href: '/psychology',
      icon: Brain,
      label: 'Psychology',
      badge: null
    },
    {
      href: '/tradeJournal',
      icon: NotebookPen,
      label: 'Trade Journal',
      badge: null
    },
    {
      href: '/backtest',
      icon: Banknote,
      label: 'Backtest',
      badge: null
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profile',
      badge: null
    },
    {
      href: '/settings',
      icon: Settings,
      label: 'Settings',
      badge: null
    },
  ];

  const isActive = (href) => currentPath === href;

  const linkClass = (active, isCollapsed) => `
    group relative flex items-center ${isCollapsed ? 'justify-center px-4' : 'px-6'} 
    py-4 mx-3 rounded-2xl font-medium transition-all duration-300 ease-in-out
    ${active
      ? 'bg-white/20 text-white shadow-lg shadow-blue-500/25 transform scale-105 backdrop-blur-sm'
      : 'text-blue-100 hover:text-white hover:bg-white/10 hover:shadow-md hover:scale-105 hover:backdrop-blur-sm'
    }
    ${isCollapsed ? 'w-14 h-14' : 'w-full'}
  `;

  const mobileLinkClass = (active) => `
    group relative flex items-center px-6 py-4 mx-3 rounded-2xl font-medium 
    transition-all duration-300 ease-in-out w-full
    ${active
      ? 'bg-white/20 text-white shadow-lg shadow-blue-500/25 transform scale-105 backdrop-blur-sm'
      : 'text-blue-100 hover:text-white hover:bg-white/10 hover:shadow-md hover:scale-105 hover:backdrop-blur-sm'
    }
  `;

  // Mobile Layout
  if (isMobile) {
    return (
      <>
        {/* Fixed Mobile Header - Only takes header space */}
        <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-r from-[#0b1623] via-[#102030] to-[#12263a] border-b border-blue-500/30 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-600/10 pointer-events-none" />

          <div className="relative flex items-center justify-between h-full px-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-white to-blue-100 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-4 h-4 text-blue-700" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-700 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">ForeNotes</h1>
                <p className="text-xs text-blue-200 font-medium">Your Trading Companion</p>
              </div>
            </div>

            <button
              onClick={toggleCollapse}
              className="p-2 rounded-xl bg-white/10 border border-blue-400/30 hover:bg-white/20 hover:border-blue-300/50 transition-all duration-200 hover:shadow-lg backdrop-blur-sm"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-blue-100" />
              ) : (
                <Menu className="w-5 h-5 text-blue-100" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay - Only appears when menu is open */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={toggleCollapse} />
        )}

        {/* Mobile Navigation Menu - Slides in from right */}
        <div className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 
          bg-gradient-to-b from-[#0b1623] via-[#102030] to-[#12263a]
          border-l border-blue-500/30 backdrop-blur-xl 
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-600/10 pointer-events-none" />

          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-500/30">
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
              onClick={toggleCollapse}
              className="p-2 rounded-xl bg-white/10 border border-blue-400/30 hover:bg-white/20 hover:border-blue-300/50 transition-all duration-200 hover:shadow-lg backdrop-blur-sm"
            >
              <X className="w-5 h-5 text-blue-100" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 py-8 space-y-3">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <div
                  key={item.href}
                  className="relative"
                  style={{
                    transitionDelay: `${index * 50}ms`
                  }}
                >
                  <Link
                    href={item.href}
                    className={mobileLinkClass(active)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="relative flex items-center w-full">
                      <Icon className={`
                        w-6 h-6 transition-all duration-200 flex-shrink-0
                        ${active ? 'text-white' : 'text-blue-100 group-hover:text-white'}
                      `} />

                      <div className="ml-4 flex items-center justify-between w-full">
                        <span className="text-base font-medium tracking-wide">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="ml-auto px-3 py-1 text-sm font-bold bg-red-500 text-white rounded-full min-w-[24px] text-center flex-shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Active indicator */}
                    {active && (
                      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-white to-blue-100 rounded-r-full transition-all duration-300" />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Mobile Premium footer */}
          <div className="p-6 border-t border-blue-500/30 mt-auto">
            <div className="bg-gradient-to-r from-white/10 to-blue-400/20 rounded-2xl p-5 border border-blue-400/30 backdrop-blur-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">Premium Plan</p>
                  <p className="text-sm text-blue-200">Advanced analytics</p>
                </div>
              </div>
              <div className="w-full bg-blue-600/50 rounded-full h-3 mb-3">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full w-4/5 transition-all duration-500" />
              </div>
              <p className="text-sm text-blue-200">80% of features used</p>
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
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className={`
      fixed top-0 left-0 min-h-screen z-50 flex flex-col 
      bg-gradient-to-b from-[#0b1623] via-[#102030] to-[#12263a]
      border-r border-blue-500/30 backdrop-blur-xl 
      transition-all duration-300 ease-in-out transform
      ${collapsed ? 'w-24' : 'w-80'}
      ${isTransitioning ? 'shadow-2xl shadow-blue-500/20' : ''}
    `}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-600/10 pointer-events-none" />

      {/* Header */}
      <div className={`
        flex items-center border-b border-blue-500/30
        transition-all duration-300 ease-in-out
        ${collapsed ? 'justify-center p-4' : 'justify-between p-6'}
      `}>
        <div className={`
          flex items-center space-x-4 transition-all duration-300 ease-in-out
          ${collapsed ? 'opacity-0 scale-90 pointer-events-none absolute' : 'opacity-100 scale-100'}
        `}>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-white to-blue-100 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-blue-700" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-blue-700 animate-pulse" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-2xl font-bold text-white whitespace-nowrap">
              ForeNotes
            </h1>
            <p className="text-sm text-blue-200 font-medium whitespace-nowrap">
              Your Trading Companion
            </p>
          </div>
        </div>

        <button
          onClick={toggleCollapse}
          className={`
            p-3 rounded-xl bg-white/10 border border-blue-400/30 
            hover:bg-white/20 hover:border-blue-300/50 transition-all duration-200 
            hover:shadow-lg group backdrop-blur-sm flex-shrink-0
            ${isTransitioning ? 'scale-110' : ''}
          `}
        >
          <div className={`transition-transform duration-300 ease-in-out ${isTransitioning ? 'rotate-180' : ''}`}>
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-blue-100 group-hover:text-white transition-colors" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-blue-100 group-hover:text-white transition-colors" />
            )}
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 space-y-3 flex flex-col justify-center">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <div
              key={item.href}
              className="relative"
              style={{
                transitionDelay: `${index * 50}ms`
              }}
            >
              <Link href={item.href} className={linkClass(active, collapsed)}>
                <div className="relative flex items-center w-full">
                  <Icon className={`
                    w-6 h-6 transition-all duration-200 flex-shrink-0
                    ${active ? 'text-white' : 'text-blue-100 group-hover:text-white'}
                  `} />

                  <div className={`
                    ml-4 flex items-center justify-between w-full overflow-hidden
                    transition-all duration-300 ease-in-out
                    ${collapsed ? 'opacity-0 scale-90 -translate-x-4' : 'opacity-100 scale-100 translate-x-0'}
                  `}>
                    <span className="text-base font-medium tracking-wide whitespace-nowrap">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="ml-auto px-3 py-1 text-sm font-bold bg-red-500 text-white rounded-full min-w-[24px] text-center flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-white to-blue-100 rounded-r-full transition-all duration-300" />
                )}
              </Link>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="
                  absolute left-20 top-1/2 -translate-y-1/2 px-4 py-3 
                  bg-blue-800 text-white text-sm rounded-xl shadow-2xl
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200 z-50 whitespace-nowrap
                  border border-blue-600/50 backdrop-blur-sm
                  transform translate-x-2 group-hover:translate-x-0
                ">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 px-2 py-1 text-xs bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-blue-800 border-l border-t border-blue-600/50 rotate-45" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Premium footer */}
      <div className={`
        p-6 border-t border-blue-500/30 mt-auto
        transition-all duration-300 ease-in-out
        ${collapsed ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}
      `}>
        <div className="bg-gradient-to-r from-white/10 to-blue-400/20 rounded-2xl p-5 border border-blue-400/30 backdrop-blur-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-base font-semibold text-white whitespace-nowrap">Premium Plan</p>
              <p className="text-sm text-blue-200 whitespace-nowrap">Advanced analytics</p>
            </div>
          </div>
          <div className="w-full bg-blue-600/50 rounded-full h-3 mb-3">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full w-4/5 transition-all duration-500" />
          </div>
          <p className="text-sm text-blue-200">80% of features used</p>
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
};

export default Sidebar;
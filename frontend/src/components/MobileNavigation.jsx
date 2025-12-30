import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import DarkModeToggle from './DarkModeToggle';
import { Menu, X, Home, Receipt, PieChart, Tag, Settings, CreditCard } from 'lucide-react';

const MobileNavigation = ({ activeNav, setActiveNav }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Mock user data - normally would come from context
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = (navItem) => {
    if (setActiveNav) {
      setActiveNav(navItem);
    }
    closeMenu();
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20">
              S
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
              Spendora
            </h1>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            <DarkModeToggle />
            <ProfileDropdown />

            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMenu}
      >
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Menu
            </h2>
            <button
              onClick={closeMenu}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-80px)]">
            {/* User Info */}
            <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-medium text-sm">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Navigation</p>
              
              <button onClick={() => handleNavClick('dashboard')} className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              
              <button onClick={() => handleNavClick('expenses')} className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-colors">
                <Receipt className="w-5 h-5" />
                <span className="font-medium">Expenses</span>
              </button>
              
              <button onClick={() => handleNavClick('budget')} className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-colors">
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Budget</span>
              </button>
              
              <button onClick={() => handleNavClick('reports')} className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-colors">
                <PieChart className="w-5 h-5" />
                <span className="font-medium">Reports</span>
              </button>
              
              <button onClick={() => handleNavClick('categories')} className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-colors">
                <Tag className="w-5 h-5" />
                <span className="font-medium">Categories</span>
              </button>
              
              <button onClick={() => handleNavClick('settings')} className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-colors">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
               {/* Quick stats could be dynamic, but utilizing space for now */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
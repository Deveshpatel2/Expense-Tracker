import React from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ProfileDropdown from '../components/ProfileDropdown';
import DarkModeToggle from '../components/DarkModeToggle';
import MobileNavigation from '../components/MobileNavigation';
import './Dashboard.css';

const Dashboard = () => {
  // Mock user data for now
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Spendora</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}!</p>
            </div>
            
            {/* Dark Mode Toggle and Profile */}
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <DarkModeToggle />
              
              {/* Profile Dropdown */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Just the Analytics Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:pt-8 pt-20">
        <AnalyticsDashboard />
      </div>
    </div>
  );
};

export default Dashboard;
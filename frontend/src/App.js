import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import UserRegister from './components/UserRegister';
import Dashboard from './pages/Dashboard';
import EmailVerification from './components/EmailVerification';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { TimezoneProvider } from './context/TimezoneContext';
import { NotificationProvider } from './components/NotificationSystem';
import { LoadingProvider } from './components/LoadingStates';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <TimezoneProvider>
            <NotificationProvider>
              <LoadingProvider>
                <Router>
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<UserRegister />} />
                      <Route path="/verify-email" element={<EmailVerification />} />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </div>
                </Router>
              </LoadingProvider>
            </NotificationProvider>
          </TimezoneProvider>
        </CurrencyProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;

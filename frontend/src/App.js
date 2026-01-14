import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Login from './components/Login';
import UserRegister from './components/UserRegister';
import EmailVerification from './components/EmailVerification';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { TimezoneProvider } from './context/TimezoneContext';
import { NotificationProvider } from './components/NotificationSystem';
import { LoadingProvider } from './components/LoadingStates';

function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <CurrencyProvider>
          <TimezoneProvider>
            <NotificationProvider>
              <LoadingProvider>
                <Router>
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<UserRegister />} />
                      <Route path="/verify-email" element={<EmailVerification />} />

                      {/* Protected Routes */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <AnalyticsDashboard />
                          </ProtectedRoute>
                        }
                      />

                      {/* Default redirect */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>


                  </div>
                </Router>
              </LoadingProvider>
            </NotificationProvider>
          </TimezoneProvider>
        </CurrencyProvider>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
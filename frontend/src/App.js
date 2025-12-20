import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import UserRegister from './components/UserRegister';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { TimezoneProvider } from './context/TimezoneContext';
import { NotificationProvider } from './components/NotificationSystem';
import { LoadingProvider } from './components/LoadingStates';
import AIChatAssistant from './components/AIChatAssistant';

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
                      
                      {/* Protected Routes */}
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Default redirect */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                    
                    {/* AI Chat Assistant - Available on all pages */}
                    <AIChatAssistant />
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
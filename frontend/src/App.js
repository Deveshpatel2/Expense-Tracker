import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import { DarkModeProvider } from './context/DarkModeContext';
import { NotificationProvider } from './components/NotificationSystem';
import { LoadingProvider } from './components/LoadingStates';

function App() {
  return (
    <DarkModeProvider>
      <NotificationProvider>
        <LoadingProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </div>
          </Router>
        </LoadingProvider>
      </NotificationProvider>
    </DarkModeProvider>
  );
}

export default App;
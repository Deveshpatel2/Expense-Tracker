import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTimezone } from '../context/TimezoneContext';
import { useDarkMode } from '../context/DarkModeContext';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user } = useAuth();
  const { selectedCurrency, currencies, setSelectedCurrency } = useCurrency();
  
  // Handle case where setSelectedCurrency might not exist
  const { selectedTimezone, timezones, setSelectedTimezone } = useTimezone();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    currency: selectedCurrency,
    timezone: selectedTimezone,
    darkMode: isDarkMode
  });

  useEffect(() => {
    setSettings({
      currency: selectedCurrency,
      timezone: selectedTimezone,
      darkMode: isDarkMode
    });
  }, [selectedCurrency, selectedTimezone, isDarkMode]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update contexts immediately
      setSelectedCurrency(settings.currency);
      setSelectedTimezone(settings.timezone);
      if (settings.darkMode !== isDarkMode) {
        toggleDarkMode();
      }

      // Save to backend
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to save settings');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          timezone: settings.timezone,
          currency: settings.currency
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/login?expired=true';
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save settings');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to export data');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/user/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/login?expired=true';
          return;
        }
        throw new Error('Failed to export data');
      }

      const data = await response.json();
      if (data.success) {
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setSuccess('Data exported successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setError(error.message || 'Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2 className="settings-title">Settings</h2>
        <p className="settings-subtitle">Manage your account preferences and data</p>
      </div>

      {error && (
        <div className="settings-alert settings-alert-error">
          <span>{error}</span>
          <button onClick={() => setError('')} className="settings-alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="settings-alert settings-alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="settings-alert-close">×</button>
        </div>
      )}

      <div className="settings-content">
        {/* Appearance Settings */}
        <div className="settings-section">
          <h3 className="settings-section-title">Appearance</h3>
          <div className="settings-section-content">
            <div className="settings-field">
              <label className="settings-label">Dark Mode</label>
              <div className="settings-toggle">
                <button
                  type="button"
                  onClick={() => {
                    setSettings({ ...settings, darkMode: !settings.darkMode });
                    toggleDarkMode();
                  }}
                  className={`settings-toggle-button ${isDarkMode ? 'active' : ''}`}
                >
                  <span className="settings-toggle-slider"></span>
                </button>
                <span className="settings-toggle-label">
                  {isDarkMode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="settings-section">
          <h3 className="settings-section-title">Currency</h3>
          <div className="settings-section-content">
            <div className="settings-field">
              <label className="settings-label" htmlFor="currency">
                Default Currency
              </label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="settings-select"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
              <p className="settings-help-text">
                This currency will be used as default for new expenses
              </p>
            </div>
          </div>
        </div>

        {/* Timezone Settings */}
        <div className="settings-section">
          <h3 className="settings-section-title">Timezone</h3>
          <div className="settings-section-content">
            <div className="settings-field">
              <label className="settings-label" htmlFor="timezone">
                Timezone
              </label>
              <select
                id="timezone"
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="settings-select"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="settings-help-text">
                Current time: {new Date().toLocaleString('en-US', { timeZone: settings.timezone })}
              </p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h3 className="settings-section-title">Data Management</h3>
          <div className="settings-section-content">
            <div className="settings-field">
              <div className="settings-action-card">
                <div className="settings-action-info">
                  <h4 className="settings-action-title">Export Your Data</h4>
                  <p className="settings-action-description">
                    Download all your expense data as a JSON file for backup or migration
                  </p>
                </div>
                <button
                  onClick={handleExportData}
                  disabled={loading}
                  className="settings-action-button"
                >
                  {loading ? 'Exporting...' : 'Export Data'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="settings-section">
          <h3 className="settings-section-title">Account Information</h3>
          <div className="settings-section-content">
            <div className="settings-info-grid">
              <div className="settings-info-item">
                <span className="settings-info-label">Email:</span>
                <span className="settings-info-value">{user?.email || 'N/A'}</span>
              </div>
              <div className="settings-info-item">
                <span className="settings-info-label">Account Type:</span>
                <span className="settings-info-value">
                  {user?.isGuest ? 'Guest' : user?.isGoogleUser ? 'Google' : 'Regular'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button
            onClick={handleSave}
            disabled={loading}
            className="settings-save-button"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


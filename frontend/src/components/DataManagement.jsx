import React, { useState, useRef } from 'react';
import { dataAPI } from '../services/api';
import './DataManagement.css';

const DataManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importResults, setImportResults] = useState(null);
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'all'
  });
  
  const fileInputRef = useRef(null);

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Utilities',
    'Housing',
    'Education',
    'Travel',
    'Other'
  ];

  const handleExportCSV = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await dataAPI.exportCSV();
      setSuccess('CSV exported successfully!');
    } catch (error) {
      setError('Failed to export CSV: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');
    setImportResults(null);

    try {
      const csvData = await file.text();
      const result = await dataAPI.importCSV(csvData);
      
      setImportResults(result.data);
      setSuccess(`Imported ${result.data.imported} expenses successfully!`);
      
      if (result.data.errors > 0) {
        setError(`${result.data.errors} rows had errors. Check details below.`);
      }
    } catch (error) {
      setError('Failed to import CSV: ' + error.message);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await dataAPI.exportPDF(
        reportFilters.startDate || undefined,
        reportFilters.endDate || undefined,
        reportFilters.category !== 'all' ? reportFilters.category : undefined
      );
      setSuccess('Report exported successfully!');
    } catch (error) {
      setError('Failed to export report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await dataAPI.backupData();
      setSuccess('Data backed up successfully!');
    } catch (error) {
      setError('Failed to backup data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setReportFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📊 Data Management
        </h2>
        
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Import Results */}
        {importResults && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Import Results</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ✅ Imported: {importResults.imported} expenses
            </p>
            {importResults.errors > 0 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                ❌ Errors: {importResults.errors} rows
              </p>
            )}
            {importResults.errorDetails && importResults.errorDetails.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Error Details:</p>
                <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside">
                  {importResults.errorDetails.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CSV Export */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              📤 Export Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Export all your expenses and budgets to CSV format
            </p>
            <button
              onClick={handleExportCSV}
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>

          {/* CSV Import */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              📥 Import Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Import expenses from CSV file (bank statements, etc.)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              disabled={loading}
              className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Expected format: ID,Description,Amount,Category,Date,Notes,Currency
            </p>
          </div>

          {/* PDF Report */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              📄 Generate Report
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Generate HTML report with filters
            </p>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={reportFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={handleExportPDF}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>

          {/* Data Backup */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              💾 Backup Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create a complete backup of all your data in JSON format
            </p>
            <button
              onClick={handleBackupData}
              disabled={loading}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Backing up...' : 'Backup Data'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📋 Instructions</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• <strong>CSV Export:</strong> Downloads all your expenses and budgets in CSV format</li>
            <li>• <strong>CSV Import:</strong> Upload bank statements or other CSV files to import expenses</li>
            <li>• <strong>PDF Report:</strong> Generate filtered HTML reports for specific date ranges and categories</li>
            <li>• <strong>Data Backup:</strong> Create a complete JSON backup of all your data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;

import React, { useState } from 'react';
import { budgetAPI } from '../services/api';
import './BudgetTemplates.css';

const BudgetTemplates = ({ templates, categories, onBudgetsCreated, selectedCurrency }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [targetMonth, setTargetMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await budgetAPI.createFromTemplate(selectedTemplate, `${targetMonth}-01`);
      onBudgetsCreated(response.data);
      setSuccess(`${response.data.length} budgets created successfully from ${selectedTemplate} template!`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToNextMonth = async () => {
    if (!selectedTemplate) {
      setError('Please select a template first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const currentMonth = new Date(targetMonth + '-01');
      const response = await budgetAPI.copyToNextMonth(currentMonth.toISOString().split('T')[0]);
      onBudgetsCreated(response.data);
      setSuccess(`${response.data.length} budgets copied to next month successfully!`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount, currency = selectedCurrency) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$',
      'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'BRL': 'R$'
    };
    return `${symbols[currency] || currency} ${parseFloat(amount).toFixed(2)}`;
  };

  const getTotalBudget = (template) => {
    return Object.values(template.categories).reduce((sum, amount) => sum + amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Templates</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="input"
            >
              <option value="">Choose a template...</option>
              {Object.entries(templates).map(([key, template]) => (
                <option key={key} value={key}>
                  {template.name} - {formatAmount(getTotalBudget(template))}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Month
            </label>
            <input
              type="month"
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleCreateFromTemplate}
            disabled={loading || !selectedTemplate}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Budgets from Template'}
          </button>
          
          <button
            onClick={handleCopyToNextMonth}
            disabled={loading || !selectedTemplate}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Copying...' : 'Copy to Next Month'}
          </button>
        </div>
      </div>

      {/* Template Details */}
      {selectedTemplate && templates[selectedTemplate] && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {templates[selectedTemplate].name} Template
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {templates[selectedTemplate].description}
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(templates[selectedTemplate].categories).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category}
                  </span>
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {formatAmount(amount)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Budget
                </span>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatAmount(getTotalBudget(templates[selectedTemplate]))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Template Comparison</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                {Object.entries(templates).map(([key, template]) => (
                  <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {template.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map((category) => (
                <tr key={category}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {category}
                  </td>
                  {Object.entries(templates).map(([key, template]) => (
                    <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {template.categories[category] ? formatAmount(template.categories[category]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                  Total
                </td>
                {Object.entries(templates).map(([key, template]) => (
                  <td key={key} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {formatAmount(getTotalBudget(template))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md">
          {success}
        </div>
      )}
    </div>
  );
};

export default BudgetTemplates;

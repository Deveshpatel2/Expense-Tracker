import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { budgetAPI } from '../services/api';
import BudgetSetup from './BudgetSetup';
import BudgetMonitoring from './BudgetMonitoring';
import BudgetTemplates from './BudgetTemplates';
import BudgetHistory from './BudgetHistory';
import './BudgetManager.css';

const BudgetManager = () => {
  const { selectedCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('setup');
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const defaultCategories = [
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

  const budgetTemplates = {
    conservative: {
      name: 'Conservative',
      description: 'Tight budget for essential expenses only',
      categories: {
        'Food & Dining': 300,
        'Transportation': 200,
        'Utilities': 150,
        'Healthcare': 100,
        'Housing': 800,
        'Other': 50
      }
    },
    moderate: {
      name: 'Moderate',
      description: 'Balanced budget with some flexibility',
      categories: {
        'Food & Dining': 500,
        'Transportation': 300,
        'Shopping': 200,
        'Entertainment': 150,
        'Utilities': 200,
        'Healthcare': 150,
        'Housing': 1000,
        'Education': 100,
        'Travel': 200,
        'Other': 100
      }
    },
    liberal: {
      name: 'Liberal',
      description: 'Comfortable budget with room for luxuries',
      categories: {
        'Food & Dining': 800,
        'Transportation': 500,
        'Shopping': 400,
        'Entertainment': 300,
        'Utilities': 250,
        'Healthcare': 200,
        'Housing': 1500,
        'Education': 300,
        'Travel': 500,
        'Other': 200
      }
    }
  };

  const loadBudgets = async (month = null) => {
    setLoading(true);
    setError('');
    try {
      const monthParam = month ? month.toISOString().split('T')[0] : null;
      const response = await budgetAPI.getBudgets(monthParam);
      setBudgets(response.data || []);
    } catch (error) {
      setError('Failed to load budgets: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleBudgetCreated = (newBudget) => {
    setBudgets(prev => [...prev, newBudget]);
    setSuccess('Budget created successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleBudgetUpdated = (updatedBudget) => {
    setBudgets(prev => prev.map(budget => 
      budget.id === updatedBudget.id ? updatedBudget : budget
    ));
    setSuccess('Budget updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleBudgetDeleted = (budgetId) => {
    setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
    setSuccess('Budget deleted successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleBudgetsCreated = (newBudgets) => {
    setBudgets(prev => [...prev, ...newBudgets]);
    setSuccess(`${newBudgets.length} budgets created successfully!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Management</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('setup')}
            className={`flex-1 py-3 px-4 text-sm font-medium whitespace-nowrap ${
              activeTab === 'setup'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Budget Setup
          </button>
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`flex-1 py-3 px-4 text-sm font-medium whitespace-nowrap ${
              activeTab === 'monitoring'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Budget Monitoring
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-3 px-4 text-sm font-medium whitespace-nowrap ${
              activeTab === 'templates'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 text-sm font-medium whitespace-nowrap ${
              activeTab === 'history'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            History
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md mb-4">
            {success}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'setup' && (
          <BudgetSetup
            categories={defaultCategories}
            onBudgetCreated={handleBudgetCreated}
            onBudgetUpdated={handleBudgetUpdated}
            onBudgetDeleted={handleBudgetDeleted}
            budgets={budgets}
            selectedCurrency={selectedCurrency}
          />
        )}

        {activeTab === 'monitoring' && (
          <BudgetMonitoring
            budgets={budgets}
            onBudgetUpdated={handleBudgetUpdated}
            onBudgetDeleted={handleBudgetDeleted}
            selectedCurrency={selectedCurrency}
            onRefresh={loadBudgets}
          />
        )}

        {activeTab === 'templates' && (
          <BudgetTemplates
            templates={budgetTemplates}
            categories={defaultCategories}
            onBudgetsCreated={handleBudgetsCreated}
            selectedCurrency={selectedCurrency}
          />
        )}

        {activeTab === 'history' && (
          <BudgetHistory
            budgets={budgets}
            onRefresh={loadBudgets}
            selectedCurrency={selectedCurrency}
          />
        )}
      </div>
    </div>
  );
};

export default BudgetManager;

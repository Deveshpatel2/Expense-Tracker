import React, { useState, useEffect } from 'react';
import { budgetAPI } from '../services/api';
import './BudgetMonitoring.css';

const BudgetMonitoring = ({ budgets, onBudgetUpdated, onBudgetDeleted, selectedCurrency, onRefresh }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBudgetSummary = async (month) => {
    setLoading(true);
    setError('');
    try {
      const monthParam = `${month}-01`;
      console.log('Loading budget summary for month:', monthParam);
      const response = await budgetAPI.getBudgetSummary(monthParam);
      setBudgetSummary(response.data);
    } catch (error) {
      console.error('Budget summary error:', error);
      setError('Failed to load budget summary: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('BudgetMonitoring useEffect triggered, selectedMonth:', selectedMonth);
    loadBudgetSummary(selectedMonth);
  }, [selectedMonth]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const formatAmount = (amount, currency) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$',
      'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'BRL': 'R$'
    };
    return `${symbols[currency] || currency} ${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'exceeded':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'on_track':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
    }
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'exceeded':
        return 'Exceeded';
      case 'warning':
        return 'Warning';
      case 'on_track':
        return 'On Track';
      default:
        return 'Unknown';
    }
  };

  const currentMonthBudgets = budgets.filter(budget => 
    budget.budgetMonth && budget.budgetMonth.startsWith(selectedMonth)
  );

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Monitoring</h3>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Month:
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="input w-auto"
            />
            <button
              onClick={() => onRefresh(selectedMonth + '-01')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Budget Summary */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading budget summary...</span>
          </div>
        </div>
      ) : budgetSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatAmount(budgetSummary.totalBudget, selectedCurrency)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatAmount(budgetSummary.totalSpent, selectedCurrency)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Remaining</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatAmount(budgetSummary.remaining, selectedCurrency)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Utilization</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {budgetSummary.utilizationPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Overall Progress Bar */}
      {budgetSummary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Budget Progress</h4>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div
              className={`h-4 rounded-full ${getProgressBarColor(budgetSummary.utilizationPercentage)}`}
              style={{ width: `${Math.min(budgetSummary.utilizationPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span>0%</span>
            <span className="font-medium">{budgetSummary.utilizationPercentage.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Individual Budget Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Category Budgets</h4>
        </div>
        
        <div className="p-6 space-y-6">
          {currentMonthBudgets.map((budget) => (
            <div key={budget.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h5 className="text-lg font-medium text-gray-900 dark:text-white">
                    {budget.category}
                  </h5>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(budget.status)}`}>
                    {getStatusText(budget.status)}
                  </span>
                  {budget.alertTriggered && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Alert
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatAmount(budget.actualSpent, budget.currency)} / {formatAmount(budget.amount, budget.currency)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {budget.utilizationPercentage.toFixed(1)}% utilized
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full ${getProgressBarColor(budget.utilizationPercentage)}`}
                  style={{ width: `${Math.min(budget.utilizationPercentage, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Budget: {formatAmount(budget.amount, budget.currency)}</span>
                <span>Remaining: {formatAmount(budget.remainingAmount, budget.currency)}</span>
              </div>
              
              {budget.notes && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <strong>Notes:</strong> {budget.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {currentMonthBudgets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No budgets found for the selected month.</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default BudgetMonitoring;

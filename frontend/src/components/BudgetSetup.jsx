import React, { useState } from 'react';
import { budgetAPI } from '../services/api';
import './BudgetSetup.css';

const BudgetSetup = ({ categories, onBudgetCreated, onBudgetUpdated, onBudgetDeleted, budgets, selectedCurrency }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    currency: selectedCurrency,
    budgetMonth: new Date().toISOString().slice(0, 7) + '-01', // First day of current month
    notes: '',
    alertThreshold: 80,
    isTemplate: false,
    templateName: ''
  });
  const [editingBudget, setEditingBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      let response;
      if (editingBudget) {
        response = await budgetAPI.updateBudget(editingBudget.id, budgetData);
        onBudgetUpdated(response.data);
      } else {
        response = await budgetAPI.createBudget(budgetData);
        onBudgetCreated(response.data);
      }
      resetForm();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      currency: budget.currency,
      budgetMonth: budget.budgetMonth,
      notes: budget.notes || '',
      alertThreshold: budget.alertThreshold || 80,
      isTemplate: budget.isTemplate || false,
      templateName: budget.templateName || ''
    });
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await budgetAPI.deleteBudget(budgetId);
      onBudgetDeleted(budgetId);
    } catch (error) {
      setError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      currency: selectedCurrency,
      budgetMonth: new Date().toISOString().slice(0, 7) + '-01',
      notes: '',
      alertThreshold: 80,
      isTemplate: false,
      templateName: ''
    });
    setEditingBudget(null);
  };

  const formatAmount = (amount, currency) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$',
      'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'BRL': 'R$'
    };
    return `${symbols[currency] || currency} ${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Budget Form */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {editingBudget ? 'Edit Budget' : 'Create New Budget'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="input"
              >
                <option value="USD">USD - $</option>
                <option value="EUR">EUR - €</option>
                <option value="GBP">GBP - £</option>
                <option value="INR">INR - ₹</option>
                <option value="CAD">CAD - C$</option>
                <option value="AUD">AUD - A$</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Month *
              </label>
              <input
                type="month"
                name="budgetMonth"
                value={formData.budgetMonth.slice(0, 7)}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetMonth: e.target.value + '-01' }))}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alert Threshold (%)
              </label>
              <select
                name="alertThreshold"
                value={formData.alertThreshold}
                onChange={handleChange}
                className="input"
              >
                <option value={70}>70%</option>
                <option value={80}>80%</option>
                <option value={90}>90%</option>
                <option value={95}>95%</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isTemplate"
                  checked={formData.isTemplate}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Save as template</span>
              </label>
            </div>
          </div>

          {formData.isTemplate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name
              </label>
              <input
                type="text"
                name="templateName"
                value={formData.templateName}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Monthly Essentials"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input"
              placeholder="Additional notes (optional)"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingBudget ? 'Update Budget' : 'Create Budget')}
            </button>
            
            {editingBudget && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Existing Budgets */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Existing Budgets</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Alert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {budgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {budget.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatAmount(budget.amount, budget.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(budget.budgetMonth)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {budget.alertThreshold}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {budget.isTemplate ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        Template
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                        Regular
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {budgets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No budgets created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetSetup;

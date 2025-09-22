import React, { useState, useEffect } from 'react';
import { recurringAPI } from '../services/api';
import './RecurringExpenses.css';

const RecurringExpenses = ({ onExpenseAdded }) => {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    pattern: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    currency: 'USD'
  });

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

  const patterns = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  useEffect(() => {
    loadRecurringExpenses();
  }, []);

  const loadRecurringExpenses = async () => {
    try {
      setLoading(true);
      const response = await recurringAPI.getRecurringExpenses();
      setRecurringExpenses(response.data || []);
    } catch (error) {
      setError('Failed to load recurring expenses: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (editingExpense) {
        await recurringAPI.updateRecurringExpense(editingExpense.id, formData);
        setSuccess('Recurring expense updated successfully!');
      } else {
        await recurringAPI.createRecurringExpense(formData);
        setSuccess('Recurring expense created successfully!');
      }
      
      setShowForm(false);
      setEditingExpense(null);
      resetForm();
      loadRecurringExpenses();
    } catch (error) {
      setError('Failed to save recurring expense: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      pattern: expense.pattern,
      startDate: expense.startDate,
      endDate: expense.endDate || '',
      notes: expense.notes || '',
      currency: expense.currency
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recurring expense?')) {
      return;
    }

    try {
      setLoading(true);
      await recurringAPI.deleteRecurringExpense(id);
      setSuccess('Recurring expense deleted successfully!');
      loadRecurringExpenses();
    } catch (error) {
      setError('Failed to delete recurring expense: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateExpenses = async () => {
    if (!window.confirm('This will generate expenses for all active recurring patterns. Continue?')) {
      return;
    }

    try {
      setGenerating(true);
      setError('');
      const response = await recurringAPI.generateExpenses();
      setSuccess(`Generated ${response.data.generated} expenses from recurring patterns!`);
      
      if (onExpenseAdded) {
        onExpenseAdded();
      }
    } catch (error) {
      setError('Failed to generate expenses: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      pattern: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      currency: 'USD'
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
    resetForm();
  };

  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getPatternLabel = (pattern) => {
    return patterns.find(p => p.value === pattern)?.label || pattern;
  };

  if (loading && recurringExpenses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            🔄 Recurring Expenses
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={handleGenerateExpenses}
              disabled={generating || recurringExpenses.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Expenses'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Recurring Expense
            </button>
          </div>
        </div>

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

        {/* Recurring Expenses List */}
        {recurringExpenses.length > 0 ? (
          <div className="space-y-4">
            {recurringExpenses.map((expense) => (
              <div key={expense.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {expense.description}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        expense.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {expense.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatAmount(expense.amount, expense.currency)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Category:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{expense.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Pattern:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getPatternLabel(expense.pattern)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Start Date:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(expense.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {expense.notes && (
                      <div className="mt-2">
                        <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                        <p className="text-gray-900 dark:text-white">{expense.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No recurring expenses found.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Create your first recurring expense to get started.
            </p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingExpense ? 'Edit Recurring Expense' : 'Add New Recurring Expense'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Netflix Subscription"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pattern *
                  </label>
                  <select
                    name="pattern"
                    value={formData.pattern}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {patterns.map(pattern => (
                      <option key={pattern.value} value={pattern.value}>{pattern.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Additional notes..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingExpense ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📋 How Recurring Expenses Work</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Create recurring expense patterns (weekly, monthly, yearly)</li>
            <li>• Use "Generate Expenses" to create actual expenses from active patterns</li>
            <li>• Generated expenses will appear in your expense list</li>
            <li>• You can edit or delete recurring patterns anytime</li>
            <li>• Set end dates to automatically stop recurring expenses</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecurringExpenses;

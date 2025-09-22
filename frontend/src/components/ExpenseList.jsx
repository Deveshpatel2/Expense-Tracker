import React, { useState, useEffect, useCallback } from 'react';
import BulkOperations from './BulkOperations';
import AdvancedSearch from './AdvancedSearch';
import './ExpenseList.css';

const ExpenseList = ({ expenses, onDeleteExpense, onEditExpense, selectedCurrency = 'USD' }) => {
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' }
  ];

  const categories = [
    'All Categories',
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

  const filterAndSortExpenses = useCallback(() => {
    let filtered = [...expenses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'All Categories') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          aValue = a.description;
          bValue = b.description;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, categoryFilter, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortExpenses();
  }, [filterAndSortExpenses]);

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Call parent function to delete
        onDeleteExpense(expenseId);
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (expense) => {
    if (onEditExpense) {
      onEditExpense(expense);
    }
  };

  // Bulk operations handlers
  const handleBulkDelete = (expensesToDelete) => {
    expensesToDelete.forEach(expense => {
      onDeleteExpense(expense.id);
    });
    setSelectedExpenses([]);
  };

  const handleBulkEdit = (expensesToEdit, editData) => {
    expensesToEdit.forEach(expense => {
      const updatedExpense = {
        ...expense,
        category: editData.category || expense.category,
        tags: editData.tags ? `${expense.tags || ''}, ${editData.tags}`.trim() : expense.tags,
        notes: editData.notes ? `${expense.notes || ''} ${editData.notes}`.trim() : expense.notes
      };
      onEditExpense(updatedExpense);
    });
    setSelectedExpenses([]);
  };

  const handleSelectAll = () => {
    setSelectedExpenses(filteredExpenses.map(expense => expense.id));
  };

  const handleClearSelection = () => {
    setSelectedExpenses([]);
  };

  const handleExpenseSelect = (expenseId) => {
    setSelectedExpenses(prev => 
      prev.includes(expenseId) 
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount, currencyCode = 'USD') => {
    const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code
    }).format(amount);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'bg-green-100 text-green-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Utilities': 'bg-yellow-100 text-yellow-800',
      'Housing': 'bg-indigo-100 text-indigo-800',
      'Education': 'bg-teal-100 text-teal-800',
      'Travel': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  // Calculate totals by currency
  const calculateTotalsByCurrency = () => {
    const totals = {};
    
    filteredExpenses.forEach(expense => {
      const currency = expense.currency || 'USD';
      if (!totals[currency]) {
        totals[currency] = 0;
      }
      totals[currency] += parseFloat(expense.amount);
    });
    
    return totals;
  };

  const currencyTotals = calculateTotalsByCurrency();

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">💰</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No expenses yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Start tracking your expenses by adding your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Advanced Search Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Expenses</h2>
        <button
          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
        >
          {showAdvancedSearch ? 'Hide Advanced Search' : 'Show Advanced Search'}
        </button>
      </div>

      {/* Advanced Search */}
      {showAdvancedSearch && (
        <AdvancedSearch
          onSearch={(searchData) => {
            setSearchTerm(searchData.query);
            setCategoryFilter(searchData.category);
            setSortBy(searchData.sortBy);
            setSortOrder(searchData.sortOrder);
          }}
          onFilter={(filterData) => {
            setCategoryFilter(filterData.category);
            setSortBy(filterData.sortBy);
            setSortOrder(filterData.sortOrder);
          }}
          onSort={(sortBy, sortOrder) => {
            setSortBy(sortBy);
            setSortOrder(sortOrder);
          }}
          onClear={() => {
            setSearchTerm('');
            setCategoryFilter('');
            setSortBy('date');
            setSortOrder('desc');
          }}
        />
      )}

      {/* Basic Filters and Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 lg:p-6">
        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
              <option value="description">Description</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="input"
            >
              <option value="desc">Newest/High to Low</option>
              <option value="asc">Oldest/Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Operations */}
      <BulkOperations
        selectedExpenses={selectedExpenses.map(id => filteredExpenses.find(expense => expense.id === id)).filter(Boolean)}
        onBulkDelete={handleBulkDelete}
        onBulkEdit={handleBulkEdit}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        totalExpenses={filteredExpenses.length}
      />

      {/* Results Summary */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </span>
          
          {/* Multi-Currency Totals */}
          <div className="flex flex-wrap gap-3">
            {Object.keys(currencyTotals).length > 0 ? (
              Object.entries(currencyTotals).map(([currency, total]) => (
                <div key={currency} className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatAmount(total, currency)}
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                    {currency}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                No expenses to display
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleSelectAll();
                      } else {
                        handleClearSelection();
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedExpenses.includes(expense.id)}
                      onChange={() => handleExpenseSelect(expense.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {expense.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatAmount(expense.amount, expense.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                      {expense.currency || 'USD'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {expense.notes || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => handleEdit(expense)}
                        disabled={loading}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={loading}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;

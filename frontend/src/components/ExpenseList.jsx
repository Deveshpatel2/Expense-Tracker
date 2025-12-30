import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ArrowUpDown, MoreHorizontal, Edit2, Trash2, CheckSquare, Square, X } from 'lucide-react';
import BulkOperations from './BulkOperations';
import AdvancedSearch from './AdvancedSearch';

const ExpenseList = ({ expenses, onDeleteExpense, onEditExpense, selectedCurrency = 'USD' }) => {
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // ... (Keep existing currencies and categories arrays)
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    // ... add others if needed, keeping it short for UI
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

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter && categoryFilter !== 'All Categories') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

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
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, categoryFilter, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortExpenses();
  }, [filterAndSortExpenses]);

  const handleDelete = (expenseId) => {
      onDeleteExpense(expenseId);
  };

  const handleSelectAll = () => {
    if (selectedExpenses.length === filteredExpenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(filteredExpenses.map(e => e.id));
    }
  };

  const toggleSelection = (id) => {
    if (selectedExpenses.includes(id)) {
      setSelectedExpenses(selectedExpenses.filter(e => e !== id));
    } else {
      setSelectedExpenses([...selectedExpenses, id]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD'
    }).format(amount);
  };

  const getCategoryColor = (category) => {
     const colors = {
      'Food & Dining': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
      'Transportation': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
      'Shopping': 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
      'Entertainment': 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
      'Healthcare': 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
      'Utilities': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
      'Other': 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'
    };
    return colors[category] || colors['Other'];
  };

  if (expenses.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Search className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No expenses found</h3>
        <p className="text-slate-500 dark:text-slate-400">Get started by adding a new expense above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-white/20 dark:border-slate-700">
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
            
             <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
        </div>

        <div className="flex items-center gap-3">
             <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${showAdvancedSearch ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
            >
              <Filter className="w-4 h-4 inline-block mr-2" />
              Filters
            </button>
        </div>
      </div>

       {showAdvancedSearch && (
        <div className="glass-card p-6 animate-slide-up">
            <AdvancedSearch
                onSearch={(data) => {
                    setSearchTerm(data.query);
                    setCategoryFilter(data.category);
                    setSortBy(data.sortBy);
                    setSortOrder(data.sortOrder);
                }}
                 onFilter={(data) => {
                    setCategoryFilter(data.category);
                    setSortBy(data.sortBy);
                    setSortOrder(data.sortOrder);
                }}
                 onSort={(sb, so) => {
                    setSortBy(sb);
                    setSortOrder(so);
                }}
                 onClear={() => {
                    setSearchTerm('');
                    setCategoryFilter('');
                    setSortBy('date');
                    setSortOrder('desc');
                }}
            />
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <th className="px-6 py-4 text-left">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-primary-500 transition-colors">
                    {selectedExpenses.length > 0 && selectedExpenses.length === filteredExpenses.length ? 
                        <CheckSquare className="w-5 h-5" /> : 
                        <Square className="w-5 h-5" />
                    }
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                 <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className={`group hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors ${selectedExpenses.includes(expense.id) ? 'bg-primary-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleSelection(expense.id)} className={`transition-colors ${selectedExpenses.includes(expense.id) ? 'text-primary-500' : 'text-slate-300 hover:text-slate-400'}`}>
                        {selectedExpenses.includes(expense.id) ? 
                            <CheckSquare className="w-5 h-5" /> : 
                            <Square className="w-5 h-5" />
                        }
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{expense.description}</div>
                    {expense.notes && <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{expense.notes}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                        {formatAmount(expense.amount, expense.currency)}
                    </div>
                     <span className="text-xs text-slate-400">{expense.currency || 'USD'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => onEditExpense(expense)}
                            className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(expense.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 flex items-center justify-between">
             <span className="text-sm text-slate-500">Showing {filteredExpenses.length} expenses</span>
             
             {/* Pagination or other controls could go here */}
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;

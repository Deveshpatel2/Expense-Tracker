import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Edit2, Trash2, Plus, Calendar, 
  ShoppingBag, Coffee, Car, Zap, Home, GraduationCap, 
  Plane, Heart, MoreHorizontal, Receipt, X
} from 'lucide-react';
import BulkOperations from './BulkOperations';
import AdvancedSearch from './AdvancedSearch';

const ExpenseList = ({ expenses, onDeleteExpense, onEditExpense, selectedCurrency = 'USD', user, onAddExpense }) => {
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

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

  const dateRanges = [
    'All Time',
    'This Week',
    'This Month',
    'Last 3 Months',
    'This Year'
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food & Dining': return Coffee;
      case 'Transportation': return Car;
      case 'Shopping': return ShoppingBag;
      case 'Entertainment': return Home; // Or generic
      case 'Healthcare': return Heart;
      case 'Utilities': return Zap;
      case 'Housing': return Home;
      case 'Education': return GraduationCap;
      case 'Travel': return Plane;
      default: return Receipt;
    }
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

  const filterAndSortExpenses = useCallback(() => {
    let filtered = [...expenses];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category
    if (categoryFilter && categoryFilter !== 'All Categories') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Date Filter
    const now = new Date();
    if (dateFilter !== 'All Time') {
        filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            switch(dateFilter) {
                case 'This Week':
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(now.getDate() - 7);
                    return expenseDate >= oneWeekAgo;
                case 'This Month':
                    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
                case 'Last 3 Months':
                   const threeMonthsAgo = new Date();
                   threeMonthsAgo.setMonth(now.getMonth() - 3);
                   return expenseDate >= threeMonthsAgo;
                case 'This Year':
                    return expenseDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    }

    // Sort
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
        default:
          aValue = a.description;
          bValue = b.description;
      }
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, categoryFilter, dateFilter, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortExpenses();
  }, [filterAndSortExpenses]);


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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Expenses</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
                Welcome back, {user?.firstName || 'User'}!
            </p>
        </div>
        <button
            onClick={onAddExpense}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all"
        >
            <Plus className="w-5 h-5" />
            Add New Expense
        </button>
      </div>

      {/* Filter Row */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20">
         <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* Search */}
             <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                />
            </div>
            
            {/* Date Filter */}
            <div className="relative min-w-[140px]">
                <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer transition-all shadow-sm"
                >
                    {dateRanges.map(range => (
                        <option key={range} value={range}>{range}</option>
                    ))}
                </select>
                 <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Category Filter */}
             <div className="relative min-w-[160px]">
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer transition-all shadow-sm"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
         </div>

         <button
             onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
             className={`p-2.5 rounded-xl transition-all border ${showAdvancedSearch ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
             title="Advanced Filters"
         >
             <Filter className="w-5 h-5" />
         </button>
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
                    setCategoryFilter('All Categories');
                    setSortBy('date');
                    setSortOrder('desc');
                }}
            />
        </div>
      )}

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
            <div className="glass-card p-12 text-center animate-fade-in flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No expenses found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                    We couldn't find any expenses matching your filters. Try adjusting them or add a new expense.
                </p>
                <button
                    onClick={onAddExpense}
                    className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                    Add Expense
                </button>
            </div>
        ) : (
            filteredExpenses.map((expense) => {
                const Icon = getCategoryIcon(expense.category);
                return (
                    <div 
                        key={expense.id} 
                        className="glass-card p-4 flex flex-col sm:flex-row items-center gap-4 group hover:scale-[1.01] hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary-100 dark:hover:border-primary-900/30"
                    >
                        {/* Icon Box */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getCategoryColor(expense.category)} bg-opacity-15`}>
                            <Icon className="w-6 h-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center sm:text-left min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg">
                                {expense.description}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                {expense.notes || expense.category}
                            </p>
                        </div>

                        {/* Amount & Date - Right Aligned on Desktop */}
                        <div className="flex flex-col items-center sm:items-end min-w-[120px]">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                {formatAmount(expense.amount, expense.currency)}
                            </span>
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                {formatDate(expense.date)}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => onEditExpense(expense)}
                                className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => onDeleteExpense(expense.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default ExpenseList;

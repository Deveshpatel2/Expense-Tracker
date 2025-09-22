import React, { useState, useEffect, useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useDarkMode } from '../context/DarkModeContext';
import { expenseAPI, budgetAPI } from '../services/api';
import './AnalyticsDashboard.css';

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
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' }
];

const formatAmount = (amount, currencyCode = 'USD') => {
  const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code
  }).format(amount);
};

const AnalyticsDashboard = ({ selectedCurrency = 'USD' }) => {
  const { isDarkMode } = useDarkMode();
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [expensesResponse, budgetsResponse] = await Promise.all([
          expenseAPI.getExpenses(),
          budgetAPI.getBudgets()
        ]);
        setExpenses(expensesResponse.data || []);
        setBudgets(budgetsResponse.data || []);
      } catch (error) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter expenses by time range
  const filteredExpenses = useMemo(() => {
    if (timeRange === 'all') return expenses;
    
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return expenses;
    }
    
    return expenses.filter(expense => {
      if (!expense.date) return false;
      const expenseDate = new Date(expense.date);
      return !isNaN(expenseDate.getTime()) && expenseDate >= startDate;
    });
  }, [expenses, timeRange]);

  // Essential Visualizations Data
  const totalSpending = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
  }, [filteredExpenses]);

  const categorySpending = useMemo(() => {
    const spending = {};
    filteredExpenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      spending[category] = (spending[category] || 0) + parseFloat(expense.amount || 0);
    });
    
    return Object.entries(spending)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  const monthlyTrend = useMemo(() => {
    const months = {};
    expenses.forEach(expense => {
      if (!expense.date) return;
      const expenseDate = new Date(expense.date);
      if (isNaN(expenseDate.getTime())) return;
      
      const month = expenseDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      months[month] = (months[month] || 0) + parseFloat(expense.amount || 0);
    });
    
    return Object.entries(months)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([month, amount]) => ({ month, amount }));
  }, [expenses]);

  const topExpenses = useMemo(() => {
    return [...filteredExpenses]
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 10);
  }, [filteredExpenses]);

  // Quick Insights Data
  const thisMonthSpending = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return expenses
      .filter(expense => {
        if (!expense.date) return false;
        const expenseDate = new Date(expense.date);
        if (isNaN(expenseDate.getTime())) return false;
        return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
      })
      .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
  }, [expenses]);

  const lastMonthSpending = useMemo(() => {
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    return expenses
      .filter(expense => {
        if (!expense.date) return false;
        const expenseDate = new Date(expense.date);
        if (isNaN(expenseDate.getTime())) return false;
        return expenseDate >= startOfLastMonth && expenseDate <= endOfLastMonth;
      })
      .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
  }, [expenses]);

  const highestSpendingCategory = useMemo(() => {
    return categorySpending[0] || { category: 'No data', amount: 0 };
  }, [categorySpending]);

  const averageDailySpending = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = Math.ceil((now - startOfMonth) / (1000 * 60 * 60 * 24)) + 1;
    return thisMonthSpending / daysInMonth;
  }, [thisMonthSpending]);

  const remainingBudget = useMemo(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const currentBudgets = budgets.filter(budget => 
      budget.budgetMonth && budget.budgetMonth.startsWith(currentMonth)
    );
    
    const totalBudget = currentBudgets.reduce((sum, budget) => sum + parseFloat(budget.amount || 0), 0);
    return totalBudget - thisMonthSpending;
  }, [budgets, thisMonthSpending]);

  // Chart colors
  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
  ];

  const getCategoryColor = (index) => {
    return COLORS[index % COLORS.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Time Range:
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input w-auto"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* This Month vs Last Month */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month vs Last</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatAmount(thisMonthSpending, selectedCurrency)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last: {formatAmount(lastMonthSpending, selectedCurrency)}
              </p>
            </div>
          </div>
        </div>

        {/* Highest Spending Category */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Category</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {highestSpendingCategory.category}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatAmount(highestSpendingCategory.amount, selectedCurrency)}
              </p>
            </div>
          </div>
        </div>

        {/* Average Daily Spending */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Average</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatAmount(averageDailySpending, selectedCurrency)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
            </div>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Remaining Budget</p>
              <p className={`text-2xl font-semibold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(remainingBudget, selectedCurrency)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Essential Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Spending Overview */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Total Spending Overview</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              {formatAmount(totalSpending, selectedCurrency)}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {timeRange === 'all' ? 'All time' : `This ${timeRange}`}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Transactions</p>
                <p className="font-semibold text-gray-900 dark:text-white">{filteredExpenses.length}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Average</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatAmount(filteredExpenses.length > 0 ? totalSpending / filteredExpenses.length : 0, selectedCurrency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Spending by Category (Pie Chart) */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Spending by Category</h3>
          {categorySpending.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categorySpending}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(index)} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatAmount(value, selectedCurrency), 'Amount']}
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                    border: isDarkMode ? "1px solid #4b5563" : "1px solid #e5e7eb",
                    color: isDarkMode ? "#f9fafb" : "#111827"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No spending data available
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend Analysis */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Trend Analysis</h3>
        {monthlyTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
              <XAxis dataKey="month" stroke={isDarkMode ? "#d1d5db" : "#6b7280"} />
              <YAxis stroke={isDarkMode ? "#d1d5db" : "#6b7280"} />
              <Tooltip 
                formatter={(value) => [formatAmount(value, selectedCurrency), 'Amount']}
                contentStyle={{
                  backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                  border: isDarkMode ? "1px solid #4b5563" : "1px solid #e5e7eb",
                  color: isDarkMode ? "#f9fafb" : "#111827"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke={isDarkMode ? "#8b5cf6" : "#6366f1"} 
                fill={isDarkMode ? "#8b5cf6" : "#6366f1"} 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            No trend data available
          </div>
        )}
      </div>

      {/* Top Expenses List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Expenses</h3>
        {topExpenses.length > 0 ? (
          <div className="space-y-3">
            {topExpenses.map((expense, index) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{expense.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{expense.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatAmount(expense.amount, expense.currency || selectedCurrency)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {expense.date ? new Date(expense.date).toLocaleDateString() : 'No date'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            No expenses found
          </div>
        )}
      </div>

      {/* Budget Performance Summary */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Budget Performance Summary</h3>
        {budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.slice(0, 5).map((budget) => {
              const budgetSpending = expenses
                .filter(expense => {
                  if (!expense.date) return false;
                  const expenseDate = new Date(expense.date);
                  if (isNaN(expenseDate.getTime())) return false;
                  return expense.category === budget.category &&
                    expenseDate.toISOString().slice(0, 7) === budget.budgetMonth?.slice(0, 7);
                })
                .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
              
              const utilizationPercentage = (budgetSpending / parseFloat(budget.amount || 1)) * 100;
              
              return (
                <div key={budget.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{budget.category}</h4>
                    <span className={`text-sm font-semibold ${
                      utilizationPercentage > 100 ? 'text-red-600' :
                      utilizationPercentage > 80 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {utilizationPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${
                        utilizationPercentage > 100 ? 'bg-red-500' :
                        utilizationPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatAmount(budgetSpending, budget.currency)} spent</span>
                    <span>{formatAmount(budget.amount, budget.currency)} budgeted</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-600 text-4xl mb-4">📊</div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No budgets found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Create budgets to track your spending performance
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

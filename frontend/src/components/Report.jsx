import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useDarkMode } from '../context/DarkModeContext';
import './Report.css';

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

// Move formatAmount function outside component to avoid dependency issues
const formatAmount = (amount, currencyCode = 'USD') => {
  const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code
  }).format(amount);
};

const Report = ({ expenses, selectedCurrency = 'USD' }) => {
  const { isDarkMode } = useDarkMode();
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Helper function to set default custom dates
  const setDefaultCustomDates = () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    setCustomStartDate(lastMonth.toISOString().split('T')[0]);
    setCustomEndDate(today.toISOString().split('T')[0]);
  };

  // Set default custom dates when custom range is selected
  React.useEffect(() => {
    if (timeRange === 'custom' && (!customStartDate || !customEndDate)) {
      setDefaultCustomDates();
    }
  }, [timeRange, customStartDate, customEndDate]);


  // Move categories to useMemo to prevent recreation on every render
  const categories = useMemo(() => [
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
  ], []);

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];
    
    // Filter by time range
    const now = new Date();
    let startDate, endDate;
    
    if (timeRange === 'custom') {
      // Use custom date range
      if (customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
      } else {
        // If custom dates are not set, default to last month
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        endDate = now;
      }
    } else {
      // Use predefined time ranges
      startDate = new Date();
      endDate = now;
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 1);
      }
    }
    
    filtered = filtered.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }
    
    return filtered;
  }, [expenses, timeRange, selectedCategory, customStartDate, customEndDate]);

  // Calculate totals by currency
  const totalsByCurrency = useMemo(() => {
    const totals = {};
    
    filteredExpenses.forEach(expense => {
      const currency = expense.currency || 'USD';
      if (!totals[currency]) {
        totals[currency] = 0;
      }
      totals[currency] += parseFloat(expense.amount);
    });
    
    return totals;
  }, [filteredExpenses]);

  // Keep the old totalAmount for backward compatibility (will be the sum of all currencies)
  const totalAmount = useMemo(() => {
    return Object.values(totalsByCurrency).reduce((sum, amount) => sum + amount, 0);
  }, [totalsByCurrency]);

  const categoryBreakdown = useMemo(() => {
    const breakdown = {};
    categories.forEach(category => {
      breakdown[category] = 0;
    });
    
    filteredExpenses.forEach(expense => {
      if (breakdown[expense.category]) {
        breakdown[expense.category] += parseFloat(expense.amount);
      }
    });
    
    return Object.entries(breakdown)
      .filter(([_, amount]) => amount > 0)
      .sort(([_, a], [__, b]) => b - a);
  }, [filteredExpenses, categories]);

  const weeklyData = useMemo(() => {
    const weeks = {};
    const now = new Date();
    
    // Generate last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekKey = `Week ${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      weeks[weekKey] = 0;
      
      filteredExpenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        if (expenseDate >= weekStart && expenseDate <= weekEnd) {
          weeks[weekKey] += parseFloat(expense.amount);
        }
      });
    }
    
    return Object.entries(weeks).map(([week, amount]) => ({
      week,
      amount: parseFloat(amount.toFixed(2)),
      formattedAmount: formatAmount(amount, selectedCurrency)
    }));
  }, [filteredExpenses, selectedCurrency]);

  const dailyData = useMemo(() => {
    const days = {};
    const now = new Date();
    
    // Generate last 14 days
    for (let i = 13; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dayKey = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[dayKey] = 0;
      
      filteredExpenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        if (expenseDate.toDateString() === day.toDateString()) {
          days[dayKey] += parseFloat(expense.amount);
        }
      });
    }
    
    return Object.entries(days).map(([day, amount]) => ({
      day,
      amount: parseFloat(amount.toFixed(2)),
      formattedAmount: formatAmount(amount, selectedCurrency)
    }));
  }, [filteredExpenses, selectedCurrency]);

  const monthlyTrend = useMemo(() => {
    const months = {};
    filteredExpenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      months[month] = (months[month] || 0) + parseFloat(expense.amount);
    });
    
    return Object.entries(months).sort(([a], [b]) => new Date(a) - new Date(b));
  }, [filteredExpenses]);

  const topExpenses = useMemo(() => {
    return [...filteredExpenses]
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 5);
  }, [filteredExpenses]);

  // Calculate averages by currency
  const averagesByCurrency = useMemo(() => {
    const averages = {};
    const counts = {};
    
    filteredExpenses.forEach(expense => {
      const currency = expense.currency || 'USD';
      if (!averages[currency]) {
        averages[currency] = 0;
        counts[currency] = 0;
      }
      averages[currency] += parseFloat(expense.amount);
      counts[currency]++;
    });
    
    // Calculate actual averages
    Object.keys(averages).forEach(currency => {
      averages[currency] = averages[currency] / counts[currency];
    });
    
    return averages;
  }, [filteredExpenses]);

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': '#10b981',
      'Transportation': '#3b82f6',
      'Shopping': '#8b5cf6',
      'Entertainment': '#ec4899',
      'Healthcare': '#ef4444',
      'Utilities': '#f59e0b',
      'Housing': '#6366f1',
      'Education': '#14b8a6',
      'Travel': '#f97316',
      'Other': '#6b7280'
    };
    return colors[category] || colors['Other'];
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No data to report</h3>
        <p className="text-gray-500 dark:text-gray-400">Add some expenses to see detailed reports and insights!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Chart Type Selection */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className={timeRange === 'custom' ? 'sm:col-span-2' : ''}>
            <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Range
            </label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {/* Custom Date Range Inputs - Inside the time range section */}
            {timeRange === 'custom' && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="customStartDate" className="block text-xs font-medium text-gray-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="customStartDate"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                  />
                </div>
                
                <div>
                  <label htmlFor="customEndDate" className="block text-xs font-medium text-gray-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="customEndDate"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Filter
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="chartType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chart Type
            </label>
            <select
              id="chartType"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => window.print()}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              📄 Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">💰</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.keys(totalsByCurrency).length > 0 ? (
                  Object.entries(totalsByCurrency).map(([currency, total]) => (
                    <div key={currency} className="flex items-center space-x-1">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatAmount(total, currency)}
                      </p>
                      <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                        {currency}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">No expenses</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">📊</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Expense</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.keys(averagesByCurrency).length > 0 ? (
                  Object.entries(averagesByCurrency).map(([currency, average]) => (
                    <div key={currency} className="flex items-center space-x-1">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatAmount(average, currency)}
                      </p>
                      <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {currency}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">No expenses</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">📝</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{filteredExpenses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">🏆</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Category</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {categoryBreakdown.length > 0 ? categoryBreakdown[0][0] : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Report Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Bar Chart */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Weekly Spending Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
              <XAxis dataKey="week" stroke={isDarkMode ? "#d1d5db" : "#6b7280"} />
              <YAxis stroke={isDarkMode ? "#d1d5db" : "#6b7280"} />
              <Tooltip 
                formatter={(value) => [formatAmount(value, selectedCurrency), 'Amount']}
                labelFormatter={(label) => `Week: ${label}`}
                contentStyle={{
                  backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                  border: isDarkMode ? "1px solid #4b5563" : "1px solid #e5e7eb",
                  color: isDarkMode ? "#f9fafb" : "#111827"
                }}
              />
              <Bar dataKey="amount" fill={isDarkMode ? "#8b5cf6" : "#6366f1"} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Line Chart */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Daily Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
              <XAxis dataKey="day" stroke={isDarkMode ? "#d1d5db" : "#6b7280"} />
              <YAxis stroke={isDarkMode ? "#d1d5db" : "#6b7280"} />
              <Tooltip 
                formatter={(value) => [formatAmount(value, selectedCurrency), 'Amount']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                  border: isDarkMode ? "1px solid #4b5563" : "1px solid #e5e7eb",
                  color: isDarkMode ? "#f9fafb" : "#111827"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke={isDarkMode ? "#34d399" : "#10b981"} 
                strokeWidth={3}
                dot={{ fill: isDarkMode ? "#34d399" : "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: isDarkMode ? "#34d399" : "#10b981", strokeWidth: 2, fill: isDarkMode ? "#34d399" : "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      {monthlyTrend.length > 1 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrend.map(([month, amount]) => ({ month, amount }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
              <XAxis dataKey="month" stroke={isDarkMode ? "#d1d5db" : "#6b7280"} />
              <YAxis stroke={isDarkMode ? "#d1d5db" : "#6b7280"} />
              <Tooltip 
                formatter={(value) => [formatAmount(value, selectedCurrency), 'Amount']}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                  border: isDarkMode ? "1px solid #4b5563" : "1px solid #e5e7eb",
                  color: isDarkMode ? "#f9fafb" : "#111827"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke={isDarkMode ? "#a78bfa" : "#8b5cf6"} 
                fill={isDarkMode ? "#a78bfa" : "#8b5cf6"} 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Pie Chart - Standalone */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Category Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={categoryBreakdown.map(([category, amount]) => ({
                name: category,
                value: amount
              }))}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryBreakdown.map(([category], index) => (
                <Cell key={`cell-${index}`} fill={getCategoryColor(category)} />
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
      </div>

      {/* Top Expenses */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top 5 Highest Expenses</h3>
        <div className="space-y-3">
          {topExpenses.map((expense, index) => (
            <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-lg font-bold text-indigo-600 mr-3">#{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                  <p className="text-xs text-gray-500">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-gray-900">{formatAmount(expense.amount, expense.currency || selectedCurrency)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Detailed Category Breakdown</h3>
        <div className="space-y-4">
          {categoryBreakdown.map(([category, amount]) => {
            const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
            return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3`} style={{ backgroundColor: getCategoryColor(category) }}></div>
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: getCategoryColor(category)
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">
                    {formatAmount(amount, selectedCurrency)}
                  </span>
                  <span className="text-sm text-gray-500 w-16 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Report;

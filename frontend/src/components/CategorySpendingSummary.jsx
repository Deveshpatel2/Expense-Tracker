import React, { useState, useMemo } from 'react';

const CategorySpendingSummary = ({ categories, expenses, selectedCurrency = 'USD' }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [sortBy, setSortBy] = useState('amount');
  const [viewMode, setViewMode] = useState('chart');

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
    
    return expenses.filter(expense => new Date(expense.date) >= startDate);
  }, [expenses, timeRange]);

  // Calculate category spending
  const categorySpending = useMemo(() => {
    const spending = {};
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    
    categories.forEach(category => {
      const categoryExpenses = filteredExpenses.filter(expense => 
        expense.category === category.name ||
        (category.subcategories && category.subcategories.some(sub => sub.name === expense.category))
      );
      
      const amount = categoryExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
      const count = categoryExpenses.length;
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      
      if (amount > 0) {
        spending[category.id] = {
          category,
          amount,
          count,
          percentage,
          expenses: categoryExpenses
        };
      }
    });
    
    return spending;
  }, [categories, filteredExpenses]);

  // Sort category spending
  const sortedSpending = useMemo(() => {
    const spendingArray = Object.values(categorySpending);
    
    return spendingArray.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'count':
          return b.count - a.count;
        case 'percentage':
          return b.percentage - a.percentage;
        case 'name':
          return a.category.name.localeCompare(b.category.name);
        default:
          return b.amount - a.amount;
      }
    });
  }, [categorySpending, sortBy]);

  // Format currency
  const formatCurrency = (amount) => {
    const currency = currencies.find(c => c.code === selectedCurrency) || currencies[0];
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code
    }).format(amount);
  };

  // Get time range label
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'today': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'All Time';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Category Spending Summary
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Analyze your spending patterns by category
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="amount">Amount</option>
              <option value="count">Count</option>
              <option value="percentage">Percentage</option>
              <option value="name">Name</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              View Mode
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="input"
            >
              <option value="chart">Chart View</option>
              <option value="list">List View</option>
              <option value="table">Table View</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Summary
            </label>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div>{sortedSpending.length} categories</div>
              <div>{formatCurrency(sortedSpending.reduce((sum, item) => sum + item.amount, 0))} total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Spending by Category - {getTimeRangeLabel()}
          </h4>
          
          <div className="space-y-3">
            {sortedSpending.map((item) => (
              <div key={item.category.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.category.icon}</span>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {item.category.name}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.count} expenses
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(item.percentage, 100)}%`,
                      backgroundColor: item.category.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Category List - {getTimeRangeLabel()}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSpending.map((item) => (
              <div key={item.category.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-3xl">{item.category.icon}</span>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {item.category.name}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.count} expenses
                    </p>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.category.color }}
                  ></div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Percentage:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Average:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.amount / item.count)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Category Table - {getTimeRangeLabel()}
          </h4>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Average
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedSpending.map((item) => (
                    <tr key={item.category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{item.category.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.category.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.category.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {item.count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {item.percentage.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatCurrency(item.amount / item.count)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedSpending.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No spending data
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No expenses found for the selected time range
          </p>
        </div>
      )}
    </div>
  );
};

export default CategorySpendingSummary;


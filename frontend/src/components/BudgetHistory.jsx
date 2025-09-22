import React, { useState, useEffect, useCallback } from 'react';
import './BudgetHistory.css';

const BudgetHistory = ({ budgets, onRefresh, selectedCurrency }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredBudgets, setFilteredBudgets] = useState([]);

  const categories = [...new Set(budgets.map(budget => budget.category))].sort();
  const years = [...new Set(budgets.map(budget => new Date(budget.budgetMonth).getFullYear()))].sort((a, b) => b - a);

  useEffect(() => {
    filterBudgets();
  }, [budgets, selectedYear, selectedCategory, filterBudgets]);

  const filterBudgets = useCallback(() => {
    let filtered = budgets.filter(budget => {
      const budgetYear = new Date(budget.budgetMonth).getFullYear();
      const categoryMatch = !selectedCategory || budget.category === selectedCategory;
      const yearMatch = budgetYear === selectedYear;
      return categoryMatch && yearMatch;
    });

    // Sort by month (newest first)
    filtered.sort((a, b) => new Date(b.budgetMonth) - new Date(a.budgetMonth));
    
    setFilteredBudgets(filtered);
  }, [budgets, selectedCategory, selectedYear]);

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

  const getCategoryStats = () => {
    const stats = {};
    filteredBudgets.forEach(budget => {
      if (!stats[budget.category]) {
        stats[budget.category] = {
          totalBudget: 0,
          totalSpent: 0,
          months: 0,
          avgUtilization: 0
        };
      }
      stats[budget.category].totalBudget += parseFloat(budget.amount);
      stats[budget.category].totalSpent += parseFloat(budget.actualSpent || 0);
      stats[budget.category].months += 1;
    });

    // Calculate average utilization
    Object.keys(stats).forEach(category => {
      const stat = stats[category];
      stat.avgUtilization = stat.totalBudget > 0 
        ? (stat.totalSpent / stat.totalBudget) * 100 
        : 0;
    });

    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget History</h3>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="input w-auto"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-auto"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => onRefresh()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Statistics */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Category Statistics ({selectedYear})</h4>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryStats).map(([category, stats]) => (
                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">{category}</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Budget:</span>
                      <span className="font-medium">{formatAmount(stats.totalBudget, selectedCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Spent:</span>
                      <span className="font-medium">{formatAmount(stats.totalSpent, selectedCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Months:</span>
                      <span className="font-medium">{stats.months}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avg Utilization:</span>
                      <span className={`font-medium ${stats.avgUtilization > 100 ? 'text-red-600' : stats.avgUtilization > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {stats.avgUtilization.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Budget History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Budget History ({filteredBudgets.length} records)
          </h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBudgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {budget.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(budget.budgetMonth)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatAmount(budget.amount, budget.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatAmount(budget.actualSpent || 0, budget.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      budget.utilizationPercentage > 100 ? 'text-red-600' : 
                      budget.utilizationPercentage > 80 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {budget.utilizationPercentage?.toFixed(1) || 0}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(budget.status)}`}>
                      {getStatusText(budget.status)}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBudgets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No budget history found for the selected filters.</p>
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

export default BudgetHistory;

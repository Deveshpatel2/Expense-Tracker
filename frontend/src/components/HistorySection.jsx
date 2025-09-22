import React from 'react';

const HistorySection = ({ expenses, deletedExpenses, selectedCurrency }) => {
  const formatAmount = (amount, currencyCode = 'USD') => {
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
    const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Combine active and deleted expenses for history
  const allExpenses = [
    ...expenses.map(expense => ({ ...expense, status: 'active' })),
    ...deletedExpenses.map(expense => ({ ...expense, status: 'deleted' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const getTotalAmount = () => {
    return allExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const getActiveAmount = () => {
    return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const getDeletedAmount = () => {
    return deletedExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total All Time</p>
              <p className="text-2xl font-semibold text-gray-900">{formatAmount(getTotalAmount(), selectedCurrency)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">{formatAmount(getActiveAmount(), selectedCurrency)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">🗑️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Deleted Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">{formatAmount(getDeletedAmount(), selectedCurrency)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Expense History</h3>
        <div className="space-y-4">
          {allExpenses.map((expense) => (
            <div key={`${expense.status}-${expense.id}`} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className={`w-3 h-3 rounded-full ${expense.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                    <p className="text-xs text-gray-500">{expense.category} • {formatDate(expense.date)}</p>
                    {expense.notes && (
                      <p className="text-xs text-gray-400 mt-1">{expense.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${expense.status === 'active' ? 'text-gray-900' : 'text-red-600'}`}>
                      {formatAmount(expense.amount, expense.currency)}
                    </p>
                    <p className="text-xs text-gray-500">{expense.currency}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistorySection;

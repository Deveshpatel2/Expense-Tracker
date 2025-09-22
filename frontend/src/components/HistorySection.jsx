import React from 'react';
import './HistorySection.css';

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
    <div className="history-section-container">
      {/* Summary Cards */}
      <div className="history-section-summary-grid">
        <div className="history-section-summary-card">
          <div className="history-section-summary-content">
            <div className="history-section-summary-icon">
              <div className="history-section-summary-icon-bg history-section-summary-icon-bg-green">
                <span className="history-section-summary-icon-text">💰</span>
              </div>
            </div>
            <div className="history-section-summary-info">
              <p className="history-section-summary-label">Total All Time</p>
              <p className="history-section-summary-value">{formatAmount(getTotalAmount(), selectedCurrency)}</p>
            </div>
          </div>
        </div>

        <div className="history-section-summary-card">
          <div className="history-section-summary-content">
            <div className="history-section-summary-icon">
              <div className="history-section-summary-icon-bg history-section-summary-icon-bg-blue">
                <span className="history-section-summary-icon-text">✅</span>
              </div>
            </div>
            <div className="history-section-summary-info">
              <p className="history-section-summary-label">Active Expenses</p>
              <p className="history-section-summary-value">{formatAmount(getActiveAmount(), selectedCurrency)}</p>
            </div>
          </div>
        </div>

        <div className="history-section-summary-card">
          <div className="history-section-summary-content">
            <div className="history-section-summary-icon">
              <div className="history-section-summary-icon-bg history-section-summary-icon-bg-red">
                <span className="history-section-summary-icon-text">🗑️</span>
              </div>
            </div>
            <div className="history-section-summary-info">
              <p className="history-section-summary-label">Deleted Expenses</p>
              <p className="history-section-summary-value">{formatAmount(getDeletedAmount(), selectedCurrency)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="history-section-timeline">
        <h3 className="history-section-timeline-title">Complete Expense History</h3>
        <div className="history-section-timeline-list">
          {allExpenses.map((expense) => (
            <div key={`${expense.status}-${expense.id}`} className="history-section-timeline-item">
              <div className={`history-section-timeline-status ${expense.status === 'active' ? 'history-section-timeline-status-active' : 'history-section-timeline-status-deleted'}`}></div>
              <div className="history-section-timeline-content">
                <div className="history-section-timeline-header">
                  <div className="history-section-timeline-details">
                    <p className="history-section-timeline-description">{expense.description}</p>
                    <p className="history-section-timeline-meta">{expense.category} • {formatDate(expense.date)}</p>
                    {expense.notes && (
                      <p className="history-section-timeline-notes">{expense.notes}</p>
                    )}
                  </div>
                  <div className="history-section-timeline-amount">
                    <p className={`history-section-timeline-amount-value ${expense.status === 'active' ? 'history-section-timeline-amount-value-active' : 'history-section-timeline-amount-value-deleted'}`}>
                      {formatAmount(expense.amount, expense.currency)}
                    </p>
                    <p className="history-section-timeline-currency">{expense.currency}</p>
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

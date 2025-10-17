import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseAPI } from '../services/api';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [, setExpenses] = useState([]);
  const [statistics, setStatistics] = useState({
    today: { amount: 0, count: 0, change: 0 },
    thisWeek: { amount: 0, count: 0, change: 0 },
    thisMonth: { amount: 0, count: 0, change: 0 },
    categories: []
  });

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await expenseAPI.getExpenses();
      if (response.success) {
        setExpenses(response.data);
        
        // Calculate statistics
        const today = new Date();
        const todayExpenses = response.data.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate.toDateString() === today.toDateString();
        });
        
        const weekExpenses = response.data.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return expenseDate >= weekAgo;
        });
        
        const monthExpenses = response.data.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate.getMonth() === today.getMonth() && 
                 expenseDate.getFullYear() === today.getFullYear();
        });

        const todayTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const weekTotal = weekExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Calculate category breakdown
        const categoryMap = {};
        response.data.forEach(expense => {
          if (categoryMap[expense.category]) {
            categoryMap[expense.category] += expense.amount;
          } else {
            categoryMap[expense.category] = expense.amount;
          }
        });

        const categories = Object.entries(categoryMap)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount);

        setStatistics({
          today: { amount: todayTotal, count: todayExpenses.length, change: 0 },
          thisWeek: { amount: weekTotal, count: weekExpenses.length, change: 0 },
          thisMonth: { amount: monthTotal, count: monthExpenses.length, change: 0 },
          categories
        });
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <h3>Loading Analytics...</h3>
      </div>
    );
  }

  const todayTotal = statistics.today.amount;
  const weekTotal = statistics.thisWeek.amount;
  const monthTotal = statistics.thisMonth.amount;

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-header-left">
          <button className="back-button">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            BACK OFFICE
          </button>
        </div>
        <div className="analytics-header-center">
          <h1 className="analytics-title">SPENDORA</h1>
        </div>
        <div className="analytics-header-right">
          <span className="analytics-company">EXPENSE TRACKER</span>
          <div className="analytics-user-info">
            <span className="analytics-language">🇺🇸</span>
            <div className="analytics-user">
              <div className="analytics-avatar">👤</div>
              <span className="analytics-username">{user?.firstName || 'User'}</span>
            </div>
            <button className="analytics-help">❓</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="analytics-main">
        {/* KPI Cards Row */}
        <div className="analytics-kpi-row">
          <div className="kpi-card kpi-sales">
            <div className="kpi-icon">📊</div>
            <div className="kpi-content">
              <div className="kpi-title">Today Expenses</div>
              <div className="kpi-amount">${todayTotal.toFixed(2)}</div>
              <div className="kpi-change positive">+0.00%</div>
              <div className="kpi-subtitle">Today's Total Transaction: ({statistics.today.count})</div>
              <div className="kpi-yesterday">Yesterday Expenses: $0.00 (0)</div>
            </div>
          </div>

          <div className="kpi-card kpi-void">
            <div className="kpi-icon">🔄</div>
            <div className="kpi-content">
              <div className="kpi-title">Today Void</div>
              <div className="kpi-amount">$0.00</div>
              <div className="kpi-change positive">+0.00%</div>
              <div className="kpi-subtitle">Today's Total Transaction: (0)</div>
              <div className="kpi-yesterday">Yesterday Void: $0.00 (0)</div>
            </div>
          </div>

          <div className="kpi-card kpi-delete">
            <div className="kpi-icon">🗑️</div>
            <div className="kpi-content">
              <div className="kpi-title">Today Delete</div>
              <div className="kpi-amount">$0.00</div>
              <div className="kpi-change positive">+0.00%</div>
              <div className="kpi-subtitle">Today's Total Transaction: (0)</div>
              <div className="kpi-yesterday">Yesterday Deleted: $0.00 (0)</div>
            </div>
          </div>

          <div className="kpi-card kpi-return">
            <div className="kpi-icon">↩️</div>
            <div className="kpi-content">
              <div className="kpi-title">Today Return</div>
              <div className="kpi-amount">$0.00</div>
              <div className="kpi-change positive">+0.00%</div>
              <div className="kpi-subtitle">Today's Total Transaction: (0)</div>
              <div className="kpi-yesterday">Yesterday Return: $0.00 (0)</div>
            </div>
          </div>

          {/* Advertisement Card */}
          <div className="kpi-card kpi-ad">
            <div className="ad-content">
              <div className="ad-title">MOOLAH POINTS</div>
              <div className="ad-text">Integrate for smarter discounts</div>
              <div className="ad-phone">(888)-342-1134</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="analytics-charts-row">
          {/* Weekly Expenses Chart */}
          <div className="chart-container">
            <h3 className="chart-title">Weekly Expenses</h3>
            <div className="chart-placeholder">
              <div className="chart-bars">
                <div className="chart-bar" style={{ height: '60%' }}></div>
                <div className="chart-bar" style={{ height: '80%' }}></div>
                <div className="chart-bar" style={{ height: '40%' }}></div>
                <div className="chart-bar" style={{ height: '90%' }}></div>
                <div className="chart-bar" style={{ height: '70%' }}></div>
                <div className="chart-bar" style={{ height: '50%' }}></div>
                <div className="chart-bar" style={{ height: '85%' }}></div>
              </div>
              <div className="chart-labels">
                <span>Fri</span>
                <span>Thu</span>
                <span>Wed</span>
                <span>Tue</span>
                <span>Mon</span>
                <span>Sun</span>
                <span>Sat</span>
              </div>
            </div>
            <div className="chart-summary">
              <div className="summary-item">
                <span className="summary-label">Net Revenue:</span>
                <span className="summary-value">${weekTotal.toFixed(2)} (100.00%)</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Tax:</span>
                <span className="summary-value">$0.00 (0.00%)</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Sales:</span>
                <span className="summary-value">${weekTotal.toFixed(2)} (100.00%)</span>
              </div>
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div className="chart-container">
            <h3 className="chart-title">Category Distribution (Monthly)</h3>
            <div className="donut-chart">
              <div className="donut-center">
                <div className="donut-total">Total (${monthTotal.toFixed(2)})</div>
                <div className="donut-percentage">100%</div>
              </div>
            </div>
            <div className="donut-legend">
              {statistics.categories.slice(0, 3).map((category, index) => (
                <div key={category.name} className="legend-item">
                  <div className={`legend-color color-${index}`}></div>
                  <span className="legend-label">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="analytics-bottom">
          <div className="bottom-section">
            <h3 className="section-title">Top 10 Spending Categories (Monthly)</h3>
            <div className="table-container">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.categories.slice(0, 10).map((category, index) => (
                    <tr key={category.name}>
                      <td>{category.name}</td>
                      <td>${category.amount.toFixed(2)}</td>
                      <td>{((category.amount / monthTotal) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bottom-section">
            <h3 className="section-title">Hourly Expenses Report (Daily)</h3>
            <div className="hourly-chart">
              <div className="hourly-bars">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="hourly-bar" style={{ height: `${Math.random() * 100}%` }}></div>
                ))}
              </div>
              <div className="hourly-labels">
                {Array.from({ length: 24 }, (_, i) => (
                  <span key={i} className="hourly-label">{i}:00</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
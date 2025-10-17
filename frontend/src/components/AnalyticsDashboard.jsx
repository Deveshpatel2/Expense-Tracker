import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [statistics, setStatistics] = useState({
    today: { amount: 0, count: 0 },
    thisWeek: { amount: 0, count: 0 },
    thisMonth: { amount: 0, count: 0 },
    categories: []
  });

  // Mock user data
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockExpenses = [
        { id: 1, description: 'Office Supplies', amount: 150.00, category: 'Office', expenseDate: '2024-01-15' },
        { id: 2, description: 'Business Lunch', amount: 75.50, category: 'Food', expenseDate: '2024-01-14' },
        { id: 3, description: 'Travel Expenses', amount: 450.25, category: 'Travel', expenseDate: '2024-01-13' },
        { id: 4, description: 'Client Dinner', amount: 120.00, category: 'Entertainment', expenseDate: '2024-01-12' },
        { id: 5, description: 'Hotel', amount: 275.75, category: 'Accommodation', expenseDate: '2024-01-11' }
      ];

      setExpenses(mockExpenses);
      
      // Calculate statistics from mock data
      const today = new Date();
      const todayExpenses = mockExpenses.filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        return expenseDate.toDateString() === today.toDateString();
      });
      
      const weekExpenses = mockExpenses.filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expenseDate >= weekAgo;
      });
      
      const monthExpenses = mockExpenses.filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        return expenseDate.getMonth() === today.getMonth() && 
               expenseDate.getFullYear() === today.getFullYear();
      });

      const todayTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const weekTotal = weekExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Calculate category breakdown
      const categoryMap = {};
      mockExpenses.forEach(expense => {
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
        today: { amount: todayTotal, count: todayExpenses.length },
        thisWeek: { amount: weekTotal, count: weekExpenses.length },
        thisMonth: { amount: monthTotal, count: monthExpenses.length },
        categories
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="expensio-loading">
        <div className="loading-spinner"></div>
        <h3>Loading Dashboard...</h3>
      </div>
    );
  }

  return (
    <div className="expensio-dashboard">
      {/* Sidebar */}
      <aside className="expensio-sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.firstName ? user.firstName.charAt(0) : 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.firstName || 'User'} {user?.lastName || ''}</div>
              <div className="user-email">{user?.email || 'user@example.com'}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </button>
          <button className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Expenses</span>
          </button>
          <button className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Trips</span>
          </button>
          <button className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Approvals</span>
          </button>
          <button className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            <span>Settings</span>
          </button>
          <button className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Support</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="logo">
            <div className="logo-icon">↔</div>
            <span className="logo-text">SPENDORA</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="expensio-main">
        <div className="main-header">
          <h1>Dashboard</h1>
          <div className="header-actions">
            <button className="btn-primary">+ New Expense</button>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Pending Tasks Card */}
          <div className="card pending-tasks">
            <div className="card-header">
              <h3>Pending Tasks</h3>
            </div>
            <div className="card-content">
              <div className="task-item">
                <div className="task-icon purple">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="task-info">
                  <span className="task-name">Pending Approvals</span>
                  <span className="task-count">5</span>
                </div>
              </div>
              <div className="task-item">
                <div className="task-icon purple">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div className="task-info">
                  <span className="task-name">New Trips Registered</span>
                  <span className="task-count">1</span>
                </div>
              </div>
              <div className="task-item">
                <div className="task-icon purple">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="task-info">
                  <span className="task-name">Unreported Expenses</span>
                  <span className="task-count">{statistics.today.count}</span>
                </div>
              </div>
              <div className="task-item">
                <div className="task-icon purple">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                </div>
                <div className="task-info">
                  <span className="task-name">Upcoming Expenses</span>
                  <span className="task-count">0</span>
                </div>
              </div>
              <div className="task-item">
                <div className="task-icon purple">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="task-info">
                  <span className="task-name">Unreported Advances</span>
                  <span className="task-count">${statistics.today.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Expenses Card */}
          <div className="card recent-expenses">
            <div className="card-header">
              <h3>Recent Expenses</h3>
            </div>
            <div className="card-content">
              <div className="expense-table">
                <div className="table-header">
                  <div className="table-cell">Subject</div>
                  <div className="table-cell">Employee</div>
                  <div className="table-cell">Team</div>
                  <div className="table-cell">Amount</div>
                </div>
                {expenses.slice(0, 5).map((expense, index) => (
                  <div key={expense.id || index} className="table-row">
                    <div className="table-cell">{expense.description || 'Office Supplies'}</div>
                    <div className="table-cell">{user?.firstName || 'User'}</div>
                    <div className="table-cell">
                      <span className="team-tag purple">Marketing</span>
                    </div>
                    <div className="table-cell">${expense.amount?.toFixed(2) || '0.00'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Access Card */}
          <div className="card quick-access">
            <div className="card-header">
              <h3>Quick Access</h3>
            </div>
            <div className="card-content">
              <div className="quick-actions">
                <button className="quick-btn purple">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>+ New expense</span>
                </button>
                <button className="quick-btn blue">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>+ Add receipt</span>
                </button>
                <button className="quick-btn green">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>+ Create report</span>
                </button>
                <button className="quick-btn red">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>+ Create trip</span>
                </button>
              </div>
            </div>
          </div>

          {/* Monthly Report Card */}
          <div className="card monthly-report">
            <div className="card-header">
              <h3>Monthly Report</h3>
            </div>
            <div className="card-content">
              <div className="charts-container">
                <div className="chart-section">
                  <h4>Team Spending Trend</h4>
                  <div className="chart-placeholder">
                    <div className="chart-bars">
                      {['PJ', 'SJ', 'MB', 'IS', 'DW', 'NJ', 'BS'].map((name, index) => (
                        <div key={name} className="chart-bar" style={{ height: `${Math.random() * 80 + 20}%` }}>
                          <span className="bar-value">{Math.floor(Math.random() * 80 + 20)}K</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="chart-section">
                  <h4>Day-to-Day Expenses</h4>
                  <div className="chart-placeholder">
                    <div className="chart-bars">
                      {['Accommodation', 'Comms', 'Services', 'Food', 'Fuel'].map((name, index) => (
                        <div key={name} className="chart-bar" style={{ height: `${Math.random() * 80 + 20}%` }}>
                          <span className="bar-value">{Math.floor(Math.random() * 80 + 20)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
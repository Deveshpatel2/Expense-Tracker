import React, { useState, useEffect, useCallback } from 'react';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState({
    today: { amount: 0, count: 0 },
    thisWeek: { amount: 0, count: 0 },
    thisMonth: { amount: 0, count: 0 },
    categories: []
  });

  // Helper function to decode JWT token
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Helper function to get user from token
  const getUserFromToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = decodeToken(token);
    if (!decoded) return null;

    return {
      firstName: decoded.firstName || decoded.sub?.split('@')[0] || 'User',
      lastName: decoded.lastName || '',
      email: decoded.email || decoded.sub || 'user@example.com'
    };
  }, []);

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      // Get user from token
      const userData = getUserFromToken();
      setUser(userData);

      // Fetch expenses from API
      const response = await fetch('http://localhost:8080/api/expenses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch expenses: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch expenses');
      }

      const fetchedExpenses = data.data || [];
      setExpenses(fetchedExpenses);
      
      // Calculate statistics from real data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayExpenses = fetchedExpenses.filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        expenseDate.setHours(0, 0, 0, 0);
        return expenseDate.getTime() === today.getTime();
      });
      
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weekExpenses = fetchedExpenses.filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        expenseDate.setHours(0, 0, 0, 0);
        return expenseDate >= weekAgo;
      });
      
      const monthExpenses = fetchedExpenses.filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        return expenseDate.getMonth() === today.getMonth() && 
               expenseDate.getFullYear() === today.getFullYear();
      });

      const todayTotal = todayExpenses.reduce((sum, expense) => {
        return sum + (parseFloat(expense.amount) || 0);
      }, 0);
      
      const weekTotal = weekExpenses.reduce((sum, expense) => {
        return sum + (parseFloat(expense.amount) || 0);
      }, 0);
      
      const monthTotal = monthExpenses.reduce((sum, expense) => {
        return sum + (parseFloat(expense.amount) || 0);
      }, 0);

      // Calculate category breakdown
      const categoryMap = {};
      fetchedExpenses.forEach(expense => {
        const category = expense.category || 'Other';
        const amount = parseFloat(expense.amount) || 0;
        if (categoryMap[category]) {
          categoryMap[category] += amount;
        } else {
          categoryMap[category] = amount;
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
      // Set default user if token decode fails
      const currentUser = getUserFromToken();
      if (!currentUser) {
        setUser({
          firstName: 'User',
          lastName: '',
          email: 'user@example.com'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [getUserFromToken]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

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
      {/* Sidebar Toggle Button */}
      <button 
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <span className="toggle-icon">{sidebarOpen ? '←' : '→'}</span>
      </button>

      {/* Sidebar */}
      <aside className={`expensio-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
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
          <ul className="nav-list">
            <li 
              className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveNav('dashboard')}
            >
              <span className="nav-text">Dashboard</span>
            </li>
            <li 
              className={`nav-item ${activeNav === 'expenses' ? 'active' : ''}`}
              onClick={() => setActiveNav('expenses')}
            >
              <span className="nav-text">Expenses</span>
            </li>
            <li 
              className={`nav-item ${activeNav === 'budget' ? 'active' : ''}`}
              onClick={() => setActiveNav('budget')}
            >
              <span className="nav-text">Budget</span>
            </li>
            <li 
              className={`nav-item ${activeNav === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveNav('reports')}
            >
              <span className="nav-text">Reports</span>
            </li>
            <li 
              className={`nav-item ${activeNav === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveNav('categories')}
            >
              <span className="nav-text">Categories</span>
            </li>
            <li 
              className={`nav-item ${activeNav === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveNav('settings')}
            >
              <span className="nav-text">Settings</span>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="logo">
            <div className="logo-icon">↔</div>
            <span className="logo-text">SPENDORA</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`expensio-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="main-header">
          <h1>Dashboard</h1>
          <div className="header-actions">
            <button className="btn-primary">+ New Expense</button>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Statistics Summary Card */}
          <div className="card statistics-summary">
            <div className="card-header">
              <h3>Expense Statistics</h3>
            </div>
            <div className="card-content">
              <div className="stat-item">
                <div className="stat-info">
                  <span className="stat-label">Today</span>
                  <span className="stat-value">${statistics.today.amount.toFixed(2)}</span>
                  <span className="stat-count">{statistics.today.count} expense{statistics.today.count !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-info">
                  <span className="stat-label">This Week</span>
                  <span className="stat-value">${statistics.thisWeek.amount.toFixed(2)}</span>
                  <span className="stat-count">{statistics.thisWeek.count} expense{statistics.thisWeek.count !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-info">
                  <span className="stat-label">This Month</span>
                  <span className="stat-value">${statistics.thisMonth.amount.toFixed(2)}</span>
                  <span className="stat-count">{statistics.thisMonth.count} expense{statistics.thisMonth.count !== 1 ? 's' : ''}</span>
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
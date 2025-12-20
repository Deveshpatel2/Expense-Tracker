import React, { useState, useEffect, useCallback } from 'react';
import ExpenseList from './ExpenseList';
import EditExpenseModal from './EditExpenseModal';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
    currency: 'USD'
  });
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

  // Helper to get token with better error handling
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      const errorMsg = 'Please log in to add expenses. Go to the login page and sign in.';
      alert(errorMsg);
      throw new Error(errorMsg);
    }
    return token;
  };

  // Expense CRUD operations
  const handleAddExpense = async (expenseData) => {
    try {
      const token = getAuthToken();

      const response = await fetch('http://localhost:8080/api/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: expenseData.description,
          amount: parseFloat(expenseData.amount),
          category: expenseData.category,
          expenseDate: expenseData.expenseDate || expenseData.date,
          notes: expenseData.notes || '',
          currency: expenseData.currency || 'USD'
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please log in again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add expense: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to add expense');
      }

      // Reload expenses
      await loadAnalyticsData();
      setShowAddExpense(false);
      setExpenseForm({
        description: '',
        amount: '',
        category: '',
        expenseDate: new Date().toISOString().split('T')[0],
        notes: '',
        currency: 'USD'
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense: ' + error.message);
    }
  };

  const handleEditExpense = async (expenseData) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`http://localhost:8080/api/expenses/${expenseData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: expenseData.description,
          amount: parseFloat(expenseData.amount),
          category: expenseData.category,
          expenseDate: expenseData.expenseDate || expenseData.date,
          notes: expenseData.notes || '',
          currency: expenseData.currency || 'USD'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update expense: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update expense');
      }

      // Reload expenses
      await loadAnalyticsData();
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense: ' + error.message);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`http://localhost:8080/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete expense: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete expense');
      }

      // Reload expenses
      await loadAnalyticsData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense: ' + error.message);
    }
  };

  const handleExpenseFormChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExpenseFormSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.category) {
      alert('Please fill in all required fields');
      return;
    }
    await handleAddExpense(expenseForm);
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
          <h1>{activeNav === 'dashboard' ? 'Dashboard' : activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</h1>
          <div className="header-actions">
            {activeNav === 'expenses' && (
              <button 
                className="btn-primary" 
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    alert('Please log in to add expenses. You need to be authenticated to use this feature.');
                    return;
                  }
                  setShowAddExpense(true);
                }}
              >
                + New Expense
              </button>
            )}
          </div>
        </div>

        {activeNav === 'dashboard' && (
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
        )}

        {activeNav === 'expenses' && (
          <div className="expenses-section">
            <ExpenseList
              expenses={expenses.map(exp => ({
                ...exp,
                date: exp.expenseDate || exp.date
              }))}
              onDeleteExpense={handleDeleteExpense}
              onEditExpense={(expense) => setEditingExpense(expense)}
              selectedCurrency="USD"
            />
          </div>
        )}

        {activeNav === 'budget' && (
          <div className="card">
            <div className="card-header">
              <h3>Budget</h3>
            </div>
            <div className="card-content">
              <p>Budget section coming soon...</p>
            </div>
          </div>
        )}

        {activeNav === 'reports' && (
          <div className="card">
            <div className="card-header">
              <h3>Reports</h3>
            </div>
            <div className="card-content">
              <p>Reports section coming soon...</p>
            </div>
          </div>
        )}

        {activeNav === 'categories' && (
          <div className="card">
            <div className="card-header">
              <h3>Categories</h3>
            </div>
            <div className="card-content">
              <p>Categories section coming soon...</p>
            </div>
          </div>
        )}

        {activeNav === 'settings' && (
          <div className="card">
            <div className="card-header">
              <h3>Settings</h3>
            </div>
            <div className="card-content">
              <p>Settings section coming soon...</p>
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        {showAddExpense && (
          <div className="modal-overlay" onClick={() => setShowAddExpense(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Expense</h2>
                <button className="modal-close" onClick={() => setShowAddExpense(false)}>×</button>
              </div>
              <form onSubmit={handleExpenseFormSubmit} className="expense-form">
                <div className="form-group">
                  <label>Description *</label>
                  <input
                    type="text"
                    name="description"
                    value={expenseForm.description}
                    onChange={handleExpenseFormChange}
                    required
                    placeholder="Enter expense description"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount *</label>
                    <input
                      type="number"
                      name="amount"
                      value={expenseForm.amount}
                      onChange={handleExpenseFormChange}
                      required
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      name="currency"
                      value={expenseForm.currency}
                      onChange={handleExpenseFormChange}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={expenseForm.category}
                      onChange={handleExpenseFormChange}
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Housing">Housing</option>
                      <option value="Education">Education</option>
                      <option value="Travel">Travel</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      name="expenseDate"
                      value={expenseForm.expenseDate}
                      onChange={handleExpenseFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={expenseForm.notes}
                    onChange={handleExpenseFormChange}
                    rows={3}
                    placeholder="Additional notes (optional)"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddExpense(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Expense Modal */}
        {editingExpense && (
          <EditExpenseModal
            isOpen={!!editingExpense}
            onClose={() => setEditingExpense(null)}
            expense={{
              ...editingExpense,
              date: editingExpense.expenseDate || editingExpense.date
            }}
            onSave={handleEditExpense}
          />
        )}
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
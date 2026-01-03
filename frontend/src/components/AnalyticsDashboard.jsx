import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Receipt, PieChart, Settings, 
  ChevronLeft, ChevronRight, Plus, CreditCard, Wallet,
  X, Users, Trash2, Menu
} from 'lucide-react';
import ExpenseList from './ExpenseList';
import Report from './Report';
import BudgetPage from './BudgetPage';
import SplitPage from './SplitPage';
import { Card, PrimaryButton, SectionHeader, EmptyState, ProgressBar } from './CoreUI';
import AddExpenseFlow from './AddExpenseFlow';
import { getCategoryConfig } from '../theme/ThemeConfig';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null); // ID of expense to delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [budgets, setBudgets] = useState([]);
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
        // Set default user even without token
        setUser({
          firstName: 'User',
          lastName: '',
          email: 'guest@example.com'
        });
        setExpenses([]);
        setStatistics({
          today: { amount: 0, count: 0 },
          thisWeek: { amount: 0, count: 0 },
          thisMonth: { amount: 0, count: 0 },
          categories: []
        });
        setLoading(false);
        return;
      }

      // Get user from token
      const userData = getUserFromToken();
      setUser(userData || {
        firstName: 'User',
        lastName: '',
        email: 'user@example.com'
      });

      const response = await fetch('http://localhost:8080/api/expenses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
           // Handle auth error
        }
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch expenses');
      }

      const fetchedExpenses = data.data || [];
      setExpenses(fetchedExpenses);
      
      // Calculate statistics
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

      const todayTotal = todayExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      const weekTotal = weekExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      const monthTotal = monthExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

      const categoryMap = {};
      fetchedExpenses.forEach(expense => {
        const category = expense.category || 'Other';
        const amount = parseFloat(expense.amount) || 0;
        categoryMap[category] = (categoryMap[category] || 0) + amount;
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

      // Load budgets for pace indicator
      const budgetMonth = today.toISOString().slice(0, 7);
      const budgetResp = await fetch(`http://localhost:8080/api/budgets?month=${budgetMonth}-01`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const budgetData = await budgetResp.json();
      if (budgetData.success) {
        setBudgets(budgetData.data || []);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setExpenses([]); // Reset on error
    } finally {
      setLoading(false);
    }
  }, [getUserFromToken]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    return token;
  };

  const handleAddExpense = async (expenseData) => {
    try {
      const token = getAuthToken();
      const isEditing = !!editingExpense;
      const url = isEditing 
        ? `http://localhost:8080/api/expenses/${editingExpense.id}`
        : 'http://localhost:8080/api/expenses';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });
      
      if (response.ok) {
        await loadAnalyticsData();
        setShowAddExpense(false);
        setEditingExpense(null); // Clear editing state
      }
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const confirmDelete = (expenseId) => {
      setExpenseToDelete(expenseId);
      setShowDeleteModal(true);
  };

  const executeDelete = async () => {
     if (!expenseToDelete) return;

     try {
        const token = getAuthToken();
        const response = await fetch(`http://localhost:8080/api/expenses/${expenseToDelete}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          await loadAnalyticsData();
          setShowDeleteModal(false);
          setExpenseToDelete(null);
        }
     } catch (error) {
       console.error('Error deleting expense:', error);
     }
  };

  const openEditModal = (expense) => {
      setEditingExpense(expense);
      setShowAddExpense(true);
  };


  // UI Components
  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setActiveNav(id);
        setMobileSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${activeNav === id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
    >
      <Icon className={`w-5 h-5 transition-colors ${activeNav === id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-slate-600'}`} />
      <span className={`${!sidebarOpen && 'lg:hidden'}`}>{label}</span>
    </button>
  );



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
            <div 
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
                onClick={() => setMobileSidebarOpen(false)}
            />
        )}

       {/* Sidebar */}
       <aside className={`
            ${sidebarOpen ? 'lg:w-72' : 'lg:w-20'} 
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:static top-0 left-0 h-full
            bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-40 lg:z-20 shadow-xl lg:shadow-sm
       `}>
            <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 h-20">
                <div className={`flex items-center gap-3 ${!sidebarOpen && 'lg:justify-center w-full'}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
                        <Wallet className="text-white w-6 h-6" />
                    </div>
                </div>
                {/* Mobile Close Button */}
                <button 
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-2 lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                <SidebarItem id="expenses" icon={Receipt} label="Expenses" />
                <SidebarItem id="budget" icon={CreditCard} label="Budget" />
                <SidebarItem id="split" icon={Users} label="Split" />
                <SidebarItem id="reports" icon={PieChart} label="Report" />
                
                <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
                    <SidebarItem id="settings" icon={Settings} label="Settings" />
                </div>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 hidden lg:block">
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
                >
                    {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
            </div>
       </aside>

       {/* Main Content */}
       <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 relative">
            {/* Mobile Header */}
            <header className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setMobileSidebarOpen(true)}
                        className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-slate-900 dark:text-white">Spendora</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {user?.firstName?.charAt(0) || 'U'}
                </div>
            </header>

            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-900/10 pointer-events-none z-0" />

            <div className="relative z-10 w-full px-6 lg:px-8 py-6 lg:py-8">
                
                {activeNav === 'dashboard' && (
                    <div className="space-y-8 animate-slide-up">
                        {/* 1. Greeting with current month context */}
                        <div className="mb-8">
                            <h1 className="text-[var(--text-page-title)] font-[var(--weight-semibold)] text-[var(--color-text-main)]">
                                Hello, {user?.firstName}
                            </h1>
                            <p className="text-[var(--text-muted)] text-[var(--color-text-muted)]">
                                Here's your spending overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        {/* 2. Monthly total spent (dominant) */}
                        <Card className="text-center py-[var(--space-xl)] shadow-none">
                            <p className="text-[var(--text-muted)] text-[var(--color-text-muted)] mb-[var(--space-xs)]">Total Spent This Month</p>
                            <h2 className="text-[var(--text-monetary-lg)] font-[var(--weight-bold)] text-[var(--color-text-main)]">
                                ${statistics.thisMonth.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            <div className="flex justify-center gap-[var(--space-lg)] mt-[var(--space-md)]">
                                <div className="text-center">
                                    <p className="text-[var(--text-muted)] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Today</p>
                                    <p className="text-[var(--text-body)] font-[var(--weight-semibold)] text-[var(--color-text-muted)]">${statistics.today.amount.toLocaleString()}</p>
                                </div>
                                <div className="text-center border-l border-[var(--color-border)] pl-[var(--space-lg)]">
                                    <p className="text-[var(--text-muted)] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Weekly</p>
                                    <p className="text-[var(--text-body)] font-[var(--weight-semibold)] text-[var(--color-text-muted)]">${statistics.thisWeek.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        </Card>

                        {/* 3. Spending pace indicator */}
                        <Card className="shadow-none">
                            <SectionHeader title="Monthly Budget Pace" />
                            {(() => {
                                const totalBudget = budgets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
                                const percentage = totalBudget > 0 ? (statistics.thisMonth.amount / totalBudget) * 100 : 0;
                                const isOver = percentage > 100;
                                
                                // Insight Logic
                                const todayDate = new Date();
                                const currentDay = todayDate.getDate();
                                const daysInMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate();
                                const expectedProgress = (currentDay / daysInMonth) * 100;
                                
                                let insightText = "Set a budget to see insights.";
                                if (totalBudget > 0) {
                                    if (isOver) {
                                        insightText = "You've exceeded your budget.";
                                    } else if (percentage < expectedProgress - 5) {
                                        insightText = "You're spending at a healthy pace.";
                                    } else if (percentage > expectedProgress + 5) {
                                        insightText = "You're spending faster than usual.";
                                    } else {
                                        insightText = "You're on track with your budget.";
                                    }
                                }

                                return (
                                    <div className="space-y-[var(--space-sm)]">
                                        <div className="flex justify-between items-end mb-[var(--space-xs)]">
                                            <div>
                                                <p className="text-[var(--text-body)] font-[var(--weight-semibold)] text-[var(--color-text-main)]">
                                                    {insightText}
                                                </p>
                                                <p className="text-[var(--text-muted)] text-[var(--color-text-muted)] mt-1">
                                                    {totalBudget > 0 
                                                        ? `${percentage.toFixed(0)}% of monthly budget used`
                                                        : 'No budget set'}
                                                </p>
                                            </div>
                                            <p className="text-[var(--text-muted)] text-[var(--color-text-muted)]">
                                                Target: ${totalBudget.toLocaleString()}
                                            </p>
                                        </div>
                                        <ProgressBar 
                                            value={percentage} 
                                            color={isOver ? 'var(--color-danger)' : 'var(--color-primary)'} 
                                        />
                                    </div>
                                );
                            })()}
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-lg)]">
                            {/* 4. Top spending categories */}
                            <Card className="shadow-none flex flex-col">
                                <SectionHeader title="Category Breakdown" actionLabel="Manage Budgets" onActionClick={() => setActiveNav('budget')} />
                                <div className="space-y-[var(--space-md)] flex-1">
                                    {statistics.categories.length > 0 ? (
                                        statistics.categories.slice(0, 5).map((cat, i) => {
                                            const { icon: CatIcon, color: catColor } = getCategoryConfig(cat.name);
                                            return (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-[var(--space-sm)]">
                                                        <div 
                                                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                                            style={{ backgroundColor: `${catColor}20` }} /* 20 = 12% opacity roughly, keeping it soft */
                                                        >
                                                            <CatIcon size={16} style={{ color: catColor }} />
                                                        </div>
                                                        <span className={`text-[var(--text-body)] ${i === 0 ? 'font-[var(--weight-bold)] text-[var(--color-primary)]' : 'text-[var(--color-text-main)]'}`}>
                                                            {cat.name}
                                                        </span>
                                                    </div>
                                                    <span className={`text-[var(--text-body)] ${i === 0 ? 'font-[var(--weight-bold)] text-[var(--color-primary)]' : 'font-[var(--weight-semibold)] text-[var(--color-text-main)]'}`}>
                                                        ${cat.amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <EmptyState message="No spending data available for this month yet." />
                                    )}
                                </div>
                            </Card>

                            {/* 5. Recent expenses list */}
                            <Card className="shadow-none flex flex-col">
                                <SectionHeader title="Recent Transactions" actionLabel="View All" onActionClick={() => setActiveNav('expenses')} />
                                <div className="space-y-[var(--space-md)] flex-1">
                                {expenses.length > 0 ? (
                                    expenses.slice(0, 5).map((expense, i) => {
                                        const { icon: CatIcon, color: catColor } = getCategoryConfig(expense.category);
                                        return (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-[var(--space-sm)] flex-1 min-w-0 pr-4">
                                                    <div 
                                                        className="w-10 h-10 rounded-[var(--radius-btn)] flex items-center justify-center shrink-0 bg-[var(--color-bg)]"
                                                        style={{ backgroundColor: `${catColor}15` }}
                                                    >
                                                        <CatIcon size={20} style={{ color: catColor }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[var(--text-body)] font-[var(--weight-semibold)] text-[var(--color-text-main)] truncate">
                                                            {expense.description}
                                                        </p>
                                                        <p className="text-[var(--text-muted)] text-[var(--color-text-muted)]">
                                                            {new Date(expense.expenseDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[var(--text-body)] font-[var(--weight-bold)] text-[var(--color-text-main)] whitespace-nowrap">
                                                    -${parseFloat(expense.amount).toLocaleString()}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                        <EmptyState 
                                            message="Your recent transactions will appear here." 
                                            ctaLabel="Add First Expense" 
                                            onCtaClick={() => setShowAddExpense(true)} 
                                        />
                                    )}
                                </div>
                            </Card>
                        </div>
                        
                        {/* Only one primary action button on the page (FAB or centered button) */}
                        <div className="flex justify-start pt-[var(--space-lg)] lg:pb-0 pb-16">
                            <PrimaryButton onClick={() => setShowAddExpense(true)} className="px-[var(--space-xl)] py-[var(--space-md)] shadow-xl hidden lg:flex">
                                <Plus className="w-5 h-5" /> Add New Expense
                            </PrimaryButton>
                        </div>

                        {/* Mobile/Tablet Floating Action Button (FAB) */}
                        <button 
                            onClick={() => setShowAddExpense(true)}
                            className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-[var(--color-primary)] text-white rounded-full shadow-2xl flex items-center justify-center z-30 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {activeNav === 'expenses' && (
                     <div className="animate-fade-in">
                        <ExpenseList
                            expenses={expenses.map(exp => ({ ...exp, date: exp.expenseDate || exp.date }))}
                            onDeleteExpense={confirmDelete}
                            onEditExpense={openEditModal}
                            selectedCurrency="USD"
                            user={user || { firstName: 'User' }}
                            onAddExpense={() => {
                                setEditingExpense(null);
                                setShowAddExpense(true);
                            }}
                        />
                     </div>
                )}

                {activeNav === 'budget' && (
                    <div className="animate-fade-in">
                        <BudgetPage 
                            expenses={expenses}
                            user={user}
                        />
                    </div>
                )}

                {activeNav === 'split' && (
                    <div className="animate-fade-in">
                        <SplitPage 
                            user={user}
                        />
                    </div>
                )}

                {activeNav === 'reports' && (
                    <div className="animate-fade-in">
                        <Report 
                            expenses={expenses}
                        />
                    </div>
                )}

                {/* Placeholders for other sections */}
                {['settings'].includes(activeNav) && (
                     <div className="glass-card p-12 text-center animate-fade-in">
                        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <Settings className="w-8 h-8 text-slate-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Work in Progress</h2>
                        <p className="text-slate-500">The {activeNav} section is currently being redesigned.</p>
                     </div>
                )}
            </div>
       </main>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Expense?</h3>
                    <p className="text-slate-500 mb-6">Are you sure you want to delete this expense? This action cannot be undone.</p>
                    <div className="flex gap-3">
                         <button 
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={executeDelete}
                            className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Optimized Add/Edit Expense Flow */}
        {showAddExpense && (
            <AddExpenseFlow 
                initialData={editingExpense}
                onSave={handleAddExpense}
                onCancel={() => {
                    setShowAddExpense(false);
                    setEditingExpense(null);
                }}
            />
        )}
    </div>
  );
};

export default AnalyticsDashboard;
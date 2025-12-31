import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Tag, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CreditCard, 
  Wallet,
  ArrowUpRight,
  Calendar,
  DollarSign,
  X,
  Users,
  Trash2
} from 'lucide-react';
import ExpenseList from './ExpenseList';
import EditExpenseModal from './EditExpenseModal';
import Report from './Report';
import SettingsPage from './SettingsPage';
import BudgetPage from './BudgetPage';
import SplitPage from './SplitPage';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null); // ID of expense to delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        setExpenseForm({
          description: '',
          amount: '',
          category: '',
          expenseDate: new Date().toISOString().split('T')[0],
          notes: '',
          currency: 'USD'
        });
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
      setExpenseForm({
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          expenseDate: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          notes: expense.notes || '',
          currency: expense.currency || 'USD'
      });
      setShowAddExpense(true);
  };

  const handleExpenseFormSubmit = async (e) => {
    e.preventDefault();
    await handleAddExpense(expenseForm);
  };
    
  const handleExpenseFormChange = (e) => {
      const { name, value } = e.target;
      setExpenseForm(prev => ({ ...prev, [name]: value }));
  };

  // UI Components
  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveNav(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        activeNav === id 
          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium shadow-sm' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className={`w-5 h-5 transition-colors ${activeNav === id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-slate-600'}`} />
      <span className={`${!sidebarOpen && 'hidden'}`}>{label}</span>
    </button>
  );

  const StatCard = ({ title, amount, count, icon: Icon, colorClass }) => (
    <div className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
            <Icon className="w-24 h-24 transform translate-x-4 -translate-y-4" />
        </div>
        <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-current`}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-slate-500 dark:text-slate-400 font-medium">{title}</span>
        </div>
        <div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
                ${amount.toFixed(2)}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded text-xs">
                    {count}
                </span>
                transactions
            </p>
        </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
        
       {/* Sidebar */}
       <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-20 hidden lg:flex shadow-sm`}>
            <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 h-20">
                <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
                        <Wallet className="text-white w-6 h-6" />
                    </div>
                    {sidebarOpen && <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">Spendora</span>}
                </div>
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

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
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
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-900/10 pointer-events-none z-0" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header - Hidden for Expenses and Budget as they have their own headers */}
                {!['expenses', 'budget', 'split'].includes(activeNav) && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                {activeNav === 'dashboard' ? 'Dashboard' : activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                Welcome back, {user?.firstName}
                            </p>
                        </div>
                        <button 
                            onClick={() => {
                                setEditingExpense(null);
                                setExpenseForm({
                                    description: '',
                                    amount: '',
                                    category: '',
                                    expenseDate: new Date().toISOString().split('T')[0],
                                    notes: '',
                                    currency: 'USD'
                                });
                                setShowAddExpense(true);
                            }}
                            className="btn-primary flex items-center gap-2 self-start md:self-auto"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Expense
                        </button>
                    </div>
                )}

                {activeNav === 'dashboard' && (
                    <div className="space-y-8 animate-slide-up">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard 
                                title="Today's Spending" 
                                amount={statistics.today.amount} 
                                count={statistics.today.count} 
                                icon={DollarSign}
                                colorClass="text-blue-500"
                            />
                            <StatCard 
                                title="This Week" 
                                amount={statistics.thisWeek.amount} 
                                count={statistics.thisWeek.count} 
                                icon={Calendar}
                                colorClass="text-violet-500"
                            />
                             <StatCard 
                                title="This Month" 
                                amount={statistics.thisMonth.amount} 
                                count={statistics.thisMonth.count} 
                                icon={PieChart}
                                colorClass="text-emerald-500"
                            />
                        </div>

                        {/* Recent Activity Section Placeholder */}
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 glass-card p-6 h-96 flex flex-col items-center justify-center text-center">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                                    <PieChart className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Spending Trends</h3>
                                <p className="text-slate-500 max-w-sm">
                                    Your spending charts and analytics will appear here once you have more data.
                                </p>
                            </div>

                            <div className="glass-card p-6 h-96">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Recent Categories</h3>
                                <div className="space-y-4">
                                    {statistics.categories.length > 0 ? (
                                        statistics.categories.slice(0, 5).map((cat, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                                                </div>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">${cat.amount.toFixed(2)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500 text-center py-8">No categories data yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
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
                                setExpenseForm({
                                    description: '',
                                    amount: '',
                                    category: '',
                                    expenseDate: new Date().toISOString().split('T')[0],
                                    notes: '',
                                    currency: 'USD'
                                });
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

                {/* Placeholders for other sections */}
                {['reports', 'settings'].includes(activeNav) && (
                     <div className="glass-card p-12 text-center animate-fade-in">
                        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <Settings className="w-8 h-8 text-slate-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Work in Progress</h2>
                        <p className="text-slate-500">The {activeNav === 'reports' ? 'Report' : activeNav} section is currently being redesigned.</p>
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

        {/* Add Expense Modal Wrapper (Simplified for now) */}
        {showAddExpense && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                        </h3>
                        <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleExpenseFormSubmit} className="p-6 space-y-6">
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Description</label>
                            <input 
                                type="text" 
                                name="description" 
                                value={expenseForm.description} 
                                onChange={handleExpenseFormChange}
                                placeholder="e.g., Grocery Shopping"
                                className="input-field bg-slate-50 border-slate-300 dark:bg-slate-700 dark:border-slate-600" 
                                required 
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                                    <input 
                                        type="number" 
                                        name="amount" 
                                        value={expenseForm.amount} 
                                        onChange={handleExpenseFormChange}
                                        placeholder="0.00"
                                        className="input-field pl-8 bg-slate-50 border-slate-300 dark:bg-slate-700 dark:border-slate-600" 
                                        required 
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Category</label>
                                <select 
                                    name="category" 
                                    value={expenseForm.category} 
                                    onChange={handleExpenseFormChange}
                                    className="input-field bg-slate-50 border-slate-300 dark:bg-slate-700 dark:border-slate-600 appearance-none" 
                                    required
                                >
                                    <option value="" disabled>Select Category</option>
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
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Date</label>
                                <input 
                                    type="date" 
                                    name="expenseDate" 
                                    value={expenseForm.expenseDate} 
                                    onChange={handleExpenseFormChange}
                                    className="input-field bg-slate-50 border-slate-300 dark:bg-slate-700 dark:border-slate-600" 
                                    required 
                                />
                            </div>
                         </div>
                         
                         <div className="flex gap-3 pt-2">
                             <button 
                                type="button" 
                                onClick={() => setShowAddExpense(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                             >
                                Cancel
                             </button>
                             <button 
                                type="submit" 
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-600/40 hover:-translate-y-0.5 transition-all"
                             >
                                Save Expense
                             </button>
                         </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default AnalyticsDashboard;
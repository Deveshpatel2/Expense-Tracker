import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, LogOut, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ExpenseList from './ExpenseList';
import Report from './Report';
import BudgetPage from './BudgetPage';
import SplitPage from './SplitPage';
import HistoryPage from './HistoryPage';
import SettingsPage from './SettingsPage';
import { } from './CoreUI'; // Keeping as placeholder or removing if truly unused. 
import AddExpenseFlow from './AddExpenseFlow';
import TopHeader from './TopHeader';
import Sidebar from './Sidebar';
import { GreetingHeader, KpiCardRow, BudgetPaceCard, CategoryBreakdownCard, RecentTransactionsCard, WeeklyTrendCard } from './DashboardWidgets';

const AnalyticsDashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null); // ID of expense to delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [groups, setGroups] = useState([]); // Folders for expenses
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showGroupDeleteModal, setShowGroupDeleteModal] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [statistics, setStatistics] = useState({
    today: { amount: 0, count: 0 },
    thisWeek: { amount: 0, count: 0 },
    thisMonth: { amount: 0, count: 0 },
    categories: []
  });

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
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
      
      // Load groups first to handle budget exclusion
      let userGroups = [];
      try {
          const groupsResp = await fetch('http://localhost:8080/api/groups', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const groupsData = await groupsResp.json();
          if (groupsData.success) {
            userGroups = groupsData.data || [];
            setGroups(userGroups);
          }
      } catch (err) {
          console.error("Failed to load groups", err);
      }

      const excludedGroupIds = new Set(userGroups.filter(g => g.includeInBudget === 0).map(g => g.id));
      const statsExpenses = fetchedExpenses.filter(e => !e.groupId || !excludedGroupIds.has(e.groupId));
      
      // Calculate statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayExpenses = statsExpenses.filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        expenseDate.setHours(0, 0, 0, 0);
        return expenseDate.getTime() === today.getTime();
      });
      
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weekExpenses = statsExpenses.filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        expenseDate.setHours(0, 0, 0, 0);
        return expenseDate >= weekAgo;
      });
      
      const monthExpenses = statsExpenses.filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        return expenseDate.getMonth() === today.getMonth() && 
               expenseDate.getFullYear() === today.getFullYear();
      });

      const todayTotal = todayExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      const weekTotal = weekExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      const monthTotal = monthExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

      const categoryMap = {};
      statsExpenses.forEach(expense => {
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
  }, []);

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

  const confirmDeleteGroup = (groupId) => {
      setGroupToDelete(groupId);
      setShowGroupDeleteModal(true);
  };

  const executeDeleteGroup = async () => {
      if (!groupToDelete) return;

      try {
          const token = getAuthToken();
          const response = await fetch(`http://localhost:8080/api/groups/${groupToDelete}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
              await loadAnalyticsData(); // Refresh list
              setShowGroupDeleteModal(false);
              setGroupToDelete(null);
          }
      } catch (error) {
          console.error("Error deleting group:", error);
      }
  };

  const openEditModal = (expense) => {
      setEditingExpense(expense);
      setShowAddExpense(true);
  };






  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden relative">

        {/* Top Header */}
        <TopHeader 
            user={user} 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            onLogout={() => setProfileDropdownOpen(!profileDropdownOpen)} // Using existing dropdown state logic or logout directly? The user spec implied a dropdown chevron. I'll hook it to toggle the dropdown for now, but the visual spec was exact. User said "Chevron down icon".
        />
        
        {/* User Profile Dropdown (Keep logically available if needed, or integrate into TopHeader if it handles it. 
           User spec for TopHeader didn't explicitly ask for the *dropdown menu implementation*, just the *header visuals*. 
           However, I need to make sure the dropdown still works or is positioned correctly relative to the new header.
           For now I will keep the profileDropdown logic in Dashboard but positioned absolutely, 
           or ideally TopHeader should handle it. 
           Given the strict "Pixel Closely" instruction for the HEADER BAR, I'll assume the interaction logic (dropdown open) 
           should ideally be triggered by that right cluster.
        */}

        {profileDropdownOpen && (
             <>
                 <div 
                     className="fixed inset-0 z-40"
                     onClick={() => setProfileDropdownOpen(false)}
                 />
                 <div className="absolute right-6 top-[70px] w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-fade-in-down">
                     <div className="p-1">
                         <button 
                             onClick={logout}
                             className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                         >
                             <LogOut className="w-4 h-4" />
                             <span>Logout</span>
                         </button>
                     </div>
                 </div>
             </>
         )}
        
        <div className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
            <div 
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
                onClick={() => setMobileSidebarOpen(false)}
            />
        )}

       {/* Sidebar */}
       <Sidebar 
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            sidebarOpen={sidebarOpen}
            mobileSidebarOpen={mobileSidebarOpen}
            setMobileSidebarOpen={setMobileSidebarOpen}
       />

       {/* Main Content */}
       <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 relative">

            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-900/10 pointer-events-none z-0" />

            <div className="relative z-10 w-full px-6 lg:px-8 py-6 lg:py-8">

                {activeNav === 'dashboard' && (
                    <div className="space-y-8 animate-slide-up">
                        <GreetingHeader userName={user?.firstName || 'User'} />
                        
                        <KpiCardRow statistics={statistics} budgets={budgets} />
                        
                        <BudgetPaceCard statistics={statistics} budgets={budgets} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column (2/3 width) */}
                            <div className="lg:col-span-2 flex flex-col">
                                <CategoryBreakdownCard categories={statistics.categories} />
                                <WeeklyTrendCard expenses={expenses} />
                            </div>

                            {/* Right Column (1/3 width) */}
                            <div className="lg:col-span-1">
                                <RecentTransactionsCard expenses={expenses} />
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
                                setEditingExpense(null);
                                setShowAddExpense(true);
                            }}
                            groups={groups}
                            onRefresh={loadAnalyticsData}
                            onDeleteGroup={confirmDeleteGroup}
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
                            budgets={budgets} // Pass budgets
                            groups={groups}   // Pass groups
                        />
                    </div>
                )}

                {activeNav === 'history' && (
                    <div className="animate-fade-in">
                        <HistoryPage 
                            expenses={expenses}
                        />
                    </div>
                )}

                {/* Placeholders for other sections */}
                {activeNav === 'settings' && (
                     <div className="animate-fade-in">
                        <SettingsPage user={user} />
                     </div>
                )}
            </div>
        </main>
        </div>

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
                groups={groups}
                onSave={handleAddExpense}
                onCancel={() => {
                    setShowAddExpense(false);
                    setEditingExpense(null);
                }}
            />
        )}

        {/* Delete Group Confirmation Modal */}
        {showGroupDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Group?</h3>
                    <p className="text-slate-500 mb-6">
                        Are you sure you want to delete this group? Expenses inside it will remain but won't be grouped.
                    </p>
                    <div className="flex gap-3">
                            <button 
                            onClick={() => setShowGroupDeleteModal(false)}
                            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={executeDeleteGroup}
                            className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all"
                        >
                            Delete Group
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AnalyticsDashboard;
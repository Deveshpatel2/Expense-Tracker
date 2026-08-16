import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listExpenses, createExpense, updateExpense, deleteExpense } from '../api';
import ExpenseList from './ExpenseList';
import AddExpenseFlow from './AddExpenseFlow';
import TopHeader from './TopHeader';
import Sidebar from './Sidebar';
import {
  GreetingHeader,
  KpiCardRow,
  CategoryBreakdownCard,
  RecentTransactionsCard,
  WeeklyTrendCard
} from './DashboardWidgets';

const emptyStatistics = {
  today: { amount: 0, count: 0 },
  thisWeek: { amount: 0, count: 0 },
  thisMonth: { amount: 0, count: 0 },
  categories: []
};

// "YYYY-MM-DD" would parse as UTC midnight and shift a day in negative-offset
// zones, so build the Date from its parts to keep it local.
const startOfDay = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Derives the dashboard totals from the expense list so the UI needs only one request.
export const summarize = (expenses) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const sum = (list) => list.reduce((total, e) => total + (parseFloat(e.amount) || 0), 0);

  const todays = expenses.filter((e) => startOfDay(e.expenseDate).getTime() === today.getTime());
  const week = expenses.filter((e) => startOfDay(e.expenseDate) >= weekAgo);
  const month = expenses.filter((e) => {
    const d = startOfDay(e.expenseDate);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const categoryMap = {};
  expenses.forEach((e) => {
    const category = e.category || 'Other';
    categoryMap[category] = (categoryMap[category] || 0) + (parseFloat(e.amount) || 0);
  });

  return {
    today: { amount: sum(todays), count: todays.length },
    thisWeek: { amount: sum(week), count: week.length },
    thisMonth: { amount: sum(month), count: month.length },
    categories: Object.entries(categoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
  };
};

const AnalyticsDashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [statistics, setStatistics] = useState(emptyStatistics);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listExpenses();
      setExpenses(data);
      setStatistics(summarize(data));
    } catch (err) {
      setError(err.message);
      setExpenses([]);
      setStatistics(emptyStatistics);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleSaveExpense = async (expenseData) => {
    try {
      if (editingExpense && editingExpense.id) {
        await updateExpense(editingExpense.id, expenseData);
      } else {
        await createExpense(expenseData);
      }
      await loadExpenses();
      setShowAddExpense(false);
      setEditingExpense(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const executeDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await deleteExpense(expenseToDelete);
      await loadExpenses();
    } catch (err) {
      setError(err.message);
    } finally {
      setExpenseToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div
          role="status"
          aria-label="Loading"
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden relative">
      <TopHeader
        user={user}
        onLogout={() => setProfileDropdownOpen(!profileDropdownOpen)}
        onToggleSidebar={() => setMobileSidebarOpen((open) => !open)}
      />

      {profileDropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
          <div className="absolute right-6 top-[70px] w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
            <div className="p-1">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 relative">
          <div className="relative z-10 w-full px-6 lg:px-8 py-6 lg:py-8">
            {error && (
              <div role="alert" className="mb-6 rounded-xl bg-red-50 text-red-700 px-4 py-3">
                {error}
              </div>
            )}

            {activeNav === 'dashboard' && (
              <div className="space-y-8">
                <GreetingHeader userName={user?.firstName || 'User'} />
                <KpiCardRow statistics={statistics} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 flex flex-col">
                    <CategoryBreakdownCard categories={statistics.categories} />
                    <WeeklyTrendCard expenses={expenses} />
                  </div>
                  <div className="lg:col-span-1">
                    <RecentTransactionsCard expenses={expenses} />
                  </div>
                </div>
              </div>
            )}

            {activeNav === 'expenses' && (
              <ExpenseList
                expenses={expenses.map((exp) => ({ ...exp, date: exp.expenseDate || exp.date }))}
                onDeleteExpense={setExpenseToDelete}
                onEditExpense={(expense) => {
                  setEditingExpense(expense);
                  setShowAddExpense(true);
                }}
                selectedCurrency="USD"
                user={user || { firstName: 'User' }}
                onAddExpense={() => {
                  setEditingExpense(null);
                  setShowAddExpense(true);
                }}
              />
            )}
          </div>
        </main>
      </div>

      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Expense?</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setExpenseToDelete(null)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddExpense && (
        <AddExpenseFlow
          initialData={editingExpense}
          onSave={handleSaveExpense}
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

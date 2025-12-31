import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Calendar, PieChart, BarChart3, 
  ArrowUpRight, ArrowDownRight, AlertCircle, 
  PiggyBank, Wallet, Trash2, Edit2, ChevronLeft, ChevronRight,
  Coffee, Car, ShoppingBag, Heart, Zap, Home, GraduationCap, Plane, Receipt, X
} from 'lucide-react';
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const BudgetPage = ({ expenses, user }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [showAddModal, setShowAddModal] = useState(false);
  const [rolloverEnabled, setRolloverEnabled] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    amount: '',
    notes: '',
    alertThreshold: 80
  });

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Utilities',
    'Housing',
    'Education',
    'Travel',
    'Other'
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food & Dining': return Coffee;
      case 'Transportation': return Car;
      case 'Shopping': return ShoppingBag;
      case 'Entertainment': return Heart;
      case 'Healthcare': return Heart;
      case 'Utilities': return Zap;
      case 'Housing': return Home;
      case 'Education': return GraduationCap;
      case 'Travel': return Plane;
      default: return Receipt;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': '#10b981', // emerald-500
      'Transportation': '#3b82f6', // blue-500
      'Shopping': '#8b5cf6', // violet-500
      'Entertainment': '#ec4899', // pink-500
      'Healthcare': '#ef4444', // red-500
      'Utilities': '#f59e0b', // amber-500
      'Other': '#64748b' // slate-500
    };
    return colors[category] || colors['Other'];
  };

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8080/api/budgets?month=${selectedMonth}-01`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBudgets(data.data || []);
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingBudget ? 'PUT' : 'POST';
      const url = editingBudget 
        ? `http://localhost:8080/api/budgets/${editingBudget.id}`
        : 'http://localhost:8080/api/budgets';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...budgetForm,
          budgetMonth: `${selectedMonth}-01`,
          currency: 'USD'
        })
      });

      if (response.ok) {
        loadBudgets();
        setShowAddModal(false);
        setEditingBudget(null);
        setBudgetForm({ category: '', amount: '', notes: '', alertThreshold: 80 });
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8080/api/budgets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  // Calculate spending per category for selected month
  const categorySpending = budgets.map(budget => {
    const spent = expenses
      .filter(exp => {
        const expDate = new Date(exp.expenseDate || exp.date);
        const expMonth = expDate.toISOString().slice(0, 7);
        return expMonth === selectedMonth && exp.category === budget.category;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

    const percent = (spent / budget.amount) * 100;
    return { ...budget, spent, percent };
  });

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = categorySpending.reduce((sum, b) => sum + b.spent, 0);
  const overallPercent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  // Chart Data
  const pieData = categorySpending.map(b => ({
    name: b.category,
    value: b.amount
  }));

  const barData = [
    { name: 'Budgeted', amount: totalBudgeted },
    { name: 'Spent', amount: totalSpent }
  ];

  const COLORS = budgets.map(b => getCategoryColor(b.category));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Budget</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Setting goals for {new Date(selectedMonth + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-4">
             <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                <button 
                    onClick={() => {
                        const d = new Date(selectedMonth + '-02');
                        d.setMonth(d.getMonth() - 1);
                        setSelectedMonth(d.toISOString().slice(0, 7));
                    }}
                    className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {new Date(selectedMonth + '-02').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <button 
                    onClick={() => {
                        const d = new Date(selectedMonth + '-02');
                        d.setMonth(d.getMonth() + 1);
                        setSelectedMonth(d.toISOString().slice(0, 7));
                    }}
                    className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
            <button
                onClick={() => {
                    setEditingBudget(null);
                    setBudgetForm({ category: '', amount: '', notes: '', alertThreshold: 80 });
                    setShowAddModal(true);
                }}
                className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20"
            >
                <Plus className="w-5 h-5" />
                Add Budget
            </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <div className="glass-card p-6 border-l-4 border-primary-500">
            <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                <Wallet className="w-5 h-5" />
                <span className="text-sm font-medium">Total Budgeted</span>
            </div>
            <h3 className="text-2xl font-bold">${totalBudgeted.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-6 border-l-4 border-emerald-500">
            <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                <ArrowDownRight className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">Total Spent</span>
            </div>
            <h3 className="text-2xl font-bold">${totalSpent.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-6 border-l-4 border-amber-500">
            <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                <PiggyBank className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">Remaining</span>
            </div>
            <h3 className="text-2xl font-bold">${(totalBudgeted - totalSpent).toLocaleString()}</h3>
        </div>
      </div>

      {/* Main Budget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Category Budgets</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Rollover</span>
                    <button 
                        onClick={() => setRolloverEnabled(!rolloverEnabled)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${rolloverEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${rolloverEnabled ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            {categorySpending.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No budgets yet</h3>
                    <p className="text-slate-500 text-sm">Start by adding a budget for a category.</p>
                </div>
            ) : (
                categorySpending.map((budget) => {
                    const Icon = getCategoryIcon(budget.category);
                    const isOver = budget.percent > 100;
                    const isNear = budget.percent > budget.alertThreshold && !isOver;

                    return (
                        <div key={budget.id} className="glass-card p-5 group hover:scale-[1.01] transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                                        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{budget.category}</h4>
                                        <p className="text-xs text-slate-500">{budget.notes || 'Monthly target'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                                        ${budget.spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                                    </div>
                                    <div className={`text-xs font-bold ${isOver ? 'text-red-500' : isNear ? 'text-amber-500' : 'text-emerald-500'}`}>
                                        {Math.round(budget.percent)}% Used
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4 shadow-inner">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(budget.percent, 100)}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-2">
                                     {isOver && (
                                        <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-lg flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Overspent
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            setEditingBudget(budget);
                                            setBudgetForm({
                                                category: budget.category,
                                                amount: budget.amount.toString(),
                                                notes: budget.notes || '',
                                                alertThreshold: budget.alertThreshold || 80
                                            });
                                            setShowAddModal(true);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteBudget(budget.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>

        {/* Charts & Analytics */}
        <div className="space-y-8">
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary-500" />
                    Budget Distribution
                </h2>
                <div className="h-[300px] w-full">
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </RePieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 italic">
                            No data to display
                        </div>
                    )}
                </div>
            </div>

             <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    Spending Overview
                </h2>
                <div className="h-[300px] w-full">
                   {totalBudgeted > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#10b981'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                   ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 italic">
                        No data to display
                    </div>
                   )}
                </div>
            </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {editingBudget ? 'Edit Budget' : 'Add New Budget'}
                    </h3>
                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSaveBudget} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                        <select 
                            value={budgetForm.category}
                            onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Monthly Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                            <input 
                                type="number" 
                                value={budgetForm.amount}
                                onChange={(e) => setBudgetForm({...budgetForm, amount: e.target.value})}
                                placeholder="0.00"
                                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Alert Threshold (%)</label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="range" 
                                min="50" 
                                max="100" 
                                step="5"
                                value={budgetForm.alertThreshold}
                                onChange={(e) => setBudgetForm({...budgetForm, alertThreshold: parseInt(e.target.value)})}
                                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{budgetForm.alertThreshold}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 italic">Notify me when I spent more than {budgetForm.alertThreshold}%</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 px-4 py-3 bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/30 hover:shadow-primary-600/40 hover:-translate-y-0.5 transition-all"
                        >
                            Save Budget
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;

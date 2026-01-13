import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, PieChart, BarChart3, 
  ArrowDownRight, AlertCircle, 
  PiggyBank, Wallet, Trash2, Edit2, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Card, SectionHeader, PrimaryButton, SecondaryButton, ProgressBar, EmptyState, Input, Select } from './CoreUI';
import { CATEGORIES, getCategoryConfig } from '../theme/ThemeConfig';

const BudgetPage = ({ expenses, user }) => {
  const [budgets, setBudgets] = useState([]);
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

  const categoryOptions = Object.keys(CATEGORIES).map(cat => ({ value: cat, label: cat }));

  const loadBudgets = useCallback(async () => {
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
        // loading state removed
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

  // Chart Data
  const pieData = categorySpending.map(b => ({
    name: b.category,
    value: b.amount
  }));

  const barData = [
    { name: 'Budgeted', amount: totalBudgeted },
    { name: 'Spent', amount: totalSpent }
  ];

  return (
    <div className="space-y-[var(--space-lg)] pb-[var(--space-xl)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[var(--space-md)]">
        <div>
          <h1 className="text-[var(--text-page-title)] font-[var(--weight-bold)] text-[var(--color-text-main)]">Budget</h1>
          <p className="text-[var(--text-muted)] text-[var(--color-text-muted)] mt-[var(--space-xs)]">
            Setting goals for {new Date(selectedMonth + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-[var(--space-md)]">
             <div className="flex items-center bg-[var(--color-surface)] rounded-[var(--radius-btn)] p-[var(--space-xs)] border border-[var(--color-border)]">
                <button 
                    onClick={() => {
                        const d = new Date(selectedMonth + '-02');
                        d.setMonth(d.getMonth() - 1);
                        setSelectedMonth(d.toISOString().slice(0, 7));
                    }}
                    className="p-[var(--space-xs)] hover:bg-[var(--color-bg)] rounded-[var(--radius-btn)] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-[var(--space-md)] text-[var(--text-body)] font-[var(--weight-semibold)] text-[var(--color-text-main)]">
                    {new Date(selectedMonth + '-02').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <button 
                    onClick={() => {
                        const d = new Date(selectedMonth + '-02');
                        d.setMonth(d.getMonth() + 1);
                        setSelectedMonth(d.toISOString().slice(0, 7));
                    }}
                    className="p-[var(--space-xs)] hover:bg-[var(--color-bg)] rounded-[var(--radius-btn)] transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
            <PrimaryButton
                onClick={() => {
                    setEditingBudget(null);
                    setBudgetForm({ category: '', amount: '', notes: '', alertThreshold: 80 });
                    setShowAddModal(true);
                }}
                className="flex items-center gap-2 !bg-[#2563EB] text-white"
            >
                <Plus className="w-5 h-5" />
                Add Budget
            </PrimaryButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--space-md)]">
        <Card padding="var(--space-md)" className="border-l-4 border-l-[#2563EB]">
            <div className="flex items-center gap-[var(--space-xs)] mb-[var(--space-xs)] text-[var(--color-text-muted)]">
                <Wallet className="w-4 h-4" />
                <span className="text-[var(--text-muted)] font-[var(--weight-medium)]">Total Budgeted</span>
            </div>
            <h3 className="text-[var(--text-monetary-md)] font-[var(--weight-bold)] text-[var(--color-text-main)]">
              ${totalBudgeted.toLocaleString()}
            </h3>
        </Card>
        <Card padding="var(--space-md)" className="border-l-4 border-l-[var(--color-success)]">
            <div className="flex items-center gap-[var(--space-xs)] mb-[var(--space-xs)] text-[var(--color-text-muted)]">
                <ArrowDownRight className="w-4 h-4 text-[var(--color-success)]" />
                <span className="text-[var(--text-muted)] font-[var(--weight-medium)]">Total Spent</span>
            </div>
            <h3 className="text-[var(--text-monetary-md)] font-[var(--weight-bold)] text-[var(--color-text-main)]">
              ${totalSpent.toLocaleString()}
            </h3>
        </Card>
        <Card padding="var(--space-md)" className="border-l-4 border-l-[var(--color-warning)]">
            <div className="flex items-center gap-[var(--space-xs)] mb-[var(--space-xs)] text-[var(--color-text-muted)]">
                <PiggyBank className="w-4 h-4 text-[var(--color-warning)]" />
                <span className="text-[var(--text-muted)] font-[var(--weight-medium)]">Remaining</span>
            </div>
            <h3 className="text-[var(--text-monetary-md)] font-[var(--weight-bold)] text-[var(--color-text-main)]">
              ${(totalBudgeted - totalSpent).toLocaleString()}
            </h3>
        </Card>
      </div>

      {/* Main Budget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-lg)]">
        <div className="space-y-[var(--space-md)]">
            <SectionHeader 
              title="Category Budgets" 
              actionLabel={rolloverEnabled ? "Rollover Enabled" : "Rollover Disabled"}
              onActionClick={() => setRolloverEnabled(!rolloverEnabled)}
            />

            {categorySpending.length === 0 ? (
                <EmptyState 
                    message="You haven't set any budgets for this month yet. Setting a budget helps you keep track of your spending goals."
                    ctaLabel="Step 1: Create a Budget"
                    onCtaClick={() => setShowAddModal(true)}
                />
            ) : (
                categorySpending.map((budget) => {
                    const { icon: Icon } = getCategoryConfig(budget.category);
                    const isOver = budget.percent > 100;
                    const isNear = budget.percent > budget.alertThreshold && !isOver;
                    const progressColor = isOver ? 'var(--color-danger)' : isNear ? 'var(--color-warning)' : 'var(--color-success)';

                    return (
                        <Card key={budget.id} padding="var(--space-md)" className="group relative">
                            <div className="flex justify-between items-start mb-[var(--space-sm)]">
                                <div className="flex items-center gap-[var(--space-sm)]">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-[var(--weight-semibold)] text-[var(--color-text-main)]">{budget.category}</h4>
                                        <p className="text-[var(--text-muted)] text-[var(--color-text-muted)]">{budget.notes || 'Monthly target'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[var(--text-body)] font-[var(--weight-bold)] text-[var(--color-text-main)]">
                                        ${budget.spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                                    </div>
                                    <div className={`text-[var(--text-muted)] font-[var(--weight-semibold)]`} style={{ color: progressColor }}>
                                        {Math.round(budget.percent)}% Used
                                    </div>
                                </div>
                            </div>

                            <ProgressBar value={budget.percent} color={progressColor} className="mb-[var(--space-sm)]" />

                            <div className="flex justify-between items-center sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-2">
                                     {isOver && (
                                        <span className="text-[var(--text-muted)] text-[var(--color-danger)] font-[var(--weight-semibold)] flex items-center gap-1">
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
                                        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteBudget(budget.id)}
                                        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    );
                })
            )}
        </div>

        {/* Charts & Analytics */}
        {categorySpending.length > 0 && (
          <div className="space-y-[var(--space-lg)]">
              <Card padding="var(--space-md)">
                  <h2 className="text-[var(--text-section-title)] font-[var(--weight-semibold)] text-[var(--color-text-main)] mb-[var(--space-md)] flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-[#2563EB]" />
                      Budget Distribution
                  </h2>
                  <div className="h-[200px] sm:h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                              <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={70}
                                  outerRadius={90}
                                  paddingAngle={2}
                                  dataKey="value"
                                  isAnimationActive={false}
                              >
                                  {pieData.map((entry, index) => (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={index === 0 ? 'var(--color-primary)' : 'var(--color-chart-muted)'} 
                                      />
                                  ))}
                              </Pie>
                              <Tooltip
                                  contentStyle={{ borderRadius: 'var(--radius-btn)', border: 'none', boxShadow: 'var(--shadow-sm)' }}
                              />
                          </RePieChart>
                      </ResponsiveContainer>
                  </div>
                  <p className="text-[12px] text-[var(--color-text-muted)] mt-[var(--space-sm)] italic text-center">
                    Distribution of budgeted funds across primary spending categories.
                  </p>
              </Card>

               <Card padding="var(--space-md)">
                  <h2 className="text-[var(--text-section-title)] font-[var(--weight-semibold)] text-[var(--color-text-main)] mb-[var(--space-md)] flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[var(--color-success)]" />
                      Spending Overview
                  </h2>
                  <div className="h-[200px] sm:h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-chart-label)' }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-chart-label)' }} />
                              <Tooltip
                                  cursor={{ fill: 'transparent' }}
                                  contentStyle={{ borderRadius: 'var(--radius-btn)', border: 'none', boxShadow: 'var(--shadow-sm)' }}
                              />
                              <Bar dataKey="amount" isAnimationActive={false} radius={[4, 4, 0, 0]}>
                                  {barData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={index === 0 ? '#2563EB' : '#9CA3AF'} />
                                  ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                  <p className="text-[12px] text-[var(--color-text-muted)] mt-[var(--space-sm)] italic text-center">
                    Comparison between total planned budget and current month's actual spending.
                  </p>
              </Card>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[var(--space-md)] bg-black/50 backdrop-blur-sm animate-fade-in">
            <Card padding="0" className="w-full max-w-md shadow-2xl overflow-hidden border-none">
                <div className="p-[var(--space-md)] border-b border-[var(--color-border)] flex justify-between items-center">
                    <h3 className="text-[var(--text-section-title)] font-[var(--weight-bold)] text-[var(--color-text-main)]">
                        {editingBudget ? 'Edit Budget' : 'Add New Budget'}
                    </h3>
                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-[var(--color-bg)] rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSaveBudget} className="p-[var(--space-md)] space-y-[var(--space-md)]">
                    <Select
                      label="Category"
                      options={categoryOptions}
                      value={budgetForm.category}
                      onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}
                      required
                    />
                    <Input
                      label="Monthly Amount"
                      type="number"
                      value={budgetForm.amount}
                      onChange={(e) => setBudgetForm({...budgetForm, amount: e.target.value})}
                      placeholder="0.00"
                      prefix="$"
                      required
                    />
                    <div>
                        <label className="block text-sm font-[var(--weight-bold)] text-[var(--color-text-main)] mb-[var(--space-xs)]">Alert Threshold (%)</label>
                        <div className="flex items-center gap-[var(--space-md)]">
                            <input 
                                type="range" 
                                min="50" 
                                max="100" 
                                step="5"
                                value={budgetForm.alertThreshold}
                                onChange={(e) => setBudgetForm({...budgetForm, alertThreshold: parseInt(e.target.value)})}
                                className="flex-1 h-2 bg-[var(--color-border)] rounded-full appearance-none cursor-pointer accent-[var(--color-[#2563EB])]"
                            />
                            <span className="text-sm font-[var(--weight-bold)] text-[var(--color-text-main)]">{budgetForm.alertThreshold}%</span>
                        </div>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-[var(--space-xs)] italic">Notify me when I spent more than {budgetForm.alertThreshold}%</p>
                    </div>
                    <div className="flex gap-[var(--space-sm)] pt-[var(--space-xs)]">
                        <SecondaryButton 
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton 
                            type="submit"
                            className="flex-1 !bg-[#2563EB] hover:!bg-[#2563EB]/80 text-white"
                        >
                            Save Budget
                        </PrimaryButton>
                    </div>
                </form>
            </Card>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;

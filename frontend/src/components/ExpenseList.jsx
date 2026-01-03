import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Filter, Search } from 'lucide-react';
import AdvancedSearch from './AdvancedSearch';
import { Card, SectionHeader, EmptyState, Input, Select } from './CoreUI';
import { CATEGORIES, getCategoryConfig } from '../theme/ThemeConfig';

const ExpenseList = ({ expenses, onDeleteExpense, onEditExpense, selectedCurrency = 'USD', user, onAddExpense }) => {
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const categories = useMemo(() => ['All Categories', ...Object.keys(CATEGORIES)], []);

  const dateRanges = [
    'All Time',
    'This Week',
    'This Month',
    'Last 3 Months',
    'This Year'
  ];

  const filterAndSortExpenses = useCallback(() => {
    let filtered = [...expenses];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category
    if (categoryFilter && categoryFilter !== 'All Categories') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Date Filter
    const now = new Date();
    if (dateFilter !== 'All Time') {
        filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            switch(dateFilter) {
                case 'This Week':
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(now.getDate() - 7);
                    return expenseDate >= oneWeekAgo;
                case 'This Month':
                    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
                case 'Last 3 Months':
                    const threeMonthsAgo = new Date();
                    threeMonthsAgo.setMonth(now.getMonth() - 3);
                    return expenseDate >= threeMonthsAgo;
                case 'This Year':
                    return expenseDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'amount':
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        default:
          aValue = a.description;
          bValue = b.description;
      }
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, categoryFilter, dateFilter, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortExpenses();
  }, [filterAndSortExpenses]);


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD'
    }).format(amount);
  };

  const getFilterSummary = () => {
    let parts = [];
    if (searchTerm) parts.push(`matching "${searchTerm}"`);
    if (categoryFilter !== 'All Categories') parts.push(`in ${categoryFilter}`);
    if (dateFilter !== 'All Time') parts.push(`from ${dateFilter.toLowerCase()}`);
    
    if (parts.length === 0) return null;
    return (
      <div className="px-[var(--space-sm)] py-[var(--space-xs)] bg-[var(--color-bg)] rounded-[var(--radius-btn)] inline-block mb-[var(--space-md)] animate-fade-in">
        <p className="text-[var(--text-muted)] text-[var(--color-text-muted)]">
          Showing expenses <span className="text-[var(--color-text-main)] font-[var(--weight-semibold)]">{parts.join(' ')}</span>
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-[var(--space-lg)]">
      {/* Header Section */}
      <SectionHeader 
        title="Expenses" 
        actionLabel="Add Expense"
        onActionClick={onAddExpense}
      />

      {/* Filter Row */}
      <div className="flex flex-col gap-[var(--space-md)] sticky top-0 z-10 bg-[var(--color-bg)] py-[var(--space-sm)] border-b border-[var(--color-border)]">
         <div className="flex flex-col lg:flex-row gap-[var(--space-md)] w-full items-end">
            {/* Search */}
             <div className="flex-1 w-full">
                <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    prefix={<Search className="w-4 h-4" />}
                />
            </div>
            
            {/* Date Filter */}
            <div className="w-full lg:w-[200px]">
                <Select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    options={dateRanges.map(r => ({ value: r, label: r }))}
                />
            </div>

            {/* Category Filter */}
             <div className="w-full lg:w-[200px]">
                <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    options={categories.map(c => ({ value: c, label: c }))}
                />
            </div>

            <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={`flex-shrink-0 p-[var(--space-sm)] h-[42px] flex items-center justify-center rounded-[var(--radius-btn)] border transition-all ${showAdvancedSearch ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
            >
                <Filter className="w-5 h-5" />
            </button>
         </div>
      </div>

      {showAdvancedSearch && (
        <Card className="animate-slide-up" padding="md">
            <AdvancedSearch
                onSearch={(data) => {
                    setSearchTerm(data.query);
                    setCategoryFilter(data.category);
                    setSortBy(data.sortBy);
                    setSortOrder(data.sortOrder);
                }}
                 onFilter={(data) => {
                    setCategoryFilter(data.category);
                    setSortBy(data.sortBy);
                    setSortOrder(data.sortOrder);
                }}
                 onSort={(sb, so) => {
                    setSortBy(sb);
                    setSortOrder(so);
                }}
                 onClear={() => {
                    setSearchTerm('');
                    setCategoryFilter('All Categories');
                    setSortBy('date');
                    setSortOrder('desc');
                }}
            />
        </Card>
      )}

      {/* Active Filter Summary */}
      {getFilterSummary()}

      {/* Expense List */}
      <div className="space-y-[var(--space-sm)]">
        {filteredExpenses.length === 0 ? (
            <EmptyState 
                message="We couldn't find any expenses matching your filters. Try adjusting them or add a new expense."
                ctaLabel="Add New Expense"
                onCtaClick={onAddExpense}
            />
        ) : (
            filteredExpenses.map((expense) => {
                const { icon: Icon, color } = getCategoryConfig(expense.category);
                return (
                    <button 
                        key={expense.id} 
                        onClick={() => onEditExpense(expense)}
                        className="w-full text-left"
                    >
                        <Card 
                            padding="sm" 
                            className="flex items-center gap-[var(--space-md)] hover:bg-[var(--color-bg)] transition-colors group"
                        >
                            {/* Icon - Line Style */}
                            {/* Icon - Soft Style */}
                            <div 
                                className="w-10 h-10 rounded-[var(--radius-btn)] flex items-center justify-center shrink-0 transition-colors"
                                style={{ backgroundColor: `${color}15` }}
                            >
                                <Icon size={20} style={{ color: color }} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-[var(--weight-semibold)] text-[var(--color-text-main)] truncate">
                                    {expense.description}
                                </h3>
                                <p className="text-[var(--text-muted)] text-[var(--color-text-muted)] truncate">
                                    {expense.notes || expense.category}
                                </p>
                            </div>

                            {/* Amount & Date */}
                            <div className="text-right shrink-0">
                                <div className="text-[var(--text-monetary-md)] font-[var(--weight-bold)] text-[var(--color-text-main)]">
                                    {formatAmount(expense.amount, expense.currency)}
                                </div>
                                <div className="text-[var(--text-muted)] text-[var(--color-text-muted)]">
                                    {formatDate(expense.date)}
                                </div>
                            </div>
                        </Card>
                    </button>
                );
            })
        )}
      </div>
    </div>
  );
};

export default ExpenseList;

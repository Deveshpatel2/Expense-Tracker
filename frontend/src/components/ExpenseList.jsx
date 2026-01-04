import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Filter, Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import AdvancedSearch from './AdvancedSearch';
import { Card, EmptyState, Input, Select, PrimaryButton } from './CoreUI';
import { CATEGORIES, getCategoryConfig } from '../theme/ThemeConfig';

const ExpenseList = ({ expenses, onDeleteExpense, onEditExpense, selectedCurrency = 'USD', user, onAddExpense }) => {
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const categories = useMemo(() => ['All Categories', ...Object.keys(CATEGORIES)], []);

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() - 1);
        return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + 1);
        return newDate;
    });
  };

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

    // Date Filter (Strict Monthly)
    filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentDate.getMonth() && 
               expenseDate.getFullYear() === currentDate.getFullYear();
    });

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
  }, [expenses, searchTerm, categoryFilter, currentDate, sortBy, sortOrder]);

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
      {/* Custom Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-[var(--text-page-title)] font-[var(--weight-bold)] text-[var(--color-text-main)] mb-1">Expenses</h1>
            <p className="text-[var(--text-muted)] text-[var(--color-text-muted)]">
                Viewing {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''} for {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Month Navigator */}
            <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-btn)] p-1 shadow-sm">
                <button 
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-[var(--color-bg)] rounded-[var(--radius-btn)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-4 font-[var(--weight-semibold)] text-[var(--text-body)] text-[var(--color-text-main)] min-w-[140px] text-center">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <button 
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-[var(--color-bg)] rounded-[var(--radius-btn)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Primary Action */}
            <PrimaryButton onClick={onAddExpense} className="shadow-lg">
                <Plus className="w-5 h-5" /> Add Expense
            </PrimaryButton>
        </div>
      </div>

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
            
            {/* Category Filter */}
             <div className="w-full lg:w-[240px]">
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
                message={`No expenses found for ${currentDate.toLocaleString('default', { month: 'long' })}.`}
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
                            className="flex items-center gap-[var(--space-md)] hover:bg-[var(--color-bg)] transition-colors group border-transparent hover:border-[var(--color-border)] shadow-sm hover:shadow-md"
                        >
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

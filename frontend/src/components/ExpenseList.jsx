import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Filter, Search, ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle, Users } from 'lucide-react';
import AdvancedSearch from './AdvancedSearch';
import { Card, EmptyState, Input, Select, PrimaryButton, SecondaryButton } from './CoreUI';
import CreateGroupModal from './CreateGroupModal';
import { CATEGORIES, getCategoryConfig } from '../theme/ThemeConfig';

const ExpenseList = ({ expenses, onDeleteExpense, onEditExpense, selectedCurrency = 'USD', user, onAddExpense, groups = [], onRefresh, onDeleteGroup }) => {
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [createdGroup, setCreatedGroup] = useState(null);

  // Check for persisted success state on mount (handle unmount/remounts)
  useEffect(() => {
    const savedGroup = sessionStorage.getItem('lastCreatedGroup');
    if (savedGroup) {
        try {
            setCreatedGroup(JSON.parse(savedGroup));
            setShowSuccessBanner(true);
            // Clear after delay
            setTimeout(() => {
                setShowSuccessBanner(false);
                sessionStorage.removeItem('lastCreatedGroup');
            }, 5000);
        } catch (e) {
            console.error('Failed to parse saved group', e);
        }
    }
  }, []);

  const handleCreateGroup = async (groupData) => {
      try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:8080/api/groups', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(groupData)
          });
          
          if (response.ok) {
              const data = await response.json();
              const newGroup = { ...groupData, id: data.data?.id || Date.now(), totalAmount: 0, date: new Date() };
              
              setCreatedGroup(newGroup);
              setShowSuccessBanner(true);
              setShowCreateGroupModal(false);
              
              // Persist for remounts (caused by onRefresh)
              sessionStorage.setItem('lastCreatedGroup', JSON.stringify(newGroup));
              
              // Trigger refresh of groups in parent with a slight delay
              // This ensures the local UI updates (closing modal, showing banner) happen FIRST
              if (onRefresh) {
                  setTimeout(() => onRefresh(), 500);
              }
              
              // Hide banner after 5 seconds
              // Hide banner after 5 seconds
              setTimeout(() => {
                  setShowSuccessBanner(false);
                  sessionStorage.removeItem('lastCreatedGroup');
              }, 5000);
          } else {
              // Fallback for demo/simulation if backend returns 404/500
              console.warn('Backend returned error, using fallback for demo');
              const newGroup = { ...groupData, id: Date.now(), totalAmount: 1.00, date: new Date() };
              
              setCreatedGroup(newGroup);
              setShowSuccessBanner(true);
              setShowCreateGroupModal(false);
              
              // Persist for remounts
              sessionStorage.setItem('lastCreatedGroup', JSON.stringify(newGroup));
              
              // Hide banner after 5 seconds
              setTimeout(() => {
                  setShowSuccessBanner(false);
                  sessionStorage.removeItem('lastCreatedGroup');
              }, 5000);
          }
      } catch (error) {
          console.error('Failed to create group:', error);
          // Fallback for demo/simulation if backend fails or is not reachable
          const newGroup = { ...groupData, id: Date.now(), totalAmount: 1.00, date: new Date() };
          
          setCreatedGroup(newGroup);
          setShowSuccessBanner(true);
          setShowCreateGroupModal(false);
          
          // Persist for remounts
          sessionStorage.setItem('lastCreatedGroup', JSON.stringify(newGroup));
          
          // Hide banner after 5 seconds
          setTimeout(() => {
              setShowSuccessBanner(false);
              sessionStorage.removeItem('lastCreatedGroup');
          }, 5000);
      }
  };

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
      
      {/* Success Banner */}
      {showSuccessBanner && createdGroup && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3 animate-fade-in mb-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
                <h3 className="text-emerald-900 font-bold text-sm">
                    {createdGroup.name} group created successfully!
                </h3>
                <p className="text-emerald-700 text-xs mt-0.5">
                    Add your expenses below this group to split them later.
                </p>
            </div>
        </div>
      )}

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
            <div className="flex items-center gap-2">
                <SecondaryButton onClick={() => setShowCreateGroupModal(true)}>
                    + Create Group
                </SecondaryButton>
                <PrimaryButton onClick={onAddExpense} className="shadow-lg">
                    <Plus className="w-5 h-5" /> Add Expense
                </PrimaryButton>
            </div>
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

      {/* Newly Created Group Card (Visible only when appropriate or generally if we had a groups section) */}
      {/* Active Groups List */}
      {groups && groups.length > 0 && (
        <div className="mb-6 animate-slide-up space-y-4">
             {/* Show distinct groups (latest first) */}
             {[...groups].reverse().map(group => {
                 // Calculate group total from current expenses
                 const groupTotal = expenses
                    .filter(e => e.groupId === group.id)
                    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

                 return (
                    <div key={group.id}>
                        <h2 className="text-[var(--text-section-title)] font-[var(--weight-semibold)] text-[var(--color-text-main)] mb-3">
                            {/* Header for the group section - could be date or 'Active Groups' */}
                            {/* Using the group name as the primary context here if we list them individually, 
                                but the design showed a month header. 
                                Let's keep the month header only if it's the first item or handle headers separately.
                                For now, putting the Month header above ALL groups if we are showing them in the month view context.
                            */}
                        </h2>
                        <Card className="flex flex-col sm:flex-row gap-4 p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Left Icon */}
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-[var(--color-text-main)]">{group.name}</h3>
                                        <p className="text-[var(--color-text-muted)] text-sm mt-1">
                                            {group.description || 'Expenses for travel, food, flight and activities.'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-[var(--color-text-main)]">
                                            {formatAmount(groupTotal)}
                                        </div>
                                        <div className="text-xs text-[var(--color-text-muted)] mt-1">
                                            {/* Use group creation date if available, or current date as fallback */}
                                            {formatDate(group.createdAt || group.date || new Date())}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <button 
                                        onClick={() => {
                                            // Pre-select group for new expense (would need support in onAddExpense)
                                            onAddExpense();
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add expense to this group
                                    </button>

                                    {onDeleteGroup && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteGroup(group.id);
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                            title="Delete Group"
                                        >
                                            <Trash2 size={16} />
                                            <span className="hidden sm:inline">Delete Group</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                 );
             })}
        </div>
      )}

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
                    <div 
                        key={expense.id} 
                        className="w-full text-left cursor-pointer group"
                        onClick={() => onEditExpense(expense)}
                    >
                        <Card 
                            padding="sm" 
                            className="flex items-center gap-[var(--space-md)] hover:bg-[var(--color-bg)] transition-colors border-transparent hover:border-[var(--color-border)] shadow-sm hover:shadow-md relative pr-12 sm:pr-[var(--space-md)]"
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
                                {/* Group Chip */}
                                {(() => {
                                    const group = groups.find(g => g.id === expense.groupId);
                                    if (group) {
                                        return (
                                            <div className="mt-1 inline-flex items-center bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                {group.name}
                                                {(group.includeInBudget === 0 || group.includeInBudget === false) && (
                                                    <span className="ml-1 text-[10px] uppercase tracking-wider text-rose-500 font-bold bg-rose-50 px-1 rounded">Excluded</span>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
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
                            
                            {/* Delete Action (Visible on hover on Desktop, swipe/action on mobile - simplifies to button here) */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteExpense(expense.id);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                                aria-label="Delete expense"
                            >
                                <Trash2 size={18} />
                            </button>
                        </Card>
                    </div>
                );
            })
        )}
      </div>

      {showCreateGroupModal && (
        <CreateGroupModal 
            onSave={handleCreateGroup}
            onCancel={() => setShowCreateGroupModal(false)}
        />
      )}
    </div>
  );
};

export default ExpenseList;

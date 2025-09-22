import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { expenseAPI } from '../services/api';
import ExpenseManager from '../components/ExpenseManager';
import ExpenseList from '../components/ExpenseList';
import Report from '../components/Report';
import ProfileDropdown from '../components/ProfileDropdown';
import DarkModeToggle from '../components/DarkModeToggle';
import EditExpenseModal from '../components/EditExpenseModal';
import MobileNavigation from '../components/MobileNavigation';
import CategoryManager from '../components/CategoryManager';
import BudgetManager from '../components/BudgetManager';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import DataManagement from '../components/DataManagement';
import RecurringExpenses from '../components/RecurringExpenses';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { selectedCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('expenses');
  const [, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    // Load expenses from API
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseAPI.getExpenses();
      if (response.success) {
        // Transform API data to match frontend format
        const transformedExpenses = response.data.map(expense => ({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: expense.expenseDate,
          notes: expense.notes,
          currency: expense.currency
        }));
        setExpenses(transformedExpenses);
      } else {
        console.error('Failed to load expenses:', response.message);
        setExpenses([]);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (newExpense) => {
    try {
      // Transform frontend format to API format
      const expenseData = {
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        expenseDate: newExpense.date,
        notes: newExpense.notes || '',
        currency: newExpense.currency || selectedCurrency
      };

      const response = await expenseAPI.createExpense(expenseData);
      
      if (response.success) {
        // Transform API response back to frontend format
        const transformedExpense = {
          id: response.data.id,
          description: response.data.description,
          amount: response.data.amount,
          category: response.data.category,
          date: response.data.expenseDate,
          notes: response.data.notes,
          currency: response.data.currency
        };
        setExpenses(prevExpenses => [transformedExpense, ...prevExpenses]);
      } else {
        console.error('Failed to add expense:', response.message);
        alert('Failed to add expense: ' + response.message);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense: ' + error.message);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const response = await expenseAPI.deleteExpense(expenseId);
      if (response.success) {
        setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== expenseId));
      } else {
        console.error('Failed to delete expense:', response.message);
        alert('Failed to delete expense: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense: ' + error.message);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowEditModal(true);
  };

  const handleSaveExpense = async (updatedExpense) => {
    try {
      // Transform frontend format to API format
      const expenseData = {
        description: updatedExpense.description,
        amount: parseFloat(updatedExpense.amount),
        category: updatedExpense.category,
        expenseDate: updatedExpense.date,
        notes: updatedExpense.notes || '',
        currency: updatedExpense.currency
      };

      const response = await expenseAPI.updateExpense(updatedExpense.id, expenseData);
      
      if (response.success) {
        // Update the expense in the local state
        setExpenses(prevExpenses => 
          prevExpenses.map(expense => 
            expense.id === updatedExpense.id 
              ? {
                  ...expense,
                  description: updatedExpense.description,
                  amount: updatedExpense.amount,
                  category: updatedExpense.category,
                  date: updatedExpense.date,
                  notes: updatedExpense.notes,
                  currency: updatedExpense.currency
                }
              : expense
          )
        );
      } else {
        console.error('Failed to update expense:', response.message);
        alert('Failed to update expense: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Error updating expense: ' + error.message);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingExpense(null);
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expense Tracker</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.name || 'User'}!</p>
              <p className="text-xs text-green-600">✅ All 8 tabs available: Expenses, Add, Reports, Categories, Budgets, Analytics, Data, Recurring</p>
            </div>
            
            {/* Dark Mode Toggle and Profile */}
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <DarkModeToggle />
              
              {/* Profile Dropdown */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:pt-8 pt-20">
        {/* Mobile Tabs - Bottom Navigation Style */}
        <div className="mobile-nav">
          <div className="mobile-nav-container">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`mobile-nav-button ${
                activeTab === 'expenses'
                  ? 'mobile-nav-button-active'
                  : 'mobile-nav-button-inactive'
              }`}
            >
              <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="mobile-nav-text">Expenses</span>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`mobile-nav-button ${
                activeTab === 'add'
                  ? 'mobile-nav-button-active'
                  : 'mobile-nav-button-inactive'
              }`}
            >
              <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="mobile-nav-text">Add</span>
            </button>
            <button
              onClick={() => setActiveTab('budgets')}
              className={`mobile-nav-button ${
                activeTab === 'budgets'
                  ? 'mobile-nav-button-active'
                  : 'mobile-nav-button-inactive'
              }`}
            >
              <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="mobile-nav-text">Budgets</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`mobile-nav-button ${
                activeTab === 'analytics'
                  ? 'mobile-nav-button-active'
                  : 'mobile-nav-button-inactive'
              }`}
            >
              <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="mobile-nav-text">Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('more')}
              className={`mobile-nav-button ${
                activeTab === 'more'
                  ? 'mobile-nav-button-active'
                  : 'mobile-nav-button-inactive'
              }`}
            >
              <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              <span className="mobile-nav-text">More</span>
            </button>
          </div>
        </div>

        {/* Desktop Tabs - Hidden on mobile */}
        <div className="desktop-nav">
          <nav className="desktop-nav-container">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`desktop-nav-button ${
                activeTab === 'expenses'
                  ? 'desktop-nav-button-active'
                  : 'desktop-nav-button-inactive'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`desktop-nav-button ${
                activeTab === 'add'
                  ? 'desktop-nav-button-active'
                  : 'desktop-nav-button-inactive'
              }`}
            >
              Add Expenses
            </button>
                 <button
                   onClick={() => setActiveTab('reports')}
                   className={`desktop-nav-button ${
                     activeTab === 'reports'
                       ? 'desktop-nav-button-active'
                       : 'desktop-nav-button-inactive'
                   }`}
                 >
                   Reports
                 </button>
                   <button
                     onClick={() => setActiveTab('categories')}
                     className={`desktop-nav-button ${
                       activeTab === 'categories'
                         ? 'desktop-nav-button-active'
                         : 'desktop-nav-button-inactive'
                     }`}
                   >
                     Categories
                   </button>
                   <button
                     onClick={() => setActiveTab('budgets')}
                     className={`desktop-nav-button ${
                       activeTab === 'budgets'
                         ? 'desktop-nav-button-active'
                         : 'desktop-nav-button-inactive'
                     }`}
                   >
                     Budgets
                   </button>
                   <button
                     onClick={() => setActiveTab('analytics')}
                     className={`desktop-nav-button ${
                       activeTab === 'analytics'
                         ? 'desktop-nav-button-active'
                         : 'desktop-nav-button-inactive'
                     }`}
                   >
                     Analytics
                   </button>
                   <button
                     onClick={() => setActiveTab('data')}
                     className={`desktop-nav-button ${
                       activeTab === 'data'
                         ? 'desktop-nav-button-active'
                         : 'desktop-nav-button-inactive'
                     }`}
                   >
                     Data Management
                   </button>
                   <button
                     onClick={() => setActiveTab('recurring')}
                     className={`desktop-nav-button ${
                       activeTab === 'recurring'
                         ? 'desktop-nav-button-active'
                         : 'desktop-nav-button-inactive'
                     }`}
                   >
                     Recurring Expenses
                   </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-icon">⏳</div>
              <h3 className="loading-title">Loading...</h3>
              <p className="loading-description">Please wait while we load your expenses.</p>
            </div>
          ) : (
            <>
              {activeTab === 'expenses' && (
                <ExpenseList 
                  expenses={expenses} 
                  onDeleteExpense={handleDeleteExpense}
                  onEditExpense={handleEditExpense}
                  selectedCurrency={selectedCurrency}
                />
              )}
              {activeTab === 'add' && (
                <ExpenseManager 
                  onAddExpense={handleAddExpense}
                />
              )}
                   {activeTab === 'reports' && (
                     <Report 
                       expenses={expenses}
                       selectedCurrency={selectedCurrency}
                     />
                   )}
                     {activeTab === 'categories' && (
                       <div className="space-y-6">
                         <CategoryManager 
                           onCategorySelect={(category) => {
                             // Handle category selection
                           }}
                           onCategoryUpdate={setCategories}
                           expenses={expenses}
                         />
                       </div>
                     )}
                     {activeTab === 'budgets' && (
                       <BudgetManager />
                     )}
                     {activeTab === 'analytics' && (
                       <AnalyticsDashboard selectedCurrency={selectedCurrency} />
                     )}
                     {activeTab === 'data' && (
                       <DataManagement />
                     )}
                     {activeTab === 'recurring' && (
                       <RecurringExpenses onExpenseAdded={loadExpenses} />
                     )}
                     {activeTab === 'more' && (
                       <div className="space-y-6">
                         <div className="more-tab-grid">
                           <button
                             onClick={() => setActiveTab('reports')}
                             className="more-tab-button"
                           >
                             <svg className="more-tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                             </svg>
                             <span className="more-tab-text">Reports</span>
                           </button>
                           
                           <button
                             onClick={() => setActiveTab('categories')}
                             className="more-tab-button"
                           >
                             <svg className="more-tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                             </svg>
                             <span className="more-tab-text">Categories</span>
                           </button>
                           
                           <button
                             onClick={() => setActiveTab('data')}
                             className="more-tab-button"
                           >
                             <svg className="more-tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                             </svg>
                             <span className="more-tab-text">Data Management</span>
                           </button>
                           
                           <button
                             onClick={() => setActiveTab('recurring')}
                             className="more-tab-button"
                           >
                             <svg className="more-tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                             </svg>
                             <span className="more-tab-text">Recurring Expenses</span>
                           </button>
                         </div>
                       </div>
                     )}
            </>
          )}
        </div>
      </div>

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        expense={editingExpense}
        onSave={handleSaveExpense}
      />
    </div>
  );
};

export default Dashboard;

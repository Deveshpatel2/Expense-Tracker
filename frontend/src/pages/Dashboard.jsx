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

const Dashboard = () => {
  const { user } = useAuth();
  const { selectedCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('expenses');
  const [categories, setCategories] = useState([]);
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
          <div className="flex">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 flex flex-col items-center py-3 px-2 ${
                activeTab === 'expenses'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs font-medium">Expenses</span>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 flex flex-col items-center py-3 px-2 ${
                activeTab === 'add'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-xs font-medium">Add</span>
            </button>
                 <button
                   onClick={() => setActiveTab('reports')}
                   className={`flex-1 flex flex-col items-center py-3 px-2 ${
                     activeTab === 'reports'
                       ? 'text-indigo-600 dark:text-indigo-400'
                       : 'text-gray-500 dark:text-gray-400'
                   }`}
                 >
                   <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                   </svg>
                   <span className="text-xs font-medium">Reports</span>
                 </button>
                 <button
                   onClick={() => setActiveTab('categories')}
                   className={`flex-1 flex flex-col items-center py-3 px-2 ${
                     activeTab === 'categories'
                       ? 'text-indigo-600 dark:text-indigo-400'
                       : 'text-gray-500 dark:text-gray-400'
                   }`}
                 >
                   <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                   </svg>
                   <span className="text-xs font-medium">Categories</span>
                 </button>
          </div>
        </div>

        {/* Desktop Tabs - Hidden on mobile */}
        <div className="hidden lg:block border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'add'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Add Expenses
            </button>
                 <button
                   onClick={() => setActiveTab('reports')}
                   className={`py-2 px-1 border-b-2 font-medium text-sm ${
                     activeTab === 'reports'
                       ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                       : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                   }`}
                 >
                   Reports
                 </button>
                 <button
                   onClick={() => setActiveTab('categories')}
                   className={`py-2 px-1 border-b-2 font-medium text-sm ${
                     activeTab === 'categories'
                       ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                       : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                   }`}
                 >
                   Categories
                 </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pb-20 lg:pb-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">⏳</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading...</h3>
              <p className="text-gray-500 dark:text-gray-400">Please wait while we load your expenses.</p>
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

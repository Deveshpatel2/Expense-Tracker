import React, { useState } from 'react';

const CategoryManager = ({ onCategorySelect, onCategoryUpdate, expenses = [] }) => {
  const [activeTab, setActiveTab] = useState('default');
  const [customCategories, setCustomCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📁',
    color: '#3B82F6',
    parentId: null,
    description: ''
  });

  // Default categories with icons and colors
  const defaultCategories = [
    {
      id: 'food-dining',
      name: 'Food & Dining',
      icon: '🍽️',
      color: '#10B981',
      description: 'Restaurants, groceries, food delivery',
      subcategories: [
        { id: 'restaurants', name: 'Restaurants', icon: '🍴' },
        { id: 'groceries', name: 'Groceries', icon: '🛒' },
        { id: 'coffee', name: 'Coffee & Tea', icon: '☕' },
        { id: 'delivery', name: 'Food Delivery', icon: '🚚' }
      ]
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: '🚗',
      color: '#3B82F6',
      description: 'Gas, public transport, rideshare',
      subcategories: [
        { id: 'gas', name: 'Gas & Fuel', icon: '⛽' },
        { id: 'public-transport', name: 'Public Transport', icon: '🚌' },
        { id: 'rideshare', name: 'Rideshare', icon: '🚕' },
        { id: 'parking', name: 'Parking', icon: '🅿️' }
      ]
    },
    {
      id: 'shopping',
      name: 'Shopping',
      icon: '🛍️',
      color: '#8B5CF6',
      description: 'Clothing, electronics, general shopping',
      subcategories: [
        { id: 'clothing', name: 'Clothing', icon: '👕' },
        { id: 'electronics', name: 'Electronics', icon: '📱' },
        { id: 'home-garden', name: 'Home & Garden', icon: '🏠' },
        { id: 'beauty', name: 'Beauty & Personal Care', icon: '💄' }
      ]
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: '🎬',
      color: '#F59E0B',
      description: 'Movies, games, subscriptions',
      subcategories: [
        { id: 'movies', name: 'Movies & TV', icon: '🎭' },
        { id: 'games', name: 'Games', icon: '🎮' },
        { id: 'subscriptions', name: 'Subscriptions', icon: '📱' },
        { id: 'events', name: 'Events & Shows', icon: '🎪' }
      ]
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: '🏥',
      color: '#EF4444',
      description: 'Medical expenses, pharmacy, fitness',
      subcategories: [
        { id: 'medical', name: 'Medical', icon: '🩺' },
        { id: 'pharmacy', name: 'Pharmacy', icon: '💊' },
        { id: 'fitness', name: 'Fitness & Gym', icon: '💪' },
        { id: 'dental', name: 'Dental', icon: '🦷' }
      ]
    },
    {
      id: 'utilities',
      name: 'Utilities',
      icon: '⚡',
      color: '#6B7280',
      description: 'Electricity, water, internet, phone',
      subcategories: [
        { id: 'electricity', name: 'Electricity', icon: '💡' },
        { id: 'water', name: 'Water', icon: '💧' },
        { id: 'internet', name: 'Internet', icon: '🌐' },
        { id: 'phone', name: 'Phone', icon: '📞' }
      ]
    },
    {
      id: 'housing',
      name: 'Housing',
      icon: '🏠',
      color: '#059669',
      description: 'Rent, mortgage, maintenance',
      subcategories: [
        { id: 'rent', name: 'Rent', icon: '🏠' },
        { id: 'mortgage', name: 'Mortgage', icon: '🏡' },
        { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
        { id: 'insurance', name: 'Insurance', icon: '🛡️' }
      ]
    },
    {
      id: 'education',
      name: 'Education',
      icon: '📚',
      color: '#7C3AED',
      description: 'Tuition, books, courses',
      subcategories: [
        { id: 'tuition', name: 'Tuition', icon: '🎓' },
        { id: 'books', name: 'Books & Supplies', icon: '📖' },
        { id: 'courses', name: 'Courses & Training', icon: '🎯' },
        { id: 'software', name: 'Software & Tools', icon: '💻' }
      ]
    },
    {
      id: 'travel',
      name: 'Travel',
      icon: '✈️',
      color: '#0EA5E9',
      description: 'Flights, hotels, vacation',
      subcategories: [
        { id: 'flights', name: 'Flights', icon: '✈️' },
        { id: 'hotels', name: 'Hotels', icon: '🏨' },
        { id: 'car-rental', name: 'Car Rental', icon: '🚙' },
        { id: 'activities', name: 'Activities', icon: '🎯' }
      ]
    },
    {
      id: 'other',
      name: 'Other',
      icon: '📁',
      color: '#6B7280',
      description: 'Miscellaneous expenses',
      subcategories: []
    }
  ];

  // Color options for custom categories
  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5A2B', '#64748B', '#0F172A'
  ];

  // Icon options for custom categories
  const iconOptions = [
    '📁', '💰', '💳', '🏦', '📊', '📈', '📉', '💼', '🎯', '⭐',
    '🔥', '💎', '🌟', '🎨', '🎵', '🎪', '🎭', '🎮', '🎲', '🎯',
    '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎀', '🎁'
  ];

  // Calculate category statistics
  const getCategoryStats = () => {
    const stats = {};
    const allCategories = [...defaultCategories, ...customCategories];
    
    allCategories.forEach(category => {
      const categoryExpenses = expenses.filter(expense => 
        expense.category === category.name || 
        (category.subcategories && category.subcategories.some(sub => sub.name === expense.category))
      );
      
      const totalAmount = categoryExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
      const count = categoryExpenses.length;
      
      stats[category.id] = {
        totalAmount,
        count,
        percentage: expenses.length > 0 ? (count / expenses.length) * 100 : 0
      };
    });
    
    return stats;
  };

  const categoryStats = getCategoryStats();

  // Handle adding new category
  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const category = {
        id: Date.now().toString(),
        ...newCategory,
        subcategories: []
      };
      setCustomCategories(prev => [...prev, category]);
      setNewCategory({
        name: '',
        icon: '📁',
        color: '#3B82F6',
        parentId: null,
        description: ''
      });
      setShowAddCategory(false);
    }
  };

  // Handle editing category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      icon: category.icon,
      color: category.color,
      parentId: category.parentId,
      description: category.description || ''
    });
    setShowAddCategory(true);
  };

  // Handle updating category
  const handleUpdateCategory = () => {
    if (editingCategory && newCategory.name.trim()) {
      setCustomCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...newCategory }
          : cat
      ));
      setEditingCategory(null);
      setNewCategory({
        name: '',
        icon: '📁',
        color: '#3B82F6',
        parentId: null,
        description: ''
      });
      setShowAddCategory(false);
    }
  };

  // Handle deleting category
  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCustomCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    onCategorySelect(category);
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (category, subcategory) => {
    onCategorySelect(subcategory);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Category Manager
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your expense categories and view spending statistics
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('default')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'default'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Default Categories
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'custom'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Custom Categories
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'statistics'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Statistics
        </button>
      </div>

      {/* Default Categories Tab */}
      {activeTab === 'default' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultCategories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                </div>

                {/* Subcategories */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subcategories:
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {category.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          onClick={() => handleSubcategorySelect(category, subcategory)}
                          className="flex items-center space-x-2 p-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <span>{subcategory.icon}</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {subcategory.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Stats */}
                {categoryStats[category.id] && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {categoryStats[category.id].count} expenses
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${categoryStats[category.id].totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${categoryStats[category.id].percentage}%`,
                            backgroundColor: category.color
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Categories Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Custom Categories
            </h4>
            <button
              onClick={() => setShowAddCategory(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
            >
              Add Category
            </button>
          </div>

          {/* Add/Edit Category Form */}
          {showAddCategory && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="input"
                    placeholder="Enter category name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="input"
                    placeholder="Enter description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-10 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewCategory({ ...newCategory, icon })}
                        className={`p-2 text-lg rounded-md border-2 ${
                          newCategory.icon === icon
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewCategory({ ...newCategory, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newCategory.color === color
                            ? 'border-gray-800 dark:border-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                <button
                  onClick={() => {
                    setShowAddCategory(false);
                    setEditingCategory(null);
                    setNewCategory({
                      name: '',
                      icon: '📁',
                      color: '#3B82F6',
                      parentId: null,
                      description: ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Custom Categories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customCategories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </h4>
                      {category.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                </div>

                {/* Category Stats */}
                {categoryStats[category.id] && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {categoryStats[category.id].count} expenses
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${categoryStats[category.id].totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${categoryStats[category.id].percentage}%`,
                            backgroundColor: category.color
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="flex-1 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {customCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No custom categories
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your first custom category to organize your expenses
              </p>
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(categoryStats).map(([categoryId, stats]) => {
              const category = [...defaultCategories, ...customCategories].find(cat => cat.id === categoryId);
              if (!category || stats.count === 0) return null;
              
              return (
                <div
                  key={categoryId}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{category.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {stats.count} expenses
                        </p>
                      </div>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${stats.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.min(stats.percentage, 100)}%`,
                            backgroundColor: category.color
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.percentage.toFixed(1)}%
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        of total expenses
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {Object.keys(categoryStats).length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No expense data
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start adding expenses to see category statistics
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;

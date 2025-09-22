import React, { useState } from 'react';
import './CategoryMergeSplit.css';

const CategoryMergeSplit = ({ categories, expenses, onCategoryUpdate, onExpenseUpdate }) => {
  const [activeTab, setActiveTab] = useState('merge');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [mergeData, setMergeData] = useState({
    name: '',
    icon: '📁',
    color: '#3B82F6',
    description: ''
  });
  const [splitData, setSplitData] = useState({
    sourceCategory: '',
    newCategories: [
      { name: '', icon: '📁', color: '#3B82F6' },
      { name: '', icon: '📁', color: '#3B82F6' }
    ]
  });

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5A2B', '#64748B', '#0F172A'
  ];

  const iconOptions = [
    '📁', '💰', '💳', '🏦', '📊', '📈', '📉', '💼', '🎯', '⭐',
    '🔥', '💎', '🌟', '🎨', '🎵', '🎪', '🎭', '🎮', '🎲', '🎯',
    '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎀', '🎁'
  ];

  // Handle category selection for merge
  const handleCategorySelect = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Handle merge categories
  const handleMergeCategories = () => {
    if (selectedCategories.length < 2 || !mergeData.name.trim()) {
      alert('Please select at least 2 categories and enter a name for the merged category');
      return;
    }

    if (window.confirm(`Are you sure you want to merge ${selectedCategories.length} categories into "${mergeData.name}"?`)) {
      // Create new merged category
      const mergedCategory = {
        id: Date.now().toString(),
        ...mergeData,
        subcategories: []
      };

      // Update expenses to use the new merged category
      const updatedExpenses = expenses.map(expense => {
        const selectedCategoryNames = selectedCategories.map(id => 
          categories.find(cat => cat.id === id)?.name
        );
        
        if (selectedCategoryNames.includes(expense.category)) {
          return { ...expense, category: mergeData.name };
        }
        return expense;
      });

      // Remove old categories and add new merged category
      const updatedCategories = categories.filter(cat => !selectedCategories.includes(cat.id));
      updatedCategories.push(mergedCategory);

      onCategoryUpdate(updatedCategories);
      onExpenseUpdate(updatedExpenses);
      
      // Reset form
      setSelectedCategories([]);
      setMergeData({
        name: '',
        icon: '📁',
        color: '#3B82F6',
        description: ''
      });
    }
  };

  // Handle split category
  const handleSplitCategory = () => {
    if (!splitData.sourceCategory || splitData.newCategories.some(cat => !cat.name.trim())) {
      alert('Please select a source category and enter names for all new categories');
      return;
    }

    if (window.confirm(`Are you sure you want to split "${splitData.sourceCategory}" into ${splitData.newCategories.length} categories?`)) {
      // Create new categories
      const newCategories = splitData.newCategories.map((cat, index) => ({
        id: Date.now().toString() + index,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        description: `Split from ${splitData.sourceCategory}`,
        subcategories: []
      }));

      // Update expenses to use the new categories
      const updatedExpenses = expenses.map(expense => {
        if (expense.category === splitData.sourceCategory) {
          // For now, assign to the first new category
          // In a real app, you might want to show a dialog to let users choose
          return { ...expense, category: splitData.newCategories[0].name };
        }
        return expense;
      });

      // Remove old category and add new categories
      const updatedCategories = categories.filter(cat => cat.name !== splitData.sourceCategory);
      updatedCategories.push(...newCategories);

      onCategoryUpdate(updatedCategories);
      onExpenseUpdate(updatedExpenses);
      
      // Reset form
      setSplitData({
        sourceCategory: '',
        newCategories: [
          { name: '', icon: '📁', color: '#3B82F6' },
          { name: '', icon: '📁', color: '#3B82F6' }
        ]
      });
    }
  };

  // Add new category to split
  const addNewCategory = () => {
    setSplitData(prev => ({
      ...prev,
      newCategories: [...prev.newCategories, { name: '', icon: '📁', color: '#3B82F6' }]
    }));
  };

  // Remove category from split
  const removeNewCategory = (index) => {
    if (splitData.newCategories.length > 2) {
      setSplitData(prev => ({
        ...prev,
        newCategories: prev.newCategories.filter((_, i) => i !== index)
      }));
    }
  };

  // Update new category
  const updateNewCategory = (index, field, value) => {
    setSplitData(prev => ({
      ...prev,
      newCategories: prev.newCategories.map((cat, i) => 
        i === index ? { ...cat, [field]: value } : cat
      )
    }));
  };

  return (
    <div className="category-merge-split-container">
      <div className="category-merge-split-header">
        <h3 className="category-merge-split-title">
          Category Merge & Split
        </h3>
        <p className="category-merge-split-subtitle">
          Merge multiple categories or split one category into multiple
        </p>
      </div>

      {/* Tabs */}
      <div className="category-merge-split-tabs">
        <button
          onClick={() => setActiveTab('merge')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'merge'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Merge Categories
        </button>
        <button
          onClick={() => setActiveTab('split')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'split'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Split Category
        </button>
      </div>

      {/* Merge Categories Tab */}
      {activeTab === 'merge' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Important Notice
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Merging categories will update all expenses that use the selected categories. 
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Select Categories to Merge */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Select Categories to Merge
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedCategories.includes(category.id)
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategorySelect(category.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {expenses.filter(exp => exp.category === category.name).length} expenses
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Merge Configuration */}
          {selectedCategories.length >= 2 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configure Merged Category
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={mergeData.name}
                    onChange={(e) => setMergeData({ ...mergeData, name: e.target.value })}
                    className="input"
                    placeholder="Enter merged category name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={mergeData.description}
                    onChange={(e) => setMergeData({ ...mergeData, description: e.target.value })}
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
                        onClick={() => setMergeData({ ...mergeData, icon })}
                        className={`p-2 text-lg rounded-md border-2 ${
                          mergeData.icon === icon
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
                        onClick={() => setMergeData({ ...mergeData, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          mergeData.color === color
                            ? 'border-gray-800 dark:border-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleMergeCategories}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md"
                >
                  Merge {selectedCategories.length} Categories
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Split Category Tab */}
      {activeTab === 'split' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Important Notice
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Splitting a category will update all expenses that use the source category. 
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Select Source Category */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Select Category to Split
            </h4>
            <select
              value={splitData.sourceCategory}
              onChange={(e) => setSplitData({ ...splitData, sourceCategory: e.target.value })}
              className="input"
            >
              <option value="">Select a category to split</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.icon} {category.name} ({expenses.filter(exp => exp.category === category.name).length} expenses)
                </option>
              ))}
            </select>
          </div>

          {/* Configure New Categories */}
          {splitData.sourceCategory && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Configure New Categories
                </h4>
                <button
                  onClick={addNewCategory}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md"
                >
                  Add Category
                </button>
              </div>
              
              <div className="space-y-4">
                {splitData.newCategories.map((category, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        Category {index + 1}
                      </h5>
                      {splitData.newCategories.length > 2 && (
                        <button
                          onClick={() => removeNewCategory(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => updateNewCategory(index, 'name', e.target.value)}
                          className="input"
                          placeholder="Enter category name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Icon
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {iconOptions.slice(0, 10).map((icon) => (
                            <button
                              key={icon}
                              onClick={() => updateNewCategory(index, 'icon', icon)}
                              className={`p-2 text-lg rounded-md border-2 ${
                                category.icon === icon
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
                              onClick={() => updateNewCategory(index, 'color', color)}
                              className={`w-8 h-8 rounded-full border-2 ${
                                category.color === color
                                  ? 'border-gray-800 dark:border-white'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}
                              style={{ backgroundColor: color }}
                            ></button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleSplitCategory}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md"
                >
                  Split into {splitData.newCategories.length} Categories
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryMergeSplit;


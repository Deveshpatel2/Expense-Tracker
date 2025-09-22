import React, { useState } from 'react';

const BulkOperations = ({ 
  selectedExpenses, 
  onBulkDelete, 
  onBulkEdit, 
  onSelectAll, 
  onClearSelection,
  totalExpenses 
}) => {
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    category: '',
    tags: '',
    notes: ''
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

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedExpenses.length} expenses?`)) {
      onBulkDelete(selectedExpenses);
      onClearSelection();
    }
  };

  const handleBulkEdit = () => {
    if (bulkEditData.category || bulkEditData.tags || bulkEditData.notes) {
      onBulkEdit(selectedExpenses, bulkEditData);
      setBulkEditData({ category: '', tags: '', notes: '' });
      onClearSelection();
    }
  };

  const handleSelectAll = () => {
    onSelectAll();
  };

  if (selectedExpenses.length === 0) {
    return null;
  }

  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
            {selectedExpenses.length} expense{selectedExpenses.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleSelectAll}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
          >
            Select All ({totalExpenses})
          </button>
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            Clear Selection
          </button>
        </div>
        <button
          onClick={() => setShowBulkActions(!showBulkActions)}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
        >
          {showBulkActions ? 'Hide Actions' : 'Show Actions'}
        </button>
      </div>

      {showBulkActions && (
        <div className="space-y-4">
          {/* Bulk Edit Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Update Category
              </label>
              <select
                value={bulkEditData.category}
                onChange={(e) => setBulkEditData({ ...bulkEditData, category: e.target.value })}
                className="input"
              >
                <option value="">Keep existing</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Add Tags
              </label>
              <input
                type="text"
                value={bulkEditData.tags}
                onChange={(e) => setBulkEditData({ ...bulkEditData, tags: e.target.value })}
                className="input"
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Add Notes
              </label>
              <input
                type="text"
                value={bulkEditData.notes}
                onChange={(e) => setBulkEditData({ ...bulkEditData, notes: e.target.value })}
                className="input"
                placeholder="Additional notes"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleBulkEdit}
              disabled={!bulkEditData.category && !bulkEditData.tags && !bulkEditData.notes}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md"
            >
              Apply Changes
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Delete Selected
            </button>
            <button
              onClick={onClearSelection}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md"
            >
              Cancel
            </button>
          </div>

          {/* Selected Expenses Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Selected Expenses:
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {expense.description}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${expense.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOperations;


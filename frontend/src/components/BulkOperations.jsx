import React, { useState } from 'react';
import './BulkOperations.css';

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
    <div className="bulk-operations-container">
      <div className="bulk-operations-header">
        <div className="bulk-operations-info">
          <span className="bulk-operations-count">
            {selectedExpenses.length} expense{selectedExpenses.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleSelectAll}
            className="bulk-operations-button"
          >
            Select All ({totalExpenses})
          </button>
          <button
            onClick={onClearSelection}
            className="bulk-operations-button-secondary"
          >
            Clear Selection
          </button>
        </div>
        <button
          onClick={() => setShowBulkActions(!showBulkActions)}
          className="bulk-operations-toggle"
        >
          {showBulkActions ? 'Hide Actions' : 'Show Actions'}
        </button>
      </div>

      {showBulkActions && (
        <div className="bulk-edit-form">
          {/* Bulk Edit Form */}
          <div className="bulk-edit-grid">
            <div>
              <label className="bulk-edit-field">
                Update Category
              </label>
              <select
                value={bulkEditData.category}
                onChange={(e) => setBulkEditData({ ...bulkEditData, category: e.target.value })}
                className="bulk-edit-input"
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
              <label className="bulk-edit-field">
                Add Tags
              </label>
              <input
                type="text"
                value={bulkEditData.tags}
                onChange={(e) => setBulkEditData({ ...bulkEditData, tags: e.target.value })}
                className="bulk-edit-input"
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div>
              <label className="bulk-edit-field">
                Add Notes
              </label>
              <input
                type="text"
                value={bulkEditData.notes}
                onChange={(e) => setBulkEditData({ ...bulkEditData, notes: e.target.value })}
                className="bulk-edit-input"
                placeholder="Additional notes"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bulk-actions">
            <button
              onClick={handleBulkEdit}
              disabled={!bulkEditData.category && !bulkEditData.tags && !bulkEditData.notes}
              className="bulk-action-button"
            >
              Apply Changes
            </button>
            <button
              onClick={handleBulkDelete}
              className="bulk-action-button-danger"
            >
              Delete Selected
            </button>
            <button
              onClick={onClearSelection}
              className="bulk-action-button-secondary"
            >
              Cancel
            </button>
          </div>

          {/* Selected Expenses Preview */}
          <div className="bulk-preview-container">
            <h4 className="bulk-preview-title">
              Selected Expenses:
            </h4>
            <div className="bulk-preview-list">
              {selectedExpenses.map((expense) => (
                <div key={expense.id} className="bulk-preview-item">
                  <span className="bulk-preview-description">
                    {expense.description}
                  </span>
                  <span className="bulk-preview-amount">
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


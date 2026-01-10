import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Card, PrimaryButton, Input } from './CoreUI';

const CreateGroupModal = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    includeInBudget: true,
    startDate: '',
    endDate: ''
  });
  const [showDates, setShowDates] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--color-text-main)]/20 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-md shadow-2xl relative overflow-hidden animate-slide-up" padding="0">
        {/* Header */}
        <div className="px-[var(--space-lg)] py-[var(--space-md)] border-b border-[var(--color-border)] flex justify-between items-center">
          <h3 className="text-[var(--text-section-title)] font-[var(--weight-semibold)] text-[var(--color-text-main)]">
            Create Expense Group
          </h3>
          <button 
            onClick={onCancel}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-[var(--space-lg)] space-y-[var(--space-lg)]">
          {/* Group Name (Required) */}
          <Input
            label="Group Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Birthday Party, Goa Trip..."
            required
            autoFocus
          />

          {/* Description (Optional) */}
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Expenses related to my..."
          />

          {/* Budget Inclusion Toggle */}
          <div className="flex items-start justify-between gap-4 p-3 bg-[var(--color-bg)] rounded-[var(--radius-btn)] border border-[var(--color-border)]">
             <div>
                <label className="block text-[14px] font-[var(--weight-semibold)] text-[var(--color-text-main)] mb-1">
                   Include in monthly budget
                </label>
                <p className="text-[12px] text-[var(--color-text-muted)] leading-tight">
                   {formData.includeInBudget 
                      ? "Expenses will count toward monthly budget" 
                      : "Expenses will be excluded from budget analytics"}
                </p>
             </div>
             <div className="relative inline-block w-11 h-6 shrink-0 mt-1">
                <input 
                  type="checkbox" 
                  name="includeInBudget"
                  checked={formData.includeInBudget}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
             </div>
          </div>

          {/* Optional Date Range */}
          <div>
              {!showDates ? (
                  <button 
                    type="button"
                    onClick={() => setShowDates(true)}
                    className="text-[13px] text-[var(--color-primary)] font-medium hover:underline flex items-center gap-1"
                  >
                      + Add date range (optional)
                  </button>
              ) : (
                  <div className="grid grid-cols-2 gap-3 animate-fade-in">
                      <div>
                          <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Start Date</label>
                          <input 
                              type="date"
                              name="startDate"
                              value={formData.startDate}
                              onChange={handleChange}
                              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-btn)] text-[13px] focus:outline-none focus:border-[var(--color-primary)]"
                          />
                      </div>
                      <div>
                          <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">End Date</label>
                          <input 
                              type="date"
                              name="endDate"
                              value={formData.endDate}
                              onChange={handleChange}
                              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-btn)] text-[13px] focus:outline-none focus:border-[var(--color-primary)]"
                          />
                      </div>
                  </div>
              )}
          </div>

          {/* Action Button */}
          <PrimaryButton 
            type="submit" 
            className="w-full py-[var(--space-md)]"
            disabled={!formData.name.trim()}
          >
            Create Group
          </PrimaryButton>
        </form>
      </Card>
    </div>
  );
};

export default CreateGroupModal;

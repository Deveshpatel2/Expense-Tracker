import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Tag, FileText, ChevronDown, Folder } from 'lucide-react';
import { Card, PrimaryButton } from './CoreUI';

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

const AddExpenseFlow = ({ onSave, onCancel, initialData = null, groups = [] }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Other',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
    currency: 'USD',
    groupId: ''
  });

  const amountRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount || '',
        description: initialData.description || '',
        category: initialData.category || 'Other',
        expenseDate: (initialData.expenseDate || initialData.date || new Date().toISOString()).split('T')[0],
        notes: initialData.notes || '',
        currency: initialData.currency || 'USD',
        groupId: initialData.groupId || ''
      });
    }
    
    // Auto-focus amount field for speed
    if (amountRef.current) {
        amountRef.current.focus();
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--color-text-main)]/20 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-md shadow-2xl relative overflow-hidden animate-slide-up" padding="0">
        {/* Header */}
        <div className="px-[var(--space-lg)] py-[var(--space-md)] border-b border-[var(--color-border)] flex justify-between items-center">
          <h3 className="text-[var(--text-section-title)] font-[var(--weight-semibold)] text-[var(--color-text-main)]">
            {initialData ? 'Edit Expense' : 'Add Expense'}
          </h3>
          <button 
            onClick={onCancel}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-[var(--space-lg)] space-y-[var(--space-lg)]">
          {/* Amount Input (Primary Focus) */}
          <div className="text-center">
            <label className="block text-[var(--text-muted)] text-[var(--color-text-muted)] mb-[var(--space-xs)] uppercase tracking-wider text-[11px] font-[var(--weight-semibold)]">
              Amount
            </label>
            <div className="relative inline-block w-full">
              <span className="absolute left-[var(--space-md)] top-1/2 -translate-y-1/2 text-[var(--text-monetary-lg)] text-[var(--color-text-muted)]">$</span>
              <input
                ref={amountRef}
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                required
                className="w-full bg-[var(--color-bg)] border-none text-[var(--text-monetary-lg)] font-[var(--weight-bold)] text-[var(--color-text-main)] px-[var(--space-xl)] py-[var(--space-lg)] rounded-[var(--radius-card)] text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all placeholder:text-[var(--color-border)]"
              />
            </div>
          </div>

          <div className="space-y-[var(--space-md)]">
            {/* Description */}
            <div className="relative">
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What was this for?"
                required
                className="w-full bg-transparent border-b border-[var(--color-border)] py-[var(--space-sm)] text-[var(--text-body)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {/* Expense Group (Optional) */}
            <div className="flex items-center gap-[var(--space-sm)]">
              <Folder className="w-4 h-4 text-[var(--color-text-muted)]" />
              <div className="relative flex-1">
                <select
                  name="groupId"
                  value={formData.groupId}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-[var(--color-border)] py-[var(--space-sm)] text-[var(--text-body)] text-[var(--color-text-main)] appearance-none focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                >
                  <option value="">No Group</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
              </div>
            </div>

            {/* Category Selector */}
            <div className="flex items-center gap-[var(--space-sm)]">
              <Tag className="w-4 h-4 text-[var(--color-text-muted)]" />
              <div className="relative flex-1">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-[var(--color-border)] py-[var(--space-sm)] text-[var(--text-body)] text-[var(--color-text-main)] appearance-none focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-[var(--space-sm)]">
              <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleChange}
                className="flex-1 bg-transparent border-b border-[var(--color-border)] py-[var(--space-sm)] text-[var(--text-body)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            {/* Notes (Optional) */}
            <div className="flex items-center gap-[var(--space-sm)]">
              <FileText className="w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add a note (optional)"
                className="flex-1 bg-transparent border-b border-[var(--color-border)] py-[var(--space-sm)] text-[var(--text-body)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-[var(--color-text-muted)]"
              />
            </div>
          </div>

          {/* Action Button */}
          <PrimaryButton type="submit" className="w-full py-[var(--space-md)]">
            {initialData ? 'Update Expense' : 'Save Expense'}
          </PrimaryButton>
        </form>
      </Card>
    </div>
  );
};

export default AddExpenseFlow;

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Home, Users, Check } from 'lucide-react';
import { PrimaryButton } from './CoreUI';

const CreateGroupModal = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    includeInBudget: true,
    type: 'personal' // 'personal' or 'shared'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl transform transition-all overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create Group Expense</h2>
            <p className="text-sm text-slate-500 mt-1">Group related expenses together</p>
          </div>
          <button 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Group Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Chicago Trip, Birthday Party"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
              autoFocus
            />
          </div>

          {/* Group Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Group Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Personal Group Card */}
              <button
                type="button"
                onClick={() => handleTypeSelect('personal')}
                className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  formData.type === 'personal'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  formData.type === 'personal' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className={`font-semibold text-sm ${
                    formData.type === 'personal' ? 'text-blue-900' : 'text-slate-900'
                  }`}>
                    Personal Group
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Only you</div>
                </div>
                {formData.type === 'personal' && (
                  <div className="absolute top-[-1px] right-[-1px] w-6 h-6 bg-blue-600 rounded-bl-xl rounded-tr-lg flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </button>

              {/* Shared Group Card */}
              <button
                type="button"
                onClick={() => handleTypeSelect('shared')}
                className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  formData.type === 'shared'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  formData.type === 'shared' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className={`font-semibold text-sm ${
                    formData.type === 'shared' ? 'text-blue-900' : 'text-slate-900'
                  }`}>
                    Shared Group
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Split later</div>
                </div>
                {formData.type === 'shared' && (
                  <div className="absolute top-[-1px] right-[-1px] w-6 h-6 bg-blue-600 rounded-bl-xl rounded-tr-lg flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Include in Budget Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-900">
                Include group expenses in budget
              </label>
              <p className="text-xs text-slate-500">
                Expenses added to this group will count toward monthly budget
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.includeInBudget}
              onClick={() => setFormData(prev => ({ ...prev, includeInBudget: !prev.includeInBudget }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.includeInBudget ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.includeInBudget ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Group Description <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional note about this group"
              rows={3}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none text-sm"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl border border-transparent hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <PrimaryButton 
              type="submit" 
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 border-none"
              disabled={!formData.name.trim()}
            >
              Create Group
            </PrimaryButton>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateGroupModal;

import React, { useState } from 'react';
import './ExpenseTemplates.css';

const ExpenseTemplates = ({ onSelectTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const expenseTemplates = [
    {
      id: 'coffee',
      name: 'Coffee',
      description: 'Daily coffee purchase',
      amount: 4.50,
      category: 'Food & Dining',
      icon: '☕',
      tags: ['daily', 'coffee', 'morning']
    },
    {
      id: 'lunch',
      name: 'Lunch',
      description: 'Work lunch',
      amount: 12.00,
      category: 'Food & Dining',
      icon: '🍽️',
      tags: ['lunch', 'work', 'food']
    },
    {
      id: 'gas',
      name: 'Gas',
      description: 'Gas station fill-up',
      amount: 45.00,
      category: 'Transportation',
      icon: '⛽',
      tags: ['gas', 'car', 'fuel']
    },
    {
      id: 'groceries',
      name: 'Groceries',
      description: 'Weekly grocery shopping',
      amount: 85.00,
      category: 'Food & Dining',
      icon: '🛒',
      tags: ['groceries', 'weekly', 'food']
    },
    {
      id: 'uber',
      name: 'Uber/Taxi',
      description: 'Ride sharing service',
      amount: 15.00,
      category: 'Transportation',
      icon: '🚗',
      tags: ['transport', 'ride', 'uber']
    },
    {
      id: 'pharmacy',
      name: 'Pharmacy',
      description: 'Medicine and health supplies',
      amount: 25.00,
      category: 'Healthcare',
      icon: '💊',
      tags: ['health', 'medicine', 'pharmacy']
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      description: 'Movie, concert, or event',
      amount: 20.00,
      category: 'Entertainment',
      icon: '🎬',
      tags: ['entertainment', 'fun', 'leisure']
    },
    {
      id: 'utilities',
      name: 'Utilities',
      description: 'Electricity, water, internet bill',
      amount: 120.00,
      category: 'Utilities',
      icon: '⚡',
      tags: ['bills', 'utilities', 'monthly']
    },
    {
      id: 'shopping',
      name: 'Shopping',
      description: 'Clothing or personal items',
      amount: 50.00,
      category: 'Shopping',
      icon: '🛍️',
      tags: ['shopping', 'clothes', 'personal']
    },
    {
      id: 'subscription',
      name: 'Subscription',
      description: 'Monthly subscription service',
      amount: 9.99,
      category: 'Entertainment',
      icon: '📱',
      tags: ['subscription', 'monthly', 'service']
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
  };

  const handleQuickAdd = (template) => {
    const expenseData = {
      description: template.description,
      amount: template.amount,
      category: template.category,
      date: new Date().toISOString().split('T')[0],
      notes: `Template: ${template.name}`,
      tags: template.tags,
      currency: 'USD'
    };
    onSelectTemplate(expenseData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Expense Templates
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Quick templates for common expenses
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenseTemplates.map((template) => (
          <div
            key={template.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedTemplate?.id === template.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${template.amount}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {template.category}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {template.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTemplateSelect(template);
                }}
                className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                Edit & Add
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAdd(template);
                }}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Quick Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Template Preview */}
      {selectedTemplate && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">
            Selected Template: {selectedTemplate.name}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-indigo-700 dark:text-indigo-300">Amount:</span>
              <span className="ml-2 font-medium text-indigo-900 dark:text-indigo-100">
                ${selectedTemplate.amount}
              </span>
            </div>
            <div>
              <span className="text-indigo-700 dark:text-indigo-300">Category:</span>
              <span className="ml-2 font-medium text-indigo-900 dark:text-indigo-100">
                {selectedTemplate.category}
              </span>
            </div>
          </div>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-2">
            {selectedTemplate.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpenseTemplates;


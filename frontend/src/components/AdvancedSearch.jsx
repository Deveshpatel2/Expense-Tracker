import React, { useState } from 'react';
import './AdvancedSearch.css';

const AdvancedSearch = ({ onSearch, onFilter, onSort, onClear }) => {
  const [searchData, setSearchData] = useState({
    query: '',
    category: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    tags: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const categories = [
    'All Categories',
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

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'category', label: 'Category' },
    { value: 'description', label: 'Description' },
    { value: 'createdAt', label: 'Created Date' }
  ];

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    onSearch(searchData);
  };

  const handleFilter = () => {
    onFilter(searchData);
  };

  const handleSort = () => {
    onSort(searchData.sortBy, searchData.sortOrder);
  };

  const handleClear = () => {
    setSearchData({
      query: '',
      category: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
      tags: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    onClear();
  };

  const handleQuickFilter = (type) => {
    const today = new Date();
    switch (type) {
      case 'today':
        const todayStr = today.toISOString().split('T')[0];
        setSearchData(prev => ({ ...prev, startDate: todayStr, endDate: todayStr }));
        break;
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        setSearchData(prev => ({ 
          ...prev, 
          startDate: weekAgo.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0] 
        }));
        break;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        setSearchData(prev => ({ 
          ...prev, 
          startDate: monthAgo.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0] 
        }));
        break;
      case 'year':
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        setSearchData(prev => ({ 
          ...prev, 
          startDate: yearAgo.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0] 
        }));
        break;
      default:
        break;
    }
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting search results...');
  };

  const handleSaveFilter = () => {
    // Save filter functionality
    console.log('Saving filter...');
  };

  return (
    <div className="advanced-search-container">
      {/* Compact Header */}
      <div className="advanced-search-header">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Advanced Search
          </h3>
        </div>
        <button
          onClick={handleClear}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {/* Search Query */}
        <div>
          <label className="advanced-search-field">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchData.query}
              onChange={(e) => handleInputChange('query', e.target.value)}
              className="advanced-search-input pl-9"
              placeholder="Search descriptions, notes..."
            />
          </div>
        </div>

        {/* Category & Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="advanced-search-field">Category</label>
            <select
              value={searchData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="advanced-search-input"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="advanced-search-field">Amount Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={searchData.minAmount}
                onChange={(e) => handleInputChange('minAmount', e.target.value)}
                className="advanced-search-input"
                placeholder="Min $"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                value={searchData.maxAmount}
                onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                className="advanced-search-input"
                placeholder="Max $"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="advanced-search-field">From Date</label>
            <input
              type="date"
              value={searchData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="advanced-search-input"
            />
          </div>
          <div>
            <label className="advanced-search-field">To Date</label>
            <input
              type="date"
              value={searchData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="advanced-search-input"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <label className="advanced-search-field">Quick Filters</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickFilter('today')}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickFilter('week')}
              className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm"
            >
              This Week
            </button>
            <button
              onClick={() => handleQuickFilter('month')}
              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm"
            >
              This Month
            </button>
            <button
              onClick={() => handleQuickFilter('year')}
              className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-md hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors text-sm"
            >
              This Year
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSearch}
            className="advanced-search-button"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
          <button
            onClick={handleExport}
            className="advanced-search-button-blue"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
          <button
            onClick={handleSaveFilter}
            className="advanced-search-button-green"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;


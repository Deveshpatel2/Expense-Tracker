import React, { useState } from 'react';

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

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Advanced Search & Filter
        </h3>
        <button
          onClick={handleClear}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Search Query */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Query
          </label>
          <input
            type="text"
            value={searchData.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="input"
            placeholder="Search in descriptions, notes, tags..."
          />
        </div>

        {/* Category and Amount Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={searchData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="input"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Min Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={searchData.minAmount}
              onChange={(e) => handleInputChange('minAmount', e.target.value)}
              className="input"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={searchData.maxAmount}
              onChange={(e) => handleInputChange('maxAmount', e.target.value)}
              className="input"
              placeholder="1000.00"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={searchData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={searchData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <input
            type="text"
            value={searchData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            className="input"
            placeholder="Enter tags separated by commas (e.g., work, travel, urgent)"
          />
        </div>

        {/* Sort Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={searchData.sortBy}
              onChange={(e) => handleInputChange('sortBy', e.target.value)}
              className="input"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort Order
            </label>
            <select
              value={searchData.sortOrder}
              onChange={(e) => handleInputChange('sortOrder', e.target.value)}
              className="input"
            >
              <option value="desc">Descending (Newest/High to Low)</option>
              <option value="asc">Ascending (Oldest/Low to High)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md"
          >
            Search
          </button>
          <button
            onClick={handleFilter}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
          >
            Apply Filters
          </button>
          <button
            onClick={handleSort}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md"
          >
            Sort
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md"
          >
            Clear
          </button>
        </div>

        {/* Quick Filters */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setSearchData(prev => ({ ...prev, startDate: today, endDate: today }));
              }}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Today
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                setSearchData(prev => ({ 
                  ...prev, 
                  startDate: weekAgo.toISOString().split('T')[0], 
                  endDate: today.toISOString().split('T')[0] 
                }));
              }}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                setSearchData(prev => ({ 
                  ...prev, 
                  startDate: monthAgo.toISOString().split('T')[0], 
                  endDate: today.toISOString().split('T')[0] 
                }));
              }}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => {
                setSearchData(prev => ({ ...prev, minAmount: '100' }));
              }}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              $100+
            </button>
            <button
              onClick={() => {
                setSearchData(prev => ({ ...prev, category: 'Food & Dining' }));
              }}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Food & Dining
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;


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

  return (
    <div className="advanced-search-container">
      <div className="advanced-search-header">
        <h3 className="advanced-search-title">
          Advanced Search & Filter
        </h3>
        <button
          onClick={handleClear}
          className="advanced-search-clear"
        >
          Clear All
        </button>
      </div>

      <div className="advanced-search-form">
        {/* Search Query */}
        <div>
          <label className="advanced-search-field">
            Search Query
          </label>
          <input
            type="text"
            value={searchData.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="advanced-search-input"
            placeholder="Search in descriptions, notes, tags..."
          />
        </div>

        {/* Category and Amount Range */}
        <div className="advanced-search-grid-3">
          <div>
            <label className="advanced-search-field">
              Category
            </label>
            <select
              value={searchData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="advanced-search-input"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="advanced-search-field">
              Min Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={searchData.minAmount}
              onChange={(e) => handleInputChange('minAmount', e.target.value)}
              className="advanced-search-input"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="advanced-search-field">
              Max Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={searchData.maxAmount}
              onChange={(e) => handleInputChange('maxAmount', e.target.value)}
              className="advanced-search-input"
              placeholder="1000.00"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="advanced-search-grid-2">
          <div>
            <label className="advanced-search-field">
              Start Date
            </label>
            <input
              type="date"
              value={searchData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="advanced-search-input"
            />
          </div>
          <div>
            <label className="advanced-search-field">
              End Date
            </label>
            <input
              type="date"
              value={searchData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="advanced-search-input"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="advanced-search-field">
            Tags
          </label>
          <input
            type="text"
            value={searchData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            className="advanced-search-input"
            placeholder="Enter tags separated by commas (e.g., work, travel, urgent)"
          />
        </div>

        {/* Sort Options */}
        <div className="advanced-search-grid-2">
          <div>
            <label className="advanced-search-field">
              Sort By
            </label>
            <select
              value={searchData.sortBy}
              onChange={(e) => handleInputChange('sortBy', e.target.value)}
              className="advanced-search-input"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="advanced-search-field">
              Sort Order
            </label>
            <select
              value={searchData.sortOrder}
              onChange={(e) => handleInputChange('sortOrder', e.target.value)}
              className="advanced-search-input"
            >
              <option value="desc">Descending (Newest/High to Low)</option>
              <option value="asc">Ascending (Oldest/Low to High)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="advanced-search-actions">
          <button
            onClick={handleSearch}
            className="advanced-search-button"
          >
            Search
          </button>
          <button
            onClick={handleFilter}
            className="advanced-search-button-blue"
          >
            Apply Filters
          </button>
          <button
            onClick={handleSort}
            className="advanced-search-button-green"
          >
            Sort
          </button>
          <button
            onClick={handleClear}
            className="advanced-search-button-gray"
          >
            Clear
          </button>
        </div>

        {/* Quick Filters */}
        <div className="advanced-search-quick-filters">
          <h4 className="advanced-search-quick-filters-title">
            Quick Filters
          </h4>
          <div className="advanced-search-quick-filters-list">
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setSearchData(prev => ({ ...prev, startDate: today, endDate: today }));
              }}
              className="advanced-search-quick-filter-button"
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
              className="advanced-search-quick-filter-button"
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
              className="advanced-search-quick-filter-button"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => {
                setSearchData(prev => ({ ...prev, minAmount: '100' }));
              }}
              className="advanced-search-quick-filter-button"
            >
              $100+
            </button>
            <button
              onClick={() => {
                setSearchData(prev => ({ ...prev, category: 'Food & Dining' }));
              }}
              className="advanced-search-quick-filter-button"
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


import React, { useState, useRef } from 'react';

const ReceiptManager = ({ onReceiptUpload, onReceiptDelete, receipts = [] }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (files) => {
    setUploading(true);
    try {
      for (let file of files) {
        if (file.type.startsWith('image/')) {
          const formData = new FormData();
          formData.append('receipt', file);
          formData.append('expenseId', 'temp'); // Will be updated when expense is created
          
          // Simulate upload - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const receiptData = {
            id: Date.now() + Math.random(),
            filename: file.name,
            originalName: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString(),
            url: URL.createObjectURL(file), // Temporary URL for preview
            expenseId: null
          };
          
          onReceiptUpload(receiptData);
        }
      }
    } catch (error) {
      console.error('Error uploading receipts:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
  };

  const handleReceiptSelect = (receiptId) => {
    setSelectedReceipts(prev => 
      prev.includes(receiptId) 
        ? prev.filter(id => id !== receiptId)
        : [...prev, receiptId]
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedReceipts.length} receipt(s)?`)) {
      selectedReceipts.forEach(receiptId => {
        onReceiptDelete(receiptId);
      });
      setSelectedReceipts([]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Receipt Management
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload and manage receipt photos
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          <div className="text-4xl">📷</div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Upload Receipt Photos
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag and drop images here, or click to select files
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>

      {/* Receipt Gallery */}
      {receipts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Receipt Gallery ({receipts.length})
            </h4>
            {selectedReceipts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete Selected ({selectedReceipts.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedReceipts.includes(receipt.id)
                    ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
                onClick={() => handleReceiptSelect(receipt.id)}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedReceipts.includes(receipt.id)
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedReceipts.includes(receipt.id) && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Receipt Image */}
                <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                  <img
                    src={receipt.url}
                    alt={receipt.originalName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Receipt Info */}
                <div className="p-3 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {receipt.originalName}
                    </h5>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(receipt.size)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{new Date(receipt.uploadDate).toLocaleDateString()}</span>
                    <span>{receipt.type.split('/')[1]?.toUpperCase()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReceiptDelete(receipt.id);
                    }}
                    className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {receipts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No receipts uploaded
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload receipt photos to keep track of your expenses
          </p>
        </div>
      )}
    </div>
  );
};

export default ReceiptManager;


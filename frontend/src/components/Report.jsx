import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Download, ChevronDown, CheckCircle, AlertCircle, X } from 'lucide-react';
import { CATEGORIES, getCategoryConfig } from '../theme/ThemeConfig';
import { useCurrency } from '../context/CurrencyContext';
const formatCurrency = (amount, currencyCode = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Report = ({ expenses = [], budgets = [], groups = [] }) => {
  const { selectedCurrency } = useCurrency();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // --- Data Processing ---

  // Generate last 12 months for selector
  const availableMonths = useMemo(() => {
    const months = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        months.push({ value: monthStr, label });
        date.setMonth(date.getMonth() - 1);
    }
    return months;
  }, []);

  // Filter expenses by selected month
  const currentMonthExpenses = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    return expenses.filter(exp => {
      const d = new Date(exp.expenseDate || exp.date);
      return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month);
    });
  }, [expenses, selectedMonth]);

  // totals
  const totalSpent = useMemo(() => 
    currentMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
    [currentMonthExpenses]
  );

  // Remaining Budget (Sum of budgets for this month - Total Spent) in simple terms
  // Or just Total Budget - Total Spent.
  // We'll calculate total budget for the selected month to get "Remaining"
  const totalBudget = useMemo(() => 
    budgets.filter(b => b.budgetMonth === selectedMonth)
           .reduce((sum, b) => sum + parseFloat(b.amount), 0),
    [budgets, selectedMonth]
  );
  
  const remainingBudget = Math.max(0, totalBudget - totalSpent);

  // Highest Category
  const categoryTotals = useMemo(() => {
    const totals = {};
    currentMonthExpenses.forEach(exp => {
      totals[exp.category] = (totals[exp.category] || 0) + parseFloat(exp.amount);
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [currentMonthExpenses]);

  const highestCategory = categoryTotals.length > 0 ? categoryTotals[0] : ['-', 0];

  // Highest Group
  const groupTotals = useMemo(() => {
    const totals = {};
    currentMonthExpenses.forEach(exp => {
      if (exp.groupId) {
        totals[exp.groupId] = (totals[exp.groupId] || 0) + parseFloat(exp.amount);
      }
    });
    return Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .map(([groupId, amount]) => {
            const group = groups.find(g => g.id === groupId);
            return { name: group ? group.name : 'Unknown Group', amount };
        });
  }, [currentMonthExpenses, groups]);

  const highestGroup = groupTotals.length > 0 ? groupTotals[0] : { name: '-', amount: 0 };


  const [showExportModal, setShowExportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false); // New Error State
  const [exportData, setExportData] = useState({ url: null, range: '' }); // Store URL and Date Text

  const [exportConfig, setExportConfig] = useState({
    dateRange: 'this_month', // today, this_week, this_month, custom
    customStart: '',
    customEnd: '',
    scope: 'all', // all, personal, group
    includeSettlements: false,
    format: 'csv', // csv
    grouping: 'none' // none, category, date
  });

  // Export Logic
  const handleExport = () => {
    try {
        // 1. Filter by Date Range
        let startD = new Date();
        let endD = new Date();
        const now = new Date();

        if (exportConfig.dateRange === 'today') {
            startD = now;
            endD = now;
        } else if (exportConfig.dateRange === 'this_week') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            startD = new Date(now.setDate(diff));
            endD = new Date();
        } else if (exportConfig.dateRange === 'this_month') {
            startD = new Date(now.getFullYear(), now.getMonth(), 1);
            endD = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (exportConfig.dateRange === 'custom') {
            if (!exportConfig.customStart || !exportConfig.customEnd) return;
            startD = new Date(exportConfig.customStart);
            endD = new Date(exportConfig.customEnd);
        }

        // Set times to start/end of day
        startD.setHours(0, 0, 0, 0);
        endD.setHours(23, 59, 59, 999);

        let filtered = expenses.filter(exp => {
            const d = new Date(exp.expenseDate || exp.date);
            return d >= startD && d <= endD;
        });

        // 2. Filter by Scope
        if (exportConfig.scope === 'personal') {
            filtered = filtered.filter(exp => !exp.groupId);
        } else if (exportConfig.scope === 'group') {
            filtered = filtered.filter(exp => !!exp.groupId);
        }

        // 3. Format Data
        const csvData = filtered.map(exp => {
            const groupName = exp.groupId ? groups.find(g => g.id === exp.groupId)?.name || 'Unknown Group' : 'Personal';
            return {
                Date: new Date(exp.expenseDate || exp.date).toLocaleDateString(),
                Description: exp.description,
                Category: exp.category,
                Amount: exp.amount,
                Currency: exp.currency || 'USD',
                Group: groupName,
                Payer: exp.paidBy || 'Me' // Assuming 'Me' if not specified or available logic
            };
        });

        if (csvData.length === 0) {
            alert("No expenses found for the selected criteria.");
            return;
        }

        // SIMULATION: Uncomment to test error state
        // throw new Error("Simulated Export Failure");

        // 4. Generate CSV String
        const csv = Papa.unparse(csvData);
        
        // 5. Create Data URI
        const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        
        // 6. Format Date Range Text for Success Modal
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        const dateRangeText = `${startD.toLocaleDateString('en-US', options)} to ${endD.toLocaleDateString('en-US', options)}`;
        
        // 7. Update State to Show Success Modal
        setExportData({ url: csvContent, range: dateRangeText });
        setShowExportModal(false);
        setShowSuccessModal(true);
    } catch (error) {
        console.error("Export Failed:", error);
        setShowExportModal(false);
        setShowErrorModal(true);
    }
  };



  // Success Modal Component
  const SuccessModal = () => {
    if (!showSuccessModal) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowSuccessModal(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up flex flex-col items-center text-center p-8" onClick={e => e.stopPropagation()}>
                
                {/* Success Icon */}
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" strokeWidth={3} />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Expenses Exported</h3>
                
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    Your expenses from <span className="font-semibold text-slate-700 dark:text-slate-300">{exportData.range}</span> have been successfully exported.
                </p>

                {/* Primary Action: Download */}
                <a 
                    href={exportData.url} 
                    download={`spendora_export_${new Date().toISOString().split('T')[0]}.csv`}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors mb-3 group"
                    onClick={() => {
                        // Optional: Close modal after download click if desired, keeping open for now per common patterns
                    }}
                >
                    <span>Download Expenses.csv</span>
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                </a>

                {/* Secondary Action: Close */}
                <button 
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full px-6 py-3.5 bg-transparent text-slate-500 dark:text-slate-400 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
  };

  // Error Modal Component
  const ErrorModal = () => {
    if (!showErrorModal) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowErrorModal(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up flex flex-col items-center text-center p-8 relative" onClick={e => e.stopPropagation()}>
                
                {/* Close X Button */}
                <button 
                    onClick={() => setShowErrorModal(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Error Icon */}
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" strokeWidth={3} />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Export Failed</h3>
                
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    Something went wrong while exporting your expenses.<br/>
                    Please try again or contact support if the issue persists.
                </p>

                {/* Primary Action: Retry (Same Download Styling) */}
                <button 
                    onClick={() => {
                        setShowErrorModal(false);
                        handleExport(); // Retry logic
                    }}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-600/40 transition-all mb-3 group"
                >
                    <span>Download Expenses.csv</span>
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                </button>

                {/* Secondary Action: Close */}
                <button 
                    onClick={() => setShowErrorModal(false)}
                    className="w-full px-6 py-3.5 bg-transparent text-slate-500 dark:text-slate-400 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
  };

  // Export Modal Component
  const ExportModal = () => {
    if (!showExportModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowExportModal(false)}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
          
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Export Expenses</h3>
            <button 
                onClick={() => setShowExportModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            
            {/* Date Range Section */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Date Range</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'this_week', label: 'This Week' },
                  { id: 'this_month', label: 'This Month' },
                  { id: 'custom', label: 'Custom Range' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setExportConfig({ ...exportConfig, dateRange: option.id })}
                    className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
                      exportConfig.dateRange === option.id
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                     {option.label}
                  </button>
                ))}
              </div>
              
              {/* Custom Range Inputs */}
              {exportConfig.dateRange === 'custom' && (
                <div className="mt-3 grid grid-cols-2 gap-3 animate-fade-in">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Start Date</label>
                    <input 
                      type="date"
                      value={exportConfig.customStart}
                      onChange={(e) => setExportConfig({ ...exportConfig, customStart: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">End Date</label>
                    <input 
                      type="date"
                      value={exportConfig.customEnd}
                      onChange={(e) => setExportConfig({ ...exportConfig, customEnd: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Data Scope Section */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Data Scope</label>
              <div className="space-y-3">
                 {[
                    { id: 'all', label: 'All expenses' },
                    { id: 'personal', label: 'Personal only' },
                    { id: 'group', label: 'Group expenses only' }
                 ].map((scope) => (
                    <label key={scope.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            exportConfig.scope === scope.id 
                            ? 'border-indigo-600 bg-indigo-600' 
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-indigo-400'
                        }`}>
                            {exportConfig.scope === scope.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input 
                            type="radio" 
                            name="scope" 
                            className="hidden"
                            checked={exportConfig.scope === scope.id}
                            onChange={() => setExportConfig({ ...exportConfig, scope: scope.id })}
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{scope.label}</span>
                    </label>
                 ))}
                 
                 {/* Toggle for Settlements */}
                 <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 mt-2">
                    <label className="flex items-center justify-between cursor-pointer group py-1">
                        <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Include split settlements</span>
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only"
                                checked={exportConfig.includeSettlements}
                                onChange={(e) => setExportConfig({ ...exportConfig, includeSettlements: e.target.checked })}
                            />
                            <div className={`w-11 h-6 rounded-full transition-colors ${exportConfig.includeSettlements ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${exportConfig.includeSettlements ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                    </label>
                 </div>
              </div>
            </div>

            {/* Format & Grouping Section */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Format</label>
                    <div className="relative">
                        <select 
                            value={exportConfig.format}
                            onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="csv">CSV</option>
                            <option value="json" disabled>JSON (Coming Soon)</option>
                            <option value="pdf" disabled>PDF (Coming Soon)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Grouping</label>
                    <div className="relative">
                        <select 
                            value={exportConfig.grouping}
                            onChange={(e) => setExportConfig({ ...exportConfig, grouping: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="none">No grouping</option>
                            <option value="category">Group by category</option>
                            <option value="date">Group by date</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3 justify-end">
             <button 
                onClick={() => setShowExportModal(false)}
                className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
             >
                Cancel
             </button>
             <button 
                onClick={handleExport}
                disabled={exportConfig.dateRange === 'custom' && (!exportConfig.customStart || !exportConfig.customEnd)}
                className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
             >
                Download
             </button>
          </div>

        </div>
      </div>
    );
  };

  // --- Chart Data Preparation ---

  // Donut Chart Data
  const donutData = categoryTotals.map(([name, value]) => ({ 
    name, 
    value,
    color: getCategoryConfig(name).color 
  }));

  // Budget vs Actual for Main Section (Top 4 Categories or so)
  const budgetVsActualData = useMemo(() => {
      // Get all unique categories from expenses and budgets
      const cats = new Set([...categoryTotals.map(c => c[0]), ...budgets.filter(b => b.budgetMonth === selectedMonth).map(b => b.category)]);
      
      return Array.from(cats).map(cat => {
          const actual = categoryTotals.find(c => c[0] === cat)?.[1] || 0;
          const budget = budgets.find(b => b.budgetMonth === selectedMonth && b.category === cat)?.amount || 0;
          return { name: cat, budget, actual };
      }).sort((a, b) => b.actual - a.actual).slice(0, 4); // Top 4 for the smaller chart
  }, [categoryTotals, budgets, selectedMonth]);

    // Full Budget vs Actual for Secondary Section
  const fullBudgetVsActualData = useMemo(() => {
      const cats = new Set([...categoryTotals.map(c => c[0]), ...budgets.filter(b => b.budgetMonth === selectedMonth).map(b => b.category)]);
      return Array.from(cats).map(cat => {
          const actual = categoryTotals.find(c => c[0] === cat)?.[1] || 0;
          const budget = budgets.find(b => b.budgetMonth === selectedMonth && b.category === cat)?.amount || 0;
          return { name: cat, budget, actual };
      }).sort((a, b) => b.budget - a.budget); // Sort by budget size usually looks nice
  }, [categoryTotals, budgets, selectedMonth]);

  // Daily Spending Trend
  const trendData = useMemo(() => {
      const [year, month] = selectedMonth.split('-');
      const daysInMonth = new Date(year, month, 0).getDate();
      const data = [];
      
      for(let i=1; i<=daysInMonth; i++) {
        // Only show up to today if current month
        const today = new Date();
        if (parseInt(year) === today.getFullYear() && parseInt(month) === today.getMonth() + 1 && i > today.getDate()) break;
        
        const dayStr = `${year}-${month}-${String(i).padStart(2, '0')}`;
        const dayTotal = currentMonthExpenses
            .filter(e => e.expenseDate?.startsWith(dayStr) || e.date?.startsWith(dayStr))
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);
        
        data.push({ day: i, amount: dayTotal });
      }
      return data;
  }, [currentMonthExpenses, selectedMonth]);


  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* 1) Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Report</h1>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm font-medium text-sm w-full sm:w-40 justify-between">
                  <span>{availableMonths.find(m => m.value === selectedMonth)?.label}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                {/* Dropdown would go here, implemented as simple select for now to avoid complexity without external lib or custom Logic */}
                <select 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    {availableMonths.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
             </div>

             <button 
                onClick={() => setShowExportModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 text-sm font-semibold"
             >
                <Download className="w-4 h-4" />
                <span>Download</span>
             </button>
        </div>
      </div>

       {/* Render Export Modal */}
       <ExportModal />
       
       {/* Render Success Modal */}
       <SuccessModal />

       {/* Render Error Modal */}
       <ErrorModal />

      {/* 2) Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl font-bold">
                $
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalSpent, selectedCurrency)}</p>
                <p className="text-sm text-slate-500 font-medium">Spent</p>
            </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold">
                👍
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(remainingBudget, selectedCurrency)}</p>
                <p className="text-sm text-slate-500 font-medium">Remaining</p>
            </div>
        </div>

        {/* Highest Category */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 text-xl font-bold">
                🏢
            </div>
            <div className="overflow-hidden">
                <p className="text-2xl font-bold text-slate-900 dark:text-white truncate">{formatCurrency(highestCategory[1], selectedCurrency)}</p>
                <p className="text-sm text-slate-500 font-medium truncate">Highest Category</p>
            </div>
        </div>

        {/* Highest Group */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl font-bold">
                👥
            </div>
            <div className="overflow-hidden">
                <p className="text-2xl font-bold text-slate-900 dark:text-white truncate">{formatCurrency(highestGroup.amount, selectedCurrency)}</p>
                <p className="text-sm text-slate-500 font-medium truncate">Highest Group</p>
            </div>
        </div>
      </div>

      {/* 3) Main Analytics Section - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Row with Category Donut and Budget Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Category Breakdown */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Category Breakdown</h3>
                    <div className="flex flex-col items-center">
                        <div className="relative w-48 h-48 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={donutData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {donutData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => formatCurrency(value, selectedCurrency)}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalSpent, selectedCurrency)}</span>
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Spent</span>
                            </div>
                        </div>

                        {/* Custom Legend */}
                        <div className="w-full space-y-3">
                            {donutData.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="font-medium text-slate-600 dark:text-slate-300">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.value, selectedCurrency)}</span>
                                        <span className="text-slate-400 w-8 text-right">
                                            {totalSpent > 0 ? Math.round((item.value / totalSpent) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Budget vs Actual (Compact) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Budget vs Actual</h3>
                        <div className="flex gap-3 text-xs font-medium">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-100"></div>
                                <span className="text-slate-500">Budget</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                                <span className="text-slate-500">Actual</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetVsActualData} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 11 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    hide 
                                />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => formatCurrency(value, selectedCurrency)}
                                />
                                <Bar dataKey="budget" name="Budget" fill="#dbeafe" radius={[4, 4, 4, 4]} barSize={20} />
                                <Bar dataKey="actual" name="Actual" fill="#34d399" radius={[4, 4, 4, 4]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4) Secondary Chart - Detailed Budget vs Actual */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Budget vs Actual (Detailed)</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fullBudgetVsActualData} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 11 }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                tickFormatter={(val) => `$${val}`}
                            />
                            <Tooltip 
                                cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value) => formatCurrency(value, selectedCurrency)}
                            />
                            <Bar dataKey="budget" name="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="actual" name="Actual" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-6">
            
            {/* Group Expense Summary */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Group Expense Summary</h3>
                <div className="space-y-4">
                    {groupTotals.length > 0 ? (
                        groupTotals.slice(0, 5).map((group, idx) => (
                             <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <span className="text-lg">👥</span> 
                                        {/* Could use specific icons if available */}
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{group.name}</span>
                                </div>
                                <span className="font-bold text-slate-500 dark:text-slate-400">{formatCurrency(group.amount, selectedCurrency)}</span>
                            </div>
                        ))
                    ) : (
                         <div className="text-center py-8 text-slate-400 text-sm">No group expenses for this month</div>
                    )}
                </div>
            </div>

            {/* Spending Trends */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Spending Trends</h3>
                </div>
                
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 10 }} 
                                interval={2}
                            />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '8px' }}
                                formatter={(value) => [formatCurrency(value, selectedCurrency), 'Spent']}
                                labelFormatter={(label) => `Day ${label}`}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="#6366f1" 
                                strokeWidth={2} 
                                dot={{ fill: '#6366f1', r: 2, strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                
            </div>

        </div>
      </div>

    </div>
  );
};

export default Report;

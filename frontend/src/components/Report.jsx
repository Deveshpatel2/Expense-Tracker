import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useCurrency } from '../context/CurrencyContext';
import { Card, SectionHeader, Select, Input, PrimaryButton, EmptyState } from './CoreUI';
import { CATEGORIES, getCategoryConfig } from '../theme/ThemeConfig';
import './Report.css';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  // ... (keep currency list or move to config if reused, but fine here for now)
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' }
];

// Move formatAmount function outside component to avoid dependency issues
const formatAmount = (amount, currencyCode = 'USD') => {
  const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code
  }).format(amount);
};

const Report = ({ expenses = [] }) => {
  // const { isDarkMode } = useDarkMode(); // Unused
  
  // Safely get currency with fallback
  let selectedCurrency = 'USD';
  try {
    const currencyContext = useCurrency();
    selectedCurrency = currencyContext?.selectedCurrency || 'USD';
  } catch (error) {
    console.warn('CurrencyContext not available, using default USD');
    selectedCurrency = 'USD';
  }
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Helper function to set default custom dates
  const setDefaultCustomDates = () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    setCustomStartDate(lastMonth.toISOString().split('T')[0]);
    setCustomEndDate(today.toISOString().split('T')[0]);
  };

  // Set default custom dates when custom range is selected
  React.useEffect(() => {
    if (timeRange === 'custom' && (!customStartDate || !customEndDate)) {
      setDefaultCustomDates();
    }
  }, [timeRange, customStartDate, customEndDate]);

  // Use centralized categories
  const categories = useMemo(() => Object.keys(CATEGORIES), []);

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];
    
    // Filter by time range
    const now = new Date();
    let startDate, endDate;
    
    if (timeRange === 'custom') {
      // Use custom date range
      if (customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
      } else {
        // If custom dates are not set, default to last month
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        endDate = now;
      }
    } else {
      // Use predefined time ranges
      startDate = new Date();
      endDate = now;
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 1);
      }
    }
    
    filtered = filtered.filter(expense => {
      const expenseDate = new Date(expense.expenseDate || expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }
    
    return filtered;
  }, [expenses, timeRange, selectedCategory, customStartDate, customEndDate]);

  // Calculate totals by currency
  const totalsByCurrency = useMemo(() => {
    const totals = {};
    
    filteredExpenses.forEach(expense => {
      const currency = expense.currency || 'USD';
      if (!totals[currency]) {
        totals[currency] = 0;
      }
      totals[currency] += parseFloat(expense.amount);
    });
    
    return totals;
  }, [filteredExpenses]);

  // Keep the old totalAmount for backward compatibility (will be the sum of all currencies)
  const totalAmount = useMemo(() => {
    return Object.values(totalsByCurrency).reduce((sum, amount) => sum + amount, 0);
  }, [totalsByCurrency]);

  const categoryBreakdown = useMemo(() => {
    const breakdown = {};
    categories.forEach(category => {
      breakdown[category] = 0;
    });
    
    filteredExpenses.forEach(expense => {
      if (breakdown[expense.category]) {
        breakdown[expense.category] += parseFloat(expense.amount);
      } else if (CATEGORIES[expense.category]) {
          breakdown[expense.category] += parseFloat(expense.amount);
      } else {
          // Handle unknown categories grouping logic if necessary or just add them
           if(!breakdown['Other']) breakdown['Other'] = 0;
           breakdown['Other'] += parseFloat(expense.amount);
      }
    });
    
    return Object.entries(breakdown)
      .filter(([_, amount]) => amount > 0)
      .sort(([_, a], [__, b]) => b - a);
  }, [filteredExpenses, categories]);

  const weeklyData = useMemo(() => {
    const weeks = {};
    const now = new Date();
    
    // Generate last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekKey = `Week ${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      weeks[weekKey] = 0;
      
      filteredExpenses.forEach(expense => {
        const expenseDate = new Date(expense.expenseDate || expense.date);
        if (expenseDate >= weekStart && expenseDate <= weekEnd) {
          weeks[weekKey] += parseFloat(expense.amount);
        }
      });
    }
    
    return Object.entries(weeks).map(([week, amount]) => ({
      week,
      amount: parseFloat(amount.toFixed(2)),
      formattedAmount: formatAmount(amount, selectedCurrency)
    }));
  }, [filteredExpenses, selectedCurrency]);

  const dailyData = useMemo(() => {
    const days = {};
    const now = new Date();
    
    // Generate last 14 days
    for (let i = 13; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dayKey = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[dayKey] = 0;
      
      filteredExpenses.forEach(expense => {
        const expenseDate = new Date(expense.expenseDate || expense.date);
        if (expenseDate.toDateString() === day.toDateString()) {
          days[dayKey] += parseFloat(expense.amount);
        }
      });
    }
    
    return Object.entries(days).map(([day, amount]) => ({
      day,
      amount: parseFloat(amount.toFixed(2)),
      formattedAmount: formatAmount(amount, selectedCurrency)
    }));
  }, [filteredExpenses, selectedCurrency]);

  const monthlyTrend = useMemo(() => {
    const months = {};
    filteredExpenses.forEach(expense => {
      const month = new Date(expense.expenseDate || expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      months[month] = (months[month] || 0) + parseFloat(expense.amount);
    });
    
    return Object.entries(months).sort(([a], [b]) => new Date(a) - new Date(b));
  }, [filteredExpenses]);

  const topExpenses = useMemo(() => {
    return [...filteredExpenses]
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 5);
  }, [filteredExpenses]);

  // Calculate averages by currency
  const averagesByCurrency = useMemo(() => {
    const averages = {};
    const counts = {};
    
    filteredExpenses.forEach(expense => {
      const currency = expense.currency || 'USD';
      if (!averages[currency]) {
        averages[currency] = 0;
        counts[currency] = 0;
      }
      averages[currency] += parseFloat(expense.amount);
      counts[currency]++;
    });
    
    // Calculate actual averages
    Object.keys(averages).forEach(currency => {
      averages[currency] = averages[currency] / counts[currency];
    });
    
    return averages;
  }, [filteredExpenses]);

  if (expenses.length === 0) {
    return (
      <EmptyState
        message="Add some expenses to see detailed reports and insights!"
        ctaLabel="Add First Expense"
        onCtaClick={() => {}} // Handle navigation if needed
      />
    );
  }

  // Common props for charts
  const axisProps = {
    axisLine: false,
    tickLine: false,
    tick: { fontSize: 12, fill: 'var(--color-chart-label)' },
    stroke: 'var(--color-chart-label)'
  };

  const tooltipProps = {
    isAnimationActive: false,
    cursor: { fill: 'transparent' },
    contentStyle: {
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-btn)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      color: 'var(--color-text-main)'
    }
  };

  return (
    <div className="space-y-[var(--space-lg)]">
      {/* Filters and Chart Type Selection */}
      <Card>
        <div className="grid grid-cols-1 gap-[var(--space-md)] sm:grid-cols-4 items-end">
          <div className={timeRange === 'custom' ? 'sm:col-span-2' : ''}>
            <Select
                label="Time Range"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                options={[
                    { value: 'week', label: 'Last Week' },
                    { value: 'month', label: 'Last Month' },
                    { value: 'quarter', label: 'Last Quarter' },
                    { value: 'year', label: 'Last Year' },
                    { value: 'custom', label: 'Custom Range' },
                ]}
            />
            {/* Custom Date Range Inputs */}
             {timeRange === 'custom' && (
              <div className="mt-[var(--space-sm)] grid grid-cols-2 gap-[var(--space-sm)]">
                <Input
                    label="Start Date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                />
                <Input
                    label="End Date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            )}
          </div>
          
          <div>
            <Select
                label="Category Filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={[
                    { value: 'all', label: 'All Categories' },
                    ...categories.map(c => ({ value: c, label: c }))
                ]}
            />
          </div>

          <div>
            <Select
                label="Chart Type"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                options={[
                    { value: 'bar', label: 'Bar Chart' },
                    { value: 'line', label: 'Line Chart' },
                    { value: 'area', label: 'Area Chart' },
                ]}
            />
          </div>

          <div>
             <PrimaryButton 
                onClick={() => window.print()} 
                className="w-full"
            >
              📄 Print Report
            </PrimaryButton>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-[var(--space-md)] sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="var(--space-lg)">
            <div className="flex items-center gap-[var(--space-md)]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-primary)] text-white text-xl">
                    💰
                </div>
                <div>
                   <p className="text-[var(--text-muted)] text-[var(--color-text-muted)] font-[var(--weight-medium)]">Total Expenses</p>
                   {Object.keys(totalsByCurrency).length > 0 ? (
                      Object.entries(totalsByCurrency).map(([currency, total]) => (
                        <div key={currency} className="text-[var(--text-monetary-md)] font-[var(--weight-bold)] text-[var(--color-text-main)]">
                           {formatAmount(total, currency)}
                        </div>
                      ))
                   ) : (
                      <p className="text-[var(--text-body)] font-[var(--weight-semibold)]">No expenses</p>
                   )}
                </div>
            </div>
        </Card>

        <Card padding="var(--space-lg)">
             <div className="flex items-center gap-[var(--space-md)]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-success)] text-white text-xl">
                    📊
                </div>
                <div>
                   <p className="text-[var(--text-muted)] text-[var(--color-text-muted)] font-[var(--weight-medium)]">Average Expense</p>
                    {Object.keys(averagesByCurrency).length > 0 ? (
                      Object.entries(averagesByCurrency).map(([currency, average]) => (
                         <div key={currency} className="text-[var(--text-monetary-md)] font-[var(--weight-bold)] text-[var(--color-text-main)]">
                           {formatAmount(average, currency)}
                        </div>
                      ))
                    ) : (
                       <p className="text-[var(--text-body)] font-[var(--weight-semibold)]">No expenses</p>
                    )}
                </div>
            </div>
        </Card>

        <Card padding="var(--space-lg)">
             <div className="flex items-center gap-[var(--space-md)]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#3b82f6] text-white text-xl">
                    📝
                </div>
                <div>
                   <p className="text-[var(--text-muted)] text-[var(--color-text-muted)] font-[var(--weight-medium)]">Transactions</p>
                   <p className="text-[var(--text-monetary-md)] font-[var(--weight-bold)] text-[var(--color-text-main)]">{filteredExpenses.length}</p>
                </div>
            </div>
        </Card>

        <Card padding="var(--space-lg)">
            <div className="flex items-center gap-[var(--space-md)]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#8b5cf6] text-white text-xl">
                    🏆
                </div>
                <div>
                   <p className="text-[var(--text-muted)] text-[var(--color-text-muted)] font-[var(--weight-medium)]">Top Category</p>
                   <p className="text-[var(--text-body)] font-[var(--weight-bold)] text-[var(--color-text-main)]">
                      {categoryBreakdown.length > 0 ? categoryBreakdown[0][0] : 'N/A'}
                   </p>
                </div>
            </div>
        </Card>
      </div>

      {/* Weekly Report Charts */}
      <div className="grid grid-cols-1 gap-[var(--space-lg)] lg:grid-cols-2">
        {/* Weekly Bar Chart */}
        <Card>
          <SectionHeader title="Weekly Spending Overview" className="mb-[var(--space-md)]" />
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
                <XAxis dataKey="week" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip 
                  {...tooltipProps}
                  formatter={(value) => [formatAmount(value, selectedCurrency), 'Amount']}
                  labelFormatter={(label) => `Week: ${label}`}
                />
                <Bar dataKey="amount" isAnimationActive={false} fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[12px] text-[var(--color-text-muted)] mt-[var(--space-sm)] italic text-center">
            Variation in spending patterns across the last eight weeks.
          </p>
        </Card>

        {/* Daily Line Chart */}
        <Card>
          <SectionHeader title="Daily Spending Trend" className="mb-[var(--space-md)]" />
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
                <XAxis dataKey="day" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip 
                  {...tooltipProps}
                  formatter={(value) => [formatAmount(value, selectedCurrency), 'Amount']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  isAnimationActive={false}
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-primary)", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: "var(--color-primary)", strokeWidth: 0, fill: "var(--color-primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[12px] text-[var(--color-text-muted)] mt-[var(--space-sm)] italic text-center">
            Detailed day-by-day spending fluctuations.
          </p>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      {monthlyTrend.length > 1 && (
        <Card>
          <SectionHeader title="Monthly Spending Trend" className="mb-[var(--space-md)]" />
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend.map(([month, amount]) => ({ month, amount }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip 
                  {...tooltipProps}
                  formatter={(value) => [formatAmount(value, selectedCurrency), 'Amount']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  isAnimationActive={false}
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-primary)", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: "var(--color-primary)", strokeWidth: 0, fill: "var(--color-primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[12px] text-[var(--color-text-muted)] mt-[var(--space-sm)] italic text-center">
            Long-term trend analysis of monthly expenditures.
          </p>
        </Card>
      )}

      {/* Category Donut Chart */}
      <Card>
        <SectionHeader title="Category Distribution" className="mb-[var(--space-md)] text-center justify-center" />
        <div className="h-[300px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryBreakdown.map(([category, amount]) => ({
                  name: category,
                  value: amount
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => window.innerWidth < 640 ? `${(percent * 100).toFixed(0)}%` : `${name} ${(percent * 100).toFixed(0)}%`}
                innerRadius={window.innerWidth < 640 ? 60 : 100}
                outerRadius={window.innerWidth < 640 ? 90 : 140}
                dataKey="value"
                isAnimationActive={false}
              >
                {categoryBreakdown.map(([category], index) => {
                   const config = getCategoryConfig(category);
                   return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={config?.color || 'var(--color-chart-muted)'} 
                      />
                   );
                })}
              </Pie>
              <Tooltip 
                {...tooltipProps}
                formatter={(value) => [formatAmount(value, selectedCurrency), 'Amount']} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[12px] text-[var(--color-text-muted)] mt-[var(--space-sm)] italic text-center">
          Percentage breakdown of all expenditures by category.
        </p>
      </Card>

      {/* Top Expenses */}
      <Card>
        <SectionHeader title="Top 5 Highest Expenses" className="mb-[var(--space-md)]" />
        <div className="space-y-[var(--space-sm)]">
          {topExpenses.map((expense, index) => (
            <div key={expense.id} className="flex items-center justify-between p-[var(--space-sm)] bg-[var(--color-bg)] rounded-[var(--radius-btn)]">
              <div className="flex items-center">
                <span className="text-[var(--text-body)] font-[var(--weight-bold)] text-[var(--color-primary)] mr-[var(--space-md)]">#{index + 1}</span>
                <div>
                  <p className="text-[var(--text-body)] font-[var(--weight-semibold)] text-[var(--color-text-main)]">{expense.description}</p>
                  <p className="text-[var(--text-muted)] text-[var(--color-text-muted)]">{expense.category} • {new Date(expense.expenseDate || expense.date).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="text-[var(--text-body)] font-[var(--weight-bold)] text-[var(--color-text-main)]">{formatAmount(expense.amount, expense.currency || selectedCurrency)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed Category Breakdown */}
      <Card>
        <SectionHeader title="Detailed Category Breakdown" className="mb-[var(--space-md)]" />
        <div className="space-y-[var(--space-md)]">
          {categoryBreakdown.map(([category, amount]) => {
            const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
            const config = getCategoryConfig(category);
            return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-[var(--space-sm)]`} style={{ backgroundColor: config.color }}></div>
                  <span className="text-[var(--text-body)] font-[var(--weight-medium)] text-[var(--color-text-main)]">{category}</span>
                </div>
                <div className="flex items-center space-x-[var(--space-md)]">
                  <div className="w-24 sm:w-32 bg-[var(--color-border)] rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: config.color
                      }}
                    ></div>
                  </div>
                  <span className="text-[var(--text-body)] font-[var(--weight-medium)] text-[var(--color-text-main)] w-20 text-right">
                    {formatAmount(amount, selectedCurrency)}
                  </span>
                  <span className="text-[var(--text-muted)] text-[var(--color-text-muted)] w-12 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>



    </div>
  );
};

export default Report;

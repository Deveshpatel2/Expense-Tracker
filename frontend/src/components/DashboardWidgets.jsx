import React from 'react';
import { 
  ChevronRight, Filter
} from 'lucide-react';
import { getCategoryConfig } from '../theme/ThemeConfig';

// --- Shared Styles ---
const CARD_BASE = "bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_6px_18px_rgba(15,23,42,0.06)] p-6";
const TEXT_MAIN = "text-[#111827]";
const TEXT_MUTED = "text-[#6B7280]";
const BLUE_MAIN = "text-[#2563EB]";
const BG_BLUE_SOFT = "bg-[#EFF6FF]";

// --- 1. Greeting Block ---
export const GreetingHeader = ({ userName }) => (
  <div className="mb-6">
    <h1 className={`${TEXT_MAIN} text-[28px] lg:text-[32px] font-semibold leading-tight`}>
      Hello, {userName}
    </h1>
    <p className={`${TEXT_MUTED} text-[15px] mt-1`}>
      Here's your spending overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
    </p>
  </div>
);

// --- 2. KPI Cards Row ---
export const KpiCardRow = ({ statistics, budgets }) => {
    const totalBudget = budgets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    // Dummy budget for weekly if not set
    const weeklyBudget = totalBudget > 0 ? (totalBudget / 4).toFixed(0) : 400;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-6">
            {/* Card A: Total Spent */}
            <div className={`${CARD_BASE} flex flex-col justify-between h-[160px]`}>
                <div>
                    <h3 className={`${TEXT_MUTED} text-[14px] font-medium`}>Total Spent This Month</h3>
                    <div className="mt-2 text-[32px] font-bold tracking-tight text-[#111827]">
                        ${statistics.thisMonth.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="space-y-2">
                     <div className="w-full h-[4px] bg-[#2563EB] rounded-full opacity-90" />
                     <p className={`${TEXT_MAIN} text-[14px] font-semibold text-center`}>
                        ${statistics.thisMonth.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </p>
                </div>
            </div>

            {/* Card B: Weekly Spending */}
            <div className={`${CARD_BASE} flex flex-col justify-between h-[160px]`}>
                <div>
                    <h3 className={`${TEXT_MUTED} text-[14px] font-medium mb-1`}>Weekly Spending</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[28px] font-bold text-[#111827]">
                            ${statistics.thisWeek.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={`${BG_BLUE_SOFT} ${TEXT_MUTED} text-[12px] px-2 py-1 rounded-md font-medium whitespace-nowrap`}>
                            / ${weeklyBudget} Budget
                        </span>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="w-full bg-[#E5E7EB] h-[4px] rounded-full overflow-hidden">
                        <div 
                            className="bg-[#2563EB] h-full rounded-full" 
                            style={{ width: `${Math.min((statistics.thisWeek.amount / weeklyBudget) * 100, 100)}%` }} // Simple calc
                        />
                    </div>
                     <p className={`${TEXT_MUTED} text-[13px] text-center font-medium`}>
                        ${statistics.thisWeek.amount.toFixed(2)} / ${weeklyBudget} Budget
                     </p>
                </div>
            </div>

            {/* Card C: Today's Spending */}
             <div className={`${CARD_BASE} flex flex-col justify-between h-[160px]`}>
                <h3 className={`${TEXT_MUTED} text-[14px] font-medium text-center`}>Today's Spending</h3>
                <div className="text-center">
                    <div className="text-[32px] font-bold text-[#111827]">
                        ${statistics.today.amount.toFixed(2)}
                    </div>
                </div>
                <div>
                     <div className="w-full h-[1px] bg-[#E5E7EB] mb-2" />
                     <p className={`${TEXT_MAIN} text-[14px] font-bold text-center`}>
                        ${statistics.today.amount.toFixed(2)}
                     </p>
                </div>
            </div>
        </div>
    );
};

// --- 3. Monthly Budget Pace ---
export const BudgetPaceCard = ({ statistics, budgets }) => {
    const totalBudget = budgets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0) || 1420; // Default 1420 if 0
    const percentage = (statistics.thisMonth.amount / totalBudget) * 100;
    
    return (
        <div className={`${CARD_BASE} mb-6`}>
             <div className="flex justify-between items-start mb-4">
                <h3 className={`${TEXT_MAIN} font-semibold text-[15px]`}>Monthly Budget Pace</h3>
                <span className={`${TEXT_MUTED} text-[13px]`}>Target: ${totalBudget.toLocaleString()}</span>
             </div>

             <div className="flex flex-col gap-1 mb-4">
                <span className={`${TEXT_MAIN} text-[14px] font-medium`}>You're spending faster than usual.</span>
                <span className={`${BLUE_MAIN} text-[13px] font-semibold`}>{percentage.toFixed(0)}% of monthly budget used</span>
             </div>

             <div className="relative pt-1">
                 <div className="flex justify-between text-[12px] text-[#9CA3AF] mb-1">
                    <span>{/* Spacer */}</span>
                    <span className="flex items-center gap-1">Target: ${totalBudget.toLocaleString()} <ChevronRight size={12}/></span>
                 </div>
                 <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                     <div 
                        className="bg-[#2563EB] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                     />
                 </div>
             </div>
        </div>
    );
};

// --- 4. Category Breakdown ---
export const CategoryBreakdownCard = ({ categories }) => {
    const displayCats = categories.slice(0, 6);

    return (
        <div className={`${CARD_BASE} flex flex-col`}>
             <div className="flex justify-between items-center mb-6">
                 <h3 className={`${TEXT_MAIN} font-semibold text-[15px]`}>Category Breakdown</h3>
                 <button className={`${TEXT_MUTED} text-[13px] hover:text-[#111827]`}>Manage Budgets</button>
             </div>

             <div className="space-y-6 flex-1">
                 {displayCats.map((cat, i) => {
                     const { icon: Icon, color } = getCategoryConfig(cat.name);
                     const safeColor = color || '#2563EB';
                     // Mock budget data for layout if not present
                     const budgetVal = cat.budget || (cat.amount * 1.5).toFixed(0); 

                     return (
                         <div key={i} className="group">
                             <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
                                         <Icon size={14} style={{ color: safeColor }} />
                                    </div>
                                    <span className={`${TEXT_MAIN} text-[14px] font-semibold`}>{cat.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className={`${TEXT_MAIN} font-bold text-[14px]`}>${cat.amount.toLocaleString()}</div>
                                    <div className="text-[10px] text-[#9CA3AF]">${budgetVal} Budget</div>
                                </div>
                             </div>
                             
                             {/* Progress Line & Sparkline Placeholder */}
                             <div className="flex items-center gap-2">
                                 <div className="flex-1 h-[3px] bg-[#E5E7EB] rounded-full overflow-hidden">
                                     <div 
                                        className="h-full rounded-full opacity-80" 
                                        style={{ backgroundColor: safeColor, width: '65%' }} 
                                     />
                                 </div>
                                 {/* Tiny Sparkline SVG placeholder */}
                                 <svg width="40" height="12" viewBox="0 0 40 12" fill="none" className="opacity-30">
                                     <path d="M0 10 L8 8 L16 11 L24 4 L32 7 L40 2" stroke={safeColor} strokeWidth="1.5" />
                                     <path d="M0 10 L8 8 L16 11 L24 4 L32 7 L40 2 V12 H0 Z" fill={safeColor} fillOpacity="0.1"/>
                                 </svg>
                             </div>
                         </div>
                     );
                 })}
             </div>
        </div>
    );
};

// --- 5. Recent Transactions ---
export const RecentTransactionsCard = ({ expenses }) => {
    const displayExpenses = expenses.slice(0, 9);

    return (
        <div className={`${CARD_BASE} flex flex-col h-full min-h-[500px] relative`}>
            <div className="flex justify-between items-center mb-6">
                 <h3 className={`${TEXT_MAIN} font-semibold text-[15px]`}>Recent Transactions</h3>
                 <button className={`${TEXT_MUTED} text-[13px] hover:text-[#111827]`}>View All &gt;</button>
             </div>

             <div className="space-y-5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                 {displayExpenses.map((expense, i) => {
                     const { icon: Icon } = getCategoryConfig(expense.category || expense.description); // Fallback usually good
                     // Attempt to match image icons specifically if possible, otherwise generic
                     // Image 1 specific overrides:
                     let SpecificIcon = Icon;
                     // let specificBg = `${color}15`; // 10% opacity hex
                     
                     return (
                         <div key={i} className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <div 
                                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: "#F3F4F6" }} // Image has greyish bg for icons generally
                                 >
                                      <SpecificIcon size={18} className="text-[#4B5563]" /> 
                                 </div>
                                 <div>
                                     <p className={`${TEXT_MAIN} text-[14px] font-semibold leading-tight`}>{expense.description}</p>
                                     <p className="text-[12px] text-[#9CA3AF] mt-0.5">{new Date(expense.expenseDate).toLocaleDateString()}</p>
                                 </div>
                             </div>
                             <span className={`${TEXT_MAIN} font-bold text-[14px]`}>
                                -${parseFloat(expense.amount).toFixed(2)}
                             </span>
                         </div>
                     );
                 })}
             </div>

             <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex justify-end">
                 <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[13px] text-[#6B7280] hover:bg-gray-50">
                     <Filter size={14} /> Filter
                 </button>
             </div>
        </div>
    );
};

// --- 6. Weekly Spending Trend ---
export const WeeklyTrendCard = ({ expenses = [] }) => {
    // 1. Process Data: Last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i)); // 6 days ago -> today
        return d;
    });

    const dailyTotals = last7Days.map(date => {
        const dayStr = date.toISOString().split('T')[0];
        const dayTotal = expenses
            .filter(e => e.expenseDate.startsWith(dayStr))
            .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        return { date: dayStr, amount: dayTotal };
    });

    const maxAmount = Math.max(...dailyTotals.map(d => d.amount), 10); // Min max 10 to avoid flatline at 0

    // 2. Generate SVG Path
    const width = 600; // viewBox width
    const height = 120; // viewBox height
    const padding = 20;
    
    // Scale points
    const points = dailyTotals.map((d, i) => {
        const x = (i / (dailyTotals.length - 1)) * width;
        const y = height - ((d.amount / maxAmount) * (height - padding * 2)) - padding;
        return `${x},${y}`;
    }).join(' ');



    return (
        <div className={`${CARD_BASE} mt-6`}>
             <div className="flex justify-between items-center mb-4">
                 <h3 className={`${TEXT_MAIN} font-semibold text-[15px]`}>Weekly Spending Trend</h3>
                 <span className={`${TEXT_MUTED} text-[13px]`}>Last 7 Days</span>
             </div>
             
             {/* Simple SVG Chart */}
             <div className="h-[120px] w-full relative">
                 {/* Grid lines */}
                 <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                     <div className="w-full h-px bg-dashed border-t border-dashed border-gray-100" />
                     <div className="w-full h-px bg-dashed border-t border-dashed border-gray-100" />
                     <div className="w-full h-px bg-dashed border-t border-dashed border-gray-100" />
                 </div>
                 
                 {/* The Line */}
                 <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                     <defs>
                        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.1"/>
                            <stop offset="100%" stopColor="#2563EB" stopOpacity="0"/>
                        </linearGradient>
                     </defs>
                     
                     {/* Area Fill */}
                     <path 
                        d={`M${points.split(' ')[0]} L${points} L${width},${height} L0,${height} Z`} 
                        fill="url(#chartFill)" 
                        className="transition-all duration-500"
                     />
                     
                     {/* Line Stroke */}
                     <polyline 
                        points={points} 
                        fill="none" 
                        stroke="#2563EB" 
                        strokeWidth="2" 
                        vectorEffect="non-scaling-stroke"
                        className="transition-all duration-500"
                     />
                     
                     {/* Nodes */}
                     {dailyTotals.map((d, i) => {
                         const x = (i / (dailyTotals.length - 1)) * width;
                         const y = height - ((d.amount / maxAmount) * (height - padding * 2)) - padding;
                         return (
                            <circle 
                                key={i} 
                                cx={x} 
                                cy={y} 
                                r="3" 
                                fill="#2563EB" 
                                vectorEffect="non-scaling-stroke"
                                className="transition-all duration-500"
                            >
                                <title>{d.date}: ${d.amount.toFixed(2)}</title>
                            </circle>
                         );
                     })}
                 </svg>
             </div>

             {/* X-Axis */}
             <div className="flex justify-between mt-2 text-[10px] text-[#9CA3AF]">
                 {dailyTotals.map((d, i) => (
                    <span key={i}>{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                 ))}
             </div>
        </div>
    );
};

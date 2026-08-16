import React from 'react';
import { getCategoryConfig } from '../theme/ThemeConfig';

// --- Shared Styles ---
const CARD_BASE = "bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_6px_18px_rgba(15,23,42,0.06)] p-6";
const TEXT_MAIN = "text-[#111827]";
const TEXT_MUTED = "text-[#6B7280]";
// const BLUE_MAIN = "text-[#2563EB]"; // Unused after strict polish
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
export const KpiCardRow = ({ statistics }) => {
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
                     <div className="w-full h-[2px] bg-[#2563EB] rounded-full opacity-90" />
                     <p className={`${TEXT_MUTED} text-[14px] font-medium text-center`}>
                        ${statistics.thisMonth.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </p>
                </div>
            </div>

            {/* Card B: Weekly Spending */}
            <div className={`${CARD_BASE} flex flex-col justify-between h-[160px]`}>
                <div>
                    <h3 className={`${TEXT_MUTED} text-[14px] font-medium mb-1`}>Last 7 Days</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[28px] font-bold text-[#111827]">
                            ${statistics.thisWeek.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={`${BG_BLUE_SOFT} text-[#2563EB] text-[12px] px-2 py-1 rounded-md font-medium whitespace-nowrap`}>
                            {statistics.thisWeek.count} {statistics.thisWeek.count === 1 ? 'expense' : 'expenses'}
                        </span>
                    </div>
                </div>
                <div>
                     <div className="w-full h-[1px] bg-[#E5E7EB] mb-2" />
                     <p className={`${TEXT_MUTED} text-[13px] text-center font-medium`}>
                        {statistics.thisWeek.count > 0 ? 'Rolling 7-day total' : 'No spend in the last 7 days'}
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
                     <p className={`${TEXT_MUTED} text-[13px] text-center font-medium`}>
                        {statistics.today.amount > 0 ? `$${statistics.today.amount.toFixed(2)}` : 'No spend yet today'}
                     </p>
                </div>
            </div>
        </div>
    );
};

// --- 4. Category Breakdown ---
export const CategoryBreakdownCard = ({ categories }) => {
    const displayCats = categories.slice(0, 6);
    const total = categories.reduce((sum, c) => sum + c.amount, 0);

    return (
        <div className={`${CARD_BASE} flex flex-col`}>
             <div className="flex justify-between items-center mb-6">
                 <h3 className={`${TEXT_MAIN} font-semibold text-[15px]`}>Category Breakdown</h3>
             </div>

             {displayCats.length === 0 ? (
                 <p className={`${TEXT_MUTED} text-[14px]`}>No expenses yet.</p>
             ) : (
                 <div className="space-y-6 flex-1">
                     {displayCats.map((cat) => {
                         const { icon: Icon } = getCategoryConfig(cat.name);
                         // Each bar shows this category's share of total spending.
                         const share = total > 0 ? (cat.amount / total) * 100 : 0;

                         return (
                             <div key={cat.name}>
                                 <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
                                             <Icon size={14} style={{ color: '#2563EB' }} />
                                        </div>
                                        <span className={`${TEXT_MAIN} text-[14px] font-semibold`}>{cat.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className={`${TEXT_MAIN} font-bold text-[14px]`}>${cat.amount.toFixed(2)}</div>
                                        <div className="text-[10px] text-[#9CA3AF]">{share.toFixed(0)}% of spending</div>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-2">
                                     <div className="flex-1 h-[2px] bg-[#E5E7EB] rounded-full overflow-hidden">
                                         <div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: '#2563EB', width: `${share}%` }}
                                         />
                                     </div>
                                 </div>
                             </div>
                         );
                     })}
                 </div>
             )}
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
             </div>

             <div className="space-y-5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                 {displayExpenses.length === 0 && (
                     <p className={`${TEXT_MUTED} text-[14px]`}>No expenses yet.</p>
                 )}
                 {displayExpenses.map((expense) => {
                     const { icon: SpecificIcon } = getCategoryConfig(expense.category || expense.description);

                     return (
                         <div key={expense.id} className="flex items-center justify-between">
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

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Card, SectionHeader, Input, Select, Toggle, PrimaryButton } from './CoreUI'; // Assuming these exist or using raw elements if distinct styling needed
import { User, Bell, Shield, Wallet, Sliders, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../theme/ThemeConfig';

const SettingsPage = ({ user }) => {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const [firstName, setFirstName] = useState(user?.firstName || 'User');
  const [lastName, setLastName] = useState(user?.lastName || '');
  
  // Mock State for Settings
  const [timeZone, setTimeZone] = useState('GMT-5 (Eastern Time)');
  
  const [startOfWeek, setStartOfWeek] = useState('Sunday');
  const [defaultCategory, setDefaultCategory] = useState('Food');
  
  const [budgetRules, setBudgetRules] = useState({
      includeGroupExpenses: true,
      includeSplitExpenses: true,
      resetDay: '1st of month'
  });

  const [notifications, setNotifications] = useState({
      expenseAdded: true,
      budgetLimit: true,
      splitReminders: false,
      monthlySummary: true
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="w-full pt-2 pb-12">
      {/* 1. Page Title */}
      <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Column */}
          <div className="space-y-6">
              {/* 3. Profile & Account Section */}
              <Card>
                  <SectionHeader title="Profile & Account" className="mb-6" />
                  <div className="flex flex-col items-center sm:items-start gap-6">
                      <div className="flex flex-col items-center gap-2">
                          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-lg relative overflow-hidden">
                             {/* Placeholder generic avatar if no image */}
                             <User className="w-10 h-10 text-blue-500" />
                          </div>
                          <button className="text-sm text-blue-600 font-medium hover:underline">Change Photo</button>
                      </div>
                      
                      <div className="w-full space-y-4">
                            <Input 
                                label="Full Name" 
                                value={`${firstName} ${lastName}`} 
                                onChange={(e) => {
                                    const parts = e.target.value.split(' ');
                                    setFirstName(parts[0]);
                                    setLastName(parts.slice(1).join(' '));
                                }} 
                            />
                             <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input 
                                    disabled 
                                    value={user?.email || 'user@example.com'} 
                                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm cursor-not-allowed w-full"
                                />
                             </div>
                             <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700">Time Zone</label>
                                <div className="relative">
                                    <select 
                                        value={timeZone}
                                        onChange={(e) => setTimeZone(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option>GMT-8 (Pacific Time)</option>
                                        <option>GMT-6 (Central Time)</option>
                                        <option>GMT-5 (Eastern Time)</option>
                                        <option>GMT+0 (UTC)</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                             </div>
                      </div>
                  </div>
              </Card>

              {/* 6. Notifications Section */}
              <Card>
                  <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                        <Bell size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
                  </div>

                  <div className="space-y-6">
                      {[
                          { key: 'expenseAdded', label: 'Expense Added' },
                          { key: 'budgetLimit', label: 'Budget Limit Warning' },
                          { key: 'splitReminders', label: 'Split Reminders' },
                      ].map(item => (
                          <div key={item.key} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-900">{item.label}</span>
                              <Toggle 
                                  checked={notifications[item.key]} 
                                  onChange={(e) => setNotifications({...notifications, [item.key]: e.target.checked})} 
                              />
                          </div>
                      ))}
                  </div>
              </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
              {/* 4. Preferences Section */}
              <Card>
                  <SectionHeader title="Preferences" className="mb-6" />
                  
                  <div className="space-y-4">
                      <Select 
                          label="Default Currency"
                          value={selectedCurrency}
                          onChange={(e) => setSelectedCurrency(e.target.value)}
                          options={[ 'USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD' ].map(c => ({ value: c, label: `${c} - ${c === 'USD' ? 'US Dollar' : c}` }))}
                      />

                      <div className="grid grid-cols-2 gap-4">
                           <Select 
                              label="Start of Week"
                              value={startOfWeek}
                              onChange={(e) => setStartOfWeek(e.target.value)}
                              options={[
                                  { value: 'Sunday', label: 'Sunday' },
                                  { value: 'Monday', label: 'Monday' }
                              ]}
                          />
                          <Select 
                              label="Default Category"
                              value={defaultCategory}
                              onChange={(e) => setDefaultCategory(e.target.value)}
                              options={Object.keys(CATEGORIES).map(c => ({ value: c, label: c }))}
                          />
                      </div>
                  </div>
              </Card>

             {/* 5. Budget & Expense Rules Section */}
             <Card>
                  <SectionHeader title="Budget & Expense Rules" className="mb-6" />

                  <div className="space-y-6">
                      <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">Include group expenses in budget</span>
                          <Toggle 
                              checked={budgetRules.includeGroupExpenses} 
                              onChange={(e) => setBudgetRules({...budgetRules, includeGroupExpenses: e.target.checked})} 
                          />
                      </div>
                      
                      <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">Include split expenses in budget</span>
                          <Toggle 
                              checked={budgetRules.includeSplitExpenses} 
                              onChange={(e) => setBudgetRules({...budgetRules, includeSplitExpenses: e.target.checked})} 
                          />
                      </div>

                      <Select 
                          label="Monthly Budget Reset Day"
                          value={budgetRules.resetDay}
                          onChange={(e) => setBudgetRules({...budgetRules, resetDay: e.target.value})}
                          options={[
                              { value: '1st of month', label: '1st of month' },
                              { value: '15th of month', label: '15th of month' }
                          ]}
                      />
                  </div>
              </Card>

              {/* 7. Privacy & Security Section */}
              <Card>
                  <SectionHeader title="Privacy & Security" className="mb-6" />

                  <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-sm text-slate-700">App Version</span>
                          <span className="text-sm font-medium text-slate-900">1.0.0</span>
                      </div>
                      
                      <div className="flex flex-col gap-2 pt-2">
                          <button className="text-left text-sm text-blue-600 hover:text-blue-700 hover:underline">Terms of Service</button>
                          <button className="text-left text-sm text-blue-600 hover:text-blue-700 hover:underline">Privacy Policy</button>
                      </div>
                      
                      <div className="pt-2">
                         <button className="text-left text-sm text-red-600 hover:text-red-700 hover:underline">Contact Support</button>
                      </div>
                  </div>
              </Card>
          </div>
      </div>
    </div>
  );
};

export default SettingsPage;

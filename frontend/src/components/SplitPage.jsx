import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Plus, MoreHorizontal, User, 
  Clock,
  ChevronRight, Search, X,
  CreditCard, Activity
} from 'lucide-react';

const SplitPage = ({ user }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Group Form State
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    memberIds: []
  });

  // User Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]); // User objects

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setGroups(data.data || []);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/users/search?q=${searchQuery}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data || []);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/groups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...groupForm,
          memberIds: selectedMembers.map(m => m.id)
        })
      });

      if (response.ok) {
        loadGroups();
        setShowCreateModal(false);
        setGroupForm({ name: '', description: '', memberIds: [] });
        setSelectedMembers([]);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-emerald-500';
    if (balance < 0) return 'text-red-500';
    return 'text-slate-500';
  };

  const getBalanceText = (balance) => {
    if (balance > 0) return `You're owed $${balance.toLocaleString()}`;
    if (balance < 0) return `You owe $${Math.abs(balance).toLocaleString()}`;
    return 'Settled up';
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Split</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, {user?.firstName || 'User'}!
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 px-6"
        >
          <Plus className="w-5 h-5" />
          Create Group
        </button>
      </div>

      {/* Groups Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Groups</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="glass-card p-6 h-40 animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No groups yet</h3>
            <p className="text-slate-500 text-sm mb-6">Create a group to start splitting expenses with friends.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="text-primary-600 font-bold hover:underline"
            >
              Set up your first group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <div 
                key={group.id} 
                onClick={() => setSelectedGroup(group)}
                className="glass-card p-6 group cursor-pointer hover:scale-[1.02] transition-all border-b-4 border-transparent hover:border-primary-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{group.name}</h4>
                      <p className="text-xs text-slate-500">{group.lastExpenseSummary || 'No expenses yet'}</p>
                    </div>
                  </div>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <div className={`text-sm font-bold ${getBalanceColor(group.myBalance)}`}>
                      {getBalanceText(group.myBalance)}
                    </div>
                    <div className="flex -space-x-2">
                      {group.members?.map((m, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center overflow-hidden">
                          {m.profilePicture ? (
                            <img src={m.profilePicture} alt={m.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      ))}
                      {group.memberCount > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          +{group.memberCount - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-slate-400 group-hover:text-primary-500 transition-colors">
                    View Details <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Activity</h2>
          <button className="btn-secondary text-xs px-3 py-1.5">View All</button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Placeholder activity items based on design */}
          <div className="glass-card p-4 flex items-center gap-4 hover:bg-white/80 transition-colors">
             <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
             </div>
             <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  <span className="font-bold">Amit</span> split "Cab Ride" in <span className="font-bold">Europe Trip</span>
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 2 hours ago
                </p>
             </div>
             <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">$15.00</p>
                <p className="text-[10px] text-slate-500">Total $45.00</p>
             </div>
          </div>
          
          <div className="glass-card p-4 flex items-center gap-4 hover:bg-white/80 transition-colors">
             <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
             </div>
             <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  You settled up with <span className="font-bold">Priya</span>
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 1 day ago
                </p>
             </div>
             <div className="text-right text-emerald-500">
                <p className="text-sm font-bold">+$25.00</p>
             </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      {!selectedGroup && (
        <button 
          onClick={() => {
            // If we have groups, default to adding to the first one
            if (groups.length > 0) {
              setSelectedGroup(groups[0]);
              setShowAddExpenseModal(true);
            } else {
              setShowCreateModal(true);
            }
          }}
          className="fixed bottom-8 right-8 flex items-center gap-2 bg-primary-600 text-white px-6 py-4 rounded-3xl shadow-2xl shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all z-20 font-bold"
        >
          <Plus className="w-6 h-6" />
          Add Expense
        </button>
      )}

      {/* Group Detail Overlay */}
      {selectedGroup && !showAddExpenseModal && (
        <GroupDetail 
          group={selectedGroup} 
          onClose={() => {
            setSelectedGroup(null);
            loadGroups();
          }} 
          onAddExpense={() => setShowAddExpenseModal(true)}
        />
      )}

      {/* Add Shared Expense Modal */}
      {showAddExpenseModal && selectedGroup && (
        <AddExpenseModal 
          group={selectedGroup}
          onClose={() => setShowAddExpenseModal(false)}
          onSuccess={() => {
            setShowAddExpenseModal(false);
            loadGroups();
          }}
        />
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Group</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Group Name</label>
                <input 
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="e.g. Europe Trip, Roommates"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Members</label>
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Search by name or email"
                  />
                  
                  {searchResults.length > 0 && searchQuery.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-10 overflow-hidden">
                      {searchResults.map(result => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => {
                            if (!selectedMembers.find(m => m.id === result.id)) {
                              setSelectedMembers([...selectedMembers, result]);
                            }
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                          className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600">
                            {result.profilePicture ? (
                              <img src={result.profilePicture} alt={result.firstName} className="w-full h-full rounded-full" />
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{result.firstName} {result.lastName}</p>
                            <p className="text-xs text-slate-500">{result.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-bold flex items-center gap-1">
                    You (Admin)
                  </div>
                  {selectedMembers.map(member => (
                    <div key={member.id} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-2">
                      {member.firstName}
                      <button 
                        type="button"
                        onClick={() => setSelectedMembers(selectedMembers.filter(m => m.id !== member.id))}
                        className="p-0.5 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={selectedMembers.length === 0}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/30 hover:shadow-primary-600/40 disabled:opacity-50 transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const GroupDetail = ({ group: initialGroup, onClose, onAddExpense }) => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettleModal, setShowSettleModal] = useState(false);

  const loadGroupDetails = useCallback(async () => {
    // ... existing loading logic ...
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/groups/${initialGroup.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setGroup(data.data);
      }
    } catch (error) {
      console.error('Error loading group details:', error);
    } finally {
      setLoading(false);
    }
  }, [initialGroup.id]);

  useEffect(() => {
    loadGroupDetails();
  }, [loadGroupDetails]);

  const handleSettleSubmit = async (toUserId, amount) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/groups/${group.id}/settle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, toUserId })
      });
      if (response.ok) {
        setShowSettleModal(false);
        loadGroupDetails();
      }
    } catch (error) {
      console.error('Error settling balance:', error);
    }
  };

  if (loading) return null;
  if (!group) return <div className="p-12 text-center">Group not found</div>;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 animate-fade-in overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button 
                onClick={() => setShowSettleModal(true)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
               <CreditCard className="w-4 h-4" /> Settle Up
            </button>
            <button onClick={onAddExpense} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
               <Plus className="w-4 h-4" /> Add Expense
            </button>
          </div>
        </div>

        <div className="space-y-2">
           <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{group.name}</h1>
           <p className="text-slate-500">{group.description || 'Manage shared expenses and balances'}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="glass-card p-6 border-l-4 border-primary-500">
              <p className="text-sm text-slate-500 mb-1">Your Balance</p>
              <h3 className={`text-2xl font-bold ${group.myBalance > 0 ? 'text-emerald-500' : group.myBalance < 0 ? 'text-red-500' : 'text-slate-700'}`}>
                {group.myBalance > 0 ? `+ $${group.myBalance.toLocaleString()}` : group.myBalance < 0 ? `- $${Math.abs(group.myBalance).toLocaleString()}` : 'Settled'}
              </h3>
           </div>
           <div className="glass-card p-6">
              <p className="text-sm text-slate-500 mb-1">Total Expenses</p>
              <h3 className="text-2xl font-bold text-slate-700 dark:text-white">
                ${group.expenses?.reduce((sum, e) => sum + (e.description !== 'Settlement' ? e.amount : 0), 0).toLocaleString()}
              </h3>
           </div>
           <div className="glass-card p-6">
              <p className="text-sm text-slate-500 mb-1">Members</p>
              <h3 className="text-2xl font-bold text-slate-700 dark:text-white">{group.members?.length}</h3>
           </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-4">
           <h2 className="text-xl font-bold text-slate-900 dark:text-white">Expenses</h2>
           {group.expenses?.length === 0 ? (
             <div className="p-12 text-center text-slate-400">No expenses recorded yet.</div>
           ) : (
             <div className="space-y-3">
               {group.expenses.map(expense => (
                 <div key={expense.id} className="glass-card p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${expense.description === 'Settlement' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                          {expense.description === 'Settlement' ? <CreditCard className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                       </div>
                       <div>
                          <p className="font-bold text-slate-900 dark:text-white">{expense.description}</p>
                          <p className="text-xs text-slate-500">
                            Paid by <span className="font-medium">{expense.payerName}</span> • {new Date(expense.expenseDate).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-slate-900 dark:text-white">${expense.amount.toLocaleString()}</p>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {showSettleModal && (
        <SettleModal 
          group={group} 
          onClose={() => setShowSettleModal(false)}
          onSettle={handleSettleSubmit}
        />
      )}
    </div>
  );
};

const SettleModal = ({ group, onClose, onSettle }) => {
  const [selectedUser, setSelectedUser] = useState(group.members[0]?.id || '');
  const [amount, setAmount] = useState('');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Record Settlement</h3>
           <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>
        <div className="p-8 space-y-6">
           <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pay To</label>
              <select 
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
              >
                 {group.members.map(m => (
                   <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                 ))}
              </select>
           </div>
           <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Amount</label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">$</span>
                 <input 
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-lg font-bold"
                  placeholder="0.00"
                />
              </div>
           </div>
           <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 px-4 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => onSettle(selectedUser, parseFloat(amount))}
                disabled={!amount || isNaN(amount)}
                className="flex-1 px-4 py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/30 hover:shadow-primary-600/40 disabled:opacity-50 transition-all"
              >
                Record Payment
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const AddExpenseModal = ({ group, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Other',
    expenseDate: new Date().toISOString().split('T')[0],
    payerId: group.members[0]?.id || '',
    notes: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount)) return;

    // Calculate even split
    const amountNum = parseFloat(form.amount);
    const splitAmount = amountNum / group.members.length;
    const splits = group.members.map(m => ({
      userId: m.id,
      amount: splitAmount
    }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/groups/${group.id}/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...form, splits })
      });

      if (response.ok) onSuccess();
    } catch (error) {
      console.error('Error saving split expense:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
           <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Add Expense to {group.name}</h3>
           <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full">
              <X className="w-6 h-6" />
           </button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
           <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <input 
                  type="text"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-lg"
                  placeholder="What was this for?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Amount</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">$</span>
                   <input 
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                    className="w-full pl-9 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-lg font-bold"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Paid By</label>
                <select 
                  value={form.payerId}
                  onChange={e => setForm({...form, payerId: e.target.value})}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                >
                   {group.members?.map(m => (
                     <option key={m.id} value={m.id}>{m.firstName === group.createdBy ? 'You' : m.firstName}</option>
                   ))}
                </select>
              </div>
           </div>

           <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/20">
              <p className="text-sm font-bold text-primary-700 dark:text-primary-400 mb-1">Splitting Evenly</p>
              <p className="text-xs text-primary-600/80 dark:text-primary-400/80">
                Each of the {group.members?.length} members will owe ${form.amount ? (parseFloat(form.amount) / group.members.length).toFixed(2) : '0.00'}
              </p>
           </div>

           <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 px-4 py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/30 hover:shadow-primary-600/40 hover:-translate-y-1 transition-all"
              >
                Save Expense
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default SplitPage;

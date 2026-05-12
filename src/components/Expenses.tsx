import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingDown,
  Download,
  X,
  ArrowUpRight,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { dbService } from '../services/dbService';
import { Expense } from '../types';

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // New expense form state
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'Miscellaneous' as any,
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'paid' as 'paid' | 'pending'
  });

  const categories = [
    'Inventory', 
    'Utilities', 
    'Payroll', 
    'Rent', 
    'Maintenance', 
    'Marketing', 
    'Taxes', 
    'Insurance', 
    'Miscellaneous'
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    setLoading(true);
    try {
      const data = await dbService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.addExpense(newExpense);
      setIsModalOpen(false);
      setNewExpense({
        description: '',
        category: 'Miscellaneous',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'paid'
      });
      fetchExpenses();
    } catch (error: any) {
      console.error('Error adding expense:', error);
      const message = error?.message || 'Check your database connection.';
      alert(`Failed to log expense: ${message}`);
    }
  };

  const handleDelete = async (id: string, description: string) => {
    if (!window.confirm(`Are you sure you want to delete the expense for "${description}"?`)) return;
    
    try {
      await dbService.deleteExpense(id);
      fetchExpenses();
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-natural-800 tracking-tight font-display">Expense Ledger</h2>
          <p className="text-natural-500 font-medium">Detailed tracking of operational costs.</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-natural-200 rounded-xl text-natural-600 font-bold hover:bg-natural-50 transition-all shadow-sm">
            <Download className="h-4 w-4" />
            Statements
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-natural-600 hover:bg-natural-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-natural-600/20"
          >
            <Plus className="h-5 w-5" />
            Log Expense
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-natural-800/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-natural-100 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-natural-800 font-display">Log New Expense</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-natural-50 rounded-full text-natural-400 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-8 space-y-6 text-natural-800">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Description</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                  placeholder="e.g. Monthly Rent"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Category</label>
                  <select 
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value as any})}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Amount ($)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Date</label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Payment Status</label>
                  <select 
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    value={newExpense.status}
                    onChange={(e) => setNewExpense({...newExpense, status: e.target.value as 'paid' | 'pending'})}
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-natural-200 rounded-xl font-bold text-natural-500 hover:bg-natural-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-natural-600 text-white rounded-xl font-bold hover:bg-natural-700 transition-all shadow-lg shadow-natural-600/20"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[32px] border border-natural-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-natural-50 rounded-bl-[48px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="text-[10px] font-bold text-natural-400 uppercase tracking-widest mb-2 relative z-10">Total Expenses</p>
          <h3 className="text-3xl font-bold text-natural-800 font-display relative z-10">${totalExpenses.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-2 text-sage text-sm font-bold relative z-10">
            <TrendingDown className="h-4 w-4" />
            Business Overhead
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-natural-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rust/5 rounded-bl-[48px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="text-[10px] font-bold text-natural-400 uppercase tracking-widest mb-2 relative z-10">Pending Approval</p>
          <h3 className="text-3xl font-bold text-rust font-display relative z-10">${pendingAmount.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-2 text-natural-400 text-sm font-bold relative z-10">
             <AlertCircle className="h-4 w-4" />
             Awaiting payment
          </div>
        </div>
        <div className="bg-natural-600 p-8 rounded-[32px] shadow-xl shadow-natural-600/20 relative overflow-hidden group">
           <div className="relative z-10">
            <h3 className="text-[10px] font-bold text-natural-100 uppercase tracking-widest mb-2">Operating Efficiency</h3>
            <p className="text-3xl font-bold text-white font-display">Target 75%</p>
            <div className="mt-8 flex flex-col gap-2">
               <div className="flex justify-between text-[10px] font-bold text-natural-100 uppercase tracking-widest">
                  <span>Usage Stability</span>
                  <span>Normal</span>
               </div>
               <div className="h-2 w-full bg-natural-700 rounded-full overflow-hidden">
                  <div className="h-full bg-sage rounded-full transition-all duration-1000 w-[65%]" />
               </div>
            </div>
           </div>
           <ArrowUpRight className="absolute -right-4 -top-4 h-32 w-32 text-white opacity-5" />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-natural-200 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-natural-100 bg-natural-50/50 flex items-center justify-between gap-6">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-natural-300" />
             <input 
               type="text" 
               placeholder="Search expenses..." 
               className="w-full pl-12 pr-4 py-2.5 bg-white border border-natural-200 rounded-xl outline-none text-sm font-medium focus:border-natural-600 transition-all text-natural-800"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           <button className="p-2.5 hover:bg-natural-50 rounded-xl text-natural-400 transition-all"><Filter className="h-5 w-5" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-natural-400 bg-natural-50/30 border-b border-natural-100">
                <th className="px-8 py-5 font-bold">Category</th>
                <th className="px-8 py-5 font-bold">Item Description</th>
                <th className="px-8 py-5 font-bold">Logged Date</th>
                <th className="px-8 py-5 font-bold text-right">Debit Amount</th>
                <th className="px-8 py-5 font-bold text-center">Status</th>
                <th className="px-8 py-5 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-100">
              {loading ? (
                <tr>
                   <td colSpan={6} className="px-8 py-20 text-center text-natural-400 font-medium">
                      Loading expenses...
                   </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-20 text-center text-natural-400 font-medium">
                      No expenses found.
                   </td>
                </tr>
              ) : filteredExpenses.map((expense) => (
                <tr key={expense.id} className="text-sm hover:bg-natural-50/50 transition-colors cursor-pointer group">
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-lg bg-natural-100 text-natural-600 text-[10px] font-bold uppercase tracking-widest">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-bold text-natural-800 text-base">{expense.description}</div>
                  </td>
                  <td className="px-8 py-5 text-natural-500 font-medium">{expense.date}</td>
                  <td className="px-8 py-5 text-right font-bold text-natural-800 font-display text-lg">
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={cn(
                        "inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest",
                        expense.status === 'paid' ? "bg-sage/10 text-sage" : "bg-rust/10 text-rust"
                      )}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => handleDelete(expense.id, expense.description)}
                      className="p-2 text-natural-300 hover:text-rust hover:bg-rust/5 rounded-lg transition-all"
                      title="Delete Expense"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

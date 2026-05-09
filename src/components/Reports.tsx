import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Download, 
  FileText, 
  Table as TableIcon, 
  Presentation,
  Calendar,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';

const revenueData = [
  { month: 'Jan', sales: 45000, expenses: 32000, profit: 13000 },
  { month: 'Feb', sales: 52000, expenses: 34000, profit: 18000 },
  { month: 'Mar', sales: 48000, expenses: 31000, profit: 17000 },
  { month: 'Apr', sales: 61000, expenses: 38000, profit: 23000 },
  { month: 'May', sales: 55000, expenses: 35000, profit: 20000 },
  { month: 'Jun', sales: 67000, expenses: 40000, profit: 27000 },
];

const categoryData = [
  { name: 'Dairy', value: 35 },
  { name: 'Produce', value: 25 },
  { name: 'Bakery', value: 15 },
  { name: 'Meat', value: 20 },
  { name: 'Canned', value: 5 },
];

export function Reports() {
  const COLORS = ['#5A5A40', '#8A9A5B', '#BC6C25', '#D4A373', '#7A7A6E'];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-natural-800 tracking-tight font-display">Performance Reports</h2>
          <p className="text-natural-500 font-medium">In-depth analysis of your store's financial health.</p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-2 bg-white border border-natural-200 rounded-xl px-4 py-2 text-sm font-bold text-natural-600 shadow-sm">
             <Calendar className="h-4 w-4 text-natural-400" />
             Jan 1 - Jun 30, 2024
           </div>
           <button className="inline-flex items-center gap-2 bg-natural-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-natural-600/20 hover:bg-natural-700 transition-all">
             <Download className="h-4 w-4" />
             Export PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-natural-200 shadow-sm transition-all hover:shadow-md">
           <div className="flex items-center justify-between mb-10">
              <div>
                 <h3 className="text-2xl font-bold text-natural-800 font-display">Revenue vs Profit</h3>
                 <p className="text-sm text-natural-400 font-semibold tracking-wide uppercase">Year-to-date performance</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="h-3 w-3 rounded-full bg-natural-600 shadow-sm" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-natural-500">Sales</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-3 w-3 rounded-full bg-sage shadow-sm" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-natural-500">Profit</span>
                </div>
              </div>
           </div>
           <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E6DE" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#A8A899', fontSize: 11, fontWeight: 600}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#A8A899', fontSize: 11, fontWeight: 600}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: '#2D2D24', color: '#fff', padding: '16px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="sales" stroke="#5A5A40" strokeWidth={5} dot={{ r: 5, fill: '#5A5A40', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 9, stroke: '#5A5A40', strokeWidth: 3 }} />
                    <Line type="monotone" dataKey="profit" stroke="#8A9A5B" strokeWidth={5} dot={{ r: 5, fill: '#8A9A5B', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 9, stroke: '#8A9A5B', strokeWidth: 3 }} />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-natural-200 shadow-sm flex flex-col">
           <h3 className="text-xl font-bold text-natural-800 mb-2 font-display">Sales Categories</h3>
           <p className="text-xs text-natural-400 font-bold uppercase tracking-widest mb-8">Revenue Distribution</p>
           <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={categoryData}
                       cx="50%"
                       cy="50%"
                       innerRadius={70}
                       outerRadius={100}
                       paddingAngle={6}
                       dataKey="value"
                    >
                       {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                       ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#2D2D24', color: '#fff' }}
                    />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-8 space-y-4">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between group cursor-default">
                   <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-xs font-bold text-natural-500 uppercase tracking-widest group-hover:text-natural-800 transition-colors">{item.name}</span>
                   </div>
                   <span className="text-sm font-bold text-natural-800 font-mono tracking-tighter">{item.value}%</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
           { label: 'Avg Ticket Size', value: '$84.20', trend: '+2.1%', sub: 'vs last month', icon: FileText, color: 'bg-natural-600' },
           { label: 'Customer Retention', value: '72%', trend: '+5.4%', sub: 'of active users', icon: Presentation, color: 'bg-sage' },
           { label: 'COGS Ratio', value: '0.62', trend: '-0.02', sub: 'efficiency metric', icon: TableIcon, color: 'bg-rust' },
           { label: 'Inventory Turnover', value: '14.5x', trend: '+1.2x', sub: 'annualized', icon: BarChart, color: 'bg-tan' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-7 rounded-[32px] border border-natural-200 shadow-sm group hover:border-natural-400 transition-all hover:-translate-y-1">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-black/5 transition-transform group-hover:scale-110", stat.color)}>
                 <stat.icon className="h-6 w-6" />
              </div>
              <h4 className="text-[10px] font-bold text-natural-400 uppercase tracking-widest">{stat.label}</h4>
              <p className="text-3xl font-bold text-natural-800 mt-1 font-display tracking-tight leading-none">{stat.value}</p>
              <div className="mt-5 flex items-center justify-between pt-4 border-t border-natural-100">
                 <span className="text-sage text-xs font-bold">{stat.trend}</span>
                 <span className="text-natural-400 text-[9px] uppercase font-bold tracking-widest">{stat.sub}</span>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}

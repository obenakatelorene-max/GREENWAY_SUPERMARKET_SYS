import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  AlertTriangle,
  Package2,
  CheckCircle2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '../lib/utils';
import { dbService } from '../services/dbService';

const data = [
  { name: 'Mon', revenue: 4000, profit: 2400 },
  { name: 'Tue', revenue: 3000, profit: 1398 },
  { name: 'Wed', revenue: 2000, profit: 9800 },
  { name: 'Thu', revenue: 2780, profit: 3908 },
  { name: 'Fri', revenue: 1890, profit: 4800 },
  { name: 'Sat', revenue: 2390, profit: 3800 },
  { name: 'Sun', revenue: 3490, profit: 4300 },
];

function StatCard({ title, value, change, trend, icon: Icon, color, loading }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-natural-200 shadow-sm transition-all hover:shadow-md hover:border-natural-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl transition-colors", color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {!loading && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-bold",
            trend === 'up' ? "text-sage" : "text-rust"
          )}>
            {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {change}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-xs font-bold text-natural-400 uppercase tracking-wider">{title}</h3>
        {loading ? (
          <div className="h-8 w-24 bg-natural-100 animate-pulse rounded-lg mt-1" />
        ) : (
          <p className="text-3xl font-bold text-natural-800 mt-1 font-display leading-none">{value}</p>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    profit: 0,
    expenses: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await dbService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-natural-800 tracking-tight font-display">Daily Overview</h2>
          <p className="text-natural-500 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} • Live Tracking</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-natural-200 rounded-xl text-sm font-bold text-natural-600 hover:bg-natural-50 transition-colors">Export CSV</button>
          <button className="px-6 py-2 bg-natural-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-natural-600/20 hover:bg-natural-700 transition-all">Generate Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+12.5%" 
          trend="up" 
          icon={DollarSign}
          color="bg-natural-600 group-hover:bg-natural-700"
          loading={loading}
        />
        <StatCard 
          title="Estimated Profit" 
          value={`$${stats.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+8.2%" 
          trend="up" 
          icon={TrendingUp}
          color="bg-sage group-hover:bg-sage/90"
          loading={loading}
        />
        <StatCard 
          title="Logged Expenses" 
          value={`$${stats.expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+4.1%" 
          trend="up" 
          icon={TrendingDown}
          color="bg-rust group-hover:bg-rust/90"
          loading={loading}
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats.lowStockCount.toString()}
          change={stats.lowStockCount > 0 ? "Needs Restock" : "Healthly"} 
          trend={stats.lowStockCount > 0 ? "down" : "up"} 
          icon={AlertTriangle}
          color="bg-tan group-hover:bg-tan/90"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-natural-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-natural-800 font-display">Sales Trend</h3>
              <p className="text-sm text-natural-400 font-medium tracking-wide">Last 7 days performance (Demo)</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-natural-600 rounded-full"></div>
                <span className="text-[10px] font-bold text-natural-500 uppercase tracking-widest">Revenue</span>
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#5A5A40" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E6DE" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A8A899', fontSize: 11, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#A8A899', fontSize: 11, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: '#2D2D24', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#5A5A40', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#5A5A40" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-natural-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-natural-800 mb-6 font-display">Inventory Status</h3>
          <div className="space-y-6">
            {[
              { name: 'Total Products', value: '248 Items', color: 'text-natural-800', bg: 'bg-natural-50', icon: Package2 },
              { name: 'Out of Stock', value: `${stats.lowStockCount} Items`, color: 'text-rust', bg: 'bg-rust/10', icon: AlertTriangle },
              { name: 'Stock Surplus', value: '12 Items', color: 'text-sage', bg: 'bg-sage/10', icon: CheckCircle2 }
            ].map((alert, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110", alert.bg)}>
                  <AlertTriangle className={cn("h-6 w-6", alert.color)} />
                </div>
                <div>
                  <div className="text-sm font-bold text-natural-800">{alert.name}</div>
                  <div className={cn("text-[11px] font-bold uppercase tracking-wider", alert.color)}>{alert.value}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-auto w-full py-4 bg-natural-50 border border-natural-200 rounded-2xl text-xs font-bold text-natural-600 uppercase tracking-widest hover:bg-natural-100 transition-colors">
            Full Stock List
          </button>
        </div>
      </div>
    </div>
  );
}


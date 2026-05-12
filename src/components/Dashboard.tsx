import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  AlertTriangle,
  Package2,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone
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
import { Sale } from '../types';
import { format } from 'date-fns';

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
        {!loading && change && (
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

const PaymentIcon = ({ method }: { method: Sale['payment_method'] }) => {
  switch (method) {
    case 'cash': return <Banknote className="h-4 w-4" />;
    case 'card': return <CreditCard className="h-4 w-4" />;
    case 'mobile_money': return <Smartphone className="h-4 w-4" />;
  }
};

export function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    profit: 0,
    expenses: 0,
    lowStockCount: 0
  });
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, salesData, topData, lowData] = await Promise.all([
          dbService.getDashboardStats(),
          dbService.getRecentSales(5),
          dbService.getTopSellingProducts(5),
          dbService.getLowStockProducts()
        ]);
        setStats(statsData);
        setRecentSales(salesData);
        setTopProducts(topData);
        setLowStockProducts(lowData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-natural-800 tracking-tight font-display">Store Overview</h2>
          <p className="text-natural-500 font-medium">
            {format(new Date(), 'EEEE, MMMM do, yyyy')} • Active Dashboard
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Gross Revenue" 
          value={`$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+12.5%" 
          trend="up" 
          icon={DollarSign}
          color="bg-natural-800 group-hover:bg-black"
          loading={loading}
        />
        <StatCard 
          title="Net Profit" 
          value={`$${stats.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+8.2%" 
          trend="up" 
          icon={TrendingUp}
          color="bg-sage group-hover:bg-sage/90"
          loading={loading}
        />
        <StatCard 
          title="Operational Expenses" 
          value={`$${stats.expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={TrendingDown}
          color="bg-rust group-hover:bg-rust/90"
          loading={loading}
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats.lowStockCount.toString()}
          change={stats.lowStockCount > 0 ? "Action Required" : "Healthy Levels"} 
          trend={stats.lowStockCount > 0 ? "down" : "up"} 
          icon={AlertTriangle}
          color="bg-tan group-hover:bg-tan/90"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-natural-200 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-bold text-natural-800 font-display">Sales Performance</h3>
                <p className="text-sm text-natural-400 font-medium tracking-wide italic">Weekly revenue trends</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-natural-50 rounded-lg">
                  <div className="w-2 h-2 bg-natural-800 rounded-full"></div>
                  <span className="text-[10px] font-bold text-natural-500 uppercase tracking-widest">Revenue</span>
                </div>
              </div>
            </div>
            <div className="h-[320px] w-full min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0E8" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A8A899', fontSize: 11, fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#A8A899', fontSize: 11, fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: '#2D2D24', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ stroke: '#1A1A1A', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#1A1A1A" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-natural-200 shadow-sm">
              <h3 className="text-xl font-bold text-natural-800 mb-6 font-display">Top Selling Products</h3>
              <div className="space-y-6">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-natural-50 rounded-xl animate-pulse" />
                  ))
                ) : topProducts.length === 0 ? (
                  <div className="text-center py-4 text-natural-400 italic text-sm">No sales data recorded yet.</div>
                ) : topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-natural-50 flex items-center justify-center font-bold text-natural-400 group-hover:bg-natural-800 group-hover:text-white transition-colors">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-natural-800 group-hover:text-black transition-colors truncate max-w-[120px]">{p.name}</div>
                        <div className="text-[10px] font-bold text-natural-400 uppercase tracking-widest">{p.quantity} units sold</div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-sm text-natural-600">${p.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-natural-200 shadow-sm">
              <h3 className="text-xl font-bold text-natural-800 mb-6 font-display">Recent Transactions</h3>
              <div className="space-y-4">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-natural-50 rounded-xl animate-pulse" />
                  ))
                ) : recentSales.length === 0 ? (
                  <div className="text-center py-4 text-natural-400 italic text-sm">No transactions yet today.</div>
                ) : recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between group">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-natural-800 tracking-tight">#{sale.id.slice(-6).toUpperCase()}</span>
                      <span className="text-[9px] text-natural-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <PaymentIcon method={sale.payment_method} />
                        {sale.payment_method.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-natural-800">${sale.total_amount.toFixed(2)}</div>
                      <div className="text-[9px] font-bold text-sage uppercase tracking-widest">+${sale.profit.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-natural-200 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-natural-800 mb-6 font-display">Inventory Alerts</h3>
            <div className="space-y-6">
              {loading ? (
                 [...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 bg-natural-50 rounded-2xl animate-pulse" />
                ))
              ) : lowStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-sage" />
                  </div>
                  <p className="text-sm font-bold text-natural-800">All Stock Healthy</p>
                  <p className="text-[10px] text-natural-400 uppercase tracking-widest mt-1">No critical shortages.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {lowStockProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-rust/5 rounded-2xl border border-rust/10 group hover:bg-rust/10 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-rust/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-5 w-5 text-rust" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-natural-800 truncate">{p.name}</div>
                        <div className="text-[10px] font-bold text-rust uppercase tracking-widest">
                          {p.stock_quantity} remaining • Min: {p.min_stock_level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {lowStockProducts.length > 0 && (
              <button className="mt-8 w-full py-4 bg-rust text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rust/90 transition-all shadow-lg shadow-rust/10 mt-auto">
                Restock Now
              </button>
            )}
          </div>
          
          <div className="bg-natural-800 p-8 rounded-[32px] text-white flex flex-col relative overflow-hidden group">
             <div className="relative z-10">
                <h3 className="text-xl font-bold font-display mb-2 text-white">Pro Analytics</h3>
                <p className="text-xs text-natural-400 mb-6 leading-relaxed">Predict customer demand with our advanced AI forecasting engine.</p>
                <div className="flex items-baseline gap-1 mb-8">
                   <span className="text-3xl font-bold text-white">$29</span>
                   <span className="text-xs text-natural-400 font-bold uppercase tracking-widest text-white/60">/ Month</span>
                </div>
                <button className="w-full py-4 bg-white text-natural-800 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-natural-100 transition-colors">
                  Enable Prediction
                </button>
             </div>
             <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-natural-700/20 rounded-full blur-3xl group-hover:bg-natural-500/20 transition-colors"></div>
          </div>
        </div>
      </div>
    </div>
  );
}


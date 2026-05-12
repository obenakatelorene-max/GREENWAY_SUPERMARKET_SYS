import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  ArrowRight,
  ChevronRight,
  History,
  Banknote,
  CreditCard,
  Smartphone,
  Eye,
  X,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { dbService } from '../services/dbService';
import { Sale, SaleItem } from '../types';
import { format } from 'date-fns';

export function Transactions() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [summaries, setSummaries] = useState({ today: 0, week: 0, month: 0 });

  useEffect(() => {
    fetchSales();
    fetchSummaries();
  }, []);

  async function fetchSummaries() {
    const data = await dbService.getTransactionSummaries();
    setSummaries(data);
  }

  async function fetchSales() {
    setLoading(true);
    try {
      const data = await dbService.getSales();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleViewDetails = async (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailOpen(true);
    try {
      const items = await dbService.getSaleItems(sale.id);
      setSaleItems(items);
    } catch (error) {
      console.error('Error fetching sale items:', error);
      setSaleItems([]);
    }
  };

  const getPaymentIcon = (method: Sale['payment_method']) => {
    switch (method) {
      case 'cash': return Banknote;
      case 'card': return CreditCard;
      default: return Smartphone;
    }
  };

  const filteredSales = sales.filter(s => 
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-natural-800 tracking-tight font-display">Transaction History</h2>
          <p className="text-natural-500 font-medium">Review and audit past sales and receipts.</p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-2 bg-white border border-natural-200 rounded-xl px-4 py-2 text-sm font-bold text-natural-600 shadow-sm text-nowrap">
             <Calendar className="h-4 w-4 text-natural-400" />
             {format(new Date(), 'MMMM dd, yyyy')}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Today's Revenue", value: summaries.today, sub: "Daily Major", color: "bg-natural-800" },
          { label: "Weekly Revenue", value: summaries.week, sub: "Weekly Performance", color: "bg-sage" },
          { label: "Monthly Revenue", value: summaries.month, sub: "Monthly Volume", color: "bg-tan" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[28px] border border-natural-200 shadow-sm group hover:-translate-y-1 transition-all">
            <h4 className="text-[10px] font-bold text-natural-400 uppercase tracking-widest">{stat.label}</h4>
            <p className="text-2xl font-bold text-natural-800 mt-1 font-display">${stat.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <div className="mt-4 pt-4 border-t border-natural-50 text-[9px] font-bold text-natural-400 uppercase tracking-widest">
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-natural-300" />
          <input 
            type="text" 
            placeholder="Search by Transaction ID..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-natural-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 transition-all font-medium text-sm text-natural-800 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-natural-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-natural-400 bg-natural-50/50 border-b border-natural-200">
                <th className="px-8 py-5 font-bold">#</th>
                <th className="px-8 py-5 font-bold">Transaction ID</th>
                <th className="px-8 py-5 font-bold">Timestamp</th>
                <th className="px-8 py-5 font-bold">Method</th>
                <th className="px-8 py-5 font-bold">Discounts</th>
                <th className="px-8 py-5 font-bold">Tax</th>
                <th className="px-8 py-5 font-bold text-right">Total Amount</th>
                <th className="px-8 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-100">
              {loading ? (
                <tr>
                   <td colSpan={7} className="px-8 py-20 text-center text-natural-400 font-medium">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-natural-600"></div>
                        Loading history...
                      </div>
                   </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                   <td colSpan={7} className="px-8 py-20 text-center text-natural-400 font-medium font-bold uppercase tracking-widest">
                      No transactions found.
                   </td>
                </tr>
              ) : filteredSales.map((sale, index) => {
                const PaymentIcon = getPaymentIcon(sale.payment_method);
                const createdAtDate = sale.created_at ? (typeof sale.created_at === 'string' ? new Date(sale.created_at) : (sale.created_at as any).toDate?.() || new Date()) : new Date();

                return (
                  <tr key={sale.id} className="text-sm hover:bg-natural-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="font-bold text-natural-400">{index + 1}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-mono font-bold text-natural-800 uppercase tracking-tighter italic">#{sale.id.slice(-10)}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-natural-700">{format(createdAtDate, 'MMM dd, yyyy')}</span>
                        <span className="text-[10px] text-natural-400 font-bold uppercase">{format(createdAtDate, 'hh:mm a')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-natural-100 flex items-center justify-center text-natural-600">
                           <PaymentIcon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-natural-600 uppercase tracking-widest">{sale.payment_method.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className={cn("font-mono font-bold", sale.discount_amount > 0 ? "text-sage" : "text-natural-300")}>
                         {sale.discount_amount > 0 ? `-$${sale.discount_amount.toFixed(2)}` : '$0.00'}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <span className="font-mono font-bold text-rust">
                         +${sale.tax_amount.toFixed(2)}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <span className="text-base font-bold text-natural-800 font-mono tracking-tight">
                         ${sale.total_amount.toFixed(2)}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                         onClick={() => handleViewDetails(sale)}
                         className="p-2.5 hover:bg-natural-800 hover:text-white rounded-xl text-natural-400 transition-all shadow-sm active:scale-95"
                      >
                         <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isDetailOpen && selectedSale && (
        <div className="fixed inset-0 bg-natural-800/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:bg-white print:p-0 print:static">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:rounded-none print:max-w-none">
            <div className="p-8 border-b border-natural-100 flex items-center justify-between print:pb-4">
               <div>
                  <h3 className="text-2xl font-bold text-natural-800 font-display">Receipt Details</h3>
                  <p className="text-xs text-natural-400 font-bold uppercase tracking-widest mt-1">TX: #{selectedSale.id}</p>
               </div>
               <button 
                 onClick={() => setIsDetailOpen(false)}
                 className="p-2 hover:bg-natural-50 rounded-full text-natural-400 transition-colors print:hidden"
               >
                 <X className="h-6 w-6" />
               </button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide print:max-h-none print:overflow-visible">
               <div className="space-y-4">
                  <div className="text-[10px] font-bold text-natural-400 uppercase tracking-widest border-b border-natural-100 pb-2">Line Items</div>
                  <div className="space-y-4">
                    {saleItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                         <div className="flex flex-col">
                            <span className="font-bold text-natural-800">{item.product_name}</span>
                            <span className="text-[10px] text-natural-400 font-bold uppercase">
                               ${item.unit_price.toFixed(2)} x {item.quantity}
                            </span>
                         </div>
                         <div className="font-mono font-bold text-natural-800">
                            ${(item.unit_price * item.quantity).toFixed(2)}
                         </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-3 pt-6 border-t border-dashed border-natural-200">
                  <div className="flex justify-between items-center text-xs font-bold text-natural-400 uppercase tracking-wider">
                     <span>Subtotal</span>
                     <span className="font-mono text-natural-800">${selectedSale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-natural-400 uppercase tracking-wider">
                     <span>Regulatory Tax</span>
                     <span className="font-mono text-rust">+${selectedSale.tax_amount.toFixed(2)}</span>
                  </div>
                  {selectedSale.discount_amount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-natural-400 uppercase tracking-wider text-sage">
                       <span>Total Discount</span>
                       <span className="font-mono">-${selectedSale.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-natural-100">
                     <span className="text-xl font-bold text-natural-800 font-display">Paid Total</span>
                     <span className="text-2xl font-bold text-natural-800 font-mono tracking-tight">
                        ${selectedSale.total_amount.toFixed(2)}
                     </span>
                  </div>
               </div>

               <div className="bg-natural-50 rounded-2xl p-6 flex flex-col gap-4 text-center">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-bold text-natural-400 uppercase tracking-widest">Payment Method</span>
                     <span className="font-bold text-natural-800 uppercase tracking-wider flex items-center justify-center gap-2">
                        {selectedSale.payment_method.replace('_', ' ')}
                     </span>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-natural-50/50 flex gap-4 print:hidden">
               <button 
                  className="flex-1 py-4 bg-natural-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-natural-800/20 active:scale-95 transition-all"
                  onClick={() => window.print()}
               >
                  <FileText className="h-4 w-4" />
                  Print Invoice
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

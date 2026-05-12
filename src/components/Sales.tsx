import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  CreditCard, 
  Banknote, 
  Smartphone,
  CheckCircle2,
  PackageSearch,
  ShoppingCart,
  Barcode,
  Tag,
  Printer,
  ChevronRight,
  X,
  Command
} from 'lucide-react';
import { cn } from '../lib/utils';
import { dbService } from '../services/dbService';
import { Product, Sale } from '../types';
import { format } from 'date-fns';

export function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [search, setSearch] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSaleId, setLastSaleId] = useState('');
  const [lastTotal, setLastTotal] = useState(0);
  const [lastItems, setLastItems] = useState<{product: Product, quantity: number}[]>([]);
  const [lastSubtotal, setLastSubtotal] = useState(0);
  const [lastTax, setLastTax] = useState(0);
  const [lastDiscount, setLastDiscount] = useState(0);
  const [lastDate, setLastDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<Sale['payment_method']>('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const categories = ['Produce', 'Dairy', 'Bakery', 'Canned Goods', 'General', 'Beverages', 'Frozen'];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const data = await dbService.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search with '/'
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Process Sale with F2
      if (e.key === 'F2') {
        e.preventDefault();
        handleCheckout();
      }
      // Toggle payment methods
      if (e.ctrlKey && e.key === '1') setPaymentMethod('cash');
      if (e.ctrlKey && e.key === '2') setPaymentMethod('card');
      if (e.ctrlKey && e.key === '3') setPaymentMethod('mobile_money');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, paymentMethod]);

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock_quantity) } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, Math.min(item.quantity + delta, item.product.stock_quantity));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const tax = subtotal * 0.15; // Standard 15% tax example
  const totalBeforeDiscount = subtotal + tax;
  const total = Math.max(0, totalBeforeDiscount - discountAmount);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                           p.sku.toLowerCase().includes(search.toLowerCase()) ||
                           p.barcode?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const saleResult = await dbService.processSale(cart, paymentMethod, discountAmount);
      setLastSaleId(saleResult.id);
      setLastTotal(saleResult.total_amount);
      setLastItems([...cart]);
      setLastSubtotal(subtotal);
      setLastTax(tax);
      setLastDiscount(discountAmount);
      setLastDate(new Date());
      setIsSuccess(true);
      setCart([]);
      setDiscountAmount(0);
    } catch (error: any) {
      console.error('Checkout error:', error);
      const message = error?.message || 'Please check your connection and stock levels.';
      alert(`Checkout failed: ${message}`);
    }
  };

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredProducts.length === 1) {
      addToCart(filteredProducts[0]);
      setSearch('');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (isSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-start overflow-y-auto pt-10 pb-20 animate-in zoom-in duration-500 scrollbar-hide">
        {/* On-screen success UI */}
        <div className="print:hidden flex flex-col items-center">
          <div className="w-24 h-24 bg-sage/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-12 w-12 text-sage" />
          </div>
          <h2 className="text-4xl font-bold text-natural-800 mb-2 font-display text-center">Sale Finalized</h2>
          <p className="text-natural-500 mb-10 font-medium text-center">Payment received via {paymentMethod.replace('_', ' ')}.</p>
          
          <div className="bg-white p-10 rounded-[48px] border border-dashed border-natural-300 w-96 text-center space-y-6 shadow-2xl relative">
             <div className="space-y-1">
               <div className="text-[10px] text-natural-400 font-bold tracking-widest uppercase mb-4">Total Amount Paid</div>
               <div className="text-5xl font-display font-bold text-natural-800 tracking-tighter">${lastTotal.toFixed(2)}</div>
             </div>
             <div className="pt-6 border-t border-natural-50 font-mono text-[11px] text-natural-400 font-bold uppercase tracking-widest">
                TX: {lastSaleId.toUpperCase()}
             </div>
             
             <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F9F9F7] rounded-full ring-1 ring-natural-200"></div>
             <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F9F9F7] rounded-full ring-1 ring-natural-200"></div>
          </div>

          <div className="flex gap-4 mt-12 w-full max-w-sm px-4">
             <button 
               onClick={() => setIsSuccess(false)}
               className="flex-1 py-4 border border-natural-200 rounded-2xl font-bold text-natural-600 hover:bg-natural-50 transition-colors shadow-sm"
             >
               New Transaction
             </button>
             <button 
               onClick={handlePrintReceipt}
               className="flex-1 py-4 bg-natural-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-natural-800/20 active:scale-95 transition-transform"
             >
               <Printer className="h-5 w-5" />
               Print Receipt
             </button>
          </div>
        </div>

        {/* Printable Receipt - Hidden on screen, visible on print */}
        <div className="hidden print:block fixed inset-0 bg-white z-[100] p-8 font-mono text-black">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold font-display uppercase tracking-wider">GREENWAY SUPERMARKET</h1>
              <p className="text-xs">123 Fresh Way, Commerce City</p>
              <p className="text-xs">Tel: (555) 0123-4567</p>
            </div>

            <div className="border-t border-b border-black py-2 text-[10px] flex justify-between uppercase">
              <span>Date: {format(lastDate, 'MM/dd/yyyy')}</span>
              <span>Time: {format(lastDate, 'HH:mm:ss')}</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-4 font-bold text-[10px] border-b border-black pb-1 uppercase">
                <span className="col-span-2">Item</span>
                <span className="text-right">Qty/Price</span>
                <span className="text-right">Total</span>
              </div>
              <div className="space-y-2">
                {lastItems.map((item, i) => (
                  <div key={i} className="grid grid-cols-4 text-[10px]">
                    <span className="col-span-2 uppercase truncate">{item.product.name}</span>
                    <span className="text-right">{item.quantity}x {item.product.price.toFixed(2)}</span>
                    <span className="text-right">${(item.quantity * item.product.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-black pt-4 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="uppercase">Subtotal</span>
                <span>${lastSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="uppercase">VAT (15%)</span>
                <span>${lastTax.toFixed(2)}</span>
              </div>
              {lastDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="uppercase">Discount</span>
                  <span>-${lastDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-dashed border-black">
                <span className="uppercase tracking-tighter">Grand Total</span>
                <span>${lastTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 text-[10px] space-y-1">
              <div className="flex justify-between uppercase">
                <span>Payment:</span>
                <span>{paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between uppercase">
                <span>Transaction:</span>
                <span>#{lastSaleId.slice(-10).toUpperCase()}</span>
              </div>
            </div>

            <div className="text-center pt-8 space-y-2">
              <div className="flex justify-center gap-1">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-black rounded-full opacity-20"></div>
                ))}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Thank you for shopping!</p>
              <p className="text-[8px] uppercase">Please keep your receipt for returns.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-10 animate-in fade-in duration-700">
      {/* Product Catalog */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-natural-800 tracking-tight font-display">Register Terminal</h2>
            <div className="relative w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-natural-300" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Find product by name or barcode... [/]" 
                className="w-full pl-12 pr-4 py-4 bg-white border border-natural-200 rounded-2xl focus:ring-4 focus:ring-natural-600/5 focus:border-natural-600 outline-none transition-all text-sm font-bold text-natural-800 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKey}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-2 py-1 bg-natural-50 rounded-lg border border-natural-100">
                 <Command className="h-3 w-3 text-natural-300" />
                 <span className="text-[10px] font-bold text-natural-400">/</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-5 py-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap",
                  activeCategory === cat 
                    ? "bg-natural-800 text-white shadow-lg shadow-natural-800/10 scale-105" 
                    : "bg-white border border-natural-200 text-natural-500 hover:bg-natural-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pb-10 pr-2">
          {loading ? (
             <div className="col-span-full h-full flex flex-col items-center justify-center text-natural-300 gap-4">
               <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-natural-600"></div>
               <span className="font-bold uppercase tracking-widest text-xs">Loading Inventory...</span>
             </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full h-full flex flex-col items-center justify-center text-natural-300 gap-4 opacity-50">
               <PackageSearch className="h-20 w-20" />
               <span className="font-bold uppercase tracking-widest text-xs">No Items Found</span>
            </div>
          ) : filteredProducts.map(product => {
            const outOfStock = product.stock_quantity <= 0;
            return (
              <button 
                key={product.id}
                disabled={outOfStock}
                onClick={() => addToCart(product)}
                className={cn(
                  "flex flex-col items-start p-5 bg-white border border-natural-200 rounded-[32px] transition-all text-left group relative h-fit",
                  outOfStock ? "opacity-50 grayscale cursor-not-allowed" : "hover:border-natural-600 hover:shadow-xl hover:shadow-natural-600/5 active:scale-95"
                )}
              >
                <div className="w-full aspect-square bg-natural-50 rounded-2xl mb-5 flex items-center justify-center transition-colors overflow-hidden border border-natural-100 group-hover:border-natural-200">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                  ) : (
                    <PackageSearch className="h-10 w-10 text-natural-200 group-hover:text-natural-400 transition-colors" />
                  )}
                </div>
                <div className="flex flex-col flex-1 w-full min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-1.5 py-0.5 bg-natural-50 rounded font-bold text-[8px] uppercase tracking-widest text-natural-400">{product.category}</span>
                    {product.barcode && (
                      <span className="flex items-center gap-1 text-[8px] font-bold text-natural-300 bg-natural-50 px-1.5 py-0.5 rounded">
                        <Barcode className="h-2.5 w-2.5" />
                        {product.barcode.slice(-4)}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-natural-800 leading-tight mb-4 group-hover:text-black transition-colors line-clamp-2 min-h-[2.5rem]">{product.name}</div>
                  
                  <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-natural-50">
                    <div className="font-mono font-bold text-xl text-natural-800">${product.price.toFixed(2)}</div>
                    <div className="h-10 w-10 rounded-xl bg-natural-50 flex items-center justify-center group-hover:bg-natural-800 transition-all group-hover:rotate-90">
                      {outOfStock ? <X className="h-5 w-5 text-rust" /> : <Plus className="h-5 w-5 text-natural-400 group-hover:text-white" />}
                    </div>
                  </div>
                </div>
                {product.stock_quantity <= product.min_stock_level && !outOfStock && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-rust/10 text-rust rounded-full text-[8px] font-bold uppercase">Low Stock</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cart / Checkout Sidebar */}
      <div className="w-[440px] flex flex-col bg-white border border-natural-200 rounded-[44px] shadow-2xl shadow-natural-800/10 overflow-hidden shrink-0">
        <div className="p-10 border-b border-natural-100 bg-natural-50/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-natural-800 rounded-xl flex items-center justify-center shadow-lg shadow-natural-800/20">
               <ShoppingCart className="h-5 w-5 text-white" />
             </div>
             <h3 className="font-bold text-natural-800 text-xl font-display tracking-tight">Active Cart</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-natural-100 text-natural-600 text-xs font-bold uppercase tracking-widest">
            {cart.reduce((s, i) => s + i.quantity, 0)} Items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40 px-10">
              <div className="h-24 w-24 rounded-full bg-natural-50 flex items-center justify-center animate-bounce duration-[2000ms]">
                <Plus className="h-10 w-10 text-natural-200" />
              </div>
              <div className="text-sm font-bold text-natural-400 uppercase tracking-widest leading-loose">Register is ready.<br />Start scanning products.</div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-start gap-4 animate-in slide-in-from-right-10 duration-500 group">
                <div className="h-16 w-16 rounded-2xl bg-natural-50 border border-natural-100 flex items-center justify-center overflow-hidden shrink-0">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <PackageSearch className="h-8 w-8 text-natural-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-natural-800 text-base leading-none truncate mb-1.5">{item.product.name}</div>
                  <div className="text-[10px] text-natural-400 font-bold uppercase tracking-widest mb-4">${item.product.price.toFixed(2)} / unit</div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-natural-50 rounded-[14px] p-1 border border-natural-100">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1.5 hover:bg-white hover:shadow-md rounded-lg text-natural-500 transition-all"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-10 text-center text-sm font-bold font-mono text-natural-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 hover:bg-white hover:shadow-md rounded-lg text-natural-500 transition-all"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="text-right">
                       <div className="font-bold font-mono text-natural-800 text-lg leading-none">
                         ${(item.product.price * item.quantity).toFixed(2)}
                       </div>
                    </div>
                  </div>
                </div>
                <button 
                   onClick={() => removeFromCart(item.product.id)} 
                   className="p-2 text-natural-300 hover:text-rust opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-10 bg-natural-50/50 border-t border-natural-100 space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-natural-400 uppercase tracking-[0.2em]">
              <span>Subtotal</span>
              <span className="font-mono text-sm tracking-normal font-bold text-natural-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-natural-400 uppercase tracking-[0.2em]">
              <span>Regulatory Tax (15%)</span>
              <span className="font-mono text-sm tracking-normal font-bold text-rust">+${tax.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between gap-4 pt-2">
               <div className="flex-1 relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-natural-300 transition-colors group-focus-within:text-natural-800" />
                  <input 
                    type="number" 
                    placeholder="Apply Discount ($)"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-natural-200 rounded-2xl text-xs font-bold text-natural-800 outline-none focus:border-natural-800 transition-all"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  />
               </div>
               {discountAmount > 0 && <span className="font-mono text-sage font-bold text-sm">-${discountAmount.toFixed(2)}</span>}
            </div>

            <div className="flex items-center justify-between text-4xl font-bold text-natural-800 pt-8 border-t border-natural-200/50 font-display tracking-tight">
              <span>Total</span>
              <span className="font-mono leading-none">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4">
             <div className="grid grid-cols-3 gap-3 p-1 bg-white border border-natural-200 rounded-[28px] shadow-sm">
              {[
                 { id: 'cash', icon: Banknote, label: 'Cash' },
                 { id: 'card', icon: CreditCard, label: 'Card' },
                 { id: 'mobile_money', icon: Smartphone, label: 'E-Wallet' }
              ].map(m => (
                <button 
                  key={m.id} 
                  onClick={() => setPaymentMethod(m.id as Sale['payment_method'])}
                  className={cn(
                    "py-4 rounded-[22px] flex flex-col items-center gap-2 transition-all relative overflow-hidden group",
                    paymentMethod === m.id ? "bg-natural-800 text-white shadow-xl shadow-natural-800/20" : "hover:bg-natural-50 text-natural-400"
                  )}
                >
                  <m.icon className="h-6 w-6 relative z-10" />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] relative z-10">{m.label}</span>
                </button>
              ))}
            </div>

            <button 
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full py-6 bg-natural-600 hover:bg-natural-700 disabled:bg-natural-200 disabled:cursor-not-allowed text-white rounded-[32px] font-bold text-xl transition-all shadow-2xl shadow-natural-600/30 flex flex-col items-center justify-center group"
            >
              <div className="flex items-center gap-4">
                <span className="font-display">Complete Checkout</span>
                <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Press [F2] to fast checkout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

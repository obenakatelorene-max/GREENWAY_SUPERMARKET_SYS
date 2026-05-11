import React, { useState, useMemo, useEffect } from 'react';
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
  ShoppingCart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { dbService } from '../services/dbService';
import { Product, Sale } from '../types';

export function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [search, setSearch] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<Sale['payment_method']>('card');

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

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
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
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      await dbService.processSale(cart, paymentMethod);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setCart([]);
      }, 3000);
    } catch (error: any) {
      console.error('Checkout error:', error);
      const message = error?.message || 'Please check your connection and stock levels.';
      alert(`Checkout failed: ${message}`);
    }
  };

  if (isSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-sage/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-12 w-12 text-sage" />
        </div>
        <h2 className="text-3xl font-bold text-natural-800 mb-2 font-display">Payment Successful!</h2>
        <p className="text-natural-500 mb-8 font-medium">Transaction completed. Printing receipt...</p>
        <div className="bg-white p-8 rounded-[32px] border border-dashed border-natural-300 w-80 text-center space-y-4 shadow-sm">
           <div className="text-2xl font-mono font-bold text-natural-800">${total.toFixed(2)}</div>
           <div className="text-[10px] text-natural-400 font-bold tracking-widest uppercase font-mono">#ORD-{Math.floor(Math.random() * 1000000000)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-10 animate-in fade-in duration-700">
      {/* Product Catalog */}
      <div className="flex-1 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-natural-800 tracking-tight font-display">Register POS</h2>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-natural-300" />
            <input 
              type="text" 
              placeholder="Scan item or type name..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-natural-200 rounded-2xl focus:ring-4 focus:ring-natural-600/5 focus:border-natural-600 outline-none transition-all text-sm font-bold text-natural-800 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
          {loading ? (
             <div className="col-span-full h-64 flex items-center justify-center text-natural-400 font-medium">
               Loading items...
             </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full h-64 flex items-center justify-center text-natural-400 font-medium">
              No items match your search.
            </div>
          ) : filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="flex flex-col items-start p-5 bg-white border border-natural-200 rounded-[32px] hover:border-natural-600 hover:shadow-xl hover:shadow-natural-600/10 transition-all text-left group"
            >
              <div className="w-full aspect-square bg-natural-50 rounded-2xl mb-5 flex items-center justify-center transition-colors group-hover:bg-white border border-transparent group-hover:border-natural-100">
                <PackageSearch className="h-10 w-10 text-natural-300 group-hover:text-natural-600 transition-colors" />
              </div>
              <div className="text-[10px] font-bold text-natural-400 uppercase tracking-widest mb-1.5">{product.category}</div>
              <div className="font-bold text-natural-800 leading-tight mb-4 group-hover:text-natural-600 transition-colors">{product.name}</div>
              <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-natural-50">
                <div className="font-mono font-bold text-xl text-natural-800">${product.price.toFixed(2)}</div>
                <div className="h-10 w-10 rounded-xl bg-natural-50 flex items-center justify-center group-hover:bg-natural-600 transition-all group-hover:rotate-90">
                  <Plus className="h-5 w-5 text-natural-400 group-hover:text-white" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart / Checkout Sidebar */}
      <div className="w-[420px] flex flex-col bg-white border border-natural-200 rounded-[40px] shadow-2xl shadow-natural-800/5 overflow-hidden">
        <div className="p-8 border-b border-natural-100 bg-natural-50/50">
          <h3 className="font-bold text-natural-800 text-lg flex items-center gap-3 font-display uppercase tracking-tight">
            Order Review
            <span className="px-2.5 py-0.5 rounded-full bg-natural-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-natural-600/20">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-natural-50 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-natural-200" />
              </div>
              <div className="text-sm font-semibold text-natural-400">Your basket is empty.<br />Add some products to begin.</div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-start gap-4 animate-in slide-in-from-right-8 duration-500">
                <div className="h-14 w-14 rounded-2xl bg-natural-50 flex items-center justify-center flex-shrink-0 border border-natural-100">
                  <PackageSearch className="h-7 w-7 text-natural-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-natural-800 text-base leading-tight truncate">{item.product.name}</div>
                  <div className="text-xs text-natural-400 font-bold tracking-tight mt-1">${item.product.price.toFixed(2)} / unit</div>
                  
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-natural-50 rounded-xl p-1.5 border border-natural-100">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-natural-500 transition-all"><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm font-bold font-mono text-natural-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-natural-500 transition-all"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-rust hover:text-rust/80 hover:bg-rust/5 p-2 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="font-bold font-mono text-natural-800 text-lg">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-natural-50 border-t border-natural-200 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold text-natural-500">
              <span>Subtotal</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold text-natural-500">
              <span>Sales Tax (8%)</span>
              <span className="font-mono text-rust">+${tax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-2xl font-bold text-natural-800 pt-4 border-t border-natural-200 font-display">
              <span>Payable Total</span>
              <span className="font-mono tracking-tighter">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-1 bg-white border border-natural-200 rounded-[28px] shadow-sm">
            {[
               { id: 'cash', icon: Banknote, label: 'Cash' },
               { id: 'card', icon: CreditCard, label: 'Card' },
               { id: 'mobile_money', icon: Smartphone, label: 'Mobile' }
            ].map(m => (
              <button 
                key={m.id} 
                onClick={() => setPaymentMethod(m.id as Sale['payment_method'])}
                className={cn(
                  "py-4 rounded-[22px] flex flex-col items-center gap-2 transition-all",
                  paymentMethod === m.id ? "bg-natural-800 text-white shadow-lg shadow-natural-800/20" : "hover:bg-natural-50 text-natural-500"
                )}
              >
                <m.icon className="h-6 w-6" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{m.label}</span>
              </button>
            ))}
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full py-5 bg-natural-600 hover:bg-natural-700 disabled:bg-natural-200 disabled:cursor-not-allowed text-white rounded-[28px] font-bold text-lg transition-all shadow-xl shadow-natural-600/20 flex items-center justify-center gap-3 group overflow-hidden relative"
          >
            <span className="relative z-10">Pay ${total.toFixed(2)}</span>
            <div className="absolute inset-0 bg-natural-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>
    </div>
  );
}

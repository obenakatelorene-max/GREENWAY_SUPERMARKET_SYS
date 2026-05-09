import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Package2,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { dbService } from '../services/dbService';
import { Product } from '../types';

export function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'General',
    price: 0,
    cost: 0,
    stock_quantity: 0,
    min_stock_level: 5
  });

  const categories = ['Produce', 'Dairy', 'Bakery', 'Canned Goods', 'General', 'Beverages', 'Frozen'];

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.addProduct(newProduct);
      setIsModalOpen(false);
      setNewProduct({
        name: '',
        sku: '',
        category: 'General',
        price: 0,
        cost: 0,
        stock_quantity: 0,
        min_stock_level: 5
      });
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Check SKU uniqueness.');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-natural-800 tracking-tight font-display">Inventory Tracking</h2>
          <p className="text-natural-500 font-medium">Manage stock levels and product categories.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-natural-600 hover:bg-natural-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-natural-600/20"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-natural-800/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-natural-100 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-natural-800 font-display">Add New Product</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-natural-50 rounded-full text-natural-400 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-8 space-y-6 text-natural-800">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Product Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    placeholder="e.g. Fresh Milk 1L"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">SKU Code</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    placeholder="Unique Item Code"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Category</label>
                  <select 
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Buying Cost ($)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({...newProduct, cost: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Selling Price ($)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Initial Stock</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({...newProduct, stock_quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Low Stock Min</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    value={newProduct.min_stock_level}
                    onChange={(e) => setNewProduct({...newProduct, min_stock_level: parseInt(e.target.value)})}
                  />
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-natural-300" />
          <input 
            type="text" 
            placeholder="Search products by name, SKU or category..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-natural-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 transition-all font-medium text-sm text-natural-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-natural-200 rounded-xl text-natural-600 font-bold hover:bg-natural-50 transition-colors text-sm">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-natural-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-natural-400 bg-natural-50/50 border-b border-natural-200">
                <th className="px-8 py-5 font-bold">Product Details</th>
                <th className="px-8 py-5 font-bold">SKU</th>
                <th className="px-8 py-5 font-bold">Category</th>
                <th className="px-8 py-5 font-bold">Stock Status</th>
                <th className="px-8 py-5 font-bold">Listing Price</th>
                <th className="px-8 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-100">
              {loading ? (
                 <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-natural-400 font-medium">
                       Loading inventory...
                    </td>
                 </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-20 text-center text-natural-400 font-medium">
                      No products found.
                   </td>
                </tr>
              ) : filteredProducts.map((product) => {
                const isLowStock = product.stock_quantity <= product.min_stock_level;
                return (
                  <tr key={product.id} className="text-sm hover:bg-natural-50/50 transition-colors cursor-pointer group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-natural-50 flex items-center justify-center border border-natural-100 group-hover:bg-natural-100 transition-colors">
                          <Package2 className="h-6 w-6 text-natural-400 group-hover:text-natural-600" />
                        </div>
                        <span className="font-bold text-natural-800 text-base">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-mono text-xs text-natural-400">{product.sku}</td>
                    <td className="px-8 py-5">
                      <span className="px-2.5 py-1 rounded-md bg-natural-100 text-natural-600 text-[10px] font-bold uppercase tracking-widest">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                           <span className={cn(
                            "font-bold",
                            isLowStock ? "text-rust" : "text-natural-800"
                          )}>
                            {product.stock_quantity} units
                          </span>
                        </div>
                        <div className="w-28 h-2 bg-natural-100 rounded-full overflow-hidden">
                          <div 
                             className={cn(
                               "h-full rounded-full transition-all duration-1000",
                               isLowStock ? "bg-rust" : "bg-sage"
                             )}
                             style={{ width: `${Math.min(100, (product.stock_quantity / (product.min_stock_level * 2)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-natural-800 font-display text-lg">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2.5 hover:bg-natural-100 rounded-xl text-natural-400 transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="p-2.5 hover:bg-rust/10 rounded-xl text-rust transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

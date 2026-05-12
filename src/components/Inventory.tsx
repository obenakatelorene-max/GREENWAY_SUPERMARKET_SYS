import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Package2,
  Edit2,
  Trash2,
  X,
  Barcode,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { dbService } from '../services/dbService';
import { Product } from '../types';

export function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // New product form state (using strings for inputs to avoid "0 won't erase" issue)
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'General',
    price: '',
    cost: '',
    stock_quantity: '',
    min_stock_level: '5',
    image_url: ''
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
      const productToSave = {
        ...newProduct,
        price: parseFloat(newProduct.price) || 0,
        cost: parseFloat(newProduct.cost) || 0,
        stock_quantity: parseInt(newProduct.stock_quantity) || 0,
        min_stock_level: parseInt(newProduct.min_stock_level) || 0,
      };

      if (editingId) {
        await dbService.updateProduct(editingId, productToSave);
      } else {
        await dbService.addProduct(productToSave);
      }

      handleCloseModal();
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      const message = error?.message || 'Check SKU uniqueness or database connection.';
      alert(`Failed to save product: ${message}`);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || '',
      category: product.category || 'General',
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock_quantity: product.stock_quantity.toString(),
      min_stock_level: product.min_stock_level.toString(),
      image_url: product.image_url || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNewProduct({
      name: '',
      sku: '',
      barcode: '',
      category: 'General',
      price: '',
      cost: '',
      stock_quantity: '',
      min_stock_level: '5',
      image_url: ''
    });
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await dbService.deleteProduct(id);
        // Optimistic update
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (error: any) {
        console.error('Error deleting product:', error);
        let errorMsg = 'Failed to delete product.';
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.error.includes('permission')) {
            errorMsg = 'Permission denied. Please ensure you are logged in as admin.';
          } else {
            errorMsg = `Error: ${parsed.error}`;
          }
        } catch (e) {
          errorMsg = error.message;
        }
        alert(errorMsg);
        fetchProducts(); // Revert on error
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-natural-800 tracking-tight font-display">Inventory Tracking</h2>
          <p className="text-natural-500 font-medium">Manage stock levels, barcodes, and product catalog.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-natural-600 hover:bg-natural-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-natural-600/20"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-natural-300" />
          <input 
            type="text" 
            placeholder="Search by name, SKU or barcode..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-natural-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 transition-all font-medium text-sm text-natural-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap whitespace-nowrap",
                activeCategory === cat 
                  ? "bg-natural-800 text-white shadow-md shadow-natural-800/10" 
                  : "bg-white border border-natural-200 text-natural-500 hover:bg-natural-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-natural-800/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 h-[90vh] flex flex-col">
            <div className="p-8 border-b border-natural-100 flex items-center justify-between shrink-0">
              <h3 className="text-2xl font-bold text-natural-800 font-display">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-natural-50 rounded-full text-natural-400 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-8 space-y-6 text-natural-800 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
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
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Barcode</label>
                  <div className="relative">
                    <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-natural-300" />
                    <input 
                      type="text" 
                      className="w-full pl-11 pr-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                      placeholder="EAN/UPC Number"
                      value={newProduct.barcode}
                      onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                    />
                  </div>
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
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-natural-300" />
                    <input 
                      type="url" 
                      className="w-full pl-11 pr-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                      placeholder="https://..."
                      value={newProduct.image_url}
                      onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Buying Cost ($)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    placeholder="0.00"
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({...newProduct, cost: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Selling Price ($)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    placeholder="0.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Initial Stock</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    placeholder="0"
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-natural-400">Low Stock Threshold</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-3 bg-natural-50 border border-natural-200 rounded-xl focus:ring-2 focus:ring-natural-600/10 focus:border-natural-600 outline-none transition-all"
                    placeholder="5"
                    value={newProduct.min_stock_level}
                    onChange={(e) => setNewProduct({...newProduct, min_stock_level: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-4 shrink-0">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-4 border border-natural-200 rounded-2xl font-bold text-natural-500 hover:bg-natural-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 bg-natural-600 text-white rounded-2xl font-bold hover:bg-natural-700 transition-all shadow-lg shadow-natural-600/20"
                >
                  {editingId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-natural-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-natural-400 bg-natural-50/50 border-b border-natural-200">
                <th className="px-8 py-5 font-bold">Product Details</th>
                <th className="px-8 py-5 font-bold">SKU / Barcode</th>
                <th className="px-8 py-5 font-bold">Category</th>
                <th className="px-8 py-5 font-bold">Stock Status</th>
                <th className="px-8 py-5 font-bold">Pricing ($)</th>
                <th className="px-8 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-100">
              {loading ? (
                 <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-natural-400 font-medium">
                       <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-natural-600"></div>
                          Loading inventory...
                       </div>
                    </td>
                 </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-20 text-center text-natural-400 font-medium font-bold uppercase tracking-widest">
                      No products found.
                   </td>
                </tr>
              ) : filteredProducts.map((product) => {
                const isLowStock = product.stock_quantity <= product.min_stock_level;
                const margin = product.price - product.cost;
                const marginPercent = (margin / product.price) * 100;

                return (
                  <tr key={product.id} className={cn(
                    "text-sm transition-colors cursor-pointer group",
                    isLowStock ? "bg-rust/[0.02] hover:bg-rust/[0.05]" : "hover:bg-natural-50/50"
                  )}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-natural-50 flex items-center justify-center border border-natural-100 group-hover:bg-natural-100 transition-colors overflow-hidden shrink-0 relative">
                          {isLowStock && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-rust rounded-full border-2 border-white animate-pulse z-10"></div>
                          )}
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Package2 className="h-6 w-6 text-natural-400 group-hover:text-natural-600" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-natural-800 text-base">{product.name}</span>
                          <span className="text-[10px] text-natural-400 font-bold uppercase tracking-tighter italic">ID: {product.id.slice(-8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col gap-1">
                          <div className="font-mono text-xs text-natural-400">SKU: {product.sku}</div>
                          {product.barcode && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-natural-500 uppercase tracking-wider">
                               <Barcode className="h-3 w-3" />
                               {product.barcode}
                            </div>
                          )}
                       </div>
                    </td>
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
                             isLowStock ? "text-rust" : "text-sage"
                           )}>
                            {product.stock_quantity <= 0 ? 'Out of Stock' : `${product.stock_quantity} units`}
                          </span>
                        </div>
                        <div className="w-28 h-2 bg-natural-100 rounded-full overflow-hidden">
                          <div 
                             className={cn(
                               "h-full rounded-full transition-all duration-1000",
                               isLowStock ? "bg-rust" : "bg-sage"
                             )}
                             style={{ width: `${product.min_stock_level > 0 ? Math.min(100, (product.stock_quantity / (product.min_stock_level * 2)) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="font-bold text-natural-800 text-base">${product.price.toFixed(2)}</span>
                          <span className="text-[10px] font-bold text-natural-400 uppercase tracking-wider">
                            Cost: ${product.cost.toFixed(2)} • <span className="text-sage">+{marginPercent.toFixed(0)}% Margin</span>
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          title="Edit Product"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                          }}
                          className="p-2.5 bg-natural-50 hover:bg-natural-100 rounded-xl text-natural-400 transition-colors border border-natural-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                           title="Delete Product"
                           onClick={(e) => {
                             e.stopPropagation();
                             console.log('Attempting to delete product:', product.id);
                             handleDeleteProduct(product.id, product.name);
                           }}
                           className="p-2.5 bg-rust/5 hover:bg-rust/10 rounded-xl text-rust transition-colors border border-rust/10"
                        >
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

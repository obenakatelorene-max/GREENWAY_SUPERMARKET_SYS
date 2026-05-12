export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  price: number;
  cost: number; // For COGS calculation
  stock_quantity: number;
  min_stock_level: number;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Sale {
  id: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  total_cost: number; // Cost of products at time of sale
  profit: number; // total_amount - total_cost
  payment_method: 'cash' | 'card' | 'mobile_money';
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string; // Snapshot in case product name changes later
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'utilities' | 'salaries' | 'supplies' | 'maintenance' | 'miscellaneous';
  date: string;
  status: 'pending' | 'paid';
  created_at: string;
}

export interface DashboardStats {
  totalSales: number;
  totalProfit: number;
  totalExpenses: number;
  lowStockCount: number;
}

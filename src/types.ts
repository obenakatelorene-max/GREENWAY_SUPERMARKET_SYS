export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_level: number;
  created_at: string;
}

export interface Sale {
  id: string;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'mobile_money';
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
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

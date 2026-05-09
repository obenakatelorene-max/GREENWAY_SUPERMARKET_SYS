import { supabase } from '../lib/supabase';
import { Product, Sale, SaleItem, Expense } from '../types';

export const dbService = {
  // --- Products ---
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as Product[];
  },

  async addProduct(product: Omit<Product, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  // --- Sales ---
  async processSale(items: { product: Product, quantity: number }[], paymentMethod: Sale['payment_method']) {
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    // 1. Create Sale Entry
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        total_amount: total,
        tax_amount: tax,
        payment_method: paymentMethod
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // 2. Create Sale Items (this triggers stock update via SQL trigger)
    const saleItems = items.map(item => ({
      sale_id: sale.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.product.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) throw itemsError;

    return sale;
  },

  // --- Expenses ---
  async getExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data as Expense[];
  },

  async addExpense(expense: Omit<Expense, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();
    if (error) throw error;
    return data as Expense;
  },

  async getDashboardStats() {
    // 1. Get total revenue
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('total_amount');
    if (salesError) throw salesError;

    // 2. Get total expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('amount');
    if (expensesError) throw expensesError;

    // 3. Get low stock count
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lte('stock_quantity', 10); // Simple threshold for now
    if (countError) throw countError;

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalProfit = totalRevenue - totalExpenses;

    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalProfit,
      lowStockCount: count || 0
    };
  }
};

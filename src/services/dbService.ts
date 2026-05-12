import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  doc, 
  runTransaction,
  serverTimestamp,
  where,
  getCountFromServer,
  limit,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Sale, Expense, StockMovement, SaleItem } from '../types';

export const dbService = {
  // --- Products ---
  async getProducts() {
    try {
      const q = query(collection(db, 'products'), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'products');
      return [];
    }
  },

  async addProduct(product: Omit<Product, 'id' | 'created_at'>) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return { id: docRef.id, ...product, created_at: new Date().toISOString() } as Product;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
      throw error;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    try {
      const productRef = doc(db, 'products', id);
      await runTransaction(db, async (transaction) => {
        transaction.update(productRef, {
          ...updates,
          updated_at: serverTimestamp()
        });

        // Log adjustment if stock changed directly
        if (updates.stock_quantity !== undefined) {
          const movementRef = doc(collection(db, 'stock_movements'));
          transaction.set(movementRef, {
            product_id: id,
            type: 'adjustment',
            quantity: updates.stock_quantity,
            reason: 'Manual warehouse adjustment',
            created_at: serverTimestamp()
          });
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      throw error;
    }
  },

  // --- Sales ---
  async processSale(
    items: { product: Product, quantity: number }[], 
    paymentMethod: Sale['payment_method'],
    discountAmount: number = 0
  ) {
    try {
      return await runTransaction(db, async (transaction) => {
        // 1. All READS first
        const productSnaps = [];
        for (const item of items) {
          const productRef = doc(db, 'products', item.product.id);
          const snap = await transaction.get(productRef);
          if (!snap.exists()) throw new Error(`Product ${item.product.id} not found`);
          productSnaps.push({ ref: productRef, snap, quantity: item.quantity });
        }

        // 2. Calculations
        const subtotal = productSnaps.reduce((sum, p) => {
          const data = p.snap.data();
          return sum + ((data?.price || 0) * p.quantity);
        }, 0);
        
        const totalCost = productSnaps.reduce((sum, p) => {
          const data = p.snap.data();
          return sum + ((data?.cost || 0) * p.quantity);
        }, 0);

        const tax = subtotal * 0.15; // 15% tax to match Sales.tsx
        const totalAmount = Math.max(0, subtotal + tax - (Number(discountAmount) || 0));
        const netProfit = totalAmount - totalCost;

        // 3. Create Sale Entry
        const saleRef = doc(collection(db, 'sales'));
        transaction.set(saleRef, {
          subtotal,
          tax_amount: tax,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          total_cost: totalCost,
          profit: netProfit,
          payment_method: paymentMethod,
          created_at: serverTimestamp()
        });

        // 4. Create Sale Items & Update Stock & Log Movement
        for (const p of productSnaps) {
          const itemRef = doc(collection(db, `sales/${saleRef.id}/items`));
          const data = p.snap.data();
          
          transaction.set(itemRef, {
            product_id: p.snap.id,
            product_name: data.name,
            quantity: p.quantity,
            unit_price: data.price,
            unit_cost: data.cost,
            total_price: data.price * p.quantity,
            created_at: serverTimestamp()
          });

          transaction.update(p.ref, { 
            stock_quantity: data.stock_quantity - p.quantity,
            updated_at: serverTimestamp()
          });

          const movementRef = doc(collection(db, 'stock_movements'));
          transaction.set(movementRef, {
            product_id: p.snap.id,
            type: 'out',
            quantity: p.quantity,
            reason: `Sale ${saleRef.id}`,
            created_at: serverTimestamp()
          });
        }

        return { id: saleRef.id, total_amount: totalAmount, profit: netProfit };
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'sales');
      throw error;
    }
  },

  // --- Expenses ---
  async getExpenses() {
    try {
      const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Expense[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'expenses');
      return [];
    }
  },

  async addExpense(expense: Omit<Expense, 'id' | 'created_at'>) {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expense,
        created_at: serverTimestamp()
      });
      return { id: docRef.id, ...expense, created_at: new Date().toISOString() } as Expense;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'expenses');
      throw error;
    }
  },

  async deleteExpense(id: string) {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `expenses/${id}`);
      throw error;
    }
  },

  // --- Dashboard & Analytics ---
  async getTransactionSummaries() {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const salesRef = collection(db, 'sales');
      
      const [todaySnap, weekSnap, monthSnap] = await Promise.all([
        getDocs(query(salesRef, where('created_at', '>=', Timestamp.fromDate(startOfToday)))),
        getDocs(query(salesRef, where('created_at', '>=', Timestamp.fromDate(startOfWeek)))),
        getDocs(query(salesRef, where('created_at', '>=', Timestamp.fromDate(startOfMonth))))
      ]);

      const calculateTotal = (snap: any) => snap.docs.reduce((sum: number, d: any) => sum + (d.data().total_amount || 0), 0);

      return {
        today: calculateTotal(todaySnap),
        week: calculateTotal(weekSnap),
        month: calculateTotal(monthSnap)
      };
    } catch (error) {
      console.error('Error fetching transaction summaries:', error);
      return { today: 0, week: 0, month: 0 };
    }
  },

  async getTopSellingProducts(limitCount: number = 5) {
    try {
      // In a real production app, you might have an aggregation collection for this.
      // For this app, we'll fetch recent sales and aggregate manually for the demo.
      const salesSnap = await getDocs(query(collection(db, 'sales'), orderBy('created_at', 'desc'), limit(50)));
      const productMap: Record<string, { name: string, quantity: number, total: number }> = {};

      for (const saleDoc of salesSnap.docs) {
        const itemsSnap = await getDocs(collection(db, `sales/${saleDoc.id}/items`));
        itemsSnap.forEach(itemDoc => {
          const item = itemDoc.data() as SaleItem;
          if (!productMap[item.product_id]) {
            productMap[item.product_id] = { name: item.product_name, quantity: 0, total: 0 };
          }
          productMap[item.product_id].quantity += item.quantity;
          productMap[item.product_id].total += item.total_price;
        });
      }

      return Object.entries(productMap)
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, limitCount)
        .map(([id, stats]) => ({ id, ...stats }));
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      return [];
    }
  },

  async getLowStockProducts() {
    try {
      const q = query(collection(db, 'products'), orderBy('stock_quantity', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as Product))
        .filter(p => p.stock_quantity <= p.min_stock_level);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'products');
      return [];
    }
  },

  async getDashboardStats() {
    try {
      const [salesSnap, expensesSnap] = await Promise.all([
        getDocs(collection(db, 'sales')),
        getDocs(collection(db, 'expenses'))
      ]);
      
      const lowStockQuery = query(collection(db, 'products'), where('stock_quantity', '<=', 10));
      const lowStockSnap = await getCountFromServer(lowStockQuery);

      const totalRevenue = salesSnap.docs.reduce((sum, s) => sum + Number(s.data().total_amount || 0), 0);
      const totalSaleProfit = salesSnap.docs.reduce((sum, s) => sum + Number(s.data().profit || 0), 0);
      const totalExpenses = expensesSnap.docs.reduce((sum, e) => sum + Number(e.data().amount || 0), 0);

      // Business Profit = Total profit from sales - Operational expenses
      const businessProfit = totalSaleProfit - totalExpenses;

      return {
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: businessProfit,
        lowStockCount: lowStockSnap.data().count
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'stats');
      throw { revenue: 0, expenses: 0, profit: 0, lowStockCount: 0 };
    }
  },

  async getRecentSales(count: number = 5) {
    try {
      const q = query(collection(db, 'sales'), orderBy('created_at', 'desc'), limit(count));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Sale[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'recent_sales');
      return [];
    }
  },

  async getSales(limitCount: number = 50) {
    try {
      const q = query(collection(db, 'sales'), orderBy('created_at', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      
      const sales = await Promise.all(snapshot.docs.map(async d => {
        const saleData = d.id ? { id: d.id, ...d.data() } as Sale : d.data() as Sale;
        // Optionally fetch items for each sale if needed, but for the list view maybe just summary is enough
        return saleData;
      }));
      
      return sales;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'sales');
      return [];
    }
  },

  async getSaleItems(saleId: string) {
    try {
      const snapshot = await getDocs(collection(db, `sales/${saleId}/items`));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as SaleItem[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `sales/${saleId}/items`);
      return [];
    }
  },

  async getReportData() {
    try {
      const [productsSnap, salesSnap, expensesSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(query(collection(db, 'sales'), orderBy('created_at', 'desc'), limit(100))),
        getDocs(collection(db, 'expenses'))
      ]);

      const products = productsSnap.docs.map(d => d.data() as Product);
      const sales = salesSnap.docs.map(d => d.data() as Sale);
      
      // Calculate Total Stock Value (Capital tied in inventory)
      const totalStockValue = products.reduce((sum, p) => sum + (p.cost * p.stock_quantity), 0);
      const totalListingValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
      const potentialProfit = totalListingValue - totalStockValue;

      return {
        totalStockValue,
        potentialProfit,
        productCount: products.length,
        recentSales: sales.slice(0, 5),
        revenueData: [
          { month: 'Jan', sales: 45000, profit: 13000 },
          { month: 'Feb', sales: 52000, profit: 18000 },
          { month: 'Mar', sales: 48000, profit: 17000 },
          { month: 'Apr', sales: 61000, profit: 23000 },
          { month: 'May', sales: 55000, profit: 20000 },
          { month: 'Jun', sales: 67000, profit: 27000 },
        ]
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'reports');
      throw error;
    }
  }
};

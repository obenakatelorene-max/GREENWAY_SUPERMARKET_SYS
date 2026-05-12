/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Receipt, 
  History,
  LayoutDashboard,
  Settings,
  Bell,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { cn } from './lib/utils';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Sales } from './components/Sales';
import { Expenses } from './components/Expenses';
import { Reports } from './components/Reports';
import { Transactions } from './components/Transactions';
import { Login } from './components/Login';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'POS / Sales', href: '/sales', icon: ShoppingCart },
  { name: 'Transactions', href: '/transactions', icon: History },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-natural-200 text-natural-500 print:hidden">
      <div className="flex h-20 items-center px-8 border-b border-natural-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-natural-600 flex items-center justify-center text-white shadow-md shadow-natural-600/20">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <span className="font-bold text-natural-800 text-xl tracking-tight font-display text-nowrap">Greenway</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1.5 px-4 py-8">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all",
                isActive 
                  ? "bg-natural-100 text-natural-600 shadow-sm" 
                  : "text-natural-500 hover:bg-natural-50 hover:text-natural-700"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                isActive ? "text-natural-600" : "text-natural-400 group-hover:text-natural-500"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-natural-100">
        <div className="bg-natural-50 p-4 rounded-2xl border border-natural-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-natural-400">Database Sync</span>
            <div className="w-2 h-2 rounded-full bg-[#8A9A5B] animate-pulse"></div>
          </div>
          <div className="text-[10px] text-natural-600 font-mono uppercase">Connected</div>
        </div>
      </div>
    </div>
  );
}

function Topbar({ user }: { user: User }) {
  const location = useLocation();
  const currentNav = navigation.find(item => item.href === location.pathname);
  
  const handleLogout = () => signOut(auth);

  return (
    <header className="h-20 bg-white border-b border-natural-200 flex items-center justify-between px-10 sticky top-0 z-10 shrink-0 print:hidden">
      <div>
        <h1 className="text-2xl font-bold text-natural-800 font-display">
          {currentNav?.name || 'Supermarket Pro'}
        </h1>
        <p className="text-xs text-natural-400 font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
          <span className="h-1 w-1 rounded-full bg-sage ring-4 ring-sage/10"></span>
          Live Management Dashboard
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2.5 text-natural-400 hover:text-natural-800 hover:bg-natural-50 rounded-xl transition-all relative group">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-rust rounded-full border-2 border-white group-hover:animate-bounce"></span>
        </button>
        <button 
          onClick={handleLogout}
          className="p-2.5 text-natural-400 hover:text-rust hover:bg-rust/5 rounded-xl transition-all"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
        <div className="h-8 w-px bg-natural-200 mx-1"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-natural-800">{user.displayName || 'Manager'}</p>
            <p className="text-[10px] text-natural-400 font-semibold uppercase tracking-wider">{user.email}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-natural-100 border border-natural-200 flex items-center justify-center overflow-hidden shadow-sm">
             <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}&backgroundColor=F7F7F2`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}

const ADMIN_EMAIL = 'obenakatelorene@gmail.com';

function UnauthorizedAccess({ email }: { email: string }) {
  return (
    <div className="min-h-screen bg-natural-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 text-center border border-natural-100">
        <div className="h-16 w-16 rounded-[24px] bg-rust/10 flex items-center justify-center text-rust mb-6 mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-natural-800 mb-2">Access Denied</h1>
        <p className="text-natural-500 mb-8 leading-relaxed">
          The account <span className="font-bold text-natural-800">{email}</span> does not have administrative privileges for this store.
        </p>
        <button
          onClick={() => signOut(auth)}
          className="w-full bg-natural-800 text-white py-4 rounded-2xl font-bold hover:bg-natural-900 transition-all"
        >
          Sign Out & Try Another Account
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-natural-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-natural-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (user.email !== ADMIN_EMAIL) {
    return <UnauthorizedAccess email={user.email || ''} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-natural-50 text-natural-700 overflow-hidden font-sans">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar user={user} />
          <main className="flex-1 overflow-y-auto p-10 print:p-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}


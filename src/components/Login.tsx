import React from 'react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { ShoppingCart, LogIn, ShieldCheck } from 'lucide-react';

export function Login() {
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-natural-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl shadow-natural-200 border border-natural-100 overflow-hidden p-10 flex flex-col items-center">
        <div className="h-16 w-16 rounded-[24px] bg-natural-600 flex items-center justify-center text-white shadow-xl shadow-natural-600/20 mb-8 transform hover:scale-110 transition-transform">
          <ShoppingCart className="h-8 w-8" />
        </div>
        
        <h1 className="text-3xl font-bold text-natural-800 font-display text-center tracking-tight mb-2">
          Greenway Supermarket
        </h1>
        <p className="text-natural-400 text-sm font-medium text-center mb-10 leading-relaxed px-4">
          Supermarket Inventory & POS Management System. Sign in to access your dashboard.
        </p>

        <div className="w-full space-y-4">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-natural-800 hover:bg-natural-900 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-natural-800/10 active:scale-[0.98]"
          >
            <LogIn className="h-5 w-5" />
            Continue with Google
          </button>
          
          <div className="flex items-center gap-2 justify-center text-[10px] text-natural-400 font-bold uppercase tracking-widest mt-6">
            <ShieldCheck className="h-3 w-3" />
            Secure Enterprise Access
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-natural-50 w-full">
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="text-xl font-bold text-natural-800">24/7</div>
              <div className="text-[10px] font-bold text-natural-400 uppercase">Support</div>
            </div>
            <div className="w-px h-10 bg-natural-100"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-natural-800">SSL</div>
              <div className="text-[10px] font-bold text-natural-400 uppercase">Encrypted</div>
            </div>
            <div className="w-px h-10 bg-natural-100"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-natural-800">v2.1</div>
              <div className="text-[10px] font-bold text-natural-400 uppercase">Stable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

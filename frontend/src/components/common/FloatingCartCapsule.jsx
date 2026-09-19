import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export const FloatingCartCapsule = () => {
  const { items, itemCount, subtotal } = useCart();
  const location = useLocation();

  // Show only on shop page or public browse pages when items exist and not already on cart
  if (itemCount === 0 || location.pathname === '/cart' || location.pathname.startsWith('/checkout')) {
    return null;
  }

  // Calculate estimated Mandi savings across all cart items
  const totalMandiSavings = items.reduce((acc, item) => {
    const savingsPerUnit = item.govt_comparison?.savings_per_kg || 0;
    return acc + (savingsPerUnit * item.quantity);
  }, 0);

  return (
    <div className="fixed bottom-16 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-30 animate-slideUp">
      <Link
        to="/cart"
        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/95 backdrop-blur-xl text-white shadow-2xl border border-white/20 hover:bg-slate-900 transition-all group active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
              {itemCount}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-emerald-400">
                ₹{subtotal.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-300">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            </div>

            {totalMandiSavings > 0 ? (
              <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Saving ₹{totalMandiSavings.toFixed(2)} vs APMC</span>
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Direct Farm Gate Batches</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 font-extrabold text-xs text-white shadow-sm transition-colors">
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    </div>
  );
};
export default FloatingCartCapsule;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export const FloatingCartCapsule = () => {
  const { items, itemCount, subtotal } = useCart();
  const location = useLocation();

  // Show only when items exist and not already on cart or checkout
  if (itemCount === 0 || location.pathname === '/cart' || location.pathname.startsWith('/checkout')) {
    return null;
  }

  // Calculate estimated Mandi savings across all cart items
  const totalMandiSavings = items.reduce((acc, item) => {
    const savingsPerUnit = item.govt_comparison?.savings_per_kg || 0;
    return acc + (savingsPerUnit * item.quantity);
  }, 0);

  return (
    <div className="fixed bottom-[72px] md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-30 animate-slideUp">
      <Link
        to="/cart"
        className="flex items-center justify-between p-2.5 sm:p-3.5 rounded-2xl bg-slate-950/95 backdrop-blur-xl text-white shadow-2xl border border-emerald-500/30 hover:bg-slate-900 transition-all group active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-md">
              {itemCount}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-mono font-black text-xs sm:text-sm text-emerald-400">
                ₹{subtotal.toFixed(2)}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-300">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            </div>

            {totalMandiSavings > 0 ? (
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-300 flex items-center gap-1 truncate">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">Saving ₹{totalMandiSavings.toFixed(2)} vs APMC</span>
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">Direct Farm Gate Batches</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 group-hover:from-emerald-500 group-hover:to-teal-500 font-black text-[11px] sm:text-xs text-white shadow-md transition-all flex-shrink-0">
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    </div>
  );
};
export default FloatingCartCapsule;

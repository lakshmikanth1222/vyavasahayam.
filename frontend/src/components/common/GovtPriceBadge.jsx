import React from 'react';
import { Landmark, TrendingUp, TrendingDown, Minus, ArrowUpRight, Scale } from 'lucide-react';

export const GovtPriceBadge = ({ comparison, askingPrice, onOpenModal, size = 'md', isB2B = false }) => {
  if (!comparison) return null;

  const modalPrice = Number(comparison.govt_modal_price_kg || askingPrice);
  const effectivePrice = Number(askingPrice);
  const savings = Number(comparison.savings_per_kg || (modalPrice - effectivePrice));
  const savingsPct = Number(comparison.savings_pct || ((modalPrice - effectivePrice) / (modalPrice || 1) * 100));
  const isSavings = savings > 0;

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className="text-slate-500 font-medium">
          Mandi: <strong className="text-slate-700 font-mono font-bold">₹{modalPrice.toFixed(1)}</strong>
        </span>
        {isSavings && (
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
            Save ₹{savings.toFixed(1)}/kg
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
          <Landmark className="w-3.5 h-3.5 text-emerald-700" />
          <span>Govt APMC Mandi:</span>
        </div>
        <div className="font-mono font-extrabold text-slate-900 text-xs">
          ₹{modalPrice.toFixed(2)}/kg
          {isB2B && (
            <span className="text-[10px] text-slate-500 font-normal ml-1">
              (₹{(modalPrice * 100).toLocaleString()}/Qtl)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
        <div className="flex items-center gap-1">
          {isSavings ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center gap-0.5">
              <span>🎉 Save ₹{savings.toFixed(1)}/kg ({Math.abs(savingsPct).toFixed(0)}%)</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px]">
              ⚖️ Fair Mandi Parity
            </span>
          )}
        </div>

        {onOpenModal && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal();
            }}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5"
          >
            <span>Compare</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

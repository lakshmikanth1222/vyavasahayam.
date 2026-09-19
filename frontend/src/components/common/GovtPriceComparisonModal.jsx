import React from 'react';
import {
  X, Landmark, TrendingUp, TrendingDown, Minus, ShieldCheck,
  CheckCircle2, Sparkles, Scale, Info, ArrowUpRight, Award, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const GovtPriceComparisonModal = ({ isOpen, onClose, product, isB2B = false }) => {
  if (!isOpen || !product) return null;

  const comp = product.govt_comparison || {};
  const askingPrice = Number(product.discount_price || product.asking_price || 0);
  const modalPrice = Number(comp.govt_modal_price_kg || askingPrice);
  const minPrice = Number(comp.govt_min_price_kg || (modalPrice * 0.85));
  const maxPrice = Number(comp.govt_max_price_kg || (modalPrice * 1.15));
  const savingsPerKg = Number(comp.savings_per_kg || (modalPrice - askingPrice));
  const savingsPct = Number(comp.savings_pct || ((modalPrice - askingPrice) / (modalPrice || 1) * 100));
  const isSavings = savingsPerKg > 0;
  const isMsp = comp.msp_applicable;
  const mspRate = comp.msp_rate_kg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
              <Landmark className="w-3.5 h-3.5" />
              <span>Government Mandi & MSP Comparison</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{product.title || product.product_name}</h2>
            <p className="text-xs text-emerald-100 flex items-center gap-1.5">
              <span>Variety: <strong>{comp.variety || 'Standard FAQ'}</strong></span>
              <span>•</span>
              <span>Mandi: <strong>{comp.market_name || 'APMC Yard'}</strong></span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Main Price Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Platform Direct Price */}
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500/30 text-emerald-950 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  🌱 Direct Farm Price
                </span>
                <div className="text-2xl font-black font-mono mt-1 text-emerald-900">
                  ₹{askingPrice.toFixed(2)}
                  <span className="text-xs font-normal text-emerald-700"> / kg</span>
                </div>
                {isB2B && (
                  <div className="text-[11px] font-mono font-bold text-emerald-800 mt-0.5">
                    ₹{(askingPrice * 100).toLocaleString()} / Quintal
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-emerald-700 mt-2 bg-emerald-200/60 px-2 py-0.5 rounded-md inline-block self-start">
                Zero Middlemen Fee
              </span>
            </div>

            {/* Govt APMC Modal Rate */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  🏛️ Govt APMC Modal Rate
                </span>
                <div className="text-2xl font-black font-mono mt-1 text-slate-900">
                  ₹{modalPrice.toFixed(2)}
                  <span className="text-xs font-normal text-slate-500"> / kg</span>
                </div>
                {isB2B && (
                  <div className="text-[11px] font-mono font-bold text-slate-600 mt-0.5">
                    ₹{(modalPrice * 100).toLocaleString()} / Quintal
                  </div>
                )}
              </div>
              <span className="text-[10px] font-semibold text-slate-500 mt-2">
                Agmarknet DMI Benchmark
              </span>
            </div>

            {/* Buyer Advantage / Savings */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isSavings
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider block text-amber-700">
                  {isSavings ? '🎉 Buyer Savings' : '⚖️ Market Parity'}
                </span>
                <div className="text-2xl font-black font-mono mt-1 text-amber-900">
                  {isSavings ? `+₹${Math.abs(savingsPerKg).toFixed(2)}` : 'Fair Parity'}
                  {isSavings && <span className="text-xs font-normal text-amber-700"> / kg</span>}
                </div>
                {isSavings && (
                  <div className="text-[11px] font-bold text-amber-800 mt-0.5">
                    Save {Math.abs(savingsPct).toFixed(1)}% vs Mandi
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-amber-800 mt-2 bg-amber-200/60 px-2 py-0.5 rounded-md inline-block self-start">
                {isSavings ? 'Direct Value Advantage' : 'Quality Graded Standard'}
              </span>
            </div>

          </div>

          {/* APMC Mandi Price Spread Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>APMC Mandi Price Range Spread (₹/kg)</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Source: {comp.market_name || 'APMC Yard'}
              </span>
            </div>

            {/* Visual Bar */}
            <div className="space-y-1.5">
              <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 bg-emerald-500/30 border-l-2 border-r-2 border-emerald-600"
                  style={{ left: '15%', right: '15%' }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold">
                <div>
                  <span className="block text-slate-400">Min Rate</span>
                  <span>₹{minPrice.toFixed(2)}</span>
                </div>
                <div className="text-center">
                  <span className="block text-emerald-700">Modal (Common)</span>
                  <span className="text-emerald-900 font-extrabold">₹{modalPrice.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="block text-slate-400">Max Rate</span>
                  <span>₹{maxPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Regulatory & Benchmark Specifications Grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>CCEA Minimum Support Price (MSP)</span>
              </div>
              {isMsp ? (
                <div className="space-y-1 text-slate-600">
                  <p>Floor Benchmark: <strong className="text-emerald-700 font-mono">₹{mspRate} / kg (₹{mspRate * 100} / qtl)</strong></p>
                  <p className="text-[10px] text-slate-500">Protected statutory floor price approved by Cabinet Committee on Economic Affairs (CCEA).</p>
                </div>
              ) : (
                <p className="text-slate-500">
                  Open APMC market commodity with daily spot price discovery governed by Directorate of Marketing & Inspection (DMI).
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Quality & Grade Standard</span>
              </div>
              <div className="space-y-1 text-slate-600">
                <p>Standard: <strong className="text-slate-800">AGMARK FAQ (Fair Average Quality)</strong></p>
                <p className="text-[10px] text-slate-500">Assayed for physical maturity, moisture threshold, and absence of external blemishes.</p>
              </div>
            </div>

          </div>

          {/* Full Live Bulletin Link */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span className="text-emerald-950 font-bold">
                Want to view all 93+ Government-listed crops across India?
              </span>
            </div>
            <Link
              to="/market-prices"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
            >
              <span>Open Live Mandi Bulletin</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};

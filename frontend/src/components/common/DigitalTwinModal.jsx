import React from 'react';
import { X, Activity, Thermometer, Droplets, Clock, AlertTriangle, ShieldCheck, SunMedium, Zap, Sparkles } from 'lucide-react';
import { FreshnessBadge } from './FreshnessBadge';

export const DigitalTwinModal = ({ listing, isOpen, onClose }) => {
  if (!isOpen || !listing) return null;

  const freshnessScore = listing.ai_freshness_score || 92;
  const remainingDays = listing.remaining_shelf_life_days || 4.5;
  const totalDays = listing.expected_shelf_life_days || 5;
  const progressPct = Math.min(100, Math.max(5, (remainingDays / totalDays) * 100));

  // Determine dynamic discount recommendation
  let discountPct = 0;
  let timerStatus = "Normal - Peak Quality Window";
  let alertStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";

  if (progressPct > 50) {
    discountPct = 0;
    timerStatus = "Peak Quality Window (>50% shelf-life remaining). Full price sale.";
    alertStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
  } else if (progressPct >= 25) {
    discountPct = 10;
    timerStatus = "Use Soon Window (25-50% remaining). 10% Dynamic Freshness Discount recommended.";
    alertStyle = "bg-amber-50 text-amber-800 border-amber-200";
  } else if (progressPct > 5) {
    discountPct = 25;
    timerStatus = "Rescue Priority Window (<25% remaining). 25% Clearance Discount or Solar Drying Route.";
    alertStyle = "bg-orange-50 text-orange-800 border-orange-200";
  } else {
    discountPct = 40;
    timerStatus = "Critical Rescue Window. Block from human consumption; route to Solar Drying / Bio-Compost.";
    alertStyle = "bg-rose-50 text-rose-800 border-rose-200";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Freshness Digital Twin
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                  LIVE DECAY MODEL
                </span>
              </h3>
              <p className="text-xs text-slate-400">{listing.title || listing.product_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Freshness Score & Decay Gauge */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Current Freshness Index
              </span>
              <FreshnessBadge score={freshnessScore} category={listing.ai_freshness_category} size="md" />
            </div>

            {/* Shelf-life countdown bar */}
            <div>
              <div className="flex justify-between text-slate-500 font-medium mb-1.5">
                <span>Remaining Shelf-Life: <strong className="text-slate-900 font-bold">{remainingDays} Days</strong></span>
                <span>Total Expected: {totalDays} Days</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPct > 50
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : progressPct > 25
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                      : 'bg-gradient-to-r from-rose-500 to-rose-400'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* IoT Environmental Telemetry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Transit Temperature</span>
                <strong className="text-sm font-extrabold text-slate-900">
                  {listing.iot_temp || 24.5}°C
                </strong>
                <span className="text-[10px] text-emerald-600 block font-medium">Optimal Cold Chain</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Relative Humidity</span>
                <strong className="text-sm font-extrabold text-slate-900">
                  {listing.iot_humidity || 68.0}% RH
                </strong>
                <span className="text-[10px] text-emerald-600 block font-medium">Preserves Turgidity</span>
              </div>
            </div>
          </div>

          {/* Dynamic Freshness Discount Recommendation */}
          <div className={`p-4 rounded-xl border ${alertStyle} space-y-1.5`}>
            <div className="flex items-center gap-2 font-bold">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Freshness Timer Policy:</span>
            </div>
            <p className="leading-relaxed">{timerStatus}</p>
            {discountPct > 0 && (
              <div className="pt-1 font-semibold flex items-center gap-2">
                <span>Original Price: ₹{listing.asking_price}/kg</span>
                <span>→</span>
                <span className="text-amber-900 font-extrabold bg-amber-200/60 px-2 py-0.5 rounded">
                  Dynamic Price: ₹{Math.round(listing.asking_price * (1 - discountPct / 100))}/kg ({discountPct}% OFF)
                </span>
              </div>
            )}
          </div>

          {/* Value-Addition / Solar Drying Backup */}
          <div className="p-3.5 rounded-xl bg-solar-50/70 border border-solar-200 flex items-start gap-3">
            <SunMedium className="w-5 h-5 text-solar-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-solar-900 font-bold block mb-0.5">
                Solar Drying Value-Addition Ready
              </strong>
              <p className="text-solar-800 leading-relaxed text-[11px]">
                This produce batch is registered with the <strong>Gannavaram Agro Solar-Drying Facility</strong>. If unfulfilled before shelf-life expiry, it converts to premium sun-dried packaged inventory.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm"
          >
            Dismiss Digital Twin
          </button>
        </div>

      </div>
    </div>
  );
};

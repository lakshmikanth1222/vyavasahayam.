import React from 'react';
import { ArrowRight, CheckCircle2, Shield, SunMedium, Tractor, Building2, Store, Truck, ShoppingBag, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorks = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-3.5 py-1 rounded-full border border-brand-200">
          Transparent Agricultural Model
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Transforming the Farm-to-Consumer Supply Chain
        </h1>
        <p className="text-sm text-slate-600">
          How VyavaSahayam reduces post-harvest spoilage, eliminates unnecessary middlemen handling, and guarantees fair prices for farmers and buyers.
        </p>
      </div>

      {/* Comparison: Traditional vs VyavaSahayam */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Traditional Model */}
        <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-200/70 space-y-5">
          <div className="flex items-center gap-2 text-rose-800 font-extrabold text-base">
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>Traditional Supply Chain (3-5 Days Delay)</span>
          </div>

          <div className="space-y-2 text-xs font-medium text-slate-700">
            <div className="p-3 bg-white rounded-xl border border-rose-100 flex items-center justify-between">
              <span>👨‍🌾 Farmer / Producer</span>
              <span className="text-rose-600 font-bold">Earns only 35-45% of consumer rupee</span>
            </div>
            <div className="text-center text-rose-400 font-bold text-xs">↓</div>
            <div className="p-3 bg-white rounded-xl border border-rose-100 flex items-center justify-between">
              <span>🤝 Village Middlemen / Local Aggregators</span>
              <span className="text-slate-500">Unregulated commission</span>
            </div>
            <div className="text-center text-rose-400 font-bold text-xs">↓</div>
            <div className="p-3 bg-white rounded-xl border border-rose-100 flex items-center justify-between">
              <span>🏛️ APMC Mandi Wholesalers</span>
              <span className="text-slate-500">Delayed payment settlements</span>
            </div>
            <div className="text-center text-rose-400 font-bold text-xs">↓</div>
            <div className="p-3 bg-white rounded-xl border border-rose-100 flex items-center justify-between">
              <span>🏢 Sub-Distributors & Commission Agents</span>
              <span className="text-slate-500">Multiple uncooled loading/unloading</span>
            </div>
            <div className="text-center text-rose-400 font-bold text-xs">↓</div>
            <div className="p-3 bg-white rounded-xl border border-rose-100 flex items-center justify-between">
              <span>🛒 Neighbourhood Retailers / Vendors</span>
              <span className="text-rose-600 font-bold">25-35% produce spoiled / discarded</span>
            </div>
            <div className="text-center text-rose-400 font-bold text-xs">↓</div>
            <div className="p-3 bg-white rounded-xl border border-rose-100 flex items-center justify-between">
              <span>🍽️ Consumer</span>
              <span className="text-slate-900 font-bold">High price for 4-day-old vegetable</span>
            </div>
          </div>
        </div>

        {/* VyavaSahayam Model */}
        <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>VyavaSahayam Direct Model (&lt;12 Hours)</span>
          </div>

          <div className="space-y-2 text-xs font-medium text-slate-700">
            <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-sm">
              <span className="font-bold text-slate-900">👨‍🌾 Farmer / FPO</span>
              <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded">
                Earns 80-88% Net Payout
              </span>
            </div>
            <div className="text-center text-emerald-600 font-bold text-xs">↓ Direct Digital Link</div>
            <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-sm">
              <div>
                <span className="font-bold text-slate-900 block">🏬 Rythu Bazar Local Fulfillment Hub</span>
                <span className="text-[11px] text-slate-500">Electronic Weighing, AI Vision Grading & Cold-Packing</span>
              </div>
              <span className="text-brand-700 font-mono font-bold">Hub #01</span>
            </div>
            <div className="text-center text-emerald-600 font-bold text-xs">↓ IoT Monitored Transit</div>
            <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-sm">
              <div>
                <span className="font-bold text-slate-900 block">🚚 Delivery Fleet / B2B Direct</span>
                <span className="text-[11px] text-slate-500">Escrow Held • Released on quality confirmation</span>
              </div>
              <span className="text-blue-700 font-bold text-[11px]">Protected</span>
            </div>
            <div className="text-center text-emerald-600 font-bold text-xs">↓ Same-Day Morning/Evening Delivery</div>
            <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-sm">
              <div>
                <span className="font-bold text-slate-900 block">🍽️ B2C Consumer / B2B Buyer</span>
                <span className="text-[11px] text-emerald-700 font-semibold">100% Farm Freshness Guaranteed</span>
              </div>
              <span className="text-emerald-800 font-bold">20-25% Cheaper</span>
            </div>
          </div>
        </div>

      </div>

      {/* Rescue Engine Diagram */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Zero-Waste Technology
          </span>
          <h3 className="text-2xl font-bold">Multi-Tier Rescue Engine & Solar Drying</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            When disruptions occur (buyer cancellations, transit delays, or freshness decay), the Rescue Engine systematically protects farmer revenue by evaluating alternative channels:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-bold text-[10px]">
              Priority 1
            </span>
            <h4 className="font-bold text-slate-200 text-sm">Buyer Switching</h4>
            <p className="text-slate-400 leading-relaxed">
              Instantly matches cancelled produce with nearby bulk supermarkets or restaurant chains.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
              Priority 2
            </span>
            <h4 className="font-bold text-slate-200 text-sm">Alternative Processing</h4>
            <p className="text-slate-400 leading-relaxed">
              Routes eligible produce to local canning, pulp, puree, and sauce processing facilities.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-solar-900/40 border border-solar-500/40 space-y-2 ring-1 ring-solar-500/30">
            <span className="px-2 py-0.5 rounded bg-solar-500/20 text-solar-400 font-mono font-bold text-[10px]">
              Priority 3 • High Value-Add
            </span>
            <h4 className="font-bold text-solar-300 text-sm">Solar Drying Module</h4>
            <p className="text-slate-300 leading-relaxed">
              Converts fresh tomatoes, chillies & mangoes into vacuum-packed sun-dried flakes with 12-month shelf life.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono font-bold text-[10px]">
              Safety Biocontainment
            </span>
            <h4 className="font-bold text-slate-200 text-sm">Waste-to-Value</h4>
            <p className="text-slate-400 leading-relaxed">
              Unsafe / contaminated produce is strictly blocked from food/feed and routed to bio-methanation.
            </p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center pt-4">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/30 transition-all"
        >
          <span>Explore Live Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};

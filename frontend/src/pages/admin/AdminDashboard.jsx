import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, Users, TrendingUp, IndianRupee, SunMedium, Zap,
  AlertTriangle, CheckCircle2, ArrowRight, BarChart3, Settings, ShieldCheck, RefreshCw
} from 'lucide-react';
import api from '../../services/api';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error("Admin analytics error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-300 text-xs font-semibold border border-white/15">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Master Governance & Intelligence Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Platform Operations & Loss Prevention
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
            Real-time telemetry across farmer onboarding, Rythu Bazar hubs, Escrow settlements, and zero-waste SOS Rescue & Govt Solar Drying Infrastructure.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/rescue"
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all border border-rose-500"
            title="Public Government Cold-Chain & Distress SOS Rescue Network"
          >
            <AlertTriangle className="w-4 h-4 text-white animate-pulse" />
            <span>SOS Rescue (Govt Infra)</span>
            <span className="px-1.5 py-0.2 rounded bg-white text-rose-900 text-[9px] font-black uppercase">
              Govt Infra
            </span>
          </Link>

          <Link
            to="/admin/rescue"
            className="px-4 py-2.5 rounded-xl bg-solar-500 hover:bg-solar-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all"
            title="Admin Emergency Rescue Operations"
          >
            <Zap className="w-4 h-4 text-slate-950" />
            <span>SOS Rescue Control</span>
          </Link>

          <Link
            to="/admin/solar-drying"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Govt Solar Drying Processing Facilities"
          >
            <SunMedium className="w-4 h-4 text-amber-300" />
            <span>Govt Solar Drying Infra</span>
          </Link>

          <Link
            to="/admin/settings"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
            title="System Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold uppercase">Total Supply Volume</span>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {analytics?.total_supply_kg || 0} kg
          </div>
          <span className="text-[11px] text-slate-500">Across {analytics?.active_listings || 0} Active Listings</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold uppercase">Intermediary Markup Saved</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            ₹{analytics?.estimated_middleman_savings_inr || 0}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Saved for Farmers & Buyers</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold uppercase">Post-Harvest Spoilage Rescued</span>
            <Zap className="w-4 h-4 text-solar-600" />
          </div>
          <div className="text-2xl font-black text-solar-700 font-mono">
            {analytics?.total_rescued_kg || 0} kg
          </div>
          <span className="text-[11px] text-solar-600 font-semibold">
            {analytics?.rescue_success_rate_pct || 94.2}% Rescue Success Rate
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold uppercase">Solar-Dried Output</span>
            <SunMedium className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {analytics?.solar_dried_output_kg || 0} kg
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Value-Added Inventory</span>
        </div>

      </div>

      {/* Stakeholder Network Stats */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">Registered Agricultural Stakeholders</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-xs font-semibold text-emerald-800 block">Farmers & FPOs</span>
            <strong className="text-2xl font-black text-emerald-900 font-mono">{analytics?.total_farmers || 5}</strong>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <span className="text-xs font-semibold text-blue-800 block">B2B Commercial Buyers</span>
            <strong className="text-2xl font-black text-blue-900 font-mono">{analytics?.total_buyers || 5}</strong>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
            <span className="text-xs font-semibold text-amber-800 block">B2C Household Consumers</span>
            <strong className="text-2xl font-black text-amber-900 font-mono">{analytics?.total_consumers || 5}</strong>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        
        <Link
          to="/admin/rescue"
          className="p-6 rounded-3xl bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 text-white shadow-md hover:scale-102 transition-all space-y-3 border border-rose-900/30"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-base">SOS Rescue & Govt Infra</h4>
            <span className="px-1.5 py-0.2 rounded bg-rose-600 text-[9px] font-black uppercase text-white">Govt</span>
          </div>
          <p className="text-xs text-slate-300">
            Audit active disruption events, route buyer switching, and utilize government cold-storage & rescue infrastructure.
          </p>
          <span className="text-xs font-bold text-rose-300 flex items-center gap-1 pt-1">
            <span>Manage SOS Rescues</span> <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/solar-drying"
          className="p-6 rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 text-white shadow-md hover:scale-102 transition-all space-y-3 border border-amber-900/30"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <SunMedium className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-base">Govt Solar Drying Units</h4>
            <span className="px-1.5 py-0.2 rounded bg-amber-600 text-[9px] font-black uppercase text-white">Zero Waste</span>
          </div>
          <p className="text-xs text-slate-300">
            Monitor active zero-waste drying tunnels, rack moisture levels, and value-added dried product SKU inventory.
          </p>
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1 pt-1">
            <span>View Solar Drying Infra</span> <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/payments"
          className="p-6 rounded-3xl bg-gradient-to-br from-purple-900 to-slate-900 text-white shadow-md hover:scale-102 transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <h4 className="font-extrabold text-base">Escrow & Payout Ledger</h4>
          <p className="text-xs text-slate-300">
            Audit held funds, farmer payout settlements, platform fees, and resolve customer quality disputes.
          </p>
          <span className="text-xs font-bold text-purple-300 flex items-center gap-1 pt-1">
            <span>Audit Escrow Ledger</span> <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Tractor, PlusCircle, Package, ShoppingBag, IndianRupee, Sparkles,
  ArrowRight, ShieldCheck, AlertTriangle, TrendingUp, Clock, Zap, PhoneCall
} from 'lucide-react';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import { DigitalTwinModal } from '../../components/common/DigitalTwinModal';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [digitalTwinOpen, setDigitalTwinOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [listRes, earnRes] = await Promise.all([
          api.get('/farmers/listings'),
          api.get('/farmers/earnings')
        ]);
        setListings(listRes.data);
        setEarnings(earnRes.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold border border-white/15">
              <Tractor className="w-3.5 h-3.5" />
              <span>Verified Farmer / FPO Partner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Namaste, {user?.full_name || 'Kisan Partner'}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200 max-w-xl">
              Manage your direct farm listings, inspect AI harvest freshness, and track guaranteed Escrow payouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/farmer/listings/new"
              className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>List New Produce</span>
            </Link>

            <Link
              to="/farmer/recommendations"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Crop Advisor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Active Listings</span>
            <Package className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {listings.filter(l => l.status === 'ACTIVE').length}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live on Marketplace
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Net Released Payout</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            ₹{earnings?.net_payout_released_inr || 0}
          </div>
          <p className="text-[11px] text-slate-500">Transferred to Bank Account</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Escrow Held</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700 font-mono">
            ₹{earnings?.escrow_held_inr || 0}
          </div>
          <p className="text-[11px] text-blue-600 font-medium">Releasing upon delivery</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">3% Crop Insurance</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono">
            ₹{earnings?.insurance_contributions_inr || 0}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">Active Policy Cover</p>
        </div>

      </div>

      {/* Produce Listings Table & Freshness Screening */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">My Farm Listings & Quality Gates</h3>
            <p className="text-xs text-slate-500">Continuous AI Freshness monitoring & Digital Twins</p>
          </div>

          <Link
            to="/farmer/listings"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3">Produce Item</th>
                <th className="pb-3">Available Qty</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Grade</th>
                <th className="pb-3">AI Freshness Score</th>
                <th className="pb-3">Remaining Shelf-Life</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Digital Twin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <img
                      src={l.image_url || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=100&q=80"}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <span>{l.title}</span>
                  </td>
                  <td className="py-3.5 font-mono font-bold">{l.available_quantity} {l.unit}</td>
                  <td className="py-3.5 font-mono font-bold text-slate-900">₹{l.asking_price}/{l.unit}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-800">
                      {l.quality_grade}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <FreshnessBadge score={l.ai_freshness_score} category={l.ai_freshness_category} size="sm" />
                  </td>
                  <td className="py-3.5 font-bold text-slate-800">{l.remaining_shelf_life_days} Days</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      l.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedListing(l);
                        setDigitalTwinOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] transition-all inline-flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>Twin Telemetry</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Twin Modal */}
      <DigitalTwinModal
        listing={selectedListing}
        isOpen={digitalTwinOpen}
        onClose={() => setDigitalTwinOpen(false)}
      />

    </div>
  );
};

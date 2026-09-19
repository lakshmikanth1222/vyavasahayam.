import React, { useState, useEffect } from 'react';
import {
  PlusCircle, Search, Sparkles, CheckCircle2, ArrowRight, ShieldCheck,
  MapPin, AlertCircle, RefreshCw, Layers, Landmark, Scale, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import { GovtPriceComparisonModal } from '../../components/common/GovtPriceComparisonModal';
import api from '../../services/api';

export const BuyerRequirements = () => {
  const [demands, setDemands] = useState([]);
  const [selectedDemandId, setSelectedDemandId] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [liveBenchmark, setLiveBenchmark] = useState(null);
  const [selectedGovtProduct, setSelectedGovtProduct] = useState(null);
  const [govtModalOpen, setGovtModalOpen] = useState(false);

  // New demand form
  const [newDemand, setNewDemand] = useState({
    product_name: 'Hybrid Vine Tomato',
    required_quantity_kg: 500.0,
    max_budget_per_kg: 26.0,
    required_grade: 'GRADE_A',
    delivery_district: 'Krishna',
    urgency: 'WITHIN_24H'
  });
  const [creating, setCreating] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    fetchDemands();
  }, []);

  // Fetch live government benchmark when product_name in form changes
  useEffect(() => {
    const fetchBenchmark = async () => {
      if (!newDemand.product_name) return;
      try {
        const res = await api.get('/market-prices/benchmark', {
          params: { product_name: newDemand.product_name, district: newDemand.delivery_district || 'Krishna' }
        });
        setLiveBenchmark(res.data);
      } catch (err) {
        console.error("Benchmark fetch error:", err);
      }
    };
    fetchBenchmark();
  }, [newDemand.product_name, newDemand.delivery_district]);

  const fetchDemands = async () => {
    try {
      const res = await api.get('/buyers/demand-requests');
      setDemands(res.data);
      if (res.data.length > 0 && !selectedDemandId) {
        loadMatches(res.data[0].id);
      }
    } catch (err) {
      console.error("Demand fetch error:", err);
    }
  };

  const loadMatches = async (demandId) => {
    setSelectedDemandId(demandId);
    setMatchingLoading(true);
    setOrderSuccess(null);
    try {
      const res = await api.get(`/buyers/demand-requests/${demandId}/matches`);
      setMatchData(res.data);
    } catch (err) {
      console.error("Match error:", err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleCreateDemand = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/buyers/demand-requests', newDemand);
      await fetchDemands();
      loadMatches(res.data.id);
    } catch (err) {
      console.error("Failed to create demand:", err);
    } finally {
      setCreating(false);
    }
  };

  const handlePlaceOrder = async (listingId, quantity) => {
    setOrdering(true);
    setOrderSuccess(null);
    try {
      const res = await api.post('/buyers/orders', {
        items: [{ listing_id: listingId, quantity: quantity }],
        delivery_address: "Mega Mart Warehouse Depot, Benz Circle, Vijayawada",
        delivery_slot: "Next Morning 6:00 AM Direct Fleet",
        buyer_notes: "B2B Bulk Procurement via AI Matching Engine"
      });
      setOrderSuccess(res.data);
      if (selectedDemandId) loadMatches(selectedDemandId);
    } catch (err) {
      console.error("Order error:", err);
      alert(err.response?.data?.detail || "Order failed");
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          B2B Procurement Matching Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Post your bulk commercial requirements and let our transparent matching algorithm evaluate farmer compatibility across price, grade, proximity, and government APMC market benchmarks.
        </p>
      </div>

      {/* Success Alert */}
      {orderSuccess && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs text-emerald-900 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <strong className="text-sm font-extrabold block">B2B Procurement Order Confirmed!</strong>
              <p>Order Number: <span className="font-mono font-bold">{orderSuccess.order_number}</span> • Funds held safely in Escrow until delivery acceptance.</p>
            </div>
          </div>
          <span className="font-extrabold text-sm font-mono text-emerald-800">
            Total: ₹{orderSuccess.total_amount}
          </span>
        </div>
      )}

      {/* Top Section: Create Demand Form & Demand Tabs */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Create Demand Form */}
        <form onSubmit={handleCreateDemand} className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Post New Procurement Demand</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live Mandi Price Sync
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Required Produce *</label>
              <select
                value={newDemand.product_name}
                onChange={(e) => setNewDemand({ ...newDemand, product_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
              >
                <option value="Hybrid Vine Tomato">Hybrid Vine Tomato</option>
                <option value="Guntur Green Chilli">Guntur Green Chilli</option>
                <option value="Kurnool Rose Onion">Kurnool Rose Onion</option>
                <option value="Fresh Native Brinjal">Fresh Native Brinjal</option>
                <option value="Organic Farm Spinach (Palak)">Organic Farm Spinach (Palak)</option>
                <option value="Farm Fresh Potato">Farm Fresh Potato</option>
                <option value="Paddy (Dhan)">Paddy (Dhan) - CCEA MSP</option>
                <option value="Gram (Chana / Chickpea)">Gram (Chana) - CCEA MSP</option>
                <option value="Red Chilli (Dry)">Red Chilli (Dry) - Guntur Mirchi Yard</option>
                <option value="Turmeric (Curcuma)">Turmeric (Curcuma) - Duggirala</option>
                <option value="Groundnut (Peanut)">Groundnut (Peanut) - CCEA MSP</option>
              </select>
            </div>

            {/* Live Government APMC Benchmark Assistant Card */}
            {liveBenchmark && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Govt APMC Price Benchmark ({liveBenchmark.market_name})</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-900">
                    ₹{liveBenchmark.govt_modal_price_kg.toFixed(2)}/kg (₹{(liveBenchmark.govt_modal_price_kg * 100).toLocaleString()}/Qtl)
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-600 pt-1 border-t border-emerald-200/60">
                  <span>Mandi Spread: <strong>₹{liveBenchmark.govt_min_price_kg} - ₹{liveBenchmark.govt_max_price_kg}/kg</strong></span>
                  <span>Rec. Fair Bid: <strong className="text-emerald-800">₹{liveBenchmark.recommended_fair_range?.min} - ₹{liveBenchmark.recommended_fair_range?.max}/kg</strong></span>
                </div>

                {liveBenchmark.msp_applicable && (
                  <div className="text-[10px] text-blue-800 font-bold bg-blue-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-700" />
                    <span>CCEA Protected Minimum Support Price: ₹{liveBenchmark.msp_rate_kg}/kg (₹{liveBenchmark.msp_rate_kg * 100}/Qtl)</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Qty (kg) *</label>
                <input
                  type="number"
                  required
                  value={newDemand.required_quantity_kg}
                  onChange={(e) => setNewDemand({ ...newDemand, required_quantity_kg: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  = {(newDemand.required_quantity_kg / 100).toFixed(1)} Quintals
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Budget (₹/kg) *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newDemand.max_budget_per_kg}
                  onChange={(e) => setNewDemand({ ...newDemand, max_budget_per_kg: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  = ₹{(newDemand.max_budget_per_kg * 100).toLocaleString()} / Quintal
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Grade</label>
                <select
                  value={newDemand.required_grade}
                  onChange={(e) => setNewDemand({ ...newDemand, required_grade: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="GRADE_A">Grade A (Premium Retail)</option>
                  <option value="GRADE_B">Grade B (Standard Commercial)</option>
                  <option value="GRADE_C">Grade C (Processing / Bulk)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Procurement Urgency</label>
                <select
                  value={newDemand.urgency}
                  onChange={(e) => setNewDemand({ ...newDemand, urgency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="IMMEDIATE">Immediate (&lt;12h)</option>
                  <option value="WITHIN_24H">Within 24 Hours</option>
                  <option value="WITHIN_3DAYS">Within 3 Days</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Post Demand & Run AI Matcher</span>}
          </button>
        </form>

        {/* Existing Demands List */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900">Your Active Requirements ({demands.length})</h3>
            <p className="text-xs text-slate-500">Select any requirement to view live algorithmic supplier rankings</p>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {demands.map((d) => (
              <div
                key={d.id}
                onClick={() => loadMatches(d.id)}
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  selectedDemandId === d.id
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-slate-900">{d.product_name}</strong>
                    <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-800 text-[10px]">
                      {d.required_grade}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Qty: <strong>{d.required_quantity_kg} kg</strong> ({(d.required_quantity_kg / 100).toFixed(1)} Qtl) • Max Budget: <strong>₹{d.max_budget_per_kg}/kg</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                    <span>Rankings</span> <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Matches & Transparent Scoring Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-extrabold text-slate-900">
                AI Match Ranking & Government Mandi Arbitrage Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by composite score: Price vs Mandi (25%) + Quantity (20%) + Grade (20%) + Proximity (20%) + Freshness (15%)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
            <span>Matches Evaluated:</span>
            <strong className="text-blue-700">{matchData?.matches_count || 0}</strong>
          </div>
        </div>

        {matchingLoading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs font-semibold">Running multi-factor compatibility matrix across registered FPOs...</p>
          </div>
        ) : matchData && matchData.matches.length > 0 ? (
          <div className="space-y-4">
            {matchData.matches.map((m, idx) => {
              const details = m.match_details;
              const comm = m.commercial_metrics || {};

              return (
                <div
                  key={idx}
                  className="p-5 rounded-3xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition-all space-y-4 text-xs shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-extrabold text-slate-900">{m.listing_title}</span>
                        <FreshnessBadge score={m.freshness_score} size="sm" />
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-200 text-slate-800 text-[10px]">
                          Grade: {m.quality_grade}
                        </span>
                      </div>
                      
                      <p className="text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Farmer: <strong>{m.farmer_name}</strong> • Location: {m.location} ({details.distance_km} km away)</span>
                      </p>
                    </div>

                    {/* Match Score Badge & Order Action */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Match Score</span>
                        <div className="text-2xl font-black text-blue-700 font-mono">
                          {details.match_score_pct}%
                        </div>
                      </div>

                      <button
                        onClick={() => handlePlaceOrder(m.listing_id, Math.min(matchData.required_quantity_kg, m.available_quantity))}
                        disabled={ordering}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
                      >
                        <span>Procure Batch</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* 3-Way Government Mandi vs Farmer Asking vs Buyer Budget Comparison */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950">
                      <span className="text-[10px] font-bold text-emerald-700 block">🌱 Farmer Asking Price</span>
                      <div className="font-mono font-extrabold text-sm text-emerald-900 mt-0.5">
                        ₹{m.asking_price}/kg <span className="text-[10px] text-emerald-700 font-normal">(₹{m.asking_price * 100}/Qtl)</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 block">🏛️ Govt APMC Modal Rate</span>
                      <div className="font-mono font-extrabold text-sm text-slate-900 mt-0.5">
                        ₹{comm.govt_modal_price_kg || '25.0'}/kg <span className="text-[10px] text-slate-500 font-normal">(₹{comm.govt_modal_price_quintal || '2,500'}/Qtl)</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950">
                      <span className="text-[10px] font-bold text-blue-700 block">🎯 Your Max Budget</span>
                      <div className="font-mono font-extrabold text-sm text-blue-900 mt-0.5">
                        ₹{matchData.max_budget_per_kg}/kg <span className="text-[10px] text-blue-700 font-normal">(₹{matchData.max_budget_per_kg * 100}/Qtl)</span>
                      </div>
                    </div>

                  </div>

                  {/* Transparent Explanation Box */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-[11px] text-slate-700 font-medium space-y-2 shadow-inner">
                    <div className="flex items-center justify-between font-bold text-blue-900">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Transparent Compatibility Matrix:</span>
                      </div>
                      {comm.arbitrage_vs_mandi_kg > 0 && (
                        <span className="text-emerald-700 font-extrabold text-[10px]">
                          🎉 ₹{comm.arbitrage_vs_mandi_kg}/kg below APMC wholesale spot rate
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 font-mono text-[11px] leading-relaxed">
                      {details.explanation}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            No compatible listings found for this requirement. Try adjusting max budget or quality tolerance.
          </div>
        )}

      </div>

    </div>
  );
};
export default BuyerRequirements;

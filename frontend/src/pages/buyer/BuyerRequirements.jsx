import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, MapPin, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import api from '../../services/api';

export const BuyerRequirements = () => {
  const [demands, setDemands] = useState([]);
  const [selectedDemandId, setSelectedDemandId] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [matchingLoading, setMatchingLoading] = useState(false);

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
          Post your bulk commercial requirements and let our transparent matching algorithm evaluate farmer compatibility across price, grade, proximity, and freshness.
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
        <form onSubmit={handleCreateDemand} className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Post New Procurement Demand</h3>
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
              </select>
            </div>

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
                  <option value="GRADE_A">Grade A (Premium)</option>
                  <option value="GRADE_B">Grade B (Standard)</option>
                  <option value="GRADE_C">Grade C (Processing)</option>
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
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900">Your Active Requirements ({demands.length})</h3>
            <p className="text-xs text-slate-500">Select any requirement to view live algorithmic supplier rankings</p>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
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
                    Qty: <strong>{d.required_quantity_kg} kg</strong> • Max Budget: <strong>₹{d.max_budget_per_kg}/kg</strong>
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
                AI Match Ranking & Transparent Compatibility Score
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by composite score: Quantity (20%) + Grade (20%) + Price (25%) + Proximity (20%) + Freshness (15%)
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

                    {/* Match Score Badge */}
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

                  {/* Transparent Explanation Box */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-[11px] text-slate-700 font-medium space-y-2 shadow-inner">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Transparent Factor Breakdown:</span>
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

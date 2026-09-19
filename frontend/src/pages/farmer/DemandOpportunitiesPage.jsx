import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Sparkles, MapPin, Calendar, Clock, ArrowRight, CheckCircle2,
  AlertCircle, ShieldCheck, RefreshCw, Send, Check, ChevronDown, ChevronUp,
  Filter, Award, DollarSign, Package
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const DemandOpportunitiesPage = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Supply offer modal state
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({
    offered_quantity_kg: 500,
    expected_price_per_kg: 26,
    quality_grade: 'GRADE_A',
    available_date: '',
    notes: ''
  });
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerSuccessMsg, setOfferSuccessMsg] = useState(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/demands/opportunities/farmer');
      setOpportunities(res.data.opportunities || []);
    } catch (err) {
      console.error('Failed to load farmer opportunities:', err);
      setError(err.response?.data?.detail || 'Unable to load demand opportunities.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOfferModal = (opp) => {
    setSelectedOpp(opp);
    const d = opp.demand;
    setOfferForm({
      offered_quantity_kg: Math.min(opp.matched_quantity_kg || 500, d.remaining_quantity_kg || d.required_quantity_kg),
      expected_price_per_kg: Math.max(15, Math.round(d.max_budget_per_kg * 0.95)),
      quality_grade: d.required_grade || 'GRADE_A',
      available_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      notes: `Freshly harvested ${d.product_name} ready for immediate mandi delivery.`
    });
    setOfferModalOpen(true);
    setOfferSuccessMsg(null);
  };

  const handleSubmitSupplyOffer = async (e) => {
    e.preventDefault();
    if (!selectedOpp) return;
    setSubmittingOffer(true);
    try {
      const res = await api.post(`/demands/${selectedOpp.demand_id}/offers`, {
        offered_quantity_kg: parseFloat(offerForm.offered_quantity_kg),
        expected_price_per_kg: parseFloat(offerForm.expected_price_per_kg),
        quality_grade: offerForm.quality_grade,
        available_date: offerForm.available_date ? new Date(offerForm.available_date).toISOString() : null,
        notes: offerForm.notes
      });
      setOfferSuccessMsg(res.data.message || 'Supply offer committed successfully!');
      setTimeout(() => {
        setOfferModalOpen(false);
        fetchOpportunities();
      }, 1800);
    } catch (err) {
      console.error('Failed to submit offer:', err);
      alert(err.response?.data?.detail || 'Failed to submit supply offer.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (statusFilter === 'NEW') return opp.status === 'NEW';
    if (statusFilter === 'OFFERED') return opp.status === 'OFFERED';
    if (statusFilter === 'ACCEPTED') return opp.status === 'ACCEPTED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demand-First Opportunity Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Buyer Procurement Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Commercial bulk buyers in Andhra Pradesh have posted confirmed demand. Our AI engine matched these opportunities to your farm profile, harvest inventory, and proximity.
          </p>
        </div>

        <button
          onClick={fetchOpportunities}
          className="self-start md:self-center flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Opportunities</span>
        </button>
      </div>

      {/* Filter Tabs & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700">Filter Status:</span>
          {['ALL', 'NEW', 'OFFERED', 'ACCEPTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="text-slate-500 font-medium">
          Showing <strong className="text-slate-900">{filteredOpportunities.length}</strong> of{' '}
          <strong>{opportunities.length}</strong> Opportunities
        </div>
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="font-bold">Evaluating multi-factor demand compatibility...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center">
          <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
          <p className="font-bold">{error}</p>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">No Active Demand Opportunities</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              When B2B buyers in Andhra Pradesh post procurement demands compatible with your crops and location, they will appear here with AI match scores.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOpportunities.map((opp) => {
            const d = opp.demand;
            const isExpanded = expandedId === opp.opportunity_id;
            const breakdown = opp.score_breakdown || {};
            const score = Math.round(opp.match_score);

            return (
              <div
                key={opp.opportunity_id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Card Header & Metrics */}
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Produce & Buyer Info */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xl font-black text-slate-900">{d.product_name}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {d.required_grade}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          opp.status === 'ACCEPTED'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : opp.status === 'OFFERED'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {opp.status === 'ACCEPTED' ? '✓ Offer Accepted (Order Active)' : opp.status === 'OFFERED' ? 'Offer Submitted' : 'New Opportunity'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span>Buyer: <strong className="text-slate-700">{d.buyer_name}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{d.delivery_district} (~{opp.estimated_distance_km} km)</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{opp.estimated_delivery_time}</span>
                        </span>
                      </p>
                    </div>

                    {/* Match Score Badge & CTA */}
                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Match Score</span>
                        <div className={`text-2xl font-black font-mono ${
                          score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-blue-600' : 'text-amber-600'
                        }`}>
                          {score}%
                        </div>
                      </div>

                      {opp.status !== 'ACCEPTED' && (
                        <button
                          onClick={() => handleOpenOfferModal(opp)}
                          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span>{opp.status === 'OFFERED' ? 'Update Supply Offer' : 'Offer Supply'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4-Column Procurement Spec Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Demand</span>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {d.required_quantity_kg?.toLocaleString()} {d.unit || 'kg'}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Remaining: <strong>{d.remaining_quantity_kg?.toLocaleString()} kg</strong>
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Buyer Max Budget</span>
                      <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
                        ₹{d.max_budget_per_kg} / kg
                      </div>
                      <span className="text-[10px] text-slate-500">
                        ₹{(d.max_budget_per_kg * 100).toLocaleString()} / Quintal
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Your Matched Capacity</span>
                      <div className="text-sm font-extrabold text-blue-700 mt-0.5">
                        {opp.matched_quantity_kg?.toLocaleString()} kg
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Can fulfill {Math.min(100, Math.round((opp.matched_quantity_kg / d.required_quantity_kg) * 100))}%
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Required By</span>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {d.required_by_date ? new Date(d.required_by_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Immediate'}
                      </div>
                      <span className="text-[10px] text-amber-700 font-bold">
                        Urgency: {d.urgency}
                      </span>
                    </div>
                  </div>

                  {/* Why This Opportunity? Collapsible AI Explanation */}
                  <div className="border-t border-slate-100 pt-4">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : opp.opportunity_id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Why was this opportunity recommended to you? (Transparent AI Matrix)</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-4 animate-fadeIn">
                        {/* Reasons Bullets */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">
                            Match Highlights
                          </span>
                          <ul className="space-y-1 text-slate-700 font-medium">
                            {(opp.explanations || []).map((reason, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Multi-Factor Score Breakdown */}
                        <div className="border-t border-slate-200 pt-3">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider mb-2">
                            Algorithmic Factor Breakdown
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[11px]">
                            <div className="p-2 rounded-xl bg-white border border-slate-200">
                              <span className="text-slate-400 block text-[9px] font-bold">PRODUCT</span>
                              <strong className="text-slate-800 font-mono">{breakdown.product_score || 0}%</strong>
                            </div>
                            <div className="p-2 rounded-xl bg-white border border-slate-200">
                              <span className="text-slate-400 block text-[9px] font-bold">CAPACITY</span>
                              <strong className="text-slate-800 font-mono">{breakdown.quantity_score || 0}%</strong>
                            </div>
                            <div className="p-2 rounded-xl bg-white border border-slate-200">
                              <span className="text-slate-400 block text-[9px] font-bold">PRICE</span>
                              <strong className="text-slate-800 font-mono">{breakdown.price_score || 0}%</strong>
                            </div>
                            <div className="p-2 rounded-xl bg-white border border-slate-200">
                              <span className="text-slate-400 block text-[9px] font-bold">GRADE</span>
                              <strong className="text-slate-800 font-mono">{breakdown.grade_score || 0}%</strong>
                            </div>
                            <div className="p-2 rounded-xl bg-white border border-slate-200">
                              <span className="text-slate-400 block text-[9px] font-bold">DISTANCE</span>
                              <strong className="text-slate-800 font-mono">{breakdown.distance_score || 0}%</strong>
                            </div>
                            <div className="p-2 rounded-xl bg-white border border-slate-200">
                              <span className="text-slate-400 block text-[9px] font-bold">FRESHNESS</span>
                              <strong className="text-slate-800 font-mono">{breakdown.freshness_score || 0}%</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Supply Offer Modal */}
      {offerModalOpen && selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Commit Supply to Demand
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Offer Supply: {selectedOpp.demand.product_name}
                </h3>
              </div>
              <button
                onClick={() => setOfferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {offerSuccessMsg ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 text-emerald-900 text-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-sm">{offerSuccessMsg}</h4>
                <p className="text-slate-600">
                  The buyer has been notified of your supply offer. Once accepted, an Escrow-backed order will be generated automatically.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitSupplyOffer} className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Buyer Target:</span>
                    <strong className="text-slate-900">{selectedOpp.demand.required_quantity_kg} kg @ up to ₹{selectedOpp.demand.max_budget_per_kg}/kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining Balance:</span>
                    <strong className="text-emerald-700">{selectedOpp.demand.remaining_quantity_kg} kg open</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantity You Can Supply (kg) *</label>
                    <input
                      type="number"
                      required
                      max={selectedOpp.demand.remaining_quantity_kg || 10000}
                      value={offerForm.offered_quantity_kg}
                      onChange={(e) => setOfferForm({ ...offerForm, offered_quantity_kg: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Expected Rate (₹/kg) *</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={offerForm.expected_price_per_kg}
                      onChange={(e) => setOfferForm({ ...offerForm, expected_price_per_kg: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Produce Quality Grade</label>
                    <select
                      value={offerForm.quality_grade}
                      onChange={(e) => setOfferForm({ ...offerForm, quality_grade: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="GRADE_A">Grade A (Premium Retail)</option>
                      <option value="GRADE_B">Grade B (Standard Commercial)</option>
                      <option value="GRADE_C">Grade C (Processing / Bulk)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ready for Dispatch On</label>
                    <input
                      type="date"
                      value={offerForm.available_date}
                      onChange={(e) => setOfferForm({ ...offerForm, available_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notes / Harvest Highlights</label>
                  <textarea
                    rows={2}
                    value={offerForm.notes}
                    onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })}
                    placeholder="e.g. Harvested this morning, packed in standard 25kg crates"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-600">
                  <span>Total Offer Value:</span>
                  <strong className="text-base font-extrabold text-emerald-800 font-mono">
                    ₹{(parseFloat(offerForm.offered_quantity_kg || 0) * parseFloat(offerForm.expected_price_per_kg || 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </strong>
                </div>

                <button
                  type="submit"
                  disabled={submittingOffer}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {submittingOffer ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Real Supply Offer</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default DemandOpportunitiesPage;

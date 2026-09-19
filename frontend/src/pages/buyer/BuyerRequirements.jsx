import React, { useState, useEffect } from 'react';
import {
  PlusCircle, Search, Sparkles, CheckCircle2, ArrowRight, ShieldCheck,
  MapPin, AlertCircle, RefreshCw, Layers, Landmark, Scale, Check, X,
  Clock, Package, DollarSign, UserCheck
} from 'lucide-react';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import api from '../../services/api';

export const BuyerRequirements = () => {
  const [demands, setDemands] = useState([]);
  const [selectedDemandId, setSelectedDemandId] = useState(null);
  const [demandDetails, setDemandDetails] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [loadingDemands, setLoadingDemands] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [liveBenchmark, setLiveBenchmark] = useState(null);

  // New demand form
  const [newDemand, setNewDemand] = useState({
    product_name: 'Tomato',
    required_quantity_kg: 1000.0,
    max_budget_per_kg: 28.0,
    required_grade: 'GRADE_A',
    delivery_district: 'Krishna',
    delivery_address: 'Mandi Road, Benz Circle, Vijayawada',
    urgency: 'WITHIN_24H',
    recurring_demand: false,
    notes: 'Urgent bulk procurement for retail distribution.'
  });
  const [creating, setCreating] = useState(false);
  const [acceptingOfferId, setAcceptingOfferId] = useState(null);
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
    setLoadingDemands(true);
    try {
      const res = await api.get('/demands');
      setDemands(res.data.demands || []);
      if (res.data.demands?.length > 0 && !selectedDemandId) {
        loadDemandDetails(res.data.demands[0].id);
      }
    } catch (err) {
      console.error("Demand fetch error:", err);
    } finally {
      setLoadingDemands(false);
    }
  };

  const loadDemandDetails = async (demandId) => {
    setSelectedDemandId(demandId);
    setLoadingDetails(true);
    setOrderSuccess(null);
    try {
      const res = await api.get(`/demands/${demandId}`);
      setDemandDetails(res.data.demand || null);

      // Also load legacy match matrix if available
      try {
        const matchRes = await api.get(`/buyers/demand-requests/${demandId}/matches`);
        setMatchData(matchRes.data);
      } catch (e) {
        // legacy match fallback
      }
    } catch (err) {
      console.error("Details error:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateDemand = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/demands', {
        product_name: newDemand.product_name,
        required_quantity_kg: parseFloat(newDemand.required_quantity_kg),
        max_budget_per_kg: parseFloat(newDemand.max_budget_per_kg),
        required_grade: newDemand.required_grade,
        delivery_district: newDemand.delivery_district,
        delivery_address: newDemand.delivery_address,
        urgency: newDemand.urgency,
        recurring_demand: newDemand.recurring_demand,
        notes: newDemand.notes
      });
      await fetchDemands();
      if (res.data?.demand?.id) {
        loadDemandDetails(res.data.demand.id);
      }
    } catch (err) {
      console.error("Failed to create demand:", err);
      alert(err.response?.data?.detail || "Failed to create demand.");
    } finally {
      setCreating(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (!selectedDemandId) return;
    setAcceptingOfferId(offerId);
    setOrderSuccess(null);
    try {
      const res = await api.post(`/demands/${selectedDemandId}/offers/${offerId}/accept`, {
        delivery_address: newDemand.delivery_address
      });
      setOrderSuccess(res.data);
      loadDemandDetails(selectedDemandId);
      fetchDemands();
    } catch (err) {
      console.error("Failed to accept offer:", err);
      alert(err.response?.data?.detail || "Failed to accept offer.");
    } finally {
      setAcceptingOfferId(null);
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (!selectedDemandId) return;
    try {
      await api.post(`/demands/${selectedDemandId}/offers/${offerId}/reject`);
      loadDemandDetails(selectedDemandId);
    } catch (err) {
      console.error("Failed to reject offer:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-400/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Demand-First Procurement Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          Post Bulk Demand & Aggregate Supply
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Post your commercial requirements. Our engine notifies verified local farmers and FPOs in real-time, aggregates multi-farmer supply commitments, and creates Escrow-secured orders with 1-click acceptance.
        </p>
      </div>

      {/* Success Alert */}
      {orderSuccess && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs text-emerald-900 animate-fadeIn shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <strong className="text-sm font-extrabold block">🎉 Supply Offer Accepted! Order Created!</strong>
              <p>
                Order Number: <span className="font-mono font-bold text-slate-900">{orderSuccess.order_number}</span> • 
                Demand status: <span className="font-bold text-emerald-800">{orderSuccess.demand_status}</span> ({orderSuccess.filled_quantity_kg} kg filled, {orderSuccess.remaining_quantity_kg} kg remaining)
              </p>
            </div>
          </div>
          <span className="font-extrabold text-xs font-mono text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
            Escrow Secured
          </span>
        </div>
      )}

      {/* Top Grid: Post Demand Form & Active Requirements List */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Post Demand Form */}
        <form onSubmit={handleCreateDemand} className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Post New Procurement Demand</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Auto Farmer Notification
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Required Produce *</label>
              <select
                value={newDemand.product_name}
                onChange={(e) => setNewDemand({ ...newDemand, product_name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
              >
                <option value="Tomato">Tomato (Hybrid Vine)</option>
                <option value="Onion">Onion (Kurnool Rose)</option>
                <option value="Potato">Potato (Farm Fresh)</option>
                <option value="Green Chilli">Green Chilli (Guntur)</option>
                <option value="Brinjal">Brinjal (Native)</option>
                <option value="Spinach">Spinach / Palak</option>
                <option value="Banana">Banana</option>
                <option value="Red Chilli (Dry)">Red Chilli (Dry - Guntur Yard)</option>
                <option value="Turmeric">Turmeric (Duggirala)</option>
                <option value="Paddy (Dhan)">Paddy (Dhan - MSP)</option>
              </select>
            </div>

            {/* Live Mandi Benchmark Assistant */}
            {liveBenchmark && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-slate-50 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                    <span>APMC Mandi Modal: ₹{liveBenchmark.govt_modal_price_kg?.toFixed(2)}/kg</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800">
                    Rec Fair: ₹{liveBenchmark.recommended_fair_range?.min} - ₹{liveBenchmark.recommended_fair_range?.max}/kg
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Quantity (kg) *</label>
                <input
                  type="number"
                  required
                  min="50"
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
                <label className="block font-bold text-slate-700 mb-1">Quality Grade</label>
                <select
                  value={newDemand.required_grade}
                  onChange={(e) => setNewDemand({ ...newDemand, required_grade: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="GRADE_A">Grade A (Premium Retail)</option>
                  <option value="GRADE_B">Grade B (Commercial / Processing)</option>
                  <option value="GRADE_C">Grade C (Bulk Puree / Pulp)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery District</label>
                <select
                  value={newDemand.delivery_district}
                  onChange={(e) => setNewDemand({ ...newDemand, delivery_district: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Krishna">Krishna (Vijayawada)</option>
                  <option value="Guntur">Guntur</option>
                  <option value="East Godavari">East Godavari (Kakinada)</option>
                  <option value="West Godavari">West Godavari (Eluru)</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                  <option value="Kurnool">Kurnool</option>
                  <option value="Kadapa">Kadapa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Delivery Destination / Warehouse</label>
              <input
                type="text"
                value={newDemand.delivery_address}
                onChange={(e) => setNewDemand({ ...newDemand, delivery_address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newDemand.recurring_demand}
                  onChange={(e) => setNewDemand({ ...newDemand, recurring_demand: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-700">Recurring Weekly Demand</span>
              </label>

              <select
                value={newDemand.urgency}
                onChange={(e) => setNewDemand({ ...newDemand, urgency: e.target.value })}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px]"
              >
                <option value="IMMEDIATE">Urgency: Immediate (&lt;12h)</option>
                <option value="WITHIN_24H">Urgency: Within 24 Hours</option>
                <option value="WITHIN_3DAYS">Urgency: Within 3 Days</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            <span>Post Demand & Notify Matched Farmers</span>
          </button>
        </form>

        {/* Existing Demands List with Progress Bars */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                Your Active Procurement Demands ({demands.length})
              </h3>
              <button onClick={fetchDemands} className="text-slate-400 hover:text-slate-700">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDemands ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Select any requirement to review farmer supply offers and track aggregation progress.
            </p>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {demands.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No procurement demands posted yet. Create your first bulk demand above!
              </div>
            ) : (
              demands.map((d) => {
                const isSelected = selectedDemandId === d.id;
                const filled = d.filled_quantity_kg || 0;
                const total = d.required_quantity_kg || 1;
                const pct = Math.min(100, Math.round((filled / total) * 100));

                return (
                  <div
                    key={d.id}
                    onClick={() => loadDemandDetails(d.id)}
                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all space-y-2.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-slate-900">{d.product_name}</strong>
                        <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-800 text-[10px]">
                          {d.required_grade}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                        d.status === 'FULLY_FILLED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : d.status === 'PARTIALLY_FILLED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : d.status === 'OFFERS_RECEIVED'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    {/* Fulfillment Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Fulfillment: <strong>{filled.toLocaleString()} / {total.toLocaleString()} kg</strong></span>
                        <strong className="text-blue-700">{pct}%</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                      <span>Max Budget: <strong>₹{d.max_budget_per_kg}/kg</strong></span>
                      <span>Hub: <strong>{d.delivery_district}</strong></span>
                      <span className="text-blue-700 font-bold flex items-center gap-1">
                        <span>{d.offers_count || 0} Offers</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Bottom Section: Supply Offers & FPO Aggregation Panel */}
      {demandDetails && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-extrabold text-slate-900">
                  Incoming Supply Offers for {demandDetails.product_name} (#{demandDetails.id?.substring(0, 8)})
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review farmer and FPO commitments. Accept offers to aggregate compatible supply into an Escrow-backed order.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono font-bold">
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl text-slate-700">
                Filled: <strong className="text-emerald-700">{demandDetails.filled_quantity_kg} kg</strong>
              </span>
              <span className="bg-blue-50 px-3 py-1.5 rounded-xl text-blue-800 border border-blue-200">
                Remaining: <strong>{demandDetails.remaining_quantity_kg} kg</strong>
              </span>
            </div>
          </div>

          {/* Offers List */}
          {demandDetails.offers?.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-600">Waiting for Farmer Supply Offers...</p>
              <p className="text-slate-400 max-w-sm mx-auto">
                Eligible farmers and FPOs in {demandDetails.delivery_district} have been notified. Once they submit supply offers, they will appear here for 1-click acceptance.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {demandDetails.offers.map((offer) => {
                const isAccepted = offer.status === 'ACCEPTED';
                const isRejected = offer.status === 'REJECTED';
                const isPending = offer.status === 'PENDING';

                return (
                  <div
                    key={offer.id}
                    className={`p-5 rounded-3xl border transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isAccepted
                        ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/30'
                        : isRejected
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-extrabold text-sm text-slate-900">{offer.farmer_name}</span>
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800 text-[10px]">
                          Grade: {offer.quality_grade}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                          isAccepted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isRejected
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {offer.status}
                        </span>
                      </div>

                      <p className="text-slate-600 flex flex-wrap items-center gap-3">
                        <span>Offered: <strong className="text-slate-900 font-mono">{offer.offered_quantity_kg} kg</strong></span>
                        <span>•</span>
                        <span>Asking Rate: <strong className="text-emerald-700 font-mono">₹{offer.expected_price_per_kg}/kg</strong></span>
                        <span>•</span>
                        <span>Total: <strong className="text-slate-900 font-mono">₹{(offer.offered_quantity_kg * offer.expected_price_per_kg).toLocaleString('en-IN')}</strong></span>
                      </p>

                      {offer.notes && (
                        <p className="text-slate-500 italic text-[11px]">"{offer.notes}"</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-start md:self-auto">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleAcceptOffer(offer.id)}
                            disabled={acceptingOfferId === offer.id}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                          >
                            {acceptingOfferId === offer.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Accept & Lock Escrow</span>
                          </button>

                          <button
                            onClick={() => handleRejectOffer(offer.id)}
                            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                          >
                            <X className="w-3.5 h-3.5 text-slate-500" />
                            <span>Decline</span>
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-800 font-bold block">✓ Order Confirmed</span>
                          <span className="font-mono text-slate-600 text-[11px]">Order #{offer.order_id?.substring(0, 8)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
export default BuyerRequirements;

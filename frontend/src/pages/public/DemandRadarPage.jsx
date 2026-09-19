import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity, TrendingUp, Sparkles, MapPin, Package, ShieldCheck, ArrowRight,
  RefreshCw, CheckCircle2, AlertTriangle, Layers, Users, Zap, Flame, BarChart2
} from 'lucide-react';
import api from '../../services/api';

export const DemandRadarPage = () => {
  const navigate = useNavigate();
  const [radarItems, setRadarItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');

  useEffect(() => {
    fetchRadarData();
  }, []);

  const fetchRadarData = async () => {
    setLoading(true);
    try {
      const [radarRes, analyticsRes, heatmapRes] = await Promise.all([
        api.get('/demands/radar'),
        api.get('/demands/analytics'),
        api.get('/demands/heatmap'),
      ]);
      setRadarItems(radarRes.data.radar_items || []);
      setAnalytics(analyticsRes.data || null);
      setHeatmap(heatmapRes.data.heatmap || []);
    } catch (err) {
      console.error('Failed to load demand radar:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = radarItems.filter((item) => {
    const streamMatch = selectedStream === 'ALL' || item.stream_type === selectedStream;
    const districtMatch = selectedDistrict === 'ALL' || item.location?.toLowerCase().includes(selectedDistrict.toLowerCase());
    return streamMatch && districtMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold border border-emerald-400/30">
            <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Live Marketplace Demand Radar</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Where Agricultural Demand Exists Right Now
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            VyavaSahayam operationalizes a true <strong className="text-emerald-300">Demand-First Procurement Loop</strong>. We continuously aggregate 3 real-time demand streams to ensure zero unsold farmer inventory and reduced post-harvest spoilage across Andhra Pradesh.
          </p>
        </div>

        {/* 3 Stream Tags */}
        <div className="relative z-10 flex flex-wrap gap-2 pt-6">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Stream A: Confirmed B2B Buyer Demands
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Stream B: LightGBM ML Forecast Supply Gaps
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Stream C: Aggregated Consumer Pre-Orders
          </span>
        </div>
      </div>

      {/* Real-time KPI Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Total Demand Generated</span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {analytics.total_demanded_kg?.toLocaleString()} <span className="text-xs font-bold text-slate-500">kg</span>
            </div>
            <p className="text-[11px] text-slate-500">Across all commercial B2B procurement requests</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Supply Committed & Matched</span>
            <div className="text-2xl font-black text-emerald-600 font-mono">
              {analytics.total_fulfilled_kg?.toLocaleString()} <span className="text-xs font-bold text-emerald-700">kg</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">
              Conversion Rate: {analytics.conversion_rate_pct}%
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Active Open Gap</span>
            <div className="text-2xl font-black text-blue-600 font-mono">
              {analytics.unfulfilled_demand_kg?.toLocaleString()} <span className="text-xs font-bold text-blue-700">kg</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {analytics.active_demands_count} active procurement contracts
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Post-Harvest Spoilage Prevented</span>
            <div className="text-2xl font-black text-teal-700 font-mono">
              {analytics.spoilage_prevented_kg?.toLocaleString()} <span className="text-xs font-bold text-teal-800">kg</span>
            </div>
            <p className="text-[11px] text-slate-500">By pre-committing harvests to direct demand</p>
          </div>
        </div>
      )}

      {/* Main Grid: Live Radar Cards + AP District Heatmap */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Radar Signals Feed */}
        <div className="lg:col-span-8 space-y-5">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700">Filter Stream:</span>
              {[
                { label: 'All Signals', val: 'ALL' },
                { label: '🟢 Confirmed B2B', val: 'CONFIRMED_B2B' },
                { label: '📈 ML Forecasts', val: 'FORECAST_GAP' },
                { label: '🛒 Pre-Orders', val: 'CONSUMER_PREORDER' },
              ].map((st) => (
                <button
                  key={st.val}
                  onClick={() => setSelectedStream(st.val)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    selectedStream === st.val
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchRadarData}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
              <p className="font-bold text-xs">Polling live demand signals...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-sm">No Active Demand Signals Matching Filter</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-base text-slate-900">{item.product_name}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                        item.stream_type === 'CONFIRMED_B2B'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.stream_type === 'FORECAST_GAP'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {item.badge_label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.intensity === 'VERY_HIGH'
                          ? 'bg-red-100 text-red-700'
                          : item.intensity === 'HIGH'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.intensity} DEMAND
                      </span>
                    </div>

                    <p className="text-slate-500 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.location}</span>
                      </span>
                      <span>•</span>
                      <span>Volume: <strong className="text-slate-900 font-mono">{item.quantity_kg?.toLocaleString()} kg</strong></span>
                      {item.target_price && (
                        <>
                          <span>•</span>
                          <span>Max Budget: <strong className="text-emerald-700 font-mono">₹{item.target_price}/kg</strong></span>
                        </>
                      )}
                      <span>•</span>
                      <span>Timing: <strong>{item.required_by}</strong></span>
                    </p>
                  </div>

                  <Link
                    to={item.action_url}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
                  >
                    <span>View Opportunity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): AP District Heatmap */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="font-extrabold text-sm text-slate-900">
                Andhra Pradesh Demand Intensity
              </h3>
            </div>
            <p className="text-[11px] text-slate-500">
              Aggregated procurement volume by mandi district hub
            </p>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {heatmap.map((dist) => (
              <div
                key={dist.district}
                onClick={() => setSelectedDistrict(selectedDistrict === dist.district ? 'ALL' : dist.district)}
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedDistrict === dist.district
                    ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: dist.color_hex }}
                    />
                    <strong className="font-bold text-slate-800">{dist.district}</strong>
                  </div>
                  <span className="font-mono font-extrabold text-slate-900">
                    {dist.total_demand_kg?.toLocaleString()} kg
                  </span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100">
                  <span>B2B: <strong>{dist.confirmed_b2b_kg} kg</strong></span>
                  <span>Pre-Orders: <strong>{dist.consumer_preorder_kg} kg</strong></span>
                  <span className="font-bold" style={{ color: dist.color_hex }}>{dist.intensity}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-2">
            <strong className="block text-slate-800 font-bold">💡 How Demand Radar Works:</strong>
            <p className="leading-relaxed">
              When buyers post requirements or our ML model forecasts supply shortfalls, signals enter the Radar. Farmers can review and submit offers with 1 click to commit harvest volumes.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
export default DemandRadarPage;

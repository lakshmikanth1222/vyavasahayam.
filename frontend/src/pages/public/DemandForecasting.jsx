import React, { useState, useEffect } from 'react';
import {
  Calendar, Sparkles, TrendingUp, TrendingDown, ArrowUpRight, Scale,
  ShieldCheck, Landmark, Leaf, Flame, SunMedium, AlertTriangle, Filter,
  Search, CheckCircle2, ChevronRight, BarChart3, Clock, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export const DemandForecasting = () => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('Organic Farm Spinach (Palak)');
  const [cropDetail, setCropDetail] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [cropLoading, setCropLoading] = useState(false);

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const [calRes, predRes] = await Promise.all([
          api.get('/forecasting/seasonal-calendar'),
          api.get('/forecasting/predictions', {
            params: { month: selectedMonth }
          })
        ]);
        setCalendarEvents(calRes.data.events || []);
        setPredictions(predRes.data.predictions || []);
      } catch (err) {
        console.error("Forecast fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecastData();
  }, [selectedMonth]);

  useEffect(() => {
    const fetchSingleCrop = async () => {
      if (!selectedCrop) return;
      setCropLoading(true);
      try {
        const res = await api.get(`/forecasting/crop/${encodeURIComponent(selectedCrop)}`);
        setCropDetail(res.data.forecast);
      } catch (err) {
        console.error("Crop detail error:", err);
      } finally {
        setCropLoading(false);
      }
    };
    fetchSingleCrop();
  }, [selectedCrop]);

  const months = [
    { num: 1, name: 'Jan (Sankranti)' },
    { num: 2, name: 'Feb (Mahashivaratri)' },
    { num: 3, name: 'Mar (Holi / Ugadi)' },
    { num: 4, name: 'Apr (Summer / Ramzan)' },
    { num: 5, name: 'May (Avakaya Peak)' },
    { num: 6, name: 'Jun (Kharif Sowing)' },
    { num: 7, name: 'Jul (Early Monsoon)' },
    { num: 8, name: 'Aug (Shravanam)' },
    { num: 9, name: 'Sep (Vinayaka Chavithi)' },
    { num: 10, name: 'Oct (Navratri / Dussehra)' },
    { num: 11, name: 'Nov (Kartheeka Maasam)' },
    { num: 12, name: 'Dec (Winter / Weddings)' }
  ];

  const filteredPredictions = predictions.filter(item => {
    const matchSearch = item.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.primary_demand_driver?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-emerald-500/20">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Agricultural Demand & Cultural Dietary Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Predictive Demand Forecasting & Seasonal Surge Analytics
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Multi-year Agmarknet historical models combined with cultural fasting calendars (like <strong>Kartheeka Maasam</strong> vegetarian peaks, <strong>Sankranti</strong> harvests, and <strong>Andhra Avakaya</strong> pickling seasons) to forecast demand spikes, price appreciation, and optimal sowing windows.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/farmer/recommendations"
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <Leaf className="w-4 h-4" />
            <span>Farmer Sowing Advisory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/buyer/requirements"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>B2B Hedging & Pre-Contracts</span>
          </Link>
        </div>
      </div>

      {/* Cultural & Religious Demand Shift Drivers */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider block">
              Cultural & Religious Calendar Drivers
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Key Festive & Dietary Demand Shift Windows
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Dynamic demand multipliers based on regional South Indian and Pan-India culinary patterns.
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calendarEvents.map((ev) => (
            <div
              key={ev.id}
              className={`rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                ev.is_currently_active
                  ? 'bg-gradient-to-b from-emerald-50/90 to-white border-emerald-400 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 font-mono">
                    {ev.period_label}
                  </span>
                  {ev.is_currently_active ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] animate-pulse">
                      ACTIVE NOW
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px]">
                      in ~{ev.days_until_event} days
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{ev.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {ev.cultural_driver}
                  </p>
                </div>

                {/* Top Surge Crops */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Highest Surge Commodities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ev.top_demand_crops.slice(0, 4).map((tc, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => setSelectedCrop(tc.crop)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-800 text-[11px] font-bold transition-colors flex items-center gap-1"
                      >
                        <span>{tc.crop}</span>
                        <span className="text-emerald-700 text-[10px] font-mono font-extrabold">+{tc.spike_pct}%</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                <div className="text-slate-700">
                  🌱 <strong>Farmer Action:</strong> {ev.farmer_action_window}
                </div>
                <div className="text-blue-900 font-medium">
                  🏢 <strong>B2B Buyer Tip:</strong> {ev.b2b_buyer_advisory}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive 12-Month Single Crop Forecast & Sowing Curve */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                12-Month Annual Demand & Price Trajectory Curve
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any agricultural commodity to inspect its annual cultural demand shifts, peak festival windows, and optimal planting calendar.
            </p>
          </div>

          {/* Crop Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Select Crop:</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-extrabold text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Organic Farm Spinach (Palak)">Organic Farm Spinach (Palak)</option>
              <option value="Amaranthus (Thotakura)">Amaranthus (Thotakura)</option>
              <option value="Gongura (Sorrel Leaves)">Gongura (Sorrel Leaves)</option>
              <option value="Tomato">Tomato (Hybrid Vine)</option>
              <option value="Brinjal">Brinjal (Vankaya)</option>
              <option value="Bottle Gourd">Bottle Gourd (Sorakaya)</option>
              <option value="Raw Mango">Raw Pickling Mango (Avakaya)</option>
              <option value="Watermelon">Watermelon (Summer Hydration)</option>
              <option value="Sugarcane">Sugarcane (Sankranti Harvest)</option>
              <option value="Broad Beans">Broad Beans (Chikkudukaya)</option>
              <option value="Sweet Orange (Mosambi)">Sweet Orange (Mosambi)</option>
              <option value="Banana">Banana (Pooja & Fasting)</option>
              <option value="Potato">Potato (Navratri Vrat & Wedding)</option>
              <option value="Onion">Onion (Kurnool Rose)</option>
              <option value="Red Chilli">Red Chilli (Dry Guntur Teja)</option>
            </select>
          </div>
        </div>

        {cropLoading || !cropDetail ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading 12-month predictive trajectory...
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Peak Demand Highlight Card */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  🏆 Peak Demand Window
                </span>
                <div className="text-xl font-black mt-1">
                  {cropDetail.peak_demand_analysis.peak_month} (Spike: +{cropDetail.peak_demand_analysis.peak_spike_pct}%)
                </div>
                <p className="text-[11px] text-emerald-800 mt-1 font-medium">
                  Triggered by: <strong>{cropDetail.peak_demand_analysis.peak_event}</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">
                  📈 Peak Expected Wholesale Rate
                </span>
                <div className="text-xl font-black mt-1 font-mono">
                  ₹{cropDetail.peak_demand_analysis.peak_expected_price_kg.toFixed(2)} / kg
                </div>
                <p className="text-[11px] text-blue-800 mt-1">
                  Current Modal: <strong className="font-mono">₹{cropDetail.current_mandi_modal_kg} / kg</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
                  🌱 Optimal Planting / Sowing Window
                </span>
                <div className="text-lg font-black mt-1 text-amber-900">
                  {cropDetail.peak_demand_analysis.recommended_sowing_period}
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  Maturity: <strong>{cropDetail.crop_growth_days} days</strong> to hit peak prices.
                </p>
              </div>
            </div>

            {/* 12-Month Visual Bar Curve */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Annual Demand Index & Price Fluctuation Forecast (Jan - Dec)
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Baseline Equilibrium = 1.0x
                </span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-4">
                {cropDetail.annual_demand_curve.map((m, mIdx) => {
                  const isPeak = m.is_peak_demand_window;
                  const barHeight = Math.min(100, Math.max(25, (m.demand_index / 2.0) * 100));

                  return (
                    <div key={mIdx} className="flex flex-col items-center space-y-2 group">
                      
                      {/* Tooltip on Hover */}
                      <span className="text-[10px] font-mono font-bold text-slate-700">
                        ₹{m.expected_price_kg.toFixed(0)}
                      </span>

                      {/* Bar Container */}
                      <div className="w-full h-28 bg-slate-200/80 rounded-xl overflow-hidden flex flex-col justify-end p-1 relative">
                        <div
                          className={`w-full rounded-lg transition-all duration-500 ${
                            isPeak
                              ? 'bg-gradient-to-t from-emerald-600 to-teal-500 shadow-md ring-2 ring-emerald-400/50'
                              : 'bg-slate-400 group-hover:bg-slate-500'
                          }`}
                          style={{ height: `${barHeight}%` }}
                        />
                      </div>

                      <div className="text-center">
                        <span className={`text-[11px] font-bold block ${isPeak ? 'text-emerald-800' : 'text-slate-600'}`}>
                          {m.month_name}
                        </span>
                        <span className={`text-[9px] font-mono block ${m.demand_spike_pct > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                          {m.demand_spike_pct > 0 ? `+${m.demand_spike_pct}%` : `${m.demand_spike_pct}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Multi-Crop Forecasts for Selected Month */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider block">
              Monthly Intelligence Table
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Crop Demand Forecasts for Month {selectedMonth}
            </h2>
          </div>

          {/* Month Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {months.map((m) => (
              <button
                key={m.num}
                onClick={() => setSelectedMonth(m.num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedMonth === m.num
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search crop or demand reason (Palak, Tomato, Kartheeka, Avakaya)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm bg-white"
          />
        </div>

        {/* Predictions Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4">Commodity / Variety</th>
                  <th className="p-4">Current Mandi Rate</th>
                  <th className="p-4">Projected Harvest Rate</th>
                  <th className="p-4">Demand Index</th>
                  <th className="p-4">Cultural / Seasonal Driver</th>
                  <th className="p-4">Optimal Sowing</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPredictions.slice(0, 15).map((p, idx) => {
                  const isHighSpike = p.demand_spike_pct >= 40;

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <strong className="font-extrabold text-sm text-slate-900 block">{p.commodity}</strong>
                        <span className="text-[11px] text-slate-400">{p.variety}</span>
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-700">
                        ₹{p.current_mandi_price_kg.toFixed(2)}/kg
                      </td>

                      <td className="p-4">
                        <span className="font-mono font-extrabold text-emerald-800 text-sm block">
                          ₹{p.projected_price_kg.toFixed(2)}/kg
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">
                          +{p.expected_price_change_pct}% expected gain
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-1 rounded-md font-extrabold text-[11px] font-mono ${
                            isHighSpike
                              ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            +{p.demand_spike_pct}%
                          </span>
                        </div>
                      </td>

                      <td className="p-4 max-w-xs text-slate-600">
                        <p className="line-clamp-2 leading-relaxed">
                          {p.primary_demand_driver}
                        </p>
                      </td>

                      <td className="p-4 text-slate-700">
                        <span className="font-bold block text-slate-900">
                          {p.optimal_sowing_window.recommended_sowing_month}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Maturity: {p.optimal_sowing_window.growth_cycle_days}d
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedCrop(p.commodity)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 font-bold text-[11px] transition-all"
                        >
                          View 12M Curve
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
export default DemandForecasting;

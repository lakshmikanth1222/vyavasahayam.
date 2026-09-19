import React, { useState, useEffect } from 'react';
import {
  Sprout, Sparkles, TrendingUp, SunMedium, CloudRain, Droplets,
  CheckCircle2, ArrowRight, DollarSign, Calendar, MapPin, Landmark
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export const CropAdvisor = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [district, setDistrict] = useState('Krishna');
  const [soilType, setSoilType] = useState('Alluvial / Black Clay');
  const [acreage, setAcreage] = useState(2.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/farmers/recommendations', {
          params: {
            district: district,
            soil_type: soilType,
            acreage: acreage
          }
        });
        setRecommendations(res.data);
      } catch (err) {
        console.error("Failed to load crop recommendations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [district, soilType, acreage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Cultural & Seasonal Sowing Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Seasonal Crop & Festive Market Demand Advisory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Calculates high-profit planting recommendations by aligning farmer sowing schedules with upcoming cultural demand surges (e.g. <strong>Kartheeka Maasam</strong> vegetarian peaks, <strong>Sankranti</strong> harvest feasts, and <strong>Andhra Avakaya</strong> pickle seasons).
          </p>
        </div>

        <Link
          to="/demand-forecasting"
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors self-start md:self-auto shadow-sm"
        >
          <Landmark className="w-4 h-4 text-emerald-400" />
          <span>Full 12-Month Demand Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Simulator Inputs */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Farmer District
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="Krishna">Krishna (Vijayawada / Gudivada)</option>
            <option value="Guntur">Guntur (Mirchi & Turmeric Belt)</option>
            <option value="East Godavari">East Godavari (Rajahmundry / Kakinada)</option>
            <option value="West Godavari">West Godavari (Eluru / Bhimavaram)</option>
            <option value="Kurnool">Kurnool (Onion & Chana Yard)</option>
            <option value="Anantapur">Anantapur (Groundnut / Mosambi)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-600" /> Soil Typology
          </label>
          <select
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="Alluvial / Black Clay">Alluvial / Black Clay (Krishna Delta)</option>
            <option value="Red Sandy Loam">Red Sandy Loam</option>
            <option value="Black Cotton Deep Soil">Black Cotton Deep Soil</option>
            <option value="Coastal Sandy Soil">Coastal Sandy Soil</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-amber-600" /> Available Land Acreage
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="100"
              value={acreage}
              onChange={(e) => setAcreage(parseFloat(e.target.value) || 1.0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <span className="font-bold text-slate-500 whitespace-nowrap">Acres</span>
          </div>
        </div>
      </div>

      {/* Recommended High-ROI Crops Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              
              {/* Target Event Banner */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[10px] border border-emerald-300">
                  {item.target_festival_event}
                </span>
                <span className="font-mono font-extrabold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {item.profit_multiplier}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-slate-900">{item.crop}</h3>
                <p className="text-xs text-slate-500 font-medium">{item.variety}</p>
              </div>

              {/* Price & Profit Breakdown */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Spot Rate:</span>
                  <span className="font-mono font-bold text-slate-700">₹{item.current_price_kg.toFixed(2)}/kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold text-emerald-900">Projected Peak Rate:</span>
                  <span className="font-mono font-black text-emerald-800 text-sm">₹{item.projected_harvest_price_kg.toFixed(2)}/kg</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-200/60 font-bold">
                  <span className="text-slate-700">Est. Net Profit ({acreage} Acres):</span>
                  <span className="font-mono text-emerald-900 text-sm">₹{item.estimated_net_profit_inr.toLocaleString()}</span>
                </div>
              </div>

              {/* Sowing & Harvest Schedule */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>{item.sow_window}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{item.harvest_window}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <span>Yield Potential: <strong>{item.projected_yield_per_acre}</strong></span>
                </div>
              </div>

              {/* Solar Drying Backup */}
              <div className="p-3 rounded-xl bg-solar-50/80 border border-solar-200 text-[11px] text-solar-900 flex items-start gap-2">
                <SunMedium className="w-4 h-4 text-solar-600 flex-shrink-0 mt-0.5" />
                <span><strong>Rescue Backup:</strong> {item.solar_drying_backup}</span>
              </div>

            </div>

            <button
              onClick={() => alert(`Pre-booking verified seed allotment & agronomy extension kit for ${item.crop} (${acreage} Acres)`)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm"
            >
              Pre-Book Seed Allotment
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
export default CropAdvisor;

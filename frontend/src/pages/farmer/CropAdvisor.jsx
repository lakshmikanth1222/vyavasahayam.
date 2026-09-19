import React, { useState, useEffect } from 'react';
import { Sprout, Sparkles, TrendingUp, SunMedium, CloudRain, Droplets, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const CropAdvisor = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await api.get('/farmers/recommendations');
        setRecommendations(res.data);
      } catch (err) {
        console.error("Failed to load crop recommendations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="space-y-1">
        <span className="text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
          Agri Intelligence
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Seasonal Crop & Market Demand Advisory
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Data-backed planting recommendations matched against soil typology, seasonal weather models, and projected B2B mandi demand.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {recommendations.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Sprout className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                  {item.demand_outlook}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900">{item.crop}</h3>
                <p className="text-xs text-slate-500 font-medium">{item.season}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Soil Compatibility</span>
                  <strong className="text-slate-800">{item.soil_fit}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Expected Wholesale Price</span>
                  <strong className="text-emerald-700 font-mono font-bold">{item.avg_expected_price}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Yield Potential</span>
                  <strong className="text-slate-800">{item.yield_potential}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-solar-50/70 border border-solar-200 text-xs text-solar-900 flex items-start gap-2">
                <SunMedium className="w-4 h-4 text-solar-600 flex-shrink-0 mt-0.5" />
                <span><strong>Rescue Backup:</strong> {item.solar_drying_yield}</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Pre-booking seed kit & extension agronomist consultation for ${item.crop}`)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Pre-Book Seed Allotment
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

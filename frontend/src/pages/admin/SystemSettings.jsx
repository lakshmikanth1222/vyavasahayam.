import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Shield, Zap, Truck, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export const SystemSettings = () => {
  const [config, setConfig] = useState({
    free_delivery_min_order: 500.0,
    default_delivery_fee: 40.0,
    farmer_insurance_enabled: true,
    farmer_insurance_percentage: 3.0,
    platform_commission_percentage: 2.0,
    discount_window_tier1_percent: 10.0,
    discount_window_tier2_percent: 25.0,
    cod_min_trust_score: 50
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setConfig(res.data);
    } catch (err) {
      console.error("Settings fetch error:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.post('/admin/settings', null, {
        params: {
          free_delivery_min_order: config.free_delivery_min_order,
          farmer_insurance_enabled: config.farmer_insurance_enabled,
          farmer_insurance_percentage: config.farmer_insurance_percentage,
          discount_tier1: config.discount_window_tier1_percent,
          discount_tier2: config.discount_window_tier2_percent
        }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Settings save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">System Policy & Business Rules Configuration</h1>
        <p className="text-xs text-slate-500">Configure marketplace thresholds, dynamic discount rules, and farmer insurance parameters</p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System configuration updated and propagated across backend services!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        
        {/* Delivery Threshold Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-900 text-sm">
            <Truck className="w-4 h-4 text-brand-600" />
            <span>Delivery & Free Threshold Rules</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Free Delivery Minimum Order Value (₹)
              </label>
              <input
                type="number"
                value={config.free_delivery_min_order}
                onChange={(e) => setConfig({ ...config, free_delivery_min_order: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Orders &gt;= this value receive ₹0 delivery fee.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Standard Delivery Charge (₹)
              </label>
              <input
                type="number"
                value={config.default_delivery_fee}
                onChange={(e) => setConfig({ ...config, default_delivery_fee: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Farmer Insurance Policy Settings */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-900 text-sm">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Configurable Farmer Insurance Policy Proposal</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <input
                type="checkbox"
                id="ins_toggle"
                checked={config.farmer_insurance_enabled}
                onChange={(e) => setConfig({ ...config, farmer_insurance_enabled: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded"
              />
              <label htmlFor="ins_toggle" className="font-bold text-slate-800 cursor-pointer">
                Enable Farmer Insurance Feature
              </label>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Insurance Contribution (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={config.farmer_insurance_percentage}
                onChange={(e) => setConfig({ ...config, farmer_insurance_percentage: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Default: 3% project proposal on gross farmer payout.
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Freshness Discount Window Settings */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-900 text-sm">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Freshness Timer Dynamic Discount Thresholds</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tier 1 Discount (25% - 50% Shelf Life Remaining) (%)
              </label>
              <input
                type="number"
                value={config.discount_window_tier1_percent}
                onChange={(e) => setConfig({ ...config, discount_window_tier1_percent: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tier 2 Rescue Clearance (&lt;25% Shelf Life Remaining) (%)
              </label>
              <input
                type="number"
                value={config.discount_window_tier2_percent}
                onChange={(e) => setConfig({ ...config, discount_window_tier2_percent: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-600/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Rules...' : 'Save Configuration Changes'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, Upload, Sparkles, ShieldCheck, ArrowRight, CheckCircle2,
  AlertTriangle, RefreshCw, Thermometer, Droplets, Zap
} from 'lucide-react';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import api from '../../services/api';

export const NewListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    product_name: 'Hybrid Vine Tomato',
    title: 'Grade A Fresh Tomatoes (Direct Harvest)',
    quantity: 500,
    unit: 'kg',
    asking_price: 24.0,
    quality_grade: 'GRADE_A',
    location_address: 'Plot 14, Gannavaram Rural Farm Road',
    village: 'Gannavaram',
    district: 'Krishna',
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    iot_temp: 24.5,
    iot_humidity: 68.0,
    notes: 'Harvested early morning at 6:30 AM under cool ambient temperature.'
  });

  const [screeningResult, setScreeningResult] = useState(null);
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Run AI Computer Vision Screening
  const runAIScreening = async () => {
    setScreeningLoading(true);
    try {
      const res = await api.post('/farmers/screen-image', null, {
        params: {
          product_name: formData.product_name,
          image_url: formData.image_url,
          harvest_age_hours: 3.5,
          iot_temp: formData.iot_temp,
          iot_humidity: formData.iot_humidity
        }
      });
      setScreeningResult(res.data);
    } catch (err) {
      console.error("AI screening error:", err);
    } finally {
      setScreeningLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/farmers/listings', formData);
      setSuccessData(res.data);
    } catch (err) {
      console.error("Failed to create listing:", err);
      alert("Failed to submit produce listing. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-1">
        <span className="text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
          Step 1: Produce Onboarding & AI Screening Gate
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          List Fresh Farm Produce
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          List your harvest for B2B buyers and B2C consumers. Our Computer Vision AI will screen quality, estimate shelf-life, and activate your batch's Digital Twin.
        </p>
      </div>

      {/* Success State */}
      {successData && (
        <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3 text-emerald-900 font-extrabold text-lg">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            <span>Produce Listed Successfully! Batch Digital Twin Active</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-200 grid sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Batch Code:</span>
              <strong className="font-mono text-sm text-slate-900 font-bold">{successData.batch_code}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">AI Freshness Score:</span>
              <div className="mt-1">
                <FreshnessBadge score={successData.ai_screening?.freshness_score} size="sm" />
              </div>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Shelf-Life Prediction:</span>
              <strong className="text-slate-900 font-bold">{successData.ai_screening?.estimated_shelf_life_days} Days</strong>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/farmer/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all"
            >
              Go to Farmer Dashboard
            </button>
            <button
              onClick={() => {
                setSuccessData(null);
                setScreeningResult(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
            >
              List Another Crop
            </button>
          </div>
        </div>
      )}

      {/* Main Listing Form & Live AI Screening Panel */}
      {!successData && (
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            
            <div className="space-y-3 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Crop / Product Type *</label>
                <select
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="Hybrid Vine Tomato">Hybrid Vine Tomato (Solar-Drying Eligible)</option>
                  <option value="Guntur Green Chilli">Guntur Green Chilli (Spice Drying Eligible)</option>
                  <option value="Kurnool Rose Onion">Kurnool Rose Onion</option>
                  <option value="Fresh Native Brinjal">Fresh Native Brinjal</option>
                  <option value="Organic Farm Spinach (Palak)">Organic Farm Spinach (Palak)</option>
                  <option value="Farm Fresh Potato">Farm Fresh Potato</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Listing Title *</label>
                <input
                  type="text"
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harvest Quantity *</label>
                  <input
                    type="number"
                    required
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Asking Price (₹/kg) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    name="asking_price"
                    value={formData.asking_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Village *</label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District *</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Farm Location / Packhouse Address *</label>
                <input
                  type="text"
                  required
                  name="location_address"
                  value={formData.location_address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Produce Photo URL / Camera Link</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>

              {/* IoT Sensors */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Farm Gate IoT Sensor Telemetry (Optional)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Core Temperature (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      name="iot_temp"
                      value={formData.iot_temp}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Humidity (% RH)</span>
                    <input
                      type="number"
                      step="0.1"
                      name="iot_humidity"
                      value={formData.iot_humidity}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={runAIScreening}
                disabled={screeningLoading}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Run AI Freshness Scan</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Submit & Activate Listing</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* AI Screening Preview Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-sm">AI Quality Screening Gate</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  CV Screen v2.4
                </span>
              </div>

              {/* Photo Preview */}
              <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                <img
                  src={formData.image_url}
                  alt="Produce Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Live Visual Feed Preprocessing
                  </span>
                </div>
              </div>

              {screeningLoading ? (
                <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
                  <span>Analyzing epidermal texture, firmness & defect vectors...</span>
                </div>
              ) : screeningResult ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Freshness Score:</span>
                    <FreshnessBadge score={screeningResult.freshness_score} category={screeningResult.freshness_category} size="md" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Grade:</span>
                    <span className="font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                      {screeningResult.quality_grade}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estimated Shelf Life:</span>
                    <strong className="text-white font-bold">{screeningResult.estimated_shelf_life_days} Days</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Spoilage Risk:</span>
                    <strong className="text-emerald-300 font-mono">{screeningResult.spoilage_risk_pct}%</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
                    <span className="text-slate-400 font-bold block mb-0.5">Defect Analysis:</span>
                    {screeningResult.visible_defects}
                  </div>

                  {screeningResult.drying_eligible && (
                    <div className="p-2.5 rounded-xl bg-solar-900/40 border border-solar-500/40 text-solar-300 text-[11px] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-solar-400 flex-shrink-0" />
                      <span>Solar Drying Value-Addition Eligible (10:1 yield recovery)</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center text-xs text-slate-400">
                  Click <strong>"Run AI Freshness Scan"</strong> to preview real-time automated quality classification.
                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

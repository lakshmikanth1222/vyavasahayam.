import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Clock, MapPin, RefreshCw, Send, Calendar } from 'lucide-react';
import api from '../../services/api';

export const PreOrderModal = ({ isOpen, onClose, defaultProduct = 'Tomato', defaultLocation = 'Krishna' }) => {
  const [form, setForm] = useState({
    product_name: defaultProduct,
    quantity_kg: 10,
    requested_delivery_date: '',
    location: defaultLocation,
    target_price: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    try {
      const res = await api.post('/preorders', {
        product_name: form.product_name,
        quantity_kg: parseFloat(form.quantity_kg),
        requested_delivery_date: form.requested_delivery_date ? new Date(form.requested_delivery_date).toISOString() : null,
        location: form.location,
        target_price: form.target_price ? parseFloat(form.target_price) : null,
        notes: form.notes
      });
      setSuccess(res.data.message || 'Pre-order registered successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Pre-order error:', err);
      alert(err.response?.data?.detail || 'Failed to place pre-order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              <Sparkles className="w-3 h-3" />
              <span>Direct-from-Farm Harvest Pre-Order</span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-1">
              Pre-Order Fresh Harvest Batch
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
            ✕
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center text-emerald-900 space-y-2 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-sm">{success}</h4>
            <p className="text-slate-500 max-w-xs mx-auto">
              Your pre-order has been aggregated into the local demand radar. Local farmers will harvest and prepare your batch.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Produce *</label>
              <select
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
              >
                <option value="Tomato">Tomato</option>
                <option value="Onion">Onion</option>
                <option value="Potato">Potato</option>
                <option value="Green Chilli">Green Chilli</option>
                <option value="Brinjal">Brinjal</option>
                <option value="Spinach">Spinach (Palak)</option>
                <option value="Banana">Banana</option>
                <option value="Mango">Mango</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity (kg) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.quantity_kg}
                  onChange={(e) => setForm({ ...form, quantity_kg: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Price (₹/kg)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Optional"
                  value={form.target_price}
                  onChange={(e) => setForm({ ...form, target_price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery District *</label>
                <select
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Krishna">Krishna (Vijayawada)</option>
                  <option value="Guntur">Guntur</option>
                  <option value="East Godavari">East Godavari</option>
                  <option value="West Godavari">West Godavari (Eluru)</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                  <option value="Kurnool">Kurnool</option>
                  <option value="Kadapa">Kadapa</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Delivery Date</label>
                <input
                  type="date"
                  value={form.requested_delivery_date}
                  onChange={(e) => setForm({ ...form, requested_delivery_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Preferences / Notes</label>
              <input
                type="text"
                placeholder="e.g. Prefer semi-ripe tomatoes for salad"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Register Pre-Order Demand</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default PreOrderModal;

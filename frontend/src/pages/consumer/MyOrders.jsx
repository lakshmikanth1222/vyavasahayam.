import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle2, ShieldCheck, Star, Clock, MapPin, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackOrderId, setFeedbackOrderId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [confirmingMap, setConfirmingMap] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/consumers/orders');
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    setConfirmingMap(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await api.post(`/consumers/orders/${orderId}/confirm-delivery`);
      alert(res.data.message);
      fetchOrders();
    } catch (err) {
      console.error("Confirm error:", err);
      alert("Failed to confirm delivery");
    } finally {
      setConfirmingMap(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/consumers/orders/${feedbackOrderId}/feedback`, null, {
        params: {
          freshness_rating: rating,
          quality_rating: rating,
          delivery_rating: rating,
          comments: comments
        }
      });
      alert("Thank you for your rating! Feedback shared with the local farming cluster.");
      setFeedbackOrderId(null);
      setComments('');
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Farm Orders</h1>
        <p className="text-xs text-slate-500">Track local Rythu Bazar fulfillment, confirm delivery to release farmer payments & rate quality</p>
      </div>

      <div className="space-y-4">
        {orders.map((ord) => {
          const isConfirming = confirmingMap[ord.id];
          return (
            <div
              key={ord.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-slate-900">{ord.order_number}</span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                    {ord.status}
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono font-semibold bg-slate-100 text-slate-700 text-[10px]">
                    {ord.payment_method}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Total:</span>
                  <span className="font-mono font-extrabold text-base text-slate-900">₹{ord.total_amount}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {ord.items?.map((it) => (
                  <div key={it.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block font-bold">{it.product_name}</strong>
                      <span className="text-slate-500 text-[11px]">{it.quantity} {it.unit} @ ₹{it.unit_price}/{it.unit}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">₹{it.total_price}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Details & Action Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-slate-500 text-[11px] flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {ord.delivery_slot}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ord.delivery_address}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {ord.payment_status === 'HELD' ? (
                    <button
                      onClick={() => handleConfirmDelivery(ord.id)}
                      disabled={isConfirming}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isConfirming ? 'Releasing Escrow...' : 'Confirm Quality & Release Payout'}</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Escrow Released to Farmer
                    </span>
                  )}

                  <button
                    onClick={() => setFeedbackOrderId(ord.id)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Rate Freshness</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Rating Feedback Modal */}
      {feedbackOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900">Rate Produce Freshness & Quality</h3>
            <p className="text-xs text-slate-500">Your direct feedback empowers local farmers and improves grading precision.</p>

            <div className="flex items-center justify-center gap-2 py-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-2 transition-transform hover:scale-110"
                >
                  <Star className={`w-8 h-8 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Tell us about the crispness, taste, and delivery experience..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none h-24"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFeedbackOrderId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitFeedback}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

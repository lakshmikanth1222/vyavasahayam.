import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Trash2, Plus, Minus, ShoppingBag, Truck, ShieldCheck, ArrowRight,
  AlertCircle, CheckCircle2, Clock, MapPin, Sparkles, IndianRupee
} from 'lucide-react';
import api from '../../services/api';

export const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal, deliveryFee, totalAmount, freeDeliveryThreshold, isFreeDelivery, amountNeededForFree } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(
    user?.consumer_profile?.default_address || 'Flat 402, Green Meadows, Benz Circle, Vijayawada'
  );
  const [slot, setSlot] = useState('Today Evening 5:00 PM - 8:00 PM');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE_ESCROW'); // ONLINE_ESCROW, COD
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const codEligible = user?.consumer_profile?.cod_eligible !== false;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload = {
        items: items.map(i => ({ listing_id: i.id, quantity: i.quantity })),
        delivery_address: address,
        delivery_slot: slot,
        payment_method: paymentMethod,
        buyer_notes: notes || null
      };

      const res = await api.post('/consumers/orders', payload);
      clearCart();
      navigate('/orders');
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.detail || "Order submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Your Fresh Basket is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore today's freshly harvested vegetables straight from local farmers and Rythu Bazar centers.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/20 transition-all"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Your Fresh Produce Basket</h1>
        <p className="text-xs text-slate-500">Direct farm fulfillment via local Rythu Bazar center</p>
      </div>

      {/* Free Delivery Threshold Meter */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-brand-50 to-teal-50 border border-emerald-200 text-xs space-y-2 shadow-sm">
        <div className="flex items-center justify-between font-bold">
          <span className="flex items-center gap-1.5 text-emerald-900">
            <Truck className="w-4 h-4 text-emerald-600" />
            {isFreeDelivery ? '🎉 Congratulations! You have unlocked FREE Delivery!' : `Add ₹${amountNeededForFree} more to qualify for FREE Delivery (Threshold: ₹${freeDeliveryThreshold})`}
          </span>
          <span className="font-mono text-emerald-800 font-bold">₹{subtotal} / ₹{freeDeliveryThreshold}</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-7 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{item.title}</h4>
                  <p className="text-slate-500 text-[11px]">Farmer: {item.farmer_name || 'Local FPO'}</p>
                  <span className="font-mono font-bold text-slate-900 block mt-1">
                    ₹{item.discount_price || item.asking_price} / {item.unit}
                  </span>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-lg hover:bg-white text-slate-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold font-mono text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded-lg hover:bg-white text-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className="font-extrabold text-sm text-slate-900 font-mono block">
                    ₹{(item.discount_price || item.asking_price) * item.quantity}
                  </span>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Summary & Payment Options */}
        <form onSubmit={handleCheckout} className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 text-xs">
          <h3 className="font-extrabold text-base text-slate-900 pb-2 border-b border-slate-100">
            Delivery & Payment Details
          </h3>

          {/* Address */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-600" /> Delivery Address *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Delivery Slot */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-600" /> Delivery Slot *
            </label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option>Today Evening 5:00 PM - 8:00 PM</option>
              <option>Tomorrow Morning 7:00 AM - 10:00 AM</option>
              <option>Tomorrow Evening 5:00 PM - 8:00 PM</option>
            </select>
          </div>

          {/* Payment Method & Controlled COD */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="block font-bold text-slate-700">Select Payment Mode</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE_ESCROW')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'ONLINE_ESCROW'
                    ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-500/20 shadow-sm'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-brand-600" /> Online Escrow
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Held safely till delivery</span>
              </button>

              <button
                type="button"
                disabled={!codEligible}
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  !codEligible
                    ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
                    : paymentMethod === 'COD'
                    ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-sm'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1 font-bold text-slate-900">
                  <IndianRupee className="w-4 h-4 text-amber-600" /> Cash on Delivery
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {codEligible ? 'Trust Verified (Score: 85+)' : 'Temporarily Restricted'}
                </span>
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 pt-3">
            <div className="flex justify-between text-slate-600">
              <span>Produce Subtotal:</span>
              <span className="font-mono font-bold text-slate-900">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee:</span>
              <span className="font-mono font-bold text-slate-900">
                {deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable:</span>
              <span className="font-mono text-brand-700">₹{totalAmount}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 transition-all disabled:opacity-50"
          >
            <span>Confirm Order (Escrow Protected)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};

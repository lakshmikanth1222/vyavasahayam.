import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, Clock, CheckCircle2, ShieldCheck, MapPin, IndianRupee } from 'lucide-react';
import api from '../../services/api';

export const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/farmers/orders');
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Farmer Produce Orders</h1>
        <p className="text-xs text-slate-500">Track purchase orders, collection center dispatches, and settlement status</p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 && !loading && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
            No incoming orders placed yet for your harvest.
          </div>
        )}

        {orders.map((ord, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-sm">{ord.order_number}</span>
                <span className="px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800 text-[10px]">
                  {ord.order_type} ORDER
                </span>
                <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                  {ord.order_status}
                </span>
              </div>

              <div>
                <strong className="text-sm font-extrabold text-slate-900 block">{ord.product_name}</strong>
                <p className="text-slate-500">
                  Ordered: <strong>{ord.quantity} {ord.unit}</strong> @ ₹{ord.unit_price}/{ord.unit}
                </p>
              </div>

              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Slot: {ord.delivery_slot}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ord.delivery_address}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Total Value</span>
                <span className="text-lg font-black text-slate-900 font-mono">₹{ord.total_price}</span>
              </div>

              <span className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-1 rounded-lg ${
                ord.payment_status === 'RELEASED'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Escrow: {ord.payment_status}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

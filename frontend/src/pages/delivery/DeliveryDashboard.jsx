import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, CheckCircle2, ShieldCheck, Phone, Navigation, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error("Delivery error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, null, {
        params: { new_status: newStatus }
      });
      fetchOrders();
      alert(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold border border-white/15">
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery Fleet Telematics Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Active Cold-Chain Logistics Hub
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
            Optimized route dispatch connecting Rythu Bazar collection centers with urban B2B depots and doorstep consumer slots.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-xs space-y-1">
          <span className="text-indigo-300 block font-bold uppercase text-[10px]">Fleet Active Status</span>
          <strong className="text-xl font-black font-mono">100% On-Time</strong>
          <span className="text-emerald-300 block text-[11px]">IoT Transit Temp: 24.5°C</span>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900">
          Assigned Deliveries ({orders.length})
        </h3>

        <div className="grid md:grid-cols-2 gap-5">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-sm">{ord.order_number}</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    ord.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                    ord.status === 'IN_TRANSIT' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ord.status}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Recipient</span>
                  <strong className="text-slate-900 text-sm">{ord.buyer_name}</strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{ord.delivery_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Slot: <strong>{ord.delivery_slot}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900 font-mono">₹{ord.total_amount} ({ord.payment_method})</span>
                
                <div className="flex gap-2">
                  {ord.status !== 'IN_TRANSIT' && ord.status !== 'DELIVERED' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'IN_TRANSIT')}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Start Transit</span>
                    </button>
                  )}

                  {ord.status !== 'DELIVERED' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Delivered</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

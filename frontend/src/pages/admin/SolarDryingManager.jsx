import React, { useState, useEffect } from 'react';
import { SunMedium, Package, Droplets, Clock, CheckCircle2, AlertTriangle, PlusCircle, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import api from '../../services/api';

export const SolarDryingManager = () => {
  const [batches, setBatches] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);

  // New batch modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({
    product_name: 'Hybrid Vine Tomato',
    input_quantity_kg: 300,
    input_quality_grade: 'GRADE_B',
    drying_centre_id: '',
    notes: 'Loaded onto food-grade stainless mesh drying racks under controlled solar airflow.'
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bRes, invRes, cRes] = await Promise.all([
        api.get('/solar-drying/batches'),
        api.get('/solar-drying/inventory'),
        api.get('/solar-drying/centres')
      ]);
      setBatches(bRes.data);
      setInventory(invRes.data);
      setCentres(cRes.data);
      if (cRes.data.length > 0 && !newBatch.drying_centre_id) {
        setNewBatch(prev => ({ ...prev, drying_centre_id: cRes.data[0].id }));
      }
    } catch (err) {
      console.error("Solar data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/solar-drying/batches', newBatch);
      setCreateModalOpen(false);
      loadData();
      alert("Solar drying batch initiated! Value-added SKU provisioned in inventory.");
    } catch (err) {
      console.error("Failed to create solar batch:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (batchId, status, finalKg) => {
    try {
      await api.patch(`/solar-drying/batches/${batchId}/status`, null, {
        params: {
          new_status: status,
          final_output_kg: finalKg || undefined,
          moisture_pct: status === 'COMPLETED' ? 10.0 : undefined
        }
      });
      loadData();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-solar-900 via-amber-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-solar-500/20 text-solar-300 text-xs font-semibold border border-solar-500/30">
            <SunMedium className="w-3.5 h-3.5" />
            <span>Solar Drying Value-Addition Module</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Solar Drying & Value Recovery Hub
          </h1>
          <p className="text-xs sm:text-sm text-solar-200 max-w-xl">
            Controlled dehydration converting near-expiry or surplus fresh tomatoes, chillies, and mangoes into high-margin vacuum-sealed dried products.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-solar-500 hover:bg-solar-600 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>Initiate Drying Batch</span>
        </button>
      </div>

      {/* Facility KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-slate-400 font-semibold uppercase">Daily Drying Capacity</span>
          <div className="text-2xl font-black text-slate-900 font-mono">2,000 kg</div>
          <span className="text-emerald-600 block text-[11px] font-medium">Gannavaram Green Hub</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-slate-400 font-semibold uppercase">Active Solar Batches</span>
          <div className="text-2xl font-black text-solar-700 font-mono">
            {batches.filter(b => b.status === 'DRYING' || b.status === 'PREPARING').length}
          </div>
          <span className="text-slate-500 block text-[11px]">In drying tunnels (55°C)</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-slate-400 font-semibold uppercase">Yield Recovery Ratio</span>
          <div className="text-2xl font-black text-emerald-700 font-mono">10 : 1</div>
          <span className="text-slate-500 block text-[11px]">100kg Fresh → 10kg Dried</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-slate-400 font-semibold uppercase">Value Margin Multiplier</span>
          <div className="text-2xl font-black text-amber-700 font-mono">+320%</div>
          <span className="text-emerald-600 block text-[11px] font-medium">₹24/kg → ₹320/kg Dried</span>
        </div>
      </div>

      {/* Active Drying Batches */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Active Solar Drying Batches ({batches.length})</h3>
            <p className="text-slate-500 text-[11px]">Continuous temperature and moisture monitoring on drying racks</p>
          </div>
          <button onClick={loadData} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3">Batch Code</th>
                <th className="pb-3">Produce</th>
                <th className="pb-3">Fresh Input</th>
                <th className="pb-3">Est. Dried Yield</th>
                <th className="pb-3">Moisture Level</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Progress Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-slate-900">{b.batch_code}</td>
                  <td className="py-3.5 font-bold text-slate-900">{b.product_name}</td>
                  <td className="py-3.5 font-mono">{b.input_quantity_kg} kg</td>
                  <td className="py-3.5 font-mono font-bold text-emerald-700">{b.estimated_yield_kg} kg</td>
                  <td className="py-3.5 font-mono font-semibold text-blue-700">{b.moisture_level_pct}% RH</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      b.status === 'DRYING' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    {b.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'DRYING')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px]"
                      >
                        Start Drying
                      </button>
                    )}
                    {b.status === 'DRYING' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'QUALITY_CHECK')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px]"
                      >
                        Quality Check
                      </button>
                    )}
                    {b.status === 'QUALITY_CHECK' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'COMPLETED', b.estimated_yield_kg)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                      >
                        Seal & Pack (Complete)
                      </button>
                    )}
                    {b.status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Packaged in SKU
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Value-Added Dried Product SKU Inventory */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
        <h3 className="font-extrabold text-base text-slate-900">Value-Added Dried Product Inventory</h3>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-solar-50/50 border border-solar-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{item.product_name}</span>
                <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                  {item.status}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">Packaging: {item.packaging_type}</p>
              <div className="flex justify-between pt-1 border-t border-solar-200/60 font-mono">
                <span>Stock: <strong>{item.quantity_kg} kg</strong></span>
                <span className="text-emerald-800 font-bold">MRP: ₹{item.sale_price}/kg</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Initiate Solar Batch Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-slate-900">Initiate Solar Drying Value-Addition</h3>
            <p className="text-slate-500 text-[11px]">Convert surplus fresh harvests into shelf-stable premium dried products.</p>

            <form onSubmit={handleCreateBatch} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Crop Type *</label>
                <select
                  value={newBatch.product_name}
                  onChange={(e) => setNewBatch({ ...newBatch, product_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value="Hybrid Vine Tomato">Hybrid Vine Tomato (Sun-Dried Halves)</option>
                  <option value="Guntur Green Chilli">Guntur Red/Green Chilli (Dry Spice Flakes)</option>
                  <option value="Kurnool Rose Onion">Kurnool Rose Onion (Dehydrated Flakes)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Input Weight (kg) *</label>
                <input
                  type="number"
                  required
                  value={newBatch.input_quantity_kg}
                  onChange={(e) => setNewBatch({ ...newBatch, input_quantity_kg: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-solar-50 border border-solar-200 text-[11px] text-solar-900">
                Estimated Dried Output: <strong>{Math.round(newBatch.input_quantity_kg * 0.1)} kg</strong> (10:1 yield recovery)
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-solar-500 hover:bg-solar-600 text-slate-950 font-bold"
                >
                  {creating ? "Provisioning..." : "Start Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

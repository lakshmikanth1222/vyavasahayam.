import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, QrCode, ArrowRight, Clock, MapPin, User, CheckCircle2, Sparkles } from 'lucide-react';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import { TraceabilityModal } from '../../components/common/TraceabilityModal';
import api from '../../services/api';

export const Traceability = () => {
  const [batches, setBatches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get('/quality/batches');
        setBatches(res.data);
      } catch (err) {
        console.error("Failed to load batches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const filtered = batches.filter((b) =>
    b.batch_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.farmer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Immutable Farm-to-Consumer Traceability</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Trace Your Produce Journey
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Every produce crate is verified at farmer gate, graded electronically at Rythu Bazar, and continuously tracked through IoT telematics.
        </p>

        {/* Search bar */}
        <div className="relative max-w-lg mx-auto pt-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-5" />
          <input
            type="text"
            placeholder="Search by Batch Code (e.g. BATCH-2026-TOM), Produce, or Farmer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs shadow-sm bg-white"
          />
        </div>
      </div>

      {/* Batches Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Active Verified Batches ({filtered.length})
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {batch.batch_code}
                  </span>
                  <FreshnessBadge score={batch.freshness_score} category={batch.freshness_category} size="sm" />
                </div>

                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{batch.product_name}</h4>
                  <p className="text-xs text-slate-500">
                    Farmer: <strong>{batch.farmer_name}</strong>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Stage:</span>
                    <strong className="text-emerald-700 font-bold">{batch.current_stage}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quality Grade:</span>
                    <strong className="text-slate-800">{batch.current_grade}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity:</span>
                    <strong className="text-slate-800">{batch.quantity_kg} kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining Shelf Life:</span>
                    <strong className="text-slate-800">{batch.remaining_shelf_life_days} Days</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedBatchId(batch.id);
                  setModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-brand-200"
              >
                <span>View Full Audit Journey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Traceability Modal */}
      <TraceabilityModal
        batchId={selectedBatchId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

    </div>
  );
};

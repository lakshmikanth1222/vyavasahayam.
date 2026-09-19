import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, MapPin, User, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { FreshnessBadge } from './FreshnessBadge';

export const TraceabilityModal = ({ batchId, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !batchId) return;
    const fetchTraceability = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/quality/batches/${batchId}/traceability`);
        setData(res.data);
      } catch (err) {
        console.error("Traceability fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTraceability();
  }, [isOpen, batchId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-brand-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Farm-to-Fork Batch Traceability</h3>
              <p className="text-xs text-brand-200 font-mono">
                Batch Code: {data?.batch_code || 'Loading...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
              <p className="text-xs font-semibold">Retrieving immutable quality ledger & milestones...</p>
            </div>
          ) : data ? (
            <>
              {/* Top summary card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Produce:</span>
                  <strong className="text-slate-900 font-bold">{data.product_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Farmer / Origin:</span>
                  <strong className="text-slate-900 font-bold">{data.farmer_name}</strong>
                  <span className="text-slate-500 block text-[11px]">({data.village})</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Quality Grade:</span>
                  <span className="inline-block px-2 py-0.5 mt-0.5 rounded font-bold bg-brand-100 text-brand-800">
                    {data.current_grade}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Freshness Score:</span>
                  <div className="mt-0.5">
                    <FreshnessBadge score={data.freshness_score} category={data.freshness_category} size="sm" />
                  </div>
                </div>
              </div>

              {/* Timeline Steps */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Verified Supply Chain Milestones
                </h4>
                <div className="relative border-l-2 border-emerald-500 ml-4 space-y-6 pb-2">
                  {data.timeline?.map((step, idx) => (
                    <div key={idx} className="relative pl-6 group">
                      {/* Step node icon */}
                      <div className="absolute -left-[17px] top-0.5 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md ring-4 ring-white">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                          <h5 className="font-bold text-sm text-slate-900">{step.step}</h5>
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> {step.date}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1 mt-1.5">
                          <p className="flex items-center gap-1.5 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>{step.location}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-500">
                            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>Auditor / Gate: <strong>{step.inspector}</strong></span>
                          </p>
                          <p className="text-slate-700 font-medium bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 text-[11px] mt-1">
                            {step.details}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-xs text-slate-500 py-8">Batch records not found.</p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            Close Traceability View
          </button>
        </div>

      </div>
    </div>
  );
};

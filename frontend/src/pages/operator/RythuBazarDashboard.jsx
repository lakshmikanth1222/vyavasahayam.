import React, { useState, useEffect } from 'react';
import { Store, Scale, Sparkles, CheckCircle2, XCircle, ArrowRight, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import { TraceabilityModal } from '../../components/common/TraceabilityModal';
import api from '../../services/api';

export const RythuBazarDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [traceModalOpen, setTraceModalOpen] = useState(false);
  const [traceBatchId, setTraceBatchId] = useState(null);

  // Inspection form
  const [grade, setGrade] = useState('GRADE_A');
  const [weightKg, setWeightKg] = useState(500);
  const [freshScore, setFreshScore] = useState(92);
  const [stage, setStage] = useState('COLLECTION_CENTRE');
  const [notes, setNotes] = useState('Weighed on digital scale, sorted, and certified for retail distribution.');
  const [inspecting, setInspecting] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await api.get('/quality/batches');
      setBatches(res.data);
    } catch (err) {
      console.error("Batch fetch error:", err);
    }
  };

  const handleInspectSubmit = async (e) => {
    e.preventDefault();
    setInspecting(true);
    try {
      await api.post('/quality/inspect', {
        batch_id: selectedBatch.id,
        stage: stage,
        grade: grade,
        weight_kg: weightKg,
        freshness_score: freshScore,
        inspector_name: "Ramesh Varma (Rythu Bazar Hub)",
        notes: notes
      });
      setInspectModalOpen(false);
      fetchBatches();
      alert("Quality grading & weighing recorded in immutable audit log!");
    } catch (err) {
      console.error("Inspect error:", err);
      alert("Failed to submit quality inspection");
    } finally {
      setInspecting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold border border-white/15">
            <Store className="w-3.5 h-3.5" />
            <span>Rythu Bazar Hub Operator Station</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Rythu Bazar Gannavaram Local Fulfillment Hub
          </h1>
          <p className="text-xs sm:text-sm text-teal-200 max-w-xl">
            Electronic weighing, computer vision quality verification, standardized grading (A/B/C/Rejected), and cold-chain dispatch.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-xs space-y-1">
          <span className="text-teal-300 block font-bold uppercase text-[10px]">Hub Daily Capacity</span>
          <strong className="text-xl font-black font-mono">15,000 kg</strong>
          <span className="text-emerald-300 block text-[11px]">Active Temperature: 22°C (Controlled)</span>
        </div>
      </div>

      {/* Produce Batches Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Incoming & Active Produce Batches</h3>
            <p className="text-xs text-slate-500">Perform grading checkpoints at Receiving, Sorting, and Final Packing</p>
          </div>
          <button
            onClick={fetchBatches}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3">Batch Code</th>
                <th className="pb-3">Produce & Farmer</th>
                <th className="pb-3">Weight (kg)</th>
                <th className="pb-3">Stage</th>
                <th className="pb-3">Quality Grade</th>
                <th className="pb-3">Freshness Score</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-slate-900">{b.batch_code}</td>
                  <td className="py-3.5">
                    <strong className="text-slate-900 block font-bold">{b.product_name}</strong>
                    <span className="text-slate-500 text-[11px]">{b.farmer_name}</span>
                  </td>
                  <td className="py-3.5 font-mono font-bold text-slate-800">{b.quantity_kg} kg</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-50 text-blue-800 border border-blue-200">
                      {b.current_stage}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      b.current_grade === 'GRADE_A' ? 'bg-emerald-100 text-emerald-800' :
                      b.current_grade === 'GRADE_B' ? 'bg-lime-100 text-lime-800' :
                      b.current_grade === 'GRADE_C' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {b.current_grade}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <FreshnessBadge score={b.freshness_score} category={b.freshness_category} size="sm" />
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedBatch(b);
                        setWeightKg(b.quantity_kg);
                        setGrade(b.current_grade);
                        setFreshScore(b.freshness_score);
                        setInspectModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-[11px] transition-all"
                    >
                      Grade / Weigh
                    </button>
                    <button
                      onClick={() => {
                        setTraceBatchId(b.id);
                        setTraceModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grading & Weighing Modal */}
      {inspectModalOpen && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Record Quality Grading & Weighing</h3>
                <p className="text-slate-500 font-mono text-[11px]">Batch: {selectedBatch.batch_code}</p>
              </div>
              <button onClick={() => setInspectModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleInspectSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Inspection Stage *</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="COLLECTION_CENTRE">Collection Centre Receiving</option>
                  <option value="WAREHOUSE_RECEIVING">Hub Sorting & Grading</option>
                  <option value="FINAL_PACKING">Final Packing & Sealing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Verified Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Grade *</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="GRADE_A">Grade A (Premium Retail)</option>
                    <option value="GRADE_B">Grade B (Standard Market)</option>
                    <option value="GRADE_C">Grade C (Processing / Solar)</option>
                    <option value="REJECTED">REJECTED (Bio-Compost only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Freshness Score (0 - 100)</label>
                <input
                  type="number"
                  value={freshScore}
                  onChange={(e) => setFreshScore(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inspector Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none h-20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inspecting}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm"
                >
                  Save Quality Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Traceability Modal */}
      <TraceabilityModal
        batchId={traceBatchId}
        isOpen={traceModalOpen}
        onClose={() => setTraceModalOpen(false)}
      />

    </div>
  );
};

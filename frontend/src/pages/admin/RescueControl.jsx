import React, { useState, useEffect } from 'react';
import {
  Zap, AlertTriangle, ShieldCheck, SunMedium, ArrowRight, RefreshCw,
  CheckCircle2, XCircle, Building2, Store, Truck, Info
} from 'lucide-react';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import api from '../../services/api';

export const RescueControl = () => {
  const [rescueEvents, setRescueEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    fetchRescueEvents();
  }, []);

  const fetchRescueEvents = async () => {
    try {
      const res = await api.get('/rescue/events');
      setRescueEvents(res.data);
    } catch (err) {
      console.error("Rescue events error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualTrigger = async (reason) => {
    setTriggering(true);
    try {
      const res = await api.post('/rescue/trigger', {
        trigger_reason: reason,
        notes: "Admin simulated disruption trigger"
      });
      alert(res.data.message);
      fetchRescueEvents();
    } catch (err) {
      console.error("Trigger error:", err);
    } finally {
      setTriggering(false);
    }
  };

  const handleExecuteOption = async (eventId, optionId) => {
    setExecuting(true);
    try {
      const res = await api.post('/rescue/execute', {
        rescue_event_id: eventId,
        selected_option_id: optionId,
        resolution_notes: "Routed by Operations Admin via Rescue Control Panel"
      });
      alert(res.data.message);
      fetchRescueEvents();
    } catch (err) {
      console.error("Execute error:", err);
      alert("Failed to execute rescue route");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-solar-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-solar-500/20 text-solar-400 text-xs font-semibold border border-solar-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>Zero-Waste Post-Harvest Rescue Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Disruption Handling & Value Recovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Automated multi-channel diversion matrix when orders cancel, transit fails, or shelf-life limits approach.
          </p>
        </div>

        {/* Quick Simulation Triggers */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
          <span className="font-bold text-slate-300 block text-[10px] uppercase">
            Simulate Disruption Event:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleManualTrigger('BUYER_CANCELLATION')}
              disabled={triggering}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-[11px] transition-all"
            >
              Buyer Cancellation
            </button>
            <button
              onClick={() => handleManualTrigger('VEHICLE_BREAKDOWN')}
              disabled={triggering}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[11px] transition-all"
            >
              Vehicle Breakdown
            </button>
            <button
              onClick={() => handleManualTrigger('FRESHNESS_DROP')}
              disabled={triggering}
              className="px-3 py-1.5 rounded-lg bg-solar-500/20 hover:bg-solar-500/30 text-solar-300 border border-solar-500/40 font-bold text-[11px] transition-all"
            >
              Freshness Decay
            </button>
          </div>
        </div>
      </div>

      {/* Critical Food Safety Callout */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="text-emerald-950 space-y-0.5">
          <strong className="font-bold block">Strict Food & Feed Biocontainment Rules Enforced:</strong>
          <p className="text-emerald-800 leading-relaxed">
            Rotten, mouldy, chemically contaminated, or unsafe produce is <strong>STRICTLY PROHIBITED</strong> from human consumption, solar drying, or animal feed. Such produce is automatically restricted to <strong>Waste-to-Value Biomethanation</strong>.
          </p>
        </div>
      </div>

      {/* Active Rescue Cases */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Active Rescue Incidents ({rescueEvents.length})</h3>
            <p className="text-xs text-slate-500">Review evaluated recovery options and route produce</p>
          </div>
          <button onClick={fetchRescueEvents} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {rescueEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 text-xs"
            >
              {/* Event Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      RESCUE #{ev.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 text-[10px]">
                      Trigger: {ev.trigger_reason}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      ev.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ev.status}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium">
                    Produce: <strong className="text-slate-900">{ev.product_name}</strong> • Quantity: <strong>{ev.quantity_kg} kg</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Remaining Shelf Window</span>
                    <strong className="text-slate-800 font-bold font-mono">{ev.remaining_shelf_life_hours} Hours</strong>
                  </div>
                  <FreshnessBadge score={ev.freshness_score} size="sm" />
                </div>
              </div>

              {/* Evaluated Options Matrix */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Algorithmic Rescue Alternatives Ranked by Economic Recovery:</span>
                </h4>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ev.options?.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        opt.is_selected
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20 shadow-sm'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            opt.channel_type === 'SOLAR_DRYING' ? 'bg-solar-100 text-solar-900' :
                            opt.channel_type === 'BUYER_SWITCHING' ? 'bg-blue-100 text-blue-900' : 'bg-slate-200 text-slate-800'
                          }`}>
                            {opt.channel_type}
                          </span>
                          <span className="font-bold text-emerald-700 font-mono">
                            Est. ₹{opt.estimated_recovery_value}
                          </span>
                        </div>

                        <div>
                          <strong className="text-slate-900 font-bold block">{opt.target_entity_name}</strong>
                          <p className="text-slate-500 text-[11px] mt-0.5">{opt.target_location}</p>
                        </div>

                        <p className="text-slate-600 text-[11px] italic bg-white/80 p-2 rounded-lg border border-slate-100">
                          "{opt.safety_verification_notes}"
                        </p>
                      </div>

                      {ev.status !== 'RESOLVED' ? (
                        <button
                          onClick={() => handleExecuteOption(ev.id, opt.id)}
                          disabled={executing}
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <span>Select & Route Produce</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : opt.is_selected && (
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-center font-bold text-[11px] flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active Routed Channel</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {ev.resolution_notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                  <span className="font-bold text-slate-900">Resolution Log:</span> {ev.resolution_notes}
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

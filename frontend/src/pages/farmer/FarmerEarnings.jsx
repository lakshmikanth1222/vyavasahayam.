import React, { useState, useEffect } from 'react';
import { IndianRupee, ShieldCheck, Zap, TrendingUp, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import api from '../../services/api';

export const FarmerEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await api.get('/farmers/earnings');
        setEarnings(res.data);
      } catch (err) {
        console.error("Earnings error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Farmer Payouts & Settlement Ledger</h1>
        <p className="text-xs text-slate-500">Transparent accounting with zero hidden deductions & automated Escrow security</p>
      </div>

      {/* Breakdown Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-slate-400 font-semibold uppercase block">Gross Sales</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            ₹{earnings?.gross_sales_inr || 0}
          </div>
          <span className="text-slate-500 block text-[11px]">Total Harvest Value</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-slate-400 font-semibold uppercase block">Platform Fee (2%)</span>
          <div className="text-2xl font-extrabold text-slate-700 font-mono">
            -₹{earnings?.platform_fee_inr || 0}
          </div>
          <span className="text-slate-500 block text-[11px]">Marketplace Operations</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-slate-400 font-semibold uppercase block">3% Farmer Insurance</span>
          <div className="text-2xl font-extrabold text-amber-700 font-mono">
            -₹{earnings?.insurance_contributions_inr || 0}
          </div>
          <span className="text-emerald-600 block text-[11px] font-semibold">Configurable Loss Cover</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-2">
          <span className="text-emerald-800 font-bold uppercase block">Net Bank Payout</span>
          <div className="text-2xl font-black text-emerald-900 font-mono">
            ₹{earnings?.net_payout_released_inr || 0}
          </div>
          <span className="text-emerald-700 block text-[11px] font-semibold">Transferred Directly</span>
        </div>

      </div>

      {/* Escrow State Machine Explainer */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-400" />
          <h3 className="font-bold text-sm">Escrow Direct Settlement Workflow</h3>
        </div>
        
        <div className="grid sm:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <strong className="text-white block mb-1">1. Buyer Orders</strong>
            <p className="text-slate-400">Payment held safely in VyavaSahayam Escrow Reserve.</p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <strong className="text-white block mb-1">2. Rythu Bazar Dispatch</strong>
            <p className="text-slate-400">Produce graded, cold-packed, and shipped to customer.</p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <strong className="text-white block mb-1">3. Customer Confirms</strong>
            <p className="text-slate-400">Freshness acceptance verified digitally on delivery.</p>
          </div>
          <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/50">
            <strong className="text-emerald-300 block mb-1">4. Automatic Release</strong>
            <p className="text-emerald-200">Net payout transferred directly to your bank account.</p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">Settlement Transactions</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3">Transaction ID</th>
                <th className="pb-3">Gross Amount</th>
                <th className="pb-3">Insurance (3%)</th>
                <th className="pb-3">Net Payout</th>
                <th className="pb-3">Escrow Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {earnings?.transactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-slate-900">{tx.id.substring(0, 8).toUpperCase()}</td>
                  <td className="py-3.5 font-mono">₹{tx.gross_amount}</td>
                  <td className="py-3.5 font-mono text-amber-700">-₹{tx.insurance_deduction}</td>
                  <td className="py-3.5 font-mono font-bold text-emerald-700">₹{tx.net_payout}</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tx.status === 'RELEASED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

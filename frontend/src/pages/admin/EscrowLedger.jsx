import React, { useState, useEffect } from 'react';
import { ShieldCheck, IndianRupee, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export const EscrowLedger = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/escrow/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error("Escrow fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (orderId, type) => {
    try {
      await api.post('/escrow/resolve', null, {
        params: {
          order_id: orderId,
          resolution_type: type,
          admin_notes: "Resolved by Master Operations Auditor"
        }
      });
      fetchTransactions();
      alert(`Dispute resolved via ${type}`);
    } catch (err) {
      console.error("Resolve error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Escrow Settlement Ledger</h1>
        <p className="text-xs text-slate-500">Audit held buyer funds, release farmer payouts, and resolve customer quality disputes</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-slate-900">All Escrow Accounts ({transactions.length})</h3>
          <button onClick={fetchTransactions} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Farmer</th>
                <th className="pb-3">Gross Held</th>
                <th className="pb-3">2% Fee</th>
                <th className="pb-3">3% Insurance</th>
                <th className="pb-3">Net Payout</th>
                <th className="pb-3">Escrow Status</th>
                <th className="pb-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-slate-900">{tx.order_number}</td>
                  <td className="py-3.5 font-bold text-slate-800">{tx.farmer_name}</td>
                  <td className="py-3.5 font-mono">₹{tx.farmer_gross_amount}</td>
                  <td className="py-3.5 font-mono text-slate-500">-₹{tx.platform_fee}</td>
                  <td className="py-3.5 font-mono text-amber-700">-₹{tx.insurance_deduction}</td>
                  <td className="py-3.5 font-mono font-bold text-emerald-700">₹{tx.farmer_net_payout}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      tx.status === 'RELEASED' ? 'bg-emerald-100 text-emerald-800' :
                      tx.status === 'DISPUTED' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    {tx.status === 'DISPUTED' ? (
                      <>
                        <button
                          onClick={() => handleResolve(tx.order_id, 'RELEASE_FULL')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                        >
                          Approve Farmer
                        </button>
                        <button
                          onClick={() => handleResolve(tx.order_id, 'FULL_REFUND')}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]"
                        >
                          Refund Buyer
                        </button>
                      </>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Normal State</span>
                    )}
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

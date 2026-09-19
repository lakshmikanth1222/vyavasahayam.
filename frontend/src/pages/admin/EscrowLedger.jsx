import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, IndianRupee, AlertTriangle, CheckCircle2, RefreshCw,
  CreditCard, ExternalLink, ArrowDownLeft, RotateCcw, Search, Filter
} from 'lucide-react';
import api from '../../services/api';

export const EscrowLedger = () => {
  const [activeTab, setActiveTab] = useState('CASHFREE_PAYMENTS'); // 'CASHFREE_PAYMENTS', 'ESCROW_HOLDS'
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundModal, setRefundModal] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [escrowRes, paymentsRes] = await Promise.all([
        api.get('/escrow/transactions'),
        api.get('/payments/admin/all')
      ]);
      setTransactions(escrowRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      console.error("Data fetch error:", err);
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
      fetchData();
      alert(`Dispute resolved via ${type}`);
    } catch (err) {
      console.error("Resolve error:", err);
      alert(err.response?.data?.detail || "Resolution failed.");
    }
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!refundModal) return;
    setRefunding(true);

    try {
      await api.post(`/payments/${refundModal.order_id}/refund`, {
        refund_amount: refundAmount ? parseFloat(refundAmount) : refundModal.amount,
        refund_note: refundReason || "Admin authorized customer refund"
      });
      alert("Cashfree refund initiated successfully!");
      setRefundModal(null);
      setRefundAmount('');
      setRefundReason('');
      fetchData();
    } catch (err) {
      console.error("Refund error:", err);
      alert(err.response?.data?.detail || "Refund failed. Please check gateway logs.");
    } finally {
      setRefunding(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.order_number?.toLowerCase().includes(term) ||
      p.customer_name?.toLowerCase().includes(term) ||
      p.gateway_order_id?.toLowerCase().includes(term) ||
      p.gateway_payment_id?.toLowerCase().includes(term) ||
      p.status?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Payment & Escrow Settlement Hub</h1>
          <p className="text-xs text-slate-500">Live Cashfree Payment Gateway telemetry, Escrow reserves, and farmer payout settlements</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('CASHFREE_PAYMENTS')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'CASHFREE_PAYMENTS'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cashfree Gateway Transactions ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ESCROW_HOLDS')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'ESCROW_HOLDS'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Escrow & Farmer Payouts ({transactions.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'CASHFREE_PAYMENTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h3 className="font-extrabold text-base text-slate-900">Cashfree PG Transactions</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-bold text-[10px]">
                API v2023-08-01
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search order, payment ID, customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button onClick={fetchData} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 text-[11px]">
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Cashfree Order ID</th>
                  <th className="pb-3">Payment ID / Reference</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-slate-900">{p.order_number}</td>
                    <td className="py-3.5">
                      <strong className="text-slate-900 block font-bold">{p.customer_name}</strong>
                      <span className="text-slate-400 text-[10px]">{p.customer_phone}</span>
                    </td>
                    <td className="py-3.5 font-mono text-[11px] text-slate-600">
                      {p.gateway_order_id || '–'}
                    </td>
                    <td className="py-3.5 font-mono text-[11px] text-slate-600">
                      {p.gateway_payment_id || p.bank_reference || '–'}
                    </td>
                    <td className="py-3.5 font-mono font-bold text-slate-900">₹{p.amount}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded font-mono font-semibold bg-slate-100 text-slate-800 text-[10px]">
                        {p.payment_method || 'ONLINE'}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        p.status === 'PAYMENT_SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'REFUNDED' ? 'bg-purple-100 text-purple-800' :
                        p.status === 'PAYMENT_FAILED' || p.status === 'PAYMENT_USER_DROPPED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {p.status === 'PAYMENT_SUCCESS' ? (
                        <button
                          onClick={() => {
                            setRefundModal(p);
                            setRefundAmount(p.amount);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[10px] flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Refund</span>
                        </button>
                      ) : p.status === 'REFUNDED' ? (
                        <span className="text-[10px] font-bold text-purple-700">Refunded ₹{p.refund_amount || p.amount}</span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">–</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ESCROW_HOLDS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900">Escrow Accounts & Farmer Payouts ({transactions.length})</h3>
            <button onClick={fetchData} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 text-[11px]">
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
                        tx.status === 'DISPUTED' ? 'bg-rose-100 text-rose-800' :
                        tx.status === 'REFUNDED' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
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
                      ) : tx.status === 'HELD' ? (
                        <button
                          onClick={() => handleResolve(tx.order_id, 'RELEASE_FULL')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px]"
                        >
                          Manual Release
                        </button>
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
      )}

      {/* Admin Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleProcessRefund} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <h3 className="font-extrabold text-base text-slate-900">Initiate Cashfree Refund</h3>
            </div>

            <p className="text-slate-500">
              Trigger a direct refund to the customer's original payment method via Cashfree Payment Gateway.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Order:</span>
                <span className="font-mono font-bold text-slate-900">{refundModal.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Original Amount:</span>
                <span className="font-mono font-bold text-slate-900">₹{refundModal.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway Order ID:</span>
                <span className="font-mono text-slate-700 text-[10px]">{refundModal.gateway_order_id}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Refund Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                max={refundModal.amount}
                min="1"
                required
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Refund Reason / Audit Note</label>
              <input
                type="text"
                required
                placeholder="e.g., Produce quality dispute or cancellation"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setRefundModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={refunding}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <span>{refunding ? 'Processing Refund...' : 'Confirm Refund'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2, AlertCircle, RefreshCw, ArrowRight,
  ShieldCheck, Package, ShoppingBag, Clock, IndianRupee, CreditCard
} from 'lucide-react';
import api from '../../services/api';
import { initiateCashfreeCheckout } from '../../services/cashfree';

export const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState('');

  const verifyPayment = async () => {
    if (!orderId) {
      setError('Missing order ID in payment callback URL');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fast server-to-server payment verification
      const res = await api.post(`/payments/${orderId}/verify`);
      setPaymentData(res.data);
    } catch (err) {
      console.error('Payment verification failed:', err);
      // Try fallback to status check
      try {
        const fallbackRes = await api.get(`/payments/${orderId}/status`);
        setPaymentData(fallbackRes.data);
      } catch (fallbackErr) {
        setError(err.response?.data?.detail || 'Unable to verify payment status. Please check My Orders.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [orderId]);

  const handleRetryPayment = async () => {
    if (!orderId) return;
    setRetrying(true);
    setError('');

    try {
      const res = await api.post('/payments/create-order', { order_id: orderId });
      const { payment_session_id, environment } = res.data;

      if (!payment_session_id) {
        throw new Error('No payment session generated');
      }

      await initiateCashfreeCheckout({
        paymentSessionId: payment_session_id,
        environment: environment || 'sandbox',
        redirectTarget: '_self'
      });
    } catch (err) {
      console.error('Retry payment error:', err);
      setError(err.response?.data?.detail || err.message || 'Payment retry initialization failed.');
      setRetrying(false);
    }
  };

  const isSuccess =
    paymentData?.order_payment_status === 'HELD' ||
    paymentData?.order_payment_status === 'PAID' ||
    paymentData?.payment?.status === 'PAYMENT_SUCCESS';

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-brand-50 border-2 border-brand-200 text-brand-600 mx-auto flex items-center justify-center animate-spin">
            <RefreshCw className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-slate-900">Verifying Payment with Cashfree</h2>
            <p className="text-xs text-slate-500">
              Please wait while our secure server confirms transaction status with the Cashfree Payment Gateway...
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-brand-600 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      
      {isSuccess ? (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl overflow-hidden animate-fadeIn">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600 p-8 text-white text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white mx-auto flex items-center justify-center ring-4 ring-white/30 shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Payment Successful!</h1>
            <p className="text-xs text-emerald-100 max-w-md mx-auto">
              Your transaction has been verified server-side with Cashfree. Your order is confirmed and protected by VyavaSahayam Escrow Reserve.
            </p>
          </div>

          {/* Details Card */}
          <div className="p-6 sm:p-8 space-y-6 text-xs">
            <div className="grid sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Order Reference</span>
                <p className="font-mono font-extrabold text-slate-900 text-sm">{paymentData?.order_number || orderId}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Amount Paid</span>
                <p className="font-mono font-extrabold text-emerald-700 text-base">₹{paymentData?.total_amount}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Payment Gateway</span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-brand-600" />
                  <span>Cashfree Payments ({paymentData?.payment?.payment_method || 'UPI / Online'})</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Transaction ID</span>
                <p className="font-mono text-slate-700 text-[11px] truncate">
                  {paymentData?.payment?.gateway_payment_id || paymentData?.payment?.gateway_order_id || 'CF_VERIFIED'}
                </p>
              </div>
            </div>

            {/* Escrow Guarantee Callout */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-emerald-900 text-xs">Escrow Farmer Protection Active</h4>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Your funds are held securely in platform escrow. Payment is released to local farmers only after delivery and your freshness quality confirmation.
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/orders"
                className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs text-center flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 transition-all"
              >
                <Package className="w-4 h-4" />
                <span>Track in My Orders</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop"
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-slate-500" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-rose-200 shadow-xl overflow-hidden animate-fadeIn">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 p-8 text-white text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white mx-auto flex items-center justify-center ring-4 ring-white/30 shadow-lg">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Payment Incomplete or Failed</h1>
            <p className="text-xs text-rose-100 max-w-md mx-auto">
              The Cashfree checkout transaction was not completed or was cancelled. Your selected harvest produce is still reserved.
            </p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6 text-xs text-center">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <p className="text-slate-600 max-w-md mx-auto">
              You can retry payment right now using Cashfree with UPI, Credit/Debit Cards, Net Banking, or mobile wallets without placing a new order.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleRetryPayment}
                disabled={retrying}
                className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                <span>{retrying ? 'Opening Cashfree...' : 'Retry Payment with Cashfree'}</span>
              </button>

              <Link
                to="/cart"
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Return to Cart</span>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

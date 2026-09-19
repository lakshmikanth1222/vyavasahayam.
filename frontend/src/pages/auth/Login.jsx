import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sprout, Lock, Mail, ArrowRight, Tractor, Building2, ShoppingBag, ShieldAlert, Store, Truck, AlertCircle, RefreshCw } from 'lucide-react';

export const Login = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(emailOrPhone, password);
      redirectUser(user.role);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (role) => {
    switch (role) {
      case 'FARMER':
        navigate('/farmer/dashboard');
        break;
      case 'BUYER_B2B':
        navigate('/buyer/dashboard');
        break;
      case 'CONSUMER_B2C':
        navigate('/shop');
        break;
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'COLLECTION_CENTER':
        navigate('/operator/dashboard');
        break;
      case 'DELIVERY_PARTNER':
        navigate('/delivery/dashboard');
        break;
      default:
        navigate('/shop');
    }
  };

  const setDemoCredentials = async (email, pass) => {
    setEmailOrPhone(email);
    setPassword(pass);
    setLoading(true);
    try {
      const user = await login(email, pass);
      redirectUser(user.role);
    } catch (err) {
      setError("Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-green mx-auto flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Sign In to VyavaSahayam
          </h2>
          <p className="text-xs text-slate-500">
            Unified access for Farmers, B2B Buyers, Consumers & Hub Operators
          </p>
        </div>

        {/* 1-Click Demo Logins */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            🚀 1-Click Instant Demo Login:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('farmer@vyavasahayam.org', 'password123')}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 transition-all text-left"
            >
              <Tractor className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Farmer / FPO</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('buyer@vyavasahayam.org', 'password123')}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-2 transition-all text-left"
            >
              <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>B2B Buyer</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('consumer@vyavasahayam.org', 'password123')}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2 transition-all text-left"
            >
              <ShoppingBag className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>B2C Consumer</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('admin@vyavasahayam.org', 'password123')}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-2 transition-all text-left"
            >
              <ShieldAlert className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>Admin Console</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('rythubazar@vyavasahayam.org', 'password123')}
              className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-2 transition-all text-left"
            >
              <Store className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Rythu Bazar Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('delivery@vyavasahayam.org', 'password123')}
              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold flex items-center gap-2 transition-all text-left"
            >
              <Truck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>Delivery Fleet</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Email or Phone Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. farmer@vyavasahayam.org"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Register here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

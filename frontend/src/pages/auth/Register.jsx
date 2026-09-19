import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sprout, Tractor, Building2, ShoppingBag, CheckCircle2, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export const Register = () => {
  const [role, setRole] = useState('FARMER'); // FARMER, BUYER_B2B, CONSUMER_B2C
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    full_name: '',
    password: '',
    // Farmer fields
    village: 'Gannavaram',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    farm_size_acres: 3.0,
    crops_grown: 'Tomato, Chilli, Brinjal',
    fpo_name: 'Kisan Seva FPO',
    // Buyer fields
    organization_name: '',
    contact_person: '',
    organization_type: 'Wholesale / Supermarket',
    delivery_address: '',
    max_budget_price: 30.0,
    // Consumer fields
    default_address: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerFarmer, registerBuyer, registerConsumer } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (role === 'FARMER') {
        await registerFarmer(formData);
        navigate('/farmer/dashboard');
      } else if (role === 'BUYER_B2B') {
        await registerBuyer({
          ...formData,
          contact_person: formData.contact_person || formData.full_name
        });
        navigate('/buyer/dashboard');
      } else {
        await registerConsumer({
          ...formData,
          default_address: formData.default_address || formData.delivery_address || 'Vijayawada'
        });
        navigate('/shop');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl gradient-green mx-auto flex items-center justify-center text-white shadow-md">
            <Sprout className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Create an Account
          </h2>
          <p className="text-xs text-slate-500">
            Join VyavaSahayam agricultural marketplace
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setRole('FARMER')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                role === 'FARMER'
                  ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Tractor className="w-5 h-5 text-brand-600" />
              <span>Farmer / FPO</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('BUYER_B2B')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                role === 'BUYER_B2B'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>B2B Buyer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('CONSUMER_B2C')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                role === 'CONSUMER_B2C'
                  ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <span>B2C Consumer</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic Role Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Common Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                name="full_name"
                placeholder="e.g. Ramesh Kumar"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                name="phone"
                placeholder="+91 98480 00000"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                name="email"
                placeholder="you@domain.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Role-Specific Fields */}
          {role === 'FARMER' && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3 text-xs">
              <span className="font-extrabold text-emerald-900 block text-[11px] uppercase tracking-wider">
                Farmer & Landholdings Details
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Village / Mandal *</label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District *</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Crops Grown</label>
                  <input
                    type="text"
                    name="crops_grown"
                    value={formData.crops_grown}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">FPO Name (Optional)</label>
                  <input
                    type="text"
                    name="fpo_name"
                    value={formData.fpo_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'BUYER_B2B' && (
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3 text-xs">
              <span className="font-extrabold text-blue-900 block text-[11px] uppercase tracking-wider">
                Organization & Procurement Details
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    name="organization_name"
                    placeholder="e.g. Fresh Supermarkets Ltd."
                    value={formData.organization_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Organization Type</label>
                  <select
                    name="organization_type"
                    value={formData.organization_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option>Supermarket Chain</option>
                    <option>Restaurant / Hotel Chain</option>
                    <option>Agro-Food Processor</option>
                    <option>Wholesale Mandi Trader</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Delivery Address *</label>
                  <input
                    type="text"
                    required
                    name="delivery_address"
                    placeholder="Warehouse location / Delivery depot"
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'CONSUMER_B2C' && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3 text-xs">
              <span className="font-extrabold text-amber-900 block text-[11px] uppercase tracking-wider">
                Household Delivery Details
              </span>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Home Delivery Address *</label>
                <input
                  type="text"
                  required
                  name="default_address"
                  placeholder="Flat / House No, Street, Landmark, City"
                  value={formData.default_address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign in here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

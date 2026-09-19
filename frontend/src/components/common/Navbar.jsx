import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import {
  Sprout, ShoppingCart, LogOut, User, Menu, X, PhoneCall,
  LayoutDashboard, PlusCircle, Search, FileText, BarChart3, SunMedium, Shield, Landmark
} from 'lucide-react';
import { VoiceModal } from './VoiceModal';

export const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 via-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-600/25 group-hover:scale-105 transition-all">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-1 leading-none">
                  Vyava<span className="text-brand-600">Sahayam</span>
                </span>
                <span className="text-[9px] font-extrabold text-emerald-700 tracking-wider uppercase mt-0.5">
                  Direct Farm Network
                </span>
              </div>
            </Link>

            {/* Main Navigation (Visible on Large Screens) */}
            <nav className="hidden xl:flex items-center gap-2">
              <Link
                to="/market-prices"
                className="px-3 py-2 rounded-xl text-xs font-extrabold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 transition-all flex items-center gap-1.5 border border-emerald-200/80 whitespace-nowrap shadow-xs"
              >
                <Landmark className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span>Govt Mandi Prices</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </Link>
              
              <Link
                to="/demand-forecasting"
                className="px-3 py-2 rounded-xl text-xs font-extrabold text-teal-900 bg-teal-50 hover:bg-teal-100 transition-all flex items-center gap-1.5 border border-teal-200/80 whitespace-nowrap shadow-xs"
              >
                <BarChart3 className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                <span>Demand Forecast</span>
                <span className="px-1 py-0.2 rounded bg-teal-200 text-teal-950 text-[9px] font-black">AI</span>
              </Link>
              
              <Link
                to="/shop"
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Marketplace
              </Link>

              <Link
                to="/how-it-works"
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                How It Works
              </Link>
              
              <Link
                to="/traceability"
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Traceability
              </Link>
            </nav>

            {/* Right Action Cluster */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              
              {/* Role Shortcut Button (If Authenticated) */}
              {isAuthenticated && role === 'FARMER' && (
                <Link
                  to="/farmer/dashboard"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-brand-600" /> 
                  <span>Farmer Hub</span>
                </Link>
              )}

              {isAuthenticated && role === 'BUYER_B2B' && (
                <Link
                  to="/buyer/dashboard"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" /> 
                  <span>B2B Hub</span>
                </Link>
              )}

              {/* Farmer Voice IVR Telephony Simulation */}
              <button
                onClick={() => setVoiceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 text-xs font-bold transition-all whitespace-nowrap active:scale-95 shadow-xs"
                title="Simulate Voice IVR for Farmers (Telugu / Hindi / English)"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-600 animate-pulse flex-shrink-0" />
                <span className="hidden sm:inline">Kisan Voice IVR</span>
              </button>

              {/* Shopping Cart (B2C) */}
              <Link
                to="/cart"
                className="relative p-2 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User Auth Info / Sign in */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="hidden lg:block text-right">
                    <p className="text-xs font-extrabold text-slate-900 leading-tight truncate max-w-[120px]">
                      {user?.full_name?.split(' ')[0]}
                    </p>
                    <span className="text-[10px] font-bold text-brand-700 uppercase">
                      {role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors active:scale-95"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-600/20 transition-all whitespace-nowrap"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Tablet/Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile/Tablet Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2.5 animate-fadeIn shadow-xl">
            <Link
              to="/market-prices"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-extrabold text-emerald-950 bg-emerald-50 border border-emerald-200"
            >
              <Landmark className="w-4 h-4 text-emerald-700" />
              <span>🏛️ Live Govt Mandi Prices & MSP</span>
            </Link>
            
            <Link
              to="/demand-forecasting"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-extrabold text-teal-950 bg-teal-50 border border-teal-200"
            >
              <BarChart3 className="w-4 h-4 text-teal-700" />
              <span>📊 AI Demand Forecasting</span>
            </Link>
            
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              <ShoppingCart className="w-4 h-4 text-slate-600" />
              <span>Fresh Marketplace</span>
            </Link>
            
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </Link>
            
            <Link
              to="/traceability"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batch Traceability
            </Link>

            {isAuthenticated && (
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <p className="px-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Role Dashboard</p>
                {role === 'FARMER' && (
                  <>
                    <Link
                      to="/farmer/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-brand-900 bg-brand-50"
                    >
                      Farmer Hub & Analytics
                    </Link>
                    <Link
                      to="/farmer/listings/new"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      + List New Harvest Produce
                    </Link>
                  </>
                )}
                {role === 'BUYER_B2B' && (
                  <Link
                    to="/buyer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-blue-900 bg-blue-50"
                  >
                    B2B Wholesale Procurement
                  </Link>
                )}
                {role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-purple-900 bg-purple-50"
                  >
                    Admin Console
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Voice IVR Telephony Modal */}
      <VoiceModal isOpen={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} />
    </>
  );
};


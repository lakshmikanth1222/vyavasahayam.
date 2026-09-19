import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import {
  Sprout, ShoppingCart, LogOut, User, Menu, X, PhoneCall,
  LayoutDashboard, PlusCircle, Search, FileText, BarChart3, SunMedium, Shield
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  Vyava<span className="text-brand-600">Sahayam</span>
                </span>
                <span className="block text-[10px] font-semibold text-emerald-700 tracking-wider uppercase -mt-1">
                  Fresh Farm-to-Customer Network
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/how-it-works"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                How It Works
              </Link>
              <Link
                to="/shop"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Fresh Marketplace
              </Link>
              <Link
                to="/traceability"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Traceability
              </Link>

              {/* Role Specific Shortcuts */}
              {role === 'FARMER' && (
                <>
                  <Link
                    to="/farmer/dashboard"
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Farmer Hub
                  </Link>
                  <Link
                    to="/farmer/listings/new"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4 text-brand-600" /> List Produce
                  </Link>
                </>
              )}

              {role === 'BUYER_B2B' && (
                <Link
                  to="/buyer/dashboard"
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" /> B2B Procurement
                </Link>
              )}

              {role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-4 h-4" /> Admin Console
                </Link>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Farmer Voice IVR Telephony simulation */}
              <button
                onClick={() => setVoiceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-harvest-500/10 text-harvest-800 border border-harvest-300/60 hover:bg-harvest-500/20 text-xs font-semibold transition-all shadow-sm"
                title="Simulate Voice IVR for Farmers (Telugu / Hindi / English)"
              >
                <PhoneCall className="w-3.5 h-3.5 text-harvest-600 animate-pulse" />
                <span className="hidden sm:inline">Farmer Voice IVR</span>
              </button>

              {/* Shopping Cart (B2C) */}
              <Link
                to="/cart"
                className="relative p-2 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User / Auth State */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="hidden lg:block text-right">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                      {user?.full_name}
                    </p>
                    <span className="text-[10px] font-semibold text-brand-700 uppercase">
                      {role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-600/20 transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Fresh Marketplace
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </Link>
            <Link
              to="/traceability"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Batch Traceability
            </Link>
            {isAuthenticated && (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase">My Dashboard</p>
                {role === 'FARMER' && (
                  <Link
                    to="/farmer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-brand-700 bg-brand-50"
                  >
                    Farmer Overview & Listings
                  </Link>
                )}
                {role === 'BUYER_B2B' && (
                  <Link
                    to="/buyer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50"
                  >
                    B2B Procurement & Matches
                  </Link>
                )}
                {role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50"
                  >
                    Admin Console & Analytics
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

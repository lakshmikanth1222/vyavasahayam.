import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import {
  Sprout, ShoppingCart, LogOut, User, Menu, X, PhoneCall,
  LayoutDashboard, PlusCircle, Search, FileText, BarChart3, SunMedium, Shield, Landmark,
  Bell, Activity, Sparkles, AlertTriangle, ChevronDown, ChevronRight, Store, Truck,
  HelpCircle, QrCode, TrendingUp, Sparkle, Bot, CheckCircle2
} from 'lucide-react';
import { VoiceModal } from './VoiceModal';
import api from '../../services/api';

export const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);

  const profileDropdownRef = useRef(null);
  const aiDropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setAiDropdownOpen(false);
  }, [location.pathname]);

  // Handle outside clicks for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (aiDropdownRef.current && !aiDropdownRef.current.contains(event.target)) {
        setAiDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll unread notifications
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnread = async () => {
        try {
          const res = await api.get('/notifications/unread-count');
          setUnreadCount(res.data?.unread_count || 0);
        } catch (e) {
          // ignore unauthenticated or background fail
        }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  // Determine user dashboard path
  const getDashboardPath = () => {
    switch (role) {
      case 'FARMER':
        return '/farmer/dashboard';
      case 'BUYER_B2B':
        return '/buyer/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      case 'COLLECTION_CENTER':
      case 'OPERATOR':
        return '/operator/dashboard';
      case 'DELIVERY_PARTNER':
      case 'DELIVERY':
        return '/delivery/dashboard';
      default:
        return '/orders';
    }
  };

  // Get user role display metadata
  const getRoleBadge = () => {
    switch (role) {
      case 'FARMER':
        return { label: 'Farmer / FPO', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'BUYER_B2B':
        return { label: 'B2B Buyer', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'ADMIN':
        return { label: 'Admin', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'COLLECTION_CENTER':
      case 'OPERATOR':
        return { label: 'Rythu Bazar', bg: 'bg-teal-100 text-teal-800 border-teal-300' };
      case 'DELIVERY_PARTNER':
      case 'DELIVERY':
        return { label: 'Fleet Partner', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      default:
        return { label: 'Consumer', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const isAiSectionActive = [
    '/demand-forecast',
    '/demand-forecasting',
    '/demand-radar',
    '/traceability',
    '/how-it-works'
  ].some(path => location.pathname.startsWith(path));

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 lg:gap-6">
            
            {/* 1. Brand Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-all">
                <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-0.5 leading-none">
                  Vyava<span className="text-emerald-600">Sahayam</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-700 tracking-wider uppercase mt-0.5">
                  Direct Farm Network
                </span>
              </div>
            </Link>

            {/* 2. Structured Desktop Navigation Links (Visible on lg and above) */}
            <nav className="hidden lg:flex items-center gap-1">
              
              {/* Marketplace */}
              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-extrabold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Marketplace</span>
              </NavLink>

              {/* Govt Mandi Prices */}
              <NavLink
                to="/market-prices"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-extrabold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <Landmark className="w-4 h-4 text-emerald-700" />
                <span>Mandi Rates & MSP</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </NavLink>

              {/* Intelligence & Analytics Dropdown */}
              <div className="relative" ref={aiDropdownRef}>
                <button
                  type="button"
                  onClick={() => setAiDropdownOpen(prev => !prev)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                    isAiSectionActive || aiDropdownOpen
                      ? 'bg-teal-50 text-teal-900 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  <span>AI & Insights</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform text-slate-400 ${aiDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {aiDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white shadow-2xl border border-slate-200 py-2.5 z-50 animate-fadeIn">
                    <div className="px-3.5 pb-2 mb-1 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Predictive Intelligence & Trust
                    </div>

                    <Link
                      to="/demand-forecast"
                      onClick={() => setAiDropdownOpen(false)}
                      className="flex items-start gap-3 px-3.5 py-2.5 hover:bg-teal-50/70 transition-colors group"
                    >
                      <div className="p-2 rounded-xl bg-teal-100 text-teal-700 group-hover:scale-105 transition-transform mt-0.5 flex-shrink-0">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          AI Demand Forecast
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-teal-100 text-teal-800">AI</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Predictive crop pricing &amp; harvesting trends</p>
                      </div>
                    </Link>

                    <Link
                      to="/demand-forecasting"
                      onClick={() => setAiDropdownOpen(false)}
                      className="flex items-start gap-3 px-3.5 py-2.5 hover:bg-amber-50/70 transition-colors group"
                    >
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-800 group-hover:scale-105 transition-transform mt-0.5 flex-shrink-0">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          12-Month Demand Matrix
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-800">Festive</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Seasonal surge curves (Kartheeka, Diwali, Sankranti)</p>
                      </div>
                    </Link>

                    <Link
                      to="/demand-radar"
                      onClick={() => setAiDropdownOpen(false)}
                      className="flex items-start gap-3 px-3.5 py-2.5 hover:bg-indigo-50/70 transition-colors group"
                    >
                      <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 group-hover:scale-105 transition-transform mt-0.5 flex-shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          Live Demand Radar
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Real-time buyer procurement heat-signals</p>
                      </div>
                    </Link>

                    <Link
                      to="/traceability"
                      onClick={() => setAiDropdownOpen(false)}
                      className="flex items-start gap-3 px-3.5 py-2.5 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-700 group-hover:scale-105 transition-transform mt-0.5 flex-shrink-0">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Farm Traceability</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Transparent origin &amp; QR batch tracking</p>
                      </div>
                    </Link>

                    <Link
                      to="/how-it-works"
                      onClick={() => setAiDropdownOpen(false)}
                      className="flex items-start gap-3 px-3.5 py-2.5 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-700 group-hover:scale-105 transition-transform mt-0.5 flex-shrink-0">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">How It Works</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Direct farm-to-consumer ecosystem</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* SOS Emergency Rescue (Prominent & High Impact) */}
              <NavLink
                to="/rescue"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border shadow-2xs ${
                    isActive
                      ? 'bg-rose-600 text-white border-rose-600 shadow-rose-600/30'
                      : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
                  }`
                }
                title="Zero-Waste Distress Intervention & Solar Drying Network"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                <span>SOS Rescue</span>
                <span className="px-1.5 py-0.2 rounded bg-rose-500 text-[9px] text-white font-extrabold uppercase">
                  Govt Infra
                </span>
              </NavLink>

            </nav>

            {/* 3. Right Action Cluster */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              
              {/* Role-Specific Primary Shortcut Buttons */}
              {isAuthenticated && (role === 'FARMER' || role === 'FPO') && (
                <Link
                  to="/demand-opportunities"
                  className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-all shadow-2xs whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Demand Feed</span>
                </Link>
              )}

              {isAuthenticated && role === 'BUYER_B2B' && (
                <Link
                  to="/buyer/requirements"
                  className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-blue-950 bg-blue-100 hover:bg-blue-200 border border-blue-300 transition-all shadow-2xs whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-700" />
                  <span>Post Demand</span>
                </Link>
              )}

              {/* Kisan Voice IVR Telephony Simulation */}
              <button
                onClick={() => setVoiceModalOpen(true)}
                className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 text-[11px] sm:text-xs font-extrabold transition-all whitespace-nowrap active:scale-95 shadow-2xs inline-flex items-center gap-1 sm:gap-1.5"
                title="Simulate Voice IVR for Farmers (Telugu / Hindi / English)"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-600 animate-pulse flex-shrink-0" />
                <span className="hidden xs:inline">Voice IVR</span>
                <span className="hidden md:inline px-1 py-0.2 rounded bg-amber-200/80 text-[9px] text-amber-900 font-bold">
                  తెలుగు/हिं
                </span>
              </button>

              {/* Notification Center Bell */}
              {isAuthenticated && (
                <Link
                  to="/notifications"
                  className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  title="Notification Center"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-md animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Shopping Cart (B2C) */}
              <Link
                to="/cart"
                className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* 4. User Account & Profile Dropdown */}
              {isAuthenticated ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-1 py-1 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 active:scale-95"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-[11px] sm:text-xs font-black shadow-sm">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-extrabold text-slate-900 leading-tight truncate max-w-[100px]">
                        {user?.full_name?.split(' ')[0]}
                      </p>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${getRoleBadge().bg} uppercase inline-block mt-0.5`}>
                        {getRoleBadge().label}
                      </span>
                    </div>

                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Menu Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-100 py-2.5 z-50 animate-fadeIn">
                      
                      {/* User Header */}
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 -mt-2.5 rounded-t-2xl">
                        <p className="text-xs font-black text-slate-900 truncate">{user?.full_name || 'User Account'}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email || user?.phone || 'Authenticated'}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${getRoleBadge().bg} uppercase`}>
                            {getRoleBadge().label}
                          </span>
                        </div>
                      </div>

                      {/* Primary Role Hub Link */}
                      <div className="px-2 py-1.5">
                        <Link
                          to={getDashboardPath()}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                          <span>Main Dashboard</span>
                        </Link>
                      </div>

                      {/* Role Specific Sub-items */}
                      <div className="px-2 py-1 space-y-0.5 text-xs">
                        {role === 'FARMER' && (
                          <>
                            <Link to="/farmer/listings" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                              <span>My Produce Listings</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </Link>
                            <Link to="/farmer/listings/new" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                              <span>+ List New Harvest</span>
                              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                            </Link>
                            <Link to="/demand-opportunities" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                              <span>Demand Opportunities</span>
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            </Link>
                            <Link to="/farmer/orders" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                              <span>Orders & Sales</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </Link>
                            <Link to="/farmer/earnings" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                              <span>Escrow Wallet & Payouts</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </Link>
                            <Link to="/farmer/recommendations" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                              <span>AI Crop Advisor</span>
                              <Bot className="w-3.5 h-3.5 text-teal-600" />
                            </Link>
                          </>
                        )}

                        {role === 'BUYER_B2B' && (
                          <>
                            <Link to="/buyer/requirements" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                              <span>Post Bulk Requirement</span>
                              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                            </Link>
                            <Link to="/buyer/dashboard" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                              <span>Procurement Contracts</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </Link>
                          </>
                        )}

                        {role === 'ADMIN' && (
                          <>
                            <Link to="/admin/rescue" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                              <span>Distress Rescue Control</span>
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            </Link>
                            <Link to="/admin/solar-drying" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                              <span>Solar Drying Units</span>
                              <SunMedium className="w-3.5 h-3.5 text-amber-600" />
                            </Link>
                            <Link to="/admin/payments" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                              <span>Escrow Ledger</span>
                              <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            </Link>
                          </>
                        )}

                        {role === 'COLLECTION_CENTER' || role === 'OPERATOR' ? (
                          <Link to="/operator/dashboard" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                            <span>Rythu Bazar Inward Desk</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                        ) : null}

                        {role === 'DELIVERY_PARTNER' || role === 'DELIVERY' ? (
                          <Link to="/delivery/dashboard" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                            <span>Fleet Route Manager</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                        ) : null}

                        <Link to="/orders" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                          <span>My Consumer Orders</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                        <Link to="/notifications" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100">
                          <span>Notifications</span>
                          {unreadCount > 0 ? (
                            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-black">{unreadCount}</span>
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </Link>
                      </div>

                      {/* Logout Action */}
                      <div className="pt-2 mt-1 border-t border-slate-100 px-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all whitespace-nowrap"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* 5. Mobile & Tablet Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* 6. Comprehensive Mobile / Tablet Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-fadeIn shadow-2xl max-h-[85vh] overflow-y-auto">
            
            {/* Core Links */}
            <div className="space-y-1.5">
              <p className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">Explore Network</p>
              
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span>Fresh Marketplace</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/market-prices"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-extrabold text-emerald-950 bg-emerald-50 border border-emerald-200"
              >
                <div className="flex items-center gap-2.5">
                  <Landmark className="w-4 h-4 text-emerald-700" />
                  <span>Govt Mandi Rates & MSP</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </Link>

              <Link
                to="/demand-forecast"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-teal-950 bg-teal-50 border border-teal-200"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-teal-700" />
                  <span>AI Demand Forecasting</span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-teal-600 text-white text-[9px] font-black">AI</span>
              </Link>

              <Link
                to="/demand-forecasting"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-amber-950 bg-amber-50 border border-amber-200"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                  <span>12-Month Cultural Demand Matrix</span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black">Festive</span>
              </Link>

              <Link
                to="/demand-radar"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-indigo-950 bg-indigo-50 border border-indigo-200"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-indigo-700" />
                  <span>Live Demand Radar</span>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              </Link>

              <Link
                to="/rescue"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-black text-rose-950 bg-rose-50 border border-rose-200"
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>SOS Distress Rescue & Solar Drying</span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black uppercase">Govt</span>
              </Link>

              <Link
                to="/traceability"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-4 h-4 text-slate-600" />
                  <span>Farm-to-Fork Batch Traceability</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-slate-600" />
                  <span>How It Works</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Kisan Voice IVR Trigger Banner */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setVoiceModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-sm shadow-md shadow-amber-600/20"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-5 h-5 animate-pulse" />
                  <span>Kisan Voice IVR Simulation</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">తెలుగు / हिं / EN</span>
              </button>
            </div>

            {/* Role Dashboards & Authenticated Tools */}
            {isAuthenticated ? (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Your Account & Role</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${getRoleBadge().bg} uppercase`}>
                    {getRoleBadge().label}
                  </span>
                </div>

                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-black text-emerald-950 bg-emerald-100 border border-emerald-300"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                  <span>Open {getRoleBadge().label} Dashboard</span>
                </Link>

                {role === 'FARMER' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/farmer/listings/new"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2.5 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 text-center"
                    >
                      + List Harvest
                    </Link>
                    <Link
                      to="/demand-opportunities"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 text-center"
                    >
                      Demand Feed
                    </Link>
                  </div>
                )}

                {role === 'BUYER_B2B' && (
                  <Link
                    to="/buyer/requirements"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-2.5 rounded-xl text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 text-center"
                  >
                    + Post Bulk Requirement
                  </Link>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-extrabold text-slate-900">{user?.full_name}</p>
                    <p className="text-[10px] text-slate-500">{user?.email || user?.phone}</p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl text-xs font-bold text-center text-slate-800 bg-slate-100 hover:bg-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl text-xs font-black text-center text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  Register
                </Link>
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
export default Navbar;

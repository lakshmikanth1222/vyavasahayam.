import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Landmark, BarChart3, ShoppingBag, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export const MobileBottomNav = () => {
  const { user, role, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  // Determine user dashboard link based on role
  let dashboardPath = '/login';
  let dashboardLabel = 'Login';

  if (isAuthenticated) {
    if (role === 'FARMER') {
      dashboardPath = '/farmer/dashboard';
      dashboardLabel = 'Farmer';
    } else if (role === 'BUYER_B2B') {
      dashboardPath = '/buyer/dashboard';
      dashboardLabel = 'B2B Hub';
    } else if (role === 'ADMIN') {
      dashboardPath = '/admin/dashboard';
      dashboardLabel = 'Admin';
    } else if (role === 'OPERATOR') {
      dashboardPath = '/operator/dashboard';
      dashboardLabel = 'Operator';
    } else if (role === 'DELIVERY') {
      dashboardPath = '/delivery/dashboard';
      dashboardLabel = 'Fleet';
    } else {
      dashboardPath = '/orders';
      dashboardLabel = 'Orders';
    }
  }

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
      exact: true
    },
    {
      to: '/market-prices',
      label: 'Mandi Rates',
      icon: Landmark,
      badge: 'Live'
    },
    {
      to: '/demand-forecasting',
      label: 'Forecast',
      icon: BarChart3,
      badge: 'AI'
    },
    {
      to: '/shop',
      label: 'Shop',
      icon: ShoppingBag,
      cartCount: itemCount
    },
    {
      to: dashboardPath,
      label: dashboardLabel,
      icon: isAuthenticated ? LayoutDashboard : User
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around safe-area-inset-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact 
          ? location.pathname === item.to 
          : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
              isActive
                ? 'text-emerald-700 font-extrabold scale-105'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-emerald-600' : 'stroke-[1.75px]'}`} />

              {/* Live Badge */}
              {item.badge === 'Live' && (
                <span className="absolute -top-1 -right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}

              {/* AI Badge */}
              {item.badge === 'AI' && (
                <span className="absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full bg-teal-500 text-white text-[8px] font-black leading-none shadow-sm">
                  AI
                </span>
              )}

              {/* Cart Count Badge */}
              {item.cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                  {item.cartCount}
                </span>
              )}
            </div>

            <span className="text-[10px] mt-1 tracking-tight leading-none">
              {item.label}
            </span>

            {/* Active Pill Indicator */}
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
export default MobileBottomNav;

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserCheck, Tractor, Building2, ShoppingBag, ShieldAlert, Store, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoSwitcher = () => {
  const { role, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { key: 'FARMER', label: 'Farmer / FPO', shortLabel: 'Farmer', icon: Tractor, route: '/farmer/dashboard', color: 'hover:bg-emerald-600' },
    { key: 'BUYER_B2B', label: 'B2B Buyer', shortLabel: 'B2B', icon: Building2, route: '/buyer/dashboard', color: 'hover:bg-blue-600' },
    { key: 'CONSUMER_B2C', label: 'Consumer', shortLabel: 'Buyer', icon: ShoppingBag, route: '/shop', color: 'hover:bg-amber-600' },
    { key: 'COLLECTION_CENTER', label: 'Rythu Bazar', shortLabel: 'Rythu', icon: Store, route: '/operator/dashboard', color: 'hover:bg-teal-600' },
    { key: 'DELIVERY_PARTNER', label: 'Delivery', shortLabel: 'Delivery', icon: Truck, route: '/delivery/dashboard', color: 'hover:bg-indigo-600' },
    { key: 'ADMIN', label: 'Admin', shortLabel: 'Admin', icon: ShieldAlert, route: '/admin/dashboard', color: 'hover:bg-purple-600' },
  ];

  const handleSwitch = async (item) => {
    try {
      await switchDemoRole(item.key);
      navigate(item.route);
    } catch (err) {
      console.error("Failed to switch role:", err);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-200 py-1.5 px-3 sm:px-4 text-xs border-b border-slate-800/80 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
        
        {/* Left Indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-black text-[9px] sm:text-[10px] uppercase tracking-wider border border-emerald-500/30 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden xs:inline">Interactive Demo</span>
            <span className="xs:hidden">Demo</span>
          </div>
        </div>

        {/* Role Selector Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1">
          {roles.map((item) => {
            const Icon = item.icon;
            const isActive = role === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSwitch(item)}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-xl transition-all font-extrabold text-[10px] sm:text-[11px] whitespace-nowrap active:scale-95 flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-white/40'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 ' + item.color
                }`}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

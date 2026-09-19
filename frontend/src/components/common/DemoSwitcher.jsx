import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserCheck, Tractor, Building2, ShoppingBag, ShieldAlert, Store, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoSwitcher = () => {
  const { role, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { key: 'FARMER', label: 'Farmer / FPO', icon: Tractor, route: '/farmer/dashboard', color: 'hover:bg-emerald-600' },
    { key: 'BUYER_B2B', label: 'B2B Buyer', icon: Building2, route: '/buyer/dashboard', color: 'hover:bg-blue-600' },
    { key: 'CONSUMER_B2C', label: 'Consumer', icon: ShoppingBag, route: '/shop', color: 'hover:bg-amber-600' },
    { key: 'COLLECTION_CENTER', label: 'Rythu Bazar', icon: Store, route: '/operator/dashboard', color: 'hover:bg-teal-600' },
    { key: 'DELIVERY_PARTNER', label: 'Delivery', icon: Truck, route: '/delivery/dashboard', color: 'hover:bg-indigo-600' },
    { key: 'ADMIN', label: 'Admin', icon: ShieldAlert, route: '/admin/dashboard', color: 'hover:bg-purple-600' },
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
    <div className="bg-slate-900 text-slate-200 py-1.5 px-4 text-xs border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px] uppercase tracking-wider">
            1-Click Live Demo Role Switcher
          </span>
          <span className="hidden sm:inline text-slate-400">Current Role:</span>
          <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {role || 'PUBLIC GUEST'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {roles.map((item) => {
            const Icon = item.icon;
            const isActive = role === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSwitch(item)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-all font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm ring-1 ring-white/30'
                    : 'bg-slate-800 text-slate-300 hover:text-white ' + item.color
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

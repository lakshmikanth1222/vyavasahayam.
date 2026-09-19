import React from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, Flame, XCircle } from 'lucide-react';

export const FreshnessBadge = ({ score = 90, category = 'FRESH', size = 'md' }) => {
  let colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = ShieldCheck;
  let label = 'Fresh';

  if (score >= 85 || category === 'FRESH') {
    colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
    Icon = ShieldCheck;
    label = 'Fresh Harvest';
  } else if (score >= 70 || category === 'MEDIUM_FRESH') {
    colorStyles = 'bg-lime-50 text-lime-700 border-lime-200 ring-1 ring-lime-500/20';
    Icon = Sparkles;
    label = 'Medium Fresh';
  } else if (score >= 50 || category === 'USE_SOON') {
    colorStyles = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
    Icon = AlertTriangle;
    label = 'Use Soon (Discounted)';
  } else if (score >= 35 || category === 'AT_RISK') {
    colorStyles = 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-500/20';
    Icon = Flame;
    label = 'At Risk / Rescue';
  } else {
    colorStyles = 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20';
    Icon = XCircle;
    label = 'Not For Sale';
  }

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2',
  }[size] || 'text-xs font-semibold px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border shadow-sm ${colorStyles} ${sizeStyles}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{label}</span>
      <span className="font-mono opacity-85 ml-0.5">({Math.round(score)}/100)</span>
    </span>
  );
};

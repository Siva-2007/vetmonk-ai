import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald' }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      ring: 'ring-emerald-500/20',
    },
    blue: {
      bg: 'bg-sky-50 text-sky-600',
      border: 'border-sky-100',
      ring: 'ring-sky-500/20',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      ring: 'ring-amber-500/20',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      ring: 'ring-rose-500/20',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
      ring: 'ring-purple-500/20',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${scheme.bg} ${scheme.border} border`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

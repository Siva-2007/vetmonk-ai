import React from 'react';

export const Badge = ({ status, variant, className = '' }) => {
  const getBadgeStyle = (val) => {
    switch (String(val).toUpperCase()) {
      case 'CONFIRMED':
      case 'COMPLETED':
      case 'ACTIVE':
      case 'RESOLVED':
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REQUESTED':
      case 'WAITING':
      case 'OPEN':
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'IN_QUEUE':
      case 'WITH_VET':
      case 'IN_CONSULTATION':
      case 'IN_PROGRESS':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'CANCELLED':
      case 'NO_SHOW':
      case 'HIGH':
      case 'URGENT':
      case 'EXPIRED':
      case 'FAILURE':
      case 'DENIED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'LOW_STOCK':
      case 'EXPIRING_SOON':
      case 'LOW':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
        variant || status
      )} ${className}`}
    >
      {status}
    </span>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage = () => {
  const { user } = useAuth();

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN': return '/super-admin/dashboard';
      case 'CLINIC_ADMIN': return '/admin/dashboard';
      case 'VETERINARIAN': return '/vet/dashboard';
      case 'RECEPTIONIST': return '/reception/dashboard';
      case 'PET_OWNER':
      default: return '/dashboard';
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">403 - Access Forbidden</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          You do not possess the necessary role authorization or ownership rights to view this protected resource.
        </p>
        <div className="pt-2">
          <Link
            to={getDashboardPath()}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

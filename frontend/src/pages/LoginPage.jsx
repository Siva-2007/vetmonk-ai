import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HeartHandshake,
  PawPrint,
  Building2,
  ArrowRight,
  Shield
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-2xl w-full">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="text-center mb-8">

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 mx-auto mb-4">
            <HeartHandshake className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to VetMonk AI
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Choose how you want to access VetMonk
          </p>

        </div>


        {/* =====================================================
            SESSION EXPIRED MESSAGE
        ===================================================== */}
        {isExpired && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-medium text-center">
            Your session has expired. Please sign in again.
          </div>
        )}


        {/* =====================================================
            LOGIN OPTIONS
        ===================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


          {/* ===================================================
              PET OWNER LOGIN
          =================================================== */}
          <button
            type="button"
            onClick={() => navigate('/login/pet-owner')}
            className="group text-left bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-200"
          >

            <div className="flex items-start justify-between">

              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-100 transition">
                <PawPrint className="w-6 h-6" />
              </div>

              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition" />

            </div>

            <h2 className="text-lg font-extrabold text-slate-900 mt-5">
              Pet Owner
            </h2>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Access your pets, appointments, vaccinations, medical records,
              documents and AI assistance.
            </p>

            <div className="mt-5 text-xs font-bold text-brand-600">
              Owner Login →
            </div>

          </button>


          {/* ===================================================
              HOSPITAL STAFF LOGIN
          =================================================== */}
          <button
            type="button"
            onClick={() => navigate('/login/hospital')}
            className="group text-left bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-200"
          >

            <div className="flex items-start justify-between">

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition">
                <Building2 className="w-6 h-6" />
              </div>

              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />

            </div>

            <h2 className="text-lg font-extrabold text-slate-900 mt-5">
              Hospital Staff
            </h2>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Sign in as a veterinarian, receptionist, or clinic
              administrator for your hospital.
            </p>

            <div className="mt-5 text-xs font-bold text-emerald-600">
              Hospital Login →
            </div>

          </button>

        </div>


        {/* =====================================================
            SECURITY INFORMATION
        ===================================================== */}
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4">

          <div className="flex items-start gap-3">

            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-slate-500" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700">
                Secure access
              </p>

              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Hospital accounts are provisioned by authorized administrators.
                Pet owners can create their own accounts through the owner
                registration process.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
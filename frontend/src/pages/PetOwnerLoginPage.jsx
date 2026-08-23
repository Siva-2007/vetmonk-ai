import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HeartHandshake,
  Lock,
  Mail,
  ArrowLeft,
  ArrowRight,
  PawPrint
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export const PetOwnerLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      error('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password
      });

      /*
       * IMPORTANT SECURITY CHECK
       *
       * This page is specifically for Pet Owners.
       * Even if someone manually sends another user's
       * credentials to this page, do not allow a staff
       * account to enter the Pet Owner portal.
       */
      if (res.data.role !== 'PET_OWNER') {
        error('This account is not registered as a Pet Owner.');
        return;
      }

      login(res.data);

      success(`Welcome back, ${res.data.name}!`);

      navigate('/dashboard');

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Login failed. Please check your credentials.';

      error(msg);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-md w-full">

        {/* =====================================================
            BACK TO ACCOUNT TYPE
        ===================================================== */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-600 transition mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login options
        </button>


        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="text-center mb-7">

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 mx-auto mb-4">
            <PawPrint className="w-7 h-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pet Owner Sign In
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Access your pets, appointments and medical records
          </p>

        </div>


        {/* =====================================================
            SESSION EXPIRED
        ===================================================== */}
        {isExpired && (
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-medium text-center">
            Your session has expired. Please sign in again.
          </div>
        )}


        {/* =====================================================
            LOGIN CARD
        ===================================================== */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* =================================================
                EMAIL
            ================================================= */}
            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>

              <div className="relative">

                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />

              </div>

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}
            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>

              <div className="relative">

                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />

              </div>

            </div>


            {/* =================================================
                SIGN IN
            ================================================= */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-brand-500/25 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >

              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}

            </button>

          </form>


          {/* ===================================================
              REGISTRATION
          =================================================== */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">

            <p className="text-xs text-slate-500">
              Don't have an account yet?
            </p>

            <Link
              to="/register"
              className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-brand-600 hover:text-brand-700 transition"
            >
              Register as Pet Owner
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

          </div>

        </div>


        {/* =====================================================
            INFORMATION
        ===================================================== */}
        <div className="mt-5 flex items-start gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl">

          <HeartHandshake className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />

          <p className="text-[11px] text-slate-500 leading-relaxed">
            This login is exclusively for registered pet-owner
            accounts. Hospital staff should use the Hospital Staff
            login.
          </p>

        </div>

      </div>

    </div>
  );
};
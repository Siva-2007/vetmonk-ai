import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  ArrowLeft,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export const HospitalLoginPage = () => {
  const [clinics, setClinics] = useState([]);
  const [clinicId, setClinicId] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loadingClinics, setLoadingClinics] = useState(true);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const isExpired =
    new URLSearchParams(location.search).get('expired');


  // =========================================================
  // LOAD CLINICS FROM DATABASE
  // =========================================================

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await api.get('/clinics');

        const data = Array.isArray(res.data)
          ? res.data
          : [];

        setClinics(data);

      } catch (err) {
        console.error('Failed to load clinics:', err);

        error(
          err.response?.data?.message ||
          'Unable to load hospitals'
        );

      } finally {
        setLoadingClinics(false);
      }
    };

    fetchClinics();
  }, [error]);


  // =========================================================
  // HOSPITAL STAFF LOGIN
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clinicId) {
      error('Please select a hospital');
      return;
    }

    if (!role) {
      error('Please select your role');
      return;
    }

    if (!email.trim()) {
      error('Please enter your email');
      return;
    }

    if (!password) {
      error('Please enter your password');
      return;
    }

    setLoading(true);

    try {

      const res = await api.post('/auth/login', {
        email: email.trim(),
        password,
        clinicId: Number(clinicId),
        role
      });


      // =====================================================
      // EXTRA FRONTEND CHECK
      // Backend is the real security boundary.
      // =====================================================

      if (res.data.role !== role) {
        error('Selected role does not match this account.');
        return;
      }

      if (
        res.data.clinicId == null ||
        Number(res.data.clinicId) !== Number(clinicId)
      ) {
        error('Selected hospital does not match this account.');
        return;
      }


      // =====================================================
      // SAVE AUTHENTICATION
      // =====================================================

      login(res.data);

      success(`Welcome back, ${res.data.name}!`);


      // =====================================================
      // ROLE DASHBOARD
      // =====================================================

      switch (res.data.role) {

        case 'CLINIC_ADMIN':
          navigate('/admin/dashboard');
          break;

        case 'VETERINARIAN':
          navigate('/vet/dashboard');
          break;

        case 'RECEPTIONIST':
          navigate('/reception/dashboard');
          break;

        default:
          error('Invalid hospital staff role.');
          break;
      }

    } catch (err) {

      console.error('Hospital login failed:', err);

      const msg =
        err.response?.data?.message ||
        'Login failed. Please check your hospital, role and credentials.';

      error(msg);

    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-md w-full">


        {/* ===================================================
            BACK BUTTON
        =================================================== */}

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login options
        </button>


        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="text-center mb-7">

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-brand-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 mx-auto mb-4">

            <Building2 className="w-7 h-7" />

          </div>


          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hospital Staff Sign In
          </h1>


          <p className="text-sm text-slate-500 mt-2">
            Sign in to your veterinary hospital account
          </p>

        </div>


        {/* ===================================================
            SESSION EXPIRED
        =================================================== */}

        {isExpired && (
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-medium text-center">
            Your session has expired. Please sign in again.
          </div>
        )}


        {/* ===================================================
            LOGIN CARD
        =================================================== */}

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >


            {/* =================================================
                HOSPITAL
            ================================================= */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Hospital
              </label>


              <div className="relative">

                <Building2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />


                <select
                  value={clinicId}
                  onChange={(e) => setClinicId(e.target.value)}
                  disabled={loadingClinics || loading}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition appearance-none disabled:opacity-60"
                >

                  <option value="">
                    {loadingClinics
                      ? 'Loading hospitals...'
                      : clinics.length === 0
                        ? 'No hospitals available'
                        : 'Select hospital'}
                  </option>


                  {clinics.map((clinic) => (
                    <option
                      key={clinic.id}
                      value={clinic.id}
                    >
                      {clinic.name}
                    </option>
                  ))}

                </select>

              </div>

            </div>


            {/* =================================================
                ROLE
            ================================================= */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Your Role
              </label>


              <div className="relative">

                <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />


                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition appearance-none disabled:opacity-60"
                >

                  <option value="">
                    Select your role
                  </option>

                  <option value="VETERINARIAN">
                    Veterinarian
                  </option>

                  <option value="RECEPTIONIST">
                    Receptionist
                  </option>

                  <option value="CLINIC_ADMIN">
                    Clinic Admin
                  </option>

                </select>

              </div>

            </div>


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
                  placeholder="staff@example.com"
                  autoComplete="username"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition disabled:opacity-60"
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
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition disabled:opacity-60"
                />

              </div>

            </div>


            {/* =================================================
                SIGN IN BUTTON
            ================================================= */}

            <button
              type="submit"
              disabled={
                loading ||
                loadingClinics ||
                clinics.length === 0
              }
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-500/25 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
              SECURITY MESSAGE
          =================================================== */}

          <div className="mt-6 pt-5 border-t border-slate-100">

            <div className="flex items-start gap-3">

              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Hospital staff accounts are created by authorized
                administrators. Your selected hospital and role
                must match your registered account.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
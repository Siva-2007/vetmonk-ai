import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export const RegisterPage = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    aadhaarNumber: '',
    preferredLanguage: 'en',
  });

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();


  // =========================================================
  // HANDLE INPUT CHANGES
  // =========================================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    // Aadhaar: allow numbers only and maximum 12 digits
    if (name === 'aadhaarNumber') {

      const numbersOnly = value.replace(/\D/g, '');

      if (numbersOnly.length <= 12) {
        setFormData({
          ...formData,
          [name]: numbersOnly
        });
      }

      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };


  // =========================================================
  // FORM SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      error('Passwords do not match');
      return;
    }

    // Password length
    if (formData.password.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    // Aadhaar validation
    if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
      error('Aadhaar number must contain exactly 12 digits');
      return;
    }

    setLoading(true);

    try {

      const res = await api.post('/auth/register', {

        name: formData.name.trim(),

        email: formData.email.trim(),

        password: formData.password,

        phone: formData.phone.trim(),

        aadhaarNumber: formData.aadhaarNumber,

        preferredLanguage: language || 'en',

      });

      // Login immediately after successful registration
      login(res.data);

      success(
        'Account created successfully! Welcome to VetMonk AI.'
      );

      navigate('/dashboard');

    } catch (err) {

      const msg =
        err.response?.data?.message ||
        'Registration failed. Please try again.';

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

      <div className="max-w-md w-full space-y-6">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="text-center">

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 mx-auto mb-4">

            <HeartHandshake className="w-7 h-7" />

          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Pet Owner Account
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your pets, appointments, vaccines, and AI medical assistance
          </p>

        </div>


        {/* ===================================================
            REGISTRATION CARD
        =================================================== */}

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl">

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* =================================================
                FULL NAME
            ================================================= */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>

              <div className="relative">

                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Morgan"
                  required
                  autoComplete="name"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />

              </div>

            </div>


            {/* =================================================
                EMAIL
            ================================================= */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>

              <div className="relative">

                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@example.com"
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />

              </div>

            </div>


            {/* =================================================
                PHONE
            ================================================= */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>

              <div className="relative">

                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 7358964540"
                  autoComplete="tel"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />

              </div>

            </div>


            {/* =================================================
                AADHAAR NUMBER
            ================================================= */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Aadhaar Number
              </label>

              <div className="relative">

                <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />

                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  placeholder="Enter 12-digit Aadhaar number"
                  inputMode="numeric"
                  maxLength={12}
                  minLength={12}
                  pattern="[0-9]{12}"
                  required
                  autoComplete="off"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />

              </div>

              <p className="text-[10px] text-slate-400 mt-1.5">
                Enter exactly 12 digits.
              </p>

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>

              <div className="relative">

                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />

              </div>

            </div>


            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>

              <div className="relative">

                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />

              </div>

            </div>


            {/* =================================================
                SUBMIT
            ================================================= */}

            <div className="pt-2">

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-brand-500/25 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >

                {loading
                  ? 'Creating Account...'
                  : 'Register as Pet Owner'
                }

                {!loading && (
                  <ArrowRight className="w-4 h-4" />
                )}

              </button>

            </div>

          </form>

        </div>


        {/* ===================================================
            LOGIN LINK
        =================================================== */}

        <p className="text-center text-xs text-slate-500">

          Already registered?{' '}

          <Link
            to="/login"
            className="font-bold text-brand-600 hover:text-brand-700"
          >
            Sign In Here
          </Link>

        </p>

      </div>

    </div>
  );
};
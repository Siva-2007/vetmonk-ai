import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  Sparkles,
  Phone,
  MessageCircle,
  Mail,
  AlertCircle,
  X
} from 'lucide-react';

import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // =====================================================
  // CONTACT DETAILS
  // =====================================================

  const phoneNumber = '+917358964540';
  const displayPhone = '+91 7358964540';
  const email = 'ssiva690620@gmail.com';

  // WhatsApp
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}`;

  // Gmail compose
  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* =====================================================
          SIDEBAR + MAIN CONTENT
      ===================================================== */}

      <div className="flex-1 flex">

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20">
          <Outlet />
        </main>

      </div>

      {/* =====================================================
          RIGHT-SIDE CONTACT / URGENT QUERIES
      ===================================================== */}

      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">

        {/* =================================================
            CONTACT OPTIONS POPUP
        ================================================= */}

        {contactOpen && (
          <div className="w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4">

            {/* Header */}

            <div className="flex items-center justify-between mb-3">

              <div className="flex items-center gap-2">

                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>

                <div>
                  <p className="text-xs font-extrabold text-slate-900">
                    Urgent Queries?
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Contact VetMonk support
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                aria-label="Close contact options"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            {/* =================================================
                CALL
            ================================================= */}

            <a
              href={`tel:${phoneNumber}`}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition mb-2"
            >

              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>

              <div>
                <p className="text-xs font-bold">
                  Call
                </p>

                <p className="text-[10px] text-slate-400">
                  {displayPhone}
                </p>
              </div>

            </a>

            {/* =================================================
                WHATSAPP
            ================================================= */}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition mb-2"
            >

              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
              </div>

              <div>
                <p className="text-xs font-bold">
                  WhatsApp
                </p>

                <p className="text-[10px] text-emerald-600/70">
                  Chat with us
                </p>
              </div>

            </a>

            {/* =================================================
                GMAIL
            ================================================= */}

            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition"
            >

              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-red-600" />
              </div>

              <div>
                <p className="text-xs font-bold">
                  Gmail
                </p>

                <p className="text-[10px] text-red-600/70">
                  {email}
                </p>
              </div>

            </a>

          </div>
        )}

        {/* =================================================
            URGENT QUERIES BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={() => setContactOpen(!contactOpen)}
          className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition duration-200 transform hover:scale-105 ${
            contactOpen
              ? 'bg-slate-800 hover:bg-slate-900 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >

          {contactOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}

          <span className="text-xs sm:text-sm font-bold tracking-wide">
            {contactOpen ? 'Close' : 'Urgent Queries?'}
          </span>

        </button>

      </div>

      {/* =====================================================
          FLOATING QUICK AI LAUNCHER
      ===================================================== */}

      <Link
        to="/ai-chat"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-brand-500/25 transition duration-200 group transform hover:scale-105"
      >

        <Sparkles className="w-5 h-5 animate-spin-slow text-brand-200 group-hover:rotate-12 transition-transform" />

        <span className="text-xs sm:text-sm font-bold tracking-wide">
          Ask VetMonk AI
        </span>

      </Link>

    </div>
  );
};
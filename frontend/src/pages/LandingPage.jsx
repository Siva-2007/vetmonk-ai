import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  Sparkles,
  Shield,
  Clock,
  Dog,
  Syringe,
  FileText,
  Building2,
  CheckCircle2,
  ArrowRight,
  Send,
  AlertTriangle,
  Briefcase,
  MapPin,
  CalendarDays,
  Phone,
  Mail,
  MessageCircle,
  Instagram
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export const LandingPage = () => {
  const { t } = useLanguage();

  const [demoPrompt, setDemoPrompt] = useState('');
  const [demoResponse, setDemoResponse] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  // =========================================================
  // CAREERS / VACANCIES
  // =========================================================

  const [vacancies, setVacancies] = useState([]);
  const [vacancyLoading, setVacancyLoading] = useState(true);
  const [vacancyError, setVacancyError] = useState('');

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        setVacancyLoading(true);
        setVacancyError('');

        const response = await api.get('/vacancies');

        const data = Array.isArray(response.data)
          ? response.data
          : [];

        setVacancies(data);
      } catch (err) {
        console.error('Failed to load vacancies:', err);

        setVacancyError(
          err.response?.data?.message ||
          'Unable to load current career opportunities.'
        );

        setVacancies([]);
      } finally {
        setVacancyLoading(false);
      }
    };

    fetchVacancies();
  }, []);

  // =========================================================
  // AI DEMO
  // =========================================================

  const handleDemoQuery = async (e) => {
    e.preventDefault();

    if (!demoPrompt.trim()) return;

    setDemoLoading(true);
    setDemoResponse(null);

    setTimeout(() => {
      const lower = demoPrompt.toLowerCase();

      if (
        lower.includes('poison') ||
        lower.includes('chocolate') ||
        lower.includes('breathing')
      ) {
        setDemoResponse({
          reply:
            'CRITICAL EMERGENCY ALERT: The described symptoms indicate a potentially life-threatening emergency. Please take your pet to the nearest emergency veterinary hospital immediately.',
          triage: 'HIGH',
          emergency: true,
          sources: [
            'VECCS Emergency Protocols',
            'Veterinary Toxic Ingestion Guidelines'
          ]
        });
      } else {
        setDemoResponse({
          reply:
            'Based on veterinary care guidelines: Ensure continuous access to fresh water and balanced age-appropriate nutrition. For specific symptom diagnosis or medication, always consult your clinic veterinarian.',
          triage: 'LOW',
          emergency: false,
          sources: [
            'WSAVA Preventive Healthcare',
            'AAHA Wellness Standards'
          ]
        });
      }

      setDemoLoading(false);
    }, 600);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDeadline = (deadline) => {
    if (!deadline) return 'Deadline not specified';

    try {
      return new Date(deadline).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return deadline;
    }
  };

  // =========================================================
  // HOMEPAGE
  // =========================================================

  return (
    <div className="space-y-24 pb-20">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="relative pt-12 pb-20 overflow-hidden">

        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-white to-slate-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-bold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-3 duration-500">

            <Sparkles className="w-4 h-4 text-brand-600" />

            <span>
              AI-Powered Veterinary Healthcare & Smart Clinic Monolith
            </span>

          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">

            Smarter Veterinary Care.

            <br className="hidden sm:block" />

            <span className="bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Healthier Pets.
            </span>

          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The integrated veterinary platform uniting pet owners,
            clinical veterinarians, receptionists, and clinic
            administrators with safe RAG-powered AI assistance
            and automated clinic workflows.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">

            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition duration-200 text-base"
            >
              <span>Get Started as Pet Owner</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-8 py-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 text-base"
            >
              <span>Staff & Demo Sign In</span>
            </Link>

          </div>

          {/* TRUST BADGES */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 pt-8 border-t border-slate-200/60">

            <div className="flex items-center justify-center gap-2 text-slate-600 text-xs font-semibold">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Multi-tier Safety Guardrails</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-600 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Real RAG Knowledge Retrieval</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-600 text-xs font-semibold">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Live Queue & Check-In</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-600 text-xs font-semibold">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>OCR Medical Document Engine</span>
            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          AI PREVIEW
      ===================================================== */}

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-700 text-white relative overflow-hidden">

          <div className="flex items-center justify-between border-b border-slate-700 pb-5 mb-6">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                <Sparkles className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Try VetMonk AI Assistant
                </h3>

                <p className="text-xs text-slate-400">
                  Experience intelligent safety triage and RAG grounding in real-time
                </p>
              </div>

            </div>

            <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Interactive Preview
            </span>

          </div>

          <form onSubmit={handleDemoQuery} className="mb-6">

            <div className="relative">

              <input
                type="text"
                value={demoPrompt}
                onChange={(e) => setDemoPrompt(e.target.value)}
                placeholder="Ask about vaccination schedules, nutrition, or try typing: 'Dog ate chocolate'..."
                className="w-full bg-slate-800/90 border border-slate-600 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 pr-28"
              />

              <button
                type="submit"
                disabled={demoLoading || !demoPrompt.trim()}
                className="absolute right-2.5 top-2.5 bottom-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <span>
                  {demoLoading ? 'Analyzing...' : 'Ask AI'}
                </span>

                <Send className="w-3.5 h-3.5" />
              </button>

            </div>

          </form>

          {demoResponse && (

            <div
              className={`p-5 rounded-2xl border text-sm animate-in fade-in duration-300 ${
                demoResponse.emergency
                  ? 'bg-rose-950/60 border-rose-600/60 text-rose-100'
                  : 'bg-emerald-950/50 border-emerald-600/40 text-emerald-100'
              }`}
            >

              <div className="flex items-center gap-2 mb-2">

                {demoResponse.emergency ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}

                <span className="font-bold text-xs uppercase tracking-wider">
                  Triage Status: {demoResponse.triage}
                  {demoResponse.emergency && ' (CRITICAL)'}
                </span>

              </div>

              <p className="leading-relaxed mb-3">
                {demoResponse.reply}
              </p>

              {demoResponse.sources && (

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-700/60">

                  <span className="font-semibold text-slate-300">
                    Grounded Knowledge Sources:
                  </span>{' '}

                  {demoResponse.sources.join(' • ')}

                </div>

              )}

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-16">

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Built for Complete Veterinary Clinic Workflows
          </h2>

          <p className="text-base text-slate-600 mt-4">
            Everything your hospital needs: from patient check-in
            queues to veterinarian consultations, pharmacy inventory,
            and AI-assisted client communication.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* PET OWNER */}

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
              <Dog className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Pet Owner Care Portal
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Comprehensive pet health records, appointment bookings,
              automated vaccination reminder alerts, and 24/7 AI
              wellness assistance.
            </p>

            <ul className="space-y-2 text-xs font-medium text-slate-700">

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                Multi-pet profiles & medical history
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                Real-time vaccination due reminders
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                Multilingual & Voice query support
              </li>

            </ul>

          </div>


          {/* CLINICAL */}

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">

            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5 border border-sky-100">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Clinical Consultation & Rx
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Streamlined veterinarian tools for clinical observations,
              SOAP notes, electronic prescriptions, and diagnostic
              record creation.
            </p>

            <ul className="space-y-2 text-xs font-medium text-slate-700">

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                One-click consultation workflow
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                Formulary prescription authoring
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                Live waiting room queue calls
              </li>

            </ul>

          </div>


          {/* ADMIN */}

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">

            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-100">
              <Building2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Pharmacy & Clinic Admin
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Real-time batch tracking, stock threshold alerts,
              expiring medication warnings, staff registration,
              and career vacancy management.
            </p>

            <ul className="space-y-2 text-xs font-medium text-slate-700">

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                Low stock & expiring drug alerts
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                Audit log trail & IDOR security
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                Public career vacancies posting
              </li>

            </ul>

          </div>

        </div>

      </section>


      {/* =====================================================
          CAREERS / VACANCIES
      ===================================================== */}

      <section
        id="careers"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >

        <div className="text-center max-w-3xl mx-auto mb-12">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold mb-4">

            <Briefcase className="w-4 h-4" />

            Careers

          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Join Our Veterinary Community
          </h2>

          <p className="text-base text-slate-600 mt-4">
            Explore current opportunities available at our veterinary
            hospitals and find your next career opportunity.
          </p>

        </div>


        {/* LOADING */}

        {vacancyLoading && (

          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm">

            <div className="animate-pulse">

              <div className="h-5 bg-slate-200 rounded w-48 mx-auto mb-4" />

              <div className="h-4 bg-slate-100 rounded w-72 max-w-full mx-auto" />

            </div>

          </div>

        )}


        {/* ERROR */}

        {!vacancyLoading && vacancyError && (

          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center">

            <Briefcase className="w-8 h-8 text-amber-500 mx-auto mb-3" />

            <h3 className="font-bold text-slate-900 mb-2">
              Careers are temporarily unavailable
            </h3>

            <p className="text-sm text-slate-600">
              {vacancyError}
            </p>

          </div>

        )}


        {/* NO VACANCIES */}

        {!vacancyLoading &&
          !vacancyError &&
          vacancies.length === 0 && (

            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm">

              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-4" />

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                No Current Openings
              </h3>

              <p className="text-sm text-slate-500 mb-5">
                There are no open career opportunities at the moment.
                Please check again later.
              </p>

              <Link
                to="/vacancies"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
              >
                View Careers Page
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>

          )}


        {/* VACANCIES */}

        {!vacancyLoading &&
          !vacancyError &&
          vacancies.length > 0 && (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {vacancies.slice(0, 6).map((vacancy) => (

                <div
                  key={vacancy.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-emerald-200 transition p-6 flex flex-col"
                >

                  {/* TITLE */}

                  <div className="flex items-start gap-4 mb-5">

                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">

                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {vacancy.title}
                      </h3>

                      {vacancy.department && (
                        <p className="text-xs text-emerald-600 font-semibold mt-1">
                          {vacancy.department}
                        </p>
                      )}

                    </div>

                  </div>


                  {/* DETAILS */}

                  <div className="space-y-3 text-sm text-slate-600 mb-6">

                    {vacancy.clinicName && (

                      <div className="flex items-start gap-2">

                        <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

                        <span>
                          {vacancy.clinicName}
                        </span>

                      </div>

                    )}


                    {vacancy.location && (

                      <div className="flex items-start gap-2">

                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

                        <span>
                          {vacancy.location}
                        </span>

                      </div>

                    )}


                    {vacancy.employmentType && (

                      <div className="flex items-center gap-2">

                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />

                        <span>
                          {vacancy.employmentType.replaceAll('_', ' ')}
                        </span>

                      </div>

                    )}


                    {vacancy.deadline && (

                      <div className="flex items-center gap-2">

                        <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />

                        <span>
                          Apply before {formatDeadline(vacancy.deadline)}
                        </span>

                      </div>

                    )}

                  </div>


                  {/* DESCRIPTION */}

                  {vacancy.description && (

                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-6">
                      {vacancy.description}
                    </p>

                  )}


                  {/* BUTTON */}

                  <div className="mt-auto">

                    <Link
                      to="/vacancies"
                      className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition"
                    >
                      View & Apply
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                  </div>

                </div>

              ))}

            </div>

          )}


        {/* VIEW ALL */}

        {!vacancyLoading &&
          !vacancyError &&
          vacancies.length > 0 && (

            <div className="text-center mt-10">

              <Link
                to="/vacancies"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-md shadow-brand-500/20 transition"
              >
                View All Careers
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>

          )}

      </section>


      {/* =====================================================
          CONTACT US
      ===================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-10">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold mb-4">
            <MessageCircle className="w-4 h-4" />
            Contact Us
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            We're Here to Help
          </h2>

          <p className="text-base text-slate-600 mt-4">
            Have questions about VetMonk AI, veterinary services, or
            career opportunities? Get in touch with us.
          </p>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* PHONE */}

          <a
            href="tel:+917358964540"
            className="group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-lg hover:border-brand-200 transition"
          >

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Phone className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-slate-900 mb-1">
              Call Us
            </h3>

            <p className="text-sm text-slate-500">
              +91 73589 64540
            </p>

          </a>


          {/* WHATSAPP */}

          <a
            href="https://wa.me/917358964540"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-lg hover:border-green-200 transition"
          >

            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <MessageCircle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-slate-900 mb-1">
              WhatsApp
            </h3>

            <p className="text-sm text-slate-500">
              Chat with us
            </p>

          </a>


          {/* EMAIL */}

          <a
            href="mailto:ssiva690620@gmail.com"
            className="group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-lg hover:border-sky-200 transition"
          >

            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Mail className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-slate-900 mb-1">
              Email
            </h3>

            <p className="text-sm text-slate-500 break-all">
              ssiva690620@gmail.com
            </p>

          </a>


          {/* INSTAGRAM */}

          <a
            href="https://www.instagram.com/dude_452155/"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-lg hover:border-pink-200 transition"
          >

            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Instagram className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-slate-900 mb-1">
              Instagram
            </h3>

            <p className="text-sm text-slate-500">
              @dude_452155
            </p>

          </a>

        </div>

      </section>


      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-brand-600 rounded-3xl p-8 sm:p-14 text-center text-white shadow-xl shadow-brand-600/20">

          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready for Modern Veterinary Healthcare?
          </h2>

          <p className="text-brand-100 max-w-xl mx-auto text-base sm:text-lg mb-8 leading-relaxed">
            Create an account or use our instant demo role selector
            to test the live platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

            <Link
              to="/register"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-brand-700 font-bold px-8 py-3.5 rounded-2xl shadow-md transition"
            >
              Register as Pet Owner
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto bg-brand-700 hover:bg-brand-800 text-white font-bold px-8 py-3.5 rounded-2xl border border-brand-500 transition"
            >
              Sign In
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
};
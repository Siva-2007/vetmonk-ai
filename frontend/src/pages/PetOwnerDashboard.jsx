import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dog,
  Calendar,
  Syringe,
  FileText,
  Sparkles,
  PlusCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../services/api';

export const PetOwnerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/pet-owner');
        setData(res.data);
      } catch (err) {
        console.error("Failed to load pet owner dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your pets and health schedules..." />;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-brand-700 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            Pet Owner Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            {t('welcome')}, {user?.name}! 🐾
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            Track your pets' comprehensive clinical records, scheduled vaccines, upcoming appointments, and get AI health guidance.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/appointments/book"
            className="flex items-center gap-2 bg-white text-brand-700 hover:bg-slate-50 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition"
          >
            <Clock className="w-4 h-4" />
            <span>{t('bookAppointment')}</span>
          </Link>
          <Link
            to="/ai-chat"
            className="flex items-center gap-2 bg-brand-900/80 hover:bg-brand-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-brand-500/40 transition"
          >
            <Sparkles className="w-4 h-4 text-brand-300" />
            <span>Ask VetMonk AI</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Registered Pets"
          value={data?.totalPets || 0}
          subtitle="Active profiles"
          icon={Dog}
          color="emerald"
        />
        <StatCard
          title="Upcoming Appointments"
          value={data?.upcomingAppointmentsCount || 0}
          subtitle="Confirmed bookings"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Vaccines Due / Pending"
          value={data?.pendingVaccinationsCount || 0}
          subtitle="Scheduled immunization"
          icon={Syringe}
          color="amber"
        />
        <StatCard
          title="Clinical Records"
          value={data?.totalMedicalRecordsCount || 0}
          subtitle="Verified by vet"
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Pets & Appointments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pets Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Dog className="w-5 h-5 text-brand-600" />
                <h2 className="text-base font-bold text-slate-900">{t('myPets')}</h2>
              </div>
              <Link
                to="/pets"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>Manage All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {(!data?.pets || data.pets.length === 0) ? (
              <div className="text-center py-8">
                <Dog className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No pets registered yet</p>
                <p className="text-xs text-slate-500 mb-4">Add your pet to schedule checkups and track records.</p>
                <Link
                  to="/pets"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register First Pet</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.pets.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-brand-300 transition flex items-start gap-3.5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-extrabold text-lg shrink-0">
                      {p.species === 'Cat' ? '🐱' : p.species === 'Dog' ? '🐶' : '🐾'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{p.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{p.species} • {p.breed || 'Mixed'}</p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-600">
                        <span className="font-semibold">{p.weight ? `${p.weight} kg` : 'Weight N/A'}</span>
                        <span>•</span>
                        <span>{p.gender || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-bold text-slate-900">Upcoming Appointments</h2>
              </div>
              <Link
                to="/appointments"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View Schedule</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {(!data?.upcomingAppointments || data.upcomingAppointments.length === 0) ? (
              <div className="text-center py-6 text-slate-500 text-xs font-medium">
                No upcoming appointments scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingAppointments.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{a.petName}</span>
                        <Badge status={a.status} />
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{a.reason}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {a.appointmentDate} at {a.appointmentTime} • Dr. {a.veterinarianName || 'Assigned on arrival'}
                      </p>
                    </div>
                    <Link
                      to="/appointments"
                      className="text-xs font-bold text-slate-600 hover:text-brand-600 p-2 rounded-lg hover:bg-slate-200/60 transition"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Vaccination Reminders & Quick AI Assistant Box */}
        <div className="space-y-6">
          {/* Upcoming Vaccination Alerts */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">{t('vaccinations')}</h3>
              </div>
              <Link to="/vaccinations" className="text-xs font-bold text-brand-600">
                View All
              </Link>
            </div>

            {(!data?.upcomingVaccinations || data.upcomingVaccinations.length === 0) ? (
              <p className="text-xs text-slate-500 py-4 text-center">No pending vaccination due dates.</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingVaccinations.map((v) => (
                  <div key={v.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{v.vaccineName}</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-200 text-amber-900 rounded">
                        Due: {v.nextDueDate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Pet: <span className="font-semibold">{v.petName}</span></p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick AI Help Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h3 className="text-sm font-bold">Have a pet health question?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Ask VetMonk AI about symptom triage, nutrition recommendations, or upload a diagnostic document for instant OCR explanation.
            </p>
            <Link
              to="/ai-chat"
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm"
            >
              <span>Open AI Chat Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

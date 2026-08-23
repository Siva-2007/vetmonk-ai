import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Clock,
  Calendar,
  CheckCircle2,
  Users,
  Pill,
  Sparkles,
  ArrowRight,
  Dog,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../services/api';

export const VeterinarianDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/veterinarian');
        setData(res.data);
      } catch (err) {
        console.error("Failed to load vet dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading clinical schedule and waiting queue..." />;
  }

  return (
    <div className="space-y-8">
      {/* Vet Greeting Banner */}
      <div className="bg-gradient-to-r from-sky-800 via-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-sky-100 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            Clinical Specialist Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Welcome, Dr. {user?.name}! 🩺
          </h1>
          <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-xl">
            Manage your patient waiting room, document clinical observations, issue electronic prescriptions, and review histories.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/vet/queue"
            className="flex items-center gap-2 bg-white text-sky-800 hover:bg-slate-50 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition"
          >
            <Clock className="w-4 h-4" />
            <span>Open Waiting Queue ({data?.waitingPatientsCount || 0})</span>
          </Link>
          <Link
            to="/ai-chat"
            className="flex items-center gap-2 bg-sky-950/80 hover:bg-sky-950 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-sky-400/40 transition"
          >
            <Sparkles className="w-4 h-4 text-sky-300" />
            <span>Clinical AI Reference</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Today's Appointments"
          value={data?.todayAppointmentsCount || 0}
          subtitle="Scheduled bookings"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Patients in Queue"
          value={data?.waitingPatientsCount || 0}
          subtitle="Waiting in reception"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Completed Today"
          value={data?.completedTodayCount || 0}
          subtitle="Finished consultations"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Total Consultations"
          value={data?.totalConsultationsCount || 0}
          subtitle="Historical patient cases"
          icon={Stethoscope}
          color="purple"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Waiting Room Queue (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">Current Waiting Queue</h2>
              </div>
              <Link
                to="/vet/queue"
                className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1"
              >
                <span>Full Queue Board</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {(!data?.queueEntries || data.queueEntries.length === 0) ? (
              <div className="text-center py-8 text-slate-500 text-xs font-medium">
                No patients currently waiting in reception queue.
              </div>
            ) : (
              <div className="space-y-3">
                {data.queueEntries.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4 hover:border-sky-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-extrabold flex items-center justify-center text-sm">
                        #{q.tokenNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{q.petName}</h3>
                          <Badge status={q.status} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Owner: {q.ownerName} • Check-In: {q.checkInTime ? q.checkInTime.substring(11, 16) : 'Recently'}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/vet/consultations?appointmentId=${q.appointmentId}&petId=${q.petId}`}
                      className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <span>Start Consultation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Tools & Formularies */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              Clinical Quick Links
            </h3>
            <div className="space-y-2.5">
              <Link
                to="/medicines"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200/70 text-xs font-bold text-slate-700 hover:text-sky-700 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Pill className="w-4 h-4 text-sky-600" />
                  <span>Drug Formulary Search</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/vet/appointments"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200/70 text-xs font-bold text-slate-700 hover:text-sky-700 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Today's Appointment Schedule</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/ai-chat"
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs font-bold text-emerald-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>AI Dosage & Literature Assistant</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Clock,
  Calendar,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../services/api';

export const ReceptionistDashboard = () => {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/dashboard/receptionist');

        if (mounted) {
          setData(response.data);
        }
      } catch (err) {
        console.error(
          'Failed to load receptionist dashboard:',
          err
        );

        if (mounted) {
          setError('Failed to load receptionist dashboard.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <LoadingSpinner
        size="lg"
        message="Loading front desk reception center..."
      />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <p className="text-red-600 font-semibold">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg bg-purple-700 text-white font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const liveQueue = Array.isArray(data?.liveQueue)
    ? data.liveQueue
    : [];

  return (
    <div className="space-y-8">

      {/* =====================================================
          GREETING BANNER
      ====================================================== */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">

        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-purple-100 text-xs font-bold uppercase tracking-wider">
            Front Desk Reception Portal
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Welcome, {user?.name || 'Receptionist'}! 📋
          </h1>

          <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-xl">
            Check-in arriving pet owners, generate live waiting
            tokens, monitor consultation queues, and handle
            customer queries.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <Link
            to="/reception/check-in"
            className="flex items-center gap-2 bg-white text-purple-900 hover:bg-slate-50 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>Check In Patient</span>
          </Link>

          <Link
            to="/reception/queue"
            className="flex items-center gap-2 bg-purple-950/80 hover:bg-purple-950 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-purple-400/40 transition"
          >
            <Clock className="w-4 h-4 text-purple-300" />
            <span>Live Waiting Board</span>
          </Link>

        </div>
      </div>


      {/* =====================================================
          METRICS
      ====================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Today's Appointments */}
        <StatCard
          title="Today's Appointments"
          value={data?.todayAppointmentsCount ?? 0}
          subtitle="Scheduled bookings"
          icon={Calendar}
          color="blue"
        />

        {/* FIXED: Backend property is checkedInCount */}
        <StatCard
          title="Checked-In Today"
          value={data?.checkedInCount ?? 0}
          subtitle="Arrivals processed"
          icon={UserCheck}
          color="emerald"
        />

        {/* FIXED: Backend property is inQueueCount */}
        <StatCard
          title="Currently Waiting"
          value={data?.inQueueCount ?? 0}
          subtitle="In reception lobby"
          icon={Clock}
          color="amber"
        />

        {/* Open Customer Queries */}
        <StatCard
          title="Open Queries"
          value={data?.openQueriesCount ?? 0}
          subtitle="Support requests"
          icon={HelpCircle}
          color="purple"
        />

      </div>


      {/* =====================================================
          LIVE RECEPTION QUEUE
      ====================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">

        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">

          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />

            <h2 className="text-base font-bold text-slate-900">
              Live Reception Queue Board
            </h2>
          </div>

          <Link
            to="/reception/queue"
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
          >
            <span>Open Full Screen Board</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

        </div>


        {/* EMPTY QUEUE */}
        {liveQueue.length === 0 ? (

          <div className="text-center py-8 text-slate-500 text-xs font-medium">
            No patients currently in reception waiting queue.
          </div>

        ) : (

          /* LIVE QUEUE DATA */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {liveQueue.map((queueEntry) => (

              <div
                key={queueEntry.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
              >

                <div className="flex items-center gap-3">

                  {/* Backend returns queueNumber */}
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 font-extrabold flex items-center justify-center text-sm">
                    #{queueEntry.queueNumber ?? '-'}
                  </div>

                  <div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {queueEntry.petName || 'Unknown Pet'}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {queueEntry.veterinarianName
                        ? `Dr. ${queueEntry.veterinarianName}`
                        : 'First Available'}
                    </p>

                  </div>

                </div>

                <Badge status={queueEntry.status} />

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};
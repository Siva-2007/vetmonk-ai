import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Dog, Building2, User, Plus, XCircle, Search, Filter } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import api from '../services/api';

export const MyAppointmentsPage = () => {
  const { success, error } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/my');
      setAppointments(res.data);
    } catch (err) {
      error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async () => {
    if (!cancellingId) return;
    try {
      await api.delete(`/appointments/${cancellingId}`);
      success('Appointment cancelled successfully.');
      setCancellingId(null);
      fetchAppointments();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const filtered = appointments.filter(a => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'UPCOMING') {
      return a.status === 'REQUESTED' || a.status === 'CONFIRMED' || a.status === 'CHECKED_IN' || a.status === 'IN_QUEUE';
    }
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-8 h-8 text-brand-600" />
            <span>My Appointments</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your upcoming clinic appointments, past consultations, and active waiting status.
          </p>
        </div>

        <Link
          to="/appointments/book"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterStatus === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {st === 'ALL' ? 'All Bookings' : st}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your appointments..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Appointments Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            You don't have any appointments matching this category.
          </p>
          <Link
            to="/appointments/book"
            className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm hover:bg-brand-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <Dog className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900">{a.petName}</h3>
                    <Badge status={a.status} />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{a.reason}</p>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" /> {a.appointmentDate}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-brand-600" /> {a.appointmentTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> {a.clinicName}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Dr. {a.veterinarianName || 'First Available'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                {(a.status === 'REQUESTED' || a.status === 'CONFIRMED') && (
                  <button
                    onClick={() => setCancellingId(a.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition border border-rose-200"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
                {a.status === 'COMPLETED' && (
                  <Link
                    to="/medical-records"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    View Clinical Record &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={!!cancellingId}
        onClose={() => setCancellingId(null)}
        onConfirm={handleCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmText="Yes, Cancel Booking"
        isDangerous={true}
      />
    </div>
  );
};

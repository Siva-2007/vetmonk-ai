import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Dog, User, CheckCircle2, XCircle, Stethoscope, Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import api from '../services/api';

export const VetAppointmentsPage = () => {
  const { success, error } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/today');
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

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status?status=${status}`);
      success(`Appointment status updated to ${status}`);
      fetchAppointments();
    } catch (err) {
      error('Failed to update appointment status');
    }
  };

  const filtered = appointments.filter(a =>
    a.petName?.toLowerCase().includes(search.toLowerCase()) ||
    a.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
    a.reason?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-8 h-8 text-sky-700" />
            <span>Today's Clinical Appointments</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review booked patient consults, check statuses, and manage your consultation schedule.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by pet or owner..."
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading appointment schedule..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Appointments Found Today</h3>
          <p className="text-xs text-slate-500 mt-1">
            Your schedule for today is currently clear.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold shrink-0 border border-sky-100">
                  <Dog className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900">{a.petName}</h3>
                    <Badge status={a.status} />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{a.reason}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-700" /> {a.appointmentTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Owner: {a.ownerName} ({a.ownerPhone || 'No phone'})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end md:self-center">
                {a.status === 'REQUESTED' && (
                  <button
                    onClick={() => handleUpdateStatus(a.id, 'CONFIRMED')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Confirm Booking
                  </button>
                )}
                {a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && (
                  <Link
                    to={`/vet/consultations?appointmentId=${a.id}&petId=${a.petId}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Open SOAP</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

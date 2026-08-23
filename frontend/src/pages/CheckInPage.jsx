import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Clock, Search, Dog, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import api from '../services/api';

export const CheckInPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Check-In Dialog state
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [selectedVetId, setSelectedVetId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [apptRes, vetRes] = await Promise.all([
        api.get('/appointments/today'),
        api.get('/users/veterinarians')
      ]);
      setAppointments(apptRes.data);
      setVets(vetRes.data);
    } catch (err) {
      error('Failed to load appointments for check-in');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCheckIn = (appt) => {
    setSelectedAppt(appt);
    setSelectedVetId(appt.veterinarianId || (vets[0]?.id || ''));
    setNotes('Arrived at reception on schedule.');
  };

  const handleProcessCheckIn = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;

    setSubmitting(true);
    try {
      const res = await api.post('/queue/check-in', {
        appointmentId: selectedAppt.id,
        veterinarianId: selectedVetId ? Number(selectedVetId) : null,
        notes: notes,
      });

      success(`Patient checked in! Issued Token #${res.data.tokenNumber}`);
      setSelectedAppt(null);
      fetchData();
      navigate('/reception/queue');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to process check-in');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = appointments.filter(a =>
    a.petName?.toLowerCase().includes(search.toLowerCase()) ||
    a.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
    a.ownerPhone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-8 h-8 text-purple-700" />
            <span>Patient Check-In & Token Generation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search scheduled appointments for today, verify arrival, assign consultation rooms, and print queue tokens.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pet, owner, or phone..."
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading today's schedule..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Appointments Pending Check-In</h3>
          <p className="text-xs text-slate-500 mt-1">
            All appointments for today have been checked in or no bookings exist.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((a) => (
            <div
              key={a.id}
              className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                a.status === 'IN_QUEUE' || a.status === 'CHECKED_IN'
                  ? 'border-purple-200 bg-purple-50/20'
                  : 'border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base">
                      <Dog className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{a.petName}</h3>
                      <p className="text-xs text-slate-500 font-medium">Owner: {a.ownerName} ({a.ownerPhone || 'No phone'})</p>
                    </div>
                  </div>
                  <Badge status={a.status} />
                </div>

                <div className="py-3 border-y border-slate-100 text-xs space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Scheduled Time:</span>
                    <span className="font-bold text-slate-900">{a.appointmentTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Reason:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[200px]">{a.reason}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Assigned Vet:</span>
                    <span>Dr. {a.veterinarianName || 'First Available'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                {a.status !== 'IN_QUEUE' && a.status !== 'CHECKED_IN' && a.status !== 'COMPLETED' && a.status !== 'CANCELLED' ? (
                  <button
                    onClick={() => handleOpenCheckIn(a)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Process Check-In</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-lg">
                    Already in Queue / Checked In
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Check-In Modal */}
      <Modal
        isOpen={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        title={`Front Desk Check-In: ${selectedAppt?.petName}`}
      >
        {selectedAppt && (
          <form onSubmit={handleProcessCheckIn} className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <p><strong>Patient:</strong> {selectedAppt.petName}</p>
              <p><strong>Owner:</strong> {selectedAppt.ownerName} ({selectedAppt.ownerPhone})</p>
              <p><strong>Scheduled Slot:</strong> {selectedAppt.appointmentTime} ({selectedAppt.reason})</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assign Attending Veterinarian *
              </label>
              <select
                value={selectedVetId}
                onChange={(e) => setSelectedVetId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              >
                {vets.map((v) => (
                  <option key={v.id} value={v.id}>
                    Dr. {v.name} ({v.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reception Arrival Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Arrived on time with crate; urgent scratching"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAppt(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Generating Token...' : 'Confirm Check-In & Issue Token'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

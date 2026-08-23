import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Dog, Building2, User, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../services/api';

export const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [pets, setPets] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    petId: '',
    clinicId: '',
    veterinarianId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00',
    reason: '',
  });

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [petsRes, clinicsRes, vetsRes] = await Promise.all([
          api.get('/pets'),
          api.get('/clinics'),
          api.get('/users/veterinarians')
        ]);

        setPets(petsRes.data);
        setClinics(clinicsRes.data);
        setVets(vetsRes.data);

        // Set sensible defaults if available
        if (petsRes.data.length > 0) {
          setFormData(prev => ({ ...prev, petId: petsRes.data[0].id }));
        }
        if (clinicsRes.data.length > 0) {
          setFormData(prev => ({ ...prev, clinicId: clinicsRes.data[0].id }));
        }
        if (vetsRes.data.length > 0) {
          setFormData(prev => ({ ...prev, veterinarianId: vetsRes.data[0].id }));
        }
      } catch (err) {
        error('Failed to load clinic prerequisites');
      } finally {
        setLoading(false);
      }
    };

    loadPrerequisites();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.petId) {
      error('Please select a pet');
      return;
    }
    if (!formData.clinicId) {
      error('Please select a clinic');
      return;
    }
    if (!formData.reason.trim()) {
      error('Please describe the reason for your visit');
      return;
    }

    setSubmitting(true);
    try {
      // Format time as HH:mm:00
      let formattedTime = formData.appointmentTime;
      if (formattedTime.length === 5) {
        formattedTime = formattedTime + ':00';
      }

      const payload = {
        petId: Number(formData.petId),
        clinicId: Number(formData.clinicId),
        veterinarianId: formData.veterinarianId ? Number(formData.veterinarianId) : null,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formattedTime,
        reason: formData.reason,
      };

      await api.post('/appointments', payload);
      success('Appointment successfully requested! The clinic will review your booking.');
      navigate('/appointments');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to book appointment. Time slot might be unavailable.';
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading available clinic slots..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Clock className="w-8 h-8 text-brand-600" />
          <span>Book Veterinary Appointment</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select your pet, preferred veterinary clinic, attending specialist, and convenient consultation time.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        {pets.length === 0 ? (
          <div className="text-center py-8">
            <Dog className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Please register a pet before booking an appointment</p>
            <button
              onClick={() => navigate('/pets')}
              className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
            >
              Go to My Pets
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Pet Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Dog className="w-3.5 h-3.5 text-brand-600" />
                  <span>Select Pet *</span>
                </label>
                <select
                  value={formData.petId}
                  onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                  required
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} • {p.breed || 'Mixed'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Clinic Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-600" />
                  <span>Select Clinic Branch *</span>
                </label>
                <select
                  value={formData.clinicId}
                  onChange={(e) => setFormData({ ...formData, clinicId: e.target.value })}
                  required
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                >
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Veterinarian Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-600" />
                <span>Preferred Attending Veterinarian (Optional)</span>
              </label>
              <select
                value={formData.veterinarianId}
                onChange={(e) => setFormData({ ...formData, veterinarianId: e.target.value })}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="">Any Available Specialist / First Available</option>
                {vets.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  <span>Appointment Date *</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  required
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  <span>Preferred Time Slot *</span>
                </label>
                <select
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  required
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="09:30">09:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="14:30">02:30 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="15:30">03:30 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="16:30">04:30 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-600" />
                <span>Reason for Visit & Symptoms Observed *</span>
              </label>
              <textarea
                rows="3"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g. Annual wellness checkup, booster vaccination, skin itching, mild cough, mobility evaluation..."
                required
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/appointments')}
                className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md shadow-brand-500/20 transition duration-200 disabled:opacity-50"
              >
                <span>{submitting ? 'Booking...' : 'Confirm Appointment'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

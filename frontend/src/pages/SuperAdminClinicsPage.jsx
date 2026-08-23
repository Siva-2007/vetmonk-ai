import React, { useState, useEffect } from 'react';
import { Building2, Plus, Phone, Mail, Clock, MapPin, Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import api from '../services/api';

export const SuperAdminClinicsPage = () => {
  const { success, error } = useToast();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    openingHours: '08:00 AM - 08:00 PM',
    servicesOffered: 'General Medicine, Surgery, Vaccinations, Radiology, Dental Care',
  });

  const fetchClinics = async () => {
    try {
      const res = await api.get('/clinics');
      setClinics(res.data);
    } catch (err) {
      error('Failed to load clinic network');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleCreateClinic = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clinics', formData);
      success(`Registered new clinic branch: ${formData.name}`);
      setIsAddOpen(false);
      setFormData({ name: '', address: '', phone: '', email: '', openingHours: '08:00 AM - 08:00 PM', servicesOffered: '' });
      fetchClinics();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create clinic');
    }
  };

  const filtered = clinics.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-8 h-8 text-brand-600" />
            <span>Clinic Hospital Branches Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register and configure hospital branches, specialty centers, operating hours, and clinical services.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Clinic Branch</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading hospital facility list..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-black">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{c.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {c.address}
                      </p>
                    </div>
                  </div>
                  <Badge status="ACTIVE" />
                </div>

                <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-xs mb-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 col-span-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hours: {c.openingHours || '08:00 AM - 08:00 PM'}</span>
                  </div>
                </div>

                {c.servicesOffered && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <strong>Services:</strong> {c.servicesOffered}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Branch ID: #{c.id}</span>
                <span>Established: Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Clinic Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Veterinary Hospital Facility"
      >
        <form onSubmit={handleCreateClinic} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Hospital / Clinic Branch Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Apex Care Animal Specialty Hospital"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Physical Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 100 Health Boulevard, Metro City"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 012-3456"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@apexvet.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Operating Hours
            </label>
            <input
              type="text"
              value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              placeholder="08:00 AM - 08:00 PM"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Services Offered
            </label>
            <textarea
              rows="2"
              value={formData.servicesOffered}
              onChange={(e) => setFormData({ ...formData, servicesOffered: e.target.value })}
              placeholder="General Surgery, Emergency Care, Dental, Ultrasound, Vaccinations..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              Save Clinic Branch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

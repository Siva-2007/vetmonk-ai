import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Phone, Shield, Search, UserCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import api from '../services/api';

export const ClinicStaffPage = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VETERINARIAN',
    phone: '',
  });

  const fetchStaff = async () => {
    try {
      const res = await api.get('/users/staff');
      // Filter only clinical staff
      const staffOnly = res.data.filter(u => u.role === 'VETERINARIAN' || u.role === 'RECEPTIONIST' || u.role === 'CLINIC_ADMIN');
      setUsers(staffOnly);
    } catch (err) {
      error('Failed to load clinic staff directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleRegisterStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      success(`Registered staff member ${formData.name} (${formData.role})`);
      setIsAddOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'VETERINARIAN', phone: '' });
      fetchStaff();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to onboard staff member');
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-8 h-8 text-teal-700" />
            <span>Clinic Staff & Healthcare Personnel</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage authorized veterinarians, veterinary nurses, technicians, and front desk receptionists.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-xs transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard New Staff</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading clinic staff roster..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-sm uppercase">
                      {u.name ? u.name.substring(0, 2) : 'ST'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{u.name}</h3>
                      <p className="text-xs font-semibold text-teal-700 mt-0.5">{u.role}</p>
                    </div>
                  </div>
                  <Badge status="ACTIVE" />
                </div>

                <div className="py-3 border-y border-slate-100 text-xs space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.phone || 'No phone recorded'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>User ID: #{u.id}</span>
                <span>Language: {u.preferredLanguage || 'en'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onboard Staff Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Onboard New Clinic Staff Member"
      >
        <form onSubmit={handleRegisterStaff} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Maya Patel"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="maya@vetmonk.ai"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Staff Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              >
                <option value="VETERINARIAN">Veterinarian (DVM)</option>
                <option value="RECEPTIONIST">Front Desk Receptionist</option>
                <option value="CLINIC_ADMIN">Clinic Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>
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
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              Confirm Onboarding
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

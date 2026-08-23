import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, MapPin, Clock, DollarSign, Calendar, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import api from '../services/api';

export const ClinicVacanciesPage = () => {
  const { success, error } = useToast();
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    department: 'Clinical Medicine',
    location: 'Metro City, State',
    experienceRequired: '2-4 years clinical experience',
    employmentType: 'FULL_TIME',
    salaryRange: '$90,000 - $120,000 / year',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    requirements: '',
  });

  const fetchVacancies = async () => {
    try {
      const res = await api.get('/vacancies');
      setVacancies(res.data);
    } catch (err) {
      error('Failed to load clinic vacancies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const handleCreateVacancy = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vacancies', formData);
      success('Vacancy published to platform public careers directory!');
      setIsAddOpen(false);
      fetchVacancies();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to post vacancy');
    }
  };

  const handleDeleteVacancy = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/vacancies/${deletingId}`);
      success('Vacancy listing removed.');
      setDeletingId(null);
      fetchVacancies();
    } catch (err) {
      error('Failed to delete vacancy');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-8 h-8 text-teal-700" />
            <span>Clinic Career Vacancies</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Recruit veterinary surgeons, veterinary nurses, technicians, and front desk coordinators.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Opening</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading clinic vacancy postings..." />
      ) : vacancies.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Active Vacancies</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Post job openings to recruit veterinarians and staff to your clinic.
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm hover:bg-teal-800 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Post Opening</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vacancies.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      {v.department}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{v.title}</h3>
                  </div>
                  <Badge status={v.status} />
                </div>

                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {v.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {v.employmentType}</span>
                  {v.salaryRange && (
                    <span className="flex items-center gap-1 font-bold text-emerald-700">
                      <DollarSign className="w-3.5 h-3.5" /> {v.salaryRange}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">{v.description}</p>
                {v.requirements && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                    <strong>Requirements:</strong> {v.requirements}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Deadline: {v.deadline}
                </span>
                <button
                  onClick={() => setDeletingId(v.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vacancy Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Post Veterinary Career Opportunity"
      >
        <form onSubmit={handleCreateVacancy} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Position Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Associate Veterinarian (DVM)"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Small Animal Medicine, Surgery"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Metro City, State"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="LOCUM">Locum / Relief</option>
                <option value="INTERNSHIP">Internship / Residency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Salary Range
              </label>
              <input
                type="text"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                placeholder="e.g. $95,000 - $125,000 / yr"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Job Description
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of day-to-day clinical duties, equipment available, working environment..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Requirements & Qualifications
            </label>
            <textarea
              rows="2"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="DVM license, certifications, surgical experience..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
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
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              Publish Vacancy
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteVacancy}
        title="Delete Vacancy Listing"
        message="Are you sure you want to remove this job vacancy from public listings?"
        confirmText="Yes, Delete Listing"
        isDangerous={true}
      />
    </div>
  );
};

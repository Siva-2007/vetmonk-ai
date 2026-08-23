import React, { useState, useEffect } from 'react';
import { Pill, Search, Building2, Plus, FileText, Info } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const MedicinesPage = () => {
  const { isClinicAdmin, isSuperAdmin } = useAuth();
  const { success, error } = useToast();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brandName: '',
    category: 'Antibiotic',
    form: 'Tablet',
    description: '',
    manufacturer: '',
  });

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      setMedicines(res.data);
    } catch (err) {
      error('Failed to load medicine formulary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medicines', formData);
      success(`Added ${formData.name} to formulary.`);
      setIsAddOpen(false);
      setFormData({ name: '', brandName: '', category: 'Antibiotic', form: 'Tablet', description: '', manufacturer: '' });
      fetchMedicines();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add medicine');
    }
  };

  const filtered = medicines.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.brandName?.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Pill className="w-8 h-8 text-brand-600" />
            <span>Veterinary Drug Formulary</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standard clinical formulary of approved veterinary pharmaceuticals, dosages, and contraindications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search formulary..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            />
          </div>

          {(isClinicAdmin || isSuperAdmin) && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Drug</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading drug catalog..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Medications Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No formulary items matched your search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {m.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-tight">{m.name}</h3>
                    {m.brandName && (
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">Brand: {m.brandName}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {m.form}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">{m.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Mfg: {m.manufacturer || 'Approved Vet Pharma'}</span>
                <span>ID: #{m.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Drug Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Medication to Clinical Formulary"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Generic Drug Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Amoxicillin / Clavulanate"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="e.g. Clavamox"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Antibiotic, NSAID, Vaccine"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Form / Formulation
              </label>
              <input
                type="text"
                value={formData.form}
                onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                placeholder="e.g. Tablet, Injectable, Chewable"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Manufacturer
            </label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              placeholder="e.g. Zoetis, Boehringer Ingelheim, Merck"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Clinical Indications
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Clinical usage guidelines, common indications, contraindications..."
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
              Save to Formulary
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

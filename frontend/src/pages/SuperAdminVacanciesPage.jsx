import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  X,
  MapPin,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  RefreshCw
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../services/api';

export const SuperAdminVacanciesPage = () => {
  const { error, success } = useToast();

  const [vacancies, setVacancies] = useState([]);
  const [clinics, setClinics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    clinicId: '',
    title: '',
    department: 'Veterinary Care',
    location: '',
    experience: '',
    employmentType: 'FULL_TIME',
    salaryRange: '',
    deadline: '',
    description: '',
    requirements: '',
    status: 'OPEN'
  };

  const [form, setForm] = useState(emptyForm);

  // =========================================================
  // LOAD VACANCIES
  // =========================================================

  const fetchVacancies = async () => {
    try {
      const response = await api.get('/vacancies');

      setVacancies(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error('Failed to load vacancies:', err);
      error('Failed to load vacancies');
    }
  };

  // =========================================================
  // LOAD CLINICS
  // =========================================================

  const fetchClinics = async () => {
    try {
      const response = await api.get('/clinics');

      setClinics(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error('Failed to load clinics:', err);
      error('Failed to load clinics');
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  const loadData = async () => {
    setLoading(true);

    try {
      await Promise.all([
        fetchVacancies(),
        fetchClinics()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      clinicId:
        clinics.length > 0
          ? String(clinics[0].id)
          : ''
    });

    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (vacancy) => {
    setEditingId(vacancy.id);

    setForm({
      clinicId:
        vacancy.clinicId !== null &&
        vacancy.clinicId !== undefined
          ? String(vacancy.clinicId)
          : '',

      title: vacancy.title || '',

      department:
        vacancy.department || 'Veterinary Care',

      location:
        vacancy.location || '',

      experience:
        vacancy.experience || '',

      employmentType:
        vacancy.employmentType || 'FULL_TIME',

      salaryRange:
        vacancy.salaryRange || '',

      deadline:
        vacancy.deadline || '',

      description:
        vacancy.description || '',

      requirements:
        vacancy.requirements || '',

      status:
        vacancy.status || 'OPEN'
    });

    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -------------------------------------------------------
    // Basic frontend validation
    // -------------------------------------------------------

    if (!form.title.trim()) {
      error('Job title is required');
      return;
    }

    if (!form.location.trim()) {
      error('Location is required');
      return;
    }

    if (!form.deadline) {
      error('Deadline is required');
      return;
    }

    if (!form.description.trim()) {
      error('Description is required');
      return;
    }

    if (!form.clinicId) {
      error('Please select a clinic');
      return;
    }

    // -------------------------------------------------------
    // Request payload
    // Matches VacancyDto.VacancyRequest exactly
    // -------------------------------------------------------

    const payload = {
      clinicId: Number(form.clinicId),

      title: form.title.trim(),

      department:
        form.department.trim() || 'Veterinary Care',

      location:
        form.location.trim(),

      experience:
        form.experience.trim(),

      employmentType:
        form.employmentType,

      salaryRange:
        form.salaryRange.trim() || null,

      deadline:
        form.deadline,

      description:
        form.description.trim(),

      requirements:
        form.requirements.trim() || null,

      status:
        form.status
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(
          `/vacancies/${editingId}`,
          payload
        );

        success('Vacancy updated successfully');
      } else {
        await api.post(
          '/vacancies',
          payload
        );

        success('Vacancy created successfully');
      }

      closeModal();

      await fetchVacancies();

    } catch (err) {
      console.error(
        'Vacancy save error:',
        err?.response?.data || err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to save vacancy';

      error(message);

    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE VACANCY
  // =========================================================

  const handleDelete = async (vacancy) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${vacancy.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/vacancies/${vacancy.id}`
      );

      success('Vacancy deleted successfully');

      await fetchVacancies();

    } catch (err) {
      console.error(
        'Delete vacancy error:',
        err?.response?.data || err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to delete vacancy';

      error(message);
    }
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';

      case 'CLOSED':
        return 'bg-slate-100 text-slate-700 border-slate-200';

      case 'FILLED':
        return 'bg-blue-100 text-blue-700 border-blue-200';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading vacancy management..."
      />
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-2.5">

            <Briefcase className="w-8 h-8 text-brand-600" />

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Vacancy Management
            </h1>

          </div>

          <p className="text-sm text-slate-500 mt-1">
            Create and manage veterinary career opportunities.
          </p>

        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />

            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-sm"
          >
            <Plus className="w-5 h-5" />

            Create Vacancy
          </button>

        </div>

      </div>


      {/* =====================================================
          VACANCY COUNT
      ===================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4">

        <p className="text-xs text-slate-500 font-medium">
          Total vacancies
        </p>

        <p className="text-2xl font-extrabold text-slate-900">
          {vacancies.length}
        </p>

      </div>


      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {vacancies.length === 0 ? (

        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">

          <Briefcase className="w-14 h-14 text-slate-300 mx-auto mb-4" />

          <h2 className="text-lg font-bold text-slate-800">
            No vacancies available
          </h2>

          <p className="text-sm text-slate-500 mt-1 mb-6">
            Create your first veterinary job vacancy.
          </p>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold"
          >
            <Plus className="w-5 h-5" />

            Create Vacancy
          </button>

        </div>

      ) : (

        /* ===================================================
           VACANCY LIST
        =================================================== */

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {vacancies.map((vacancy) => (

            <div
              key={vacancy.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition"
            >

              {/* Header */}

              <div className="flex items-start justify-between gap-4">

                <div>

                  <span className="inline-flex px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 text-[10px] font-extrabold uppercase">
                    {vacancy.department || 'Veterinary Care'}
                  </span>

                  <h2 className="text-lg font-extrabold text-slate-900 mt-2">
                    {vacancy.title}
                  </h2>

                </div>

                <span
                  className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold ${getStatusClass(
                    vacancy.status
                  )}`}
                >
                  {vacancy.status}
                </span>

              </div>


              {/* Details */}

              <div className="mt-4 space-y-2.5 text-xs text-slate-600">

                <div className="flex items-center gap-2">

                  <Building2 className="w-4 h-4 text-slate-400" />

                  <span>
                    {vacancy.clinicName || 'Clinic'}
                  </span>

                </div>

                <div className="flex items-center gap-2">

                  <MapPin className="w-4 h-4 text-slate-400" />

                  <span>
                    {vacancy.location}
                  </span>

                </div>

                <div className="flex items-center gap-2">

                  <Clock className="w-4 h-4 text-slate-400" />

                  <span>
                    {vacancy.employmentType}
                  </span>

                </div>

                {vacancy.salaryRange && (

                  <div className="flex items-center gap-2 text-emerald-700 font-bold">

                    <DollarSign className="w-4 h-4" />

                    <span>
                      {vacancy.salaryRange}
                    </span>

                  </div>

                )}

                <div className="flex items-center gap-2">

                  <Calendar className="w-4 h-4 text-slate-400" />

                  <span>
                    Deadline: {vacancy.deadline}
                  </span>

                </div>

              </div>


              {/* Description */}

              <div className="mt-5">

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {vacancy.description}
                </p>

              </div>


              {/* Requirements */}

              {vacancy.requirements && (

                <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-3">

                  <p className="text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                    Requirements
                  </p>

                  <p className="text-xs text-slate-600">
                    {vacancy.requirements}
                  </p>

                </div>

              )}


              {/* Actions */}

              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end gap-2">

                <button
                  type="button"
                  onClick={() => openEditModal(vacancy)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  <Pencil className="w-3.5 h-3.5" />

                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(vacancy)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />

                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      )}


      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">

            {/* Modal Header */}

            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between z-10">

              <div>

                <h2 className="text-xl font-extrabold text-slate-900">

                  {editingId
                    ? 'Edit Vacancy'
                    : 'Create Vacancy'}

                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Enter the job opening details below.
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>

            </div>


            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* Clinic */}

              <div>

                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Clinic *
                </label>

                <select
                  name="clinicId"
                  value={form.clinicId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >

                  <option value="">
                    Select clinic
                  </option>

                  {clinics.map((clinic) => (

                    <option
                      key={clinic.id}
                      value={clinic.id}
                    >
                      {clinic.name}
                    </option>

                  ))}

                </select>

                {clinics.length === 0 && (

                  <p className="text-xs text-red-500 mt-1">
                    No clinics available. Create a clinic first.
                  </p>

                )}

              </div>


              {/* Title + Department */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Job Title *
                  </label>

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="Senior Associate Vet"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />

                </div>


                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Department
                  </label>

                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="Veterinary Care"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />

                </div>

              </div>


              {/* Location + Experience */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Location *
                  </label>

                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="Metro City, State"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />

                </div>


                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Experience
                  </label>

                  <input
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="2-5 years"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />

                </div>

              </div>


              {/* Employment + Salary */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Employment Type
                  </label>

                  <select
                    name="employmentType"
                    value={form.employmentType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >

                    <option value="FULL_TIME">
                      Full Time
                    </option>

                    <option value="PART_TIME">
                      Part Time
                    </option>

                    <option value="CONTRACT">
                      Contract
                    </option>

                    <option value="INTERNSHIP">
                      Internship
                    </option>

                  </select>

                </div>


                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Salary Range
                  </label>

                  <input
                    name="salaryRange"
                    value={form.salaryRange}
                    onChange={handleChange}
                    placeholder="$90,000 - $120,000 / year"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />

                </div>

              </div>


              {/* Deadline + Status */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Application Deadline *
                  </label>

                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />

                </div>


                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >

                    <option value="OPEN">
                      OPEN
                    </option>

                    <option value="CLOSED">
                      CLOSED
                    </option>

                    <option value="FILLED">
                      FILLED
                    </option>

                  </select>

                </div>

              </div>


              {/* Description */}

              <div>

                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Description *
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Describe the responsibilities and role..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                />

              </div>


              {/* Requirements */}

              <div>

                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Requirements
                </label>

                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  rows={4}
                  placeholder="B.V.Sc or DVM degree, veterinary registration, clinical experience..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                />

              </div>


              {/* Buttons */}

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || clinics.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold"
                >

                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />

                      {editingId
                        ? 'Update Vacancy'
                        : 'Create Vacancy'}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};
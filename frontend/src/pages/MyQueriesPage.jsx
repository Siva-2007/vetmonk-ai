import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Clock,
  CheckCircle2,
  Sparkles,
  User,
  Building2,
  MessageSquare,
  Send,
  X
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const MyQueriesPage = () => {
  const { success, error } = useToast();
  const { user } = useAuth();

  const [queries, setQueries] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Owner create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Staff response modal
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [responseSubmitting, setResponseSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    petId: '',
    subject: '',
    category: 'GENERAL_PET_CARE',
    description: '',
    priority: 'MEDIUM'
  });

  /*
   * Staff members can see all queries.
   * Pet owners can see only their own queries.
   */
  const isStaff = [
    'SUPER_ADMIN',
    'CLINIC_ADMIN',
    'VETERINARIAN',
    'RECEPTIONIST'
  ].includes(user?.role);

  // =========================================================
  // LOAD QUERIES
  // =========================================================

  const fetchQueries = async () => {
    try {
      setLoading(true);

      const queryRequest = isStaff
        ? api.get('/customer-queries')
        : api.get('/customer-queries/my');

      const requests = [queryRequest];

      // Pets are needed only for pet-owner query creation.
      if (!isStaff) {
        requests.push(api.get('/pets'));
      }

      const responses = await Promise.all(requests);

      const queryResponse = responses[0];

      if (isStaff) {
        // Backend returns Spring Page
        setQueries(queryResponse.data?.content || []);
      } else {
        // Backend returns normal List
        setQueries(
          Array.isArray(queryResponse.data)
            ? queryResponse.data
            : []
        );

        setPets(responses[1]?.data || []);
      }
    } catch (err) {
      console.error('Failed to load customer queries:', err);

      error(
        err.response?.data?.message ||
        'Failed to load support queries'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [isStaff]);

  // =========================================================
  // CREATE QUERY - PET OWNER
  // =========================================================

  const handleCreateQuery = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.description.trim()) {
      error('Please fill in subject and description');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        petId: formData.petId
          ? Number(formData.petId)
          : null
      };

      await api.post('/customer-queries', payload);

      success(
        'Query submitted! AI has classified your ticket for fast clinic dispatch.'
      );

      setIsCreateOpen(false);

      setFormData({
        petId: '',
        subject: '',
        category: 'GENERAL_PET_CARE',
        description: '',
        priority: 'MEDIUM'
      });

      await fetchQueries();
    } catch (err) {
      console.error('Failed to submit query:', err);

      error(
        err.response?.data?.message ||
        'Failed to submit query'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // OPEN STAFF RESPONSE MODAL
  // =========================================================

  const openResponseModal = (query) => {
    setSelectedQuery(query);

    // If a previous response exists, show it in the textarea.
    setResponseText(query.resolutionNotes || '');

    setIsResponseOpen(true);
  };

  // =========================================================
  // STAFF RESPONSE
  // =========================================================

  const handleStaffResponse = async (newStatus) => {
    if (!selectedQuery) {
      return;
    }

    if (!responseText.trim()) {
      error('Please enter a response before saving.');
      return;
    }

    setResponseSubmitting(true);

    try {
      const payload = {
        status: newStatus,
        priority: selectedQuery.priority || 'MEDIUM',
        resolutionNotes: responseText.trim(),

        // Assign the ticket to the currently logged-in staff member.
        // This uses the real authenticated user's ID.
        assignedToId: user?.id ? Number(user.id) : null
      };

      await api.patch(
        `/customer-queries/${selectedQuery.id}`,
        payload
      );

      if (newStatus === 'RESOLVED') {
        success('Query response saved and ticket resolved.');
      } else {
        success('Response saved. Ticket is now in progress.');
      }

      setIsResponseOpen(false);
      setSelectedQuery(null);
      setResponseText('');

      await fetchQueries();
    } catch (err) {
      console.error('Failed to update customer query:', err);

      error(
        err.response?.data?.message ||
        'Failed to update customer query'
      );
    } finally {
      setResponseSubmitting(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">

            <HelpCircle className="w-8 h-8 text-brand-600" />

            <span>
              Customer Support & Clinical Inquiries
            </span>

          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">

            {isStaff
              ? 'Review and respond to customer support and clinical inquiries submitted to the clinic.'
              : 'Submit questions to clinic staff with intelligent AI priority classification and resolution tracking.'
            }

          </p>
        </div>

        {/* Owner only */}
        {!isStaff && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Query Ticket</span>
          </button>
        )}

      </div>

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading ? (

        <LoadingSpinner message="Loading support threads..." />

      ) : queries.length === 0 ? (

        /* ===================================================
           EMPTY STATE
        ==================================================== */

        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">

          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />

          <h3 className="text-base font-bold text-slate-800">
            {isStaff
              ? 'No Support Queries Found'
              : 'No Support Queries Filed'
            }
          </h3>

          <p className="text-xs text-slate-500 mt-1 mb-6">
            {isStaff
              ? 'There are currently no customer support or clinical inquiries in the system.'
              : 'Have questions about billing, appointments, or non-emergency pet care? Submit a ticket to your clinic.'
            }
          </p>

          {!isStaff && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm hover:bg-brand-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Submit First Query</span>
            </button>
          )}

        </div>

      ) : (

        /* ===================================================
           QUERY LIST
        ==================================================== */

        <div className="space-y-4">

          {queries.map((q) => (

            <div
              key={q.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition"
            >

              {/* =================================================
                  QUERY HEADER
              ================================================== */}

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100 mb-4">

                <div>

                  <div className="flex flex-wrap items-center gap-2 mb-1">

                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {q.category}
                    </span>

                    <Badge status={q.status} />

                    <Badge status={q.priority} />

                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {q.subject}
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5">

                    Ticket #{q.id}

                    {' • '}

                    Submitted on{' '}

                    {q.createdAt
                      ? q.createdAt.split('T')[0]
                      : 'Today'
                    }

                    {q.petName && (
                      <>
                        {' • '}
                        Patient: {q.petName}
                      </>
                    )}

                  </p>

                </div>

                {/* AI classification */}

                {q.aiSuggestedCategory && (

                  <div className="flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200 self-start">

                    <Sparkles className="w-3.5 h-3.5" />

                    <span>
                      AI Triage: {q.aiSuggestedCategory}{' '}
                      ({q.aiSuggestedPriority})
                    </span>

                  </div>

                )}

              </div>

              {/* =================================================
                  STAFF INFORMATION
              ================================================== */}

              {isStaff && (

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">

                  {q.userName && (

                    <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-100 rounded-xl p-3">

                      <User className="w-4 h-4 text-slate-500" />

                      <div>

                        <p className="text-[10px] uppercase font-bold text-slate-500">
                          Submitted By
                        </p>

                        <p className="font-semibold text-slate-800">
                          {q.userName}
                        </p>

                        {q.userEmail && (
                          <p className="text-slate-500">
                            {q.userEmail}
                          </p>
                        )}

                      </div>

                    </div>

                  )}

                  {q.petName && (

                    <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-100 rounded-xl p-3">

                      <Building2 className="w-4 h-4 text-slate-500" />

                      <div>

                        <p className="text-[10px] uppercase font-bold text-slate-500">
                          Patient
                        </p>

                        <p className="font-semibold text-slate-800">
                          {q.petName}
                          {q.petSpecies && ` (${q.petSpecies})`}
                        </p>

                      </div>

                    </div>

                  )}

                </div>

              )}

              {/* =================================================
                  INQUIRY
              ================================================== */}

              <div className="space-y-3 text-xs">

                <div>

                  <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block mb-1">
                    {isStaff
                      ? 'Customer Inquiry:'
                      : 'Your Inquiry:'
                    }
                  </span>

                  <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed">
                    {q.description}
                  </p>

                </div>

                {/* =================================================
                    ASSIGNED STAFF
                ================================================== */}

                {isStaff && q.assignedToName && (

                  <div className="text-xs text-slate-600 bg-blue-50 border border-blue-100 rounded-xl p-3">

                    <span className="font-bold">
                      Assigned To:
                    </span>{' '}

                    {q.assignedToName}

                  </div>

                )}

                {/* =================================================
                    RESOLUTION
                ================================================== */}

                {q.resolutionNotes ? (

                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">

                    <div className="flex items-center gap-2 mb-1 font-bold text-emerald-900">

                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />

                      <span>
                        {isStaff
                          ? 'Resolution Notes:'
                          : `Clinic Staff Response (Assigned to: ${
                              q.assignedToName ||
                              'Clinic Coordinator'
                            }):`
                        }
                      </span>

                    </div>

                    <p className="leading-relaxed whitespace-pre-line text-xs font-medium">
                      {q.resolutionNotes}
                    </p>

                  </div>

                ) : (

                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">

                    <Clock className="w-4 h-4 shrink-0" />

                    <span>
                      {isStaff
                        ? 'This query is awaiting clinic staff action.'
                        : 'Our clinical desk is currently reviewing your query. Response will appear here.'
                      }
                    </span>

                  </div>

                )}

                {/* =================================================
                    STAFF ACTION BUTTON
                ================================================== */}

                {isStaff && (

                  <div className="flex justify-end pt-2">

                    <button
                      onClick={() => openResponseModal(q)}
                      className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
                    >

                      <MessageSquare className="w-4 h-4" />

                      {q.resolutionNotes
                        ? 'Update Response'
                        : 'Respond to Customer'
                      }

                    </button>

                  </div>

                )}

              </div>

            </div>

          ))}

        </div>

      )}

      {/* =========================================================
          CREATE QUERY MODAL - PET OWNER
      ========================================================== */}

      {!isStaff && (

        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Submit New Support Ticket / Medical Inquiry"
        >

          <form
            onSubmit={handleCreateQuery}
            className="space-y-4"
          >

            {/* Subject */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject *
              </label>

              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subject: e.target.value
                  })
                }
                placeholder="e.g. Question regarding post-vaccination diet or billing"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />

            </div>

            {/* Pet + Category */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Pet */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Relates to Pet (Optional)
                </label>

                <select
                  value={formData.petId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      petId: e.target.value
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                >

                  <option value="">
                    General Account / No specific pet
                  </option>

                  {pets.map((p) => (

                    <option
                      key={p.id}
                      value={p.id}
                    >
                      {p.name} ({p.species})
                    </option>

                  ))}

                </select>

              </div>

              {/* Category */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>

                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                >

                  <option value="GENERAL_PET_CARE">
                    General Pet Care
                  </option>

                  <option value="MEDICAL_INQUIRY">
                    Medical Inquiry
                  </option>

                  <option value="APPOINTMENT">
                    Appointment Rescheduling
                  </option>

                  <option value="BILLING">
                    Billing & Invoices
                  </option>

                  <option value="TECHNICAL">
                    Technical Platform Help
                  </option>

                </select>

              </div>

            </div>

            {/* Description */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Description *
              </label>

              <textarea
                rows="4"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value
                  })
                }
                placeholder="Describe your inquiry in detail. Our automated triage assistant will prioritize it appropriately."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />

            </div>

            {/* Buttons */}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">

              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
              >
                {submitting
                  ? 'Submitting...'
                  : 'Submit Ticket'
                }
              </button>

            </div>

          </form>

        </Modal>

      )}

      {/* =========================================================
          STAFF RESPONSE MODAL
      ========================================================== */}

      {isStaff && (

        <Modal
          isOpen={isResponseOpen}
          onClose={() => {
            if (!responseSubmitting) {
              setIsResponseOpen(false);
              setSelectedQuery(null);
              setResponseText('');
            }
          }}
          title="Respond to Customer Query"
        >

          {selectedQuery && (

            <div className="space-y-5">

              {/* Ticket information */}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">

                <div className="flex items-center justify-between gap-3">

                  <div>

                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      Ticket #{selectedQuery.id}
                    </p>

                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {selectedQuery.subject}
                    </h3>

                  </div>

                  <div className="flex gap-2">
                    <Badge status={selectedQuery.status} />
                    <Badge status={selectedQuery.priority} />
                  </div>

                </div>

                <div className="mt-3">

                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                    Customer Inquiry
                  </p>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-xl p-3">
                    {selectedQuery.description}
                  </p>

                </div>

              </div>

              {/* Response */}

              <div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Staff Response / Resolution Notes *
                </label>

                <textarea
                  rows="6"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter your response to the customer..."
                  disabled={responseSubmitting}
                  className="w-full px-3.5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none disabled:opacity-50"
                />

                <p className="text-[10px] text-slate-500 mt-1.5">
                  This response will be stored in the customer's support ticket.
                </p>

              </div>

              {/* Assigned staff */}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-900">

                <div className="flex items-center gap-2">

                  <User className="w-4 h-4" />

                  <span>
                    This ticket will be assigned to{' '}
                    <strong>
                      {user?.name || 'current staff member'}
                    </strong>.
                  </span>

                </div>

              </div>

              {/* Buttons */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 pt-4 border-t border-slate-100">

                <button
                  type="button"
                  disabled={responseSubmitting}
                  onClick={() => {
                    setIsResponseOpen(false);
                    setSelectedQuery(null);
                    setResponseText('');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={responseSubmitting}
                  onClick={() =>
                    handleStaffResponse('IN_PROGRESS')
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />

                  {responseSubmitting
                    ? 'Saving...'
                    : 'Save Response'
                  }
                </button>

                <button
                  type="button"
                  disabled={responseSubmitting}
                  onClick={() =>
                    handleStaffResponse('RESOLVED')
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />

                  {responseSubmitting
                    ? 'Resolving...'
                    : 'Respond & Resolve'
                  }
                </button>

              </div>

            </div>

          )}

        </Modal>

      )}

    </div>
  );
};
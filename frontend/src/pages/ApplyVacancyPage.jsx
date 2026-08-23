import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Mail,
  Phone,
  User,
  FileText,
  Send,
  ShieldCheck
} from 'lucide-react';

import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const ApplyVacancyPage = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const { success, error } = useToast();

  const [vacancy, setVacancy] = useState(null);
  const [loadingVacancy, setLoadingVacancy] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: null
  });


  // =========================================================
  // LOAD VACANCY
  // =========================================================

  useEffect(() => {

    const loadVacancy = async () => {

      try {

        const response =
          await api.get(`/vacancies/${id}`);

        setVacancy(response.data);

      } catch (err) {

        console.error(
          'Failed to load vacancy:',
          err
        );

        error(
          err.response?.data?.message ||
          'Unable to load vacancy.'
        );

      } finally {

        setLoadingVacancy(false);

      }

    };

    loadVacancy();

  }, [id, error]);


  // =========================================================
  // INPUT HANDLER
  // =========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
      files
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: files
        ? files[0]
        : value
    }));

  };


  // =========================================================
  // SUBMIT APPLICATION
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    // -------------------------------------------------------
    // Basic validation
    // -------------------------------------------------------

    if (!form.fullName.trim()) {

      error('Please enter your full name.');

      return;

    }


    if (!form.email.trim()) {

      error('Please enter your email.');

      return;

    }


    if (!form.phone.trim()) {

      error('Please enter your phone number.');

      return;

    }


    if (!form.resume) {

      error('Please upload your resume.');

      return;

    }


    // -------------------------------------------------------
    // Resume validation
    // -------------------------------------------------------

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];


    if (!allowedTypes.includes(form.resume.type)) {

      error(
        'Only PDF, DOC and DOCX resumes are allowed.'
      );

      return;

    }


    // -------------------------------------------------------
    // 5 MB maximum
    // -------------------------------------------------------

    const maxSize =
      5 * 1024 * 1024;


    if (form.resume.size > maxSize) {

      error(
        'Resume must be smaller than 5 MB.'
      );

      return;

    }


    setSubmitting(true);


    try {

      const formData = new FormData();

      formData.append(
        'fullName',
        form.fullName.trim()
      );

      formData.append(
        'email',
        form.email.trim()
      );

      formData.append(
        'phone',
        form.phone.trim()
      );

      formData.append(
        'coverLetter',
        form.coverLetter.trim()
      );

      formData.append(
        'resume',
        form.resume
      );


      await api.post(
        `/vacancies/${id}/applications`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );


      success(
        'Application submitted successfully.'
      );


      navigate('/vacancies');

    } catch (err) {

      console.error(
        'Application submission failed:',
        err
      );


      error(
        err.response?.data?.message ||
        'Unable to submit your application.'
      );

    } finally {

      setSubmitting(false);

    }

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loadingVacancy) {

    return (
      <div className="min-h-[70vh] flex items-center justify-center">

        <p className="text-sm text-slate-500">
          Loading vacancy...
        </p>

      </div>
    );

  }


  // =========================================================
  // VACANCY NOT FOUND
  // =========================================================

  if (!vacancy) {

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">

        <Briefcase
          className="w-12 h-12 text-slate-300 mx-auto mb-4"
        />

        <h1 className="text-2xl font-bold text-slate-900">
          Vacancy not found
        </h1>


        <button
          type="button"
          onClick={() => navigate('/vacancies')}
          className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold"
        >

          <ArrowLeft className="w-4 h-4" />

          Back to Careers

        </button>

      </div>
    );

  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* =====================================================
          BACK
      ===================================================== */}

      <button
        type="button"
        onClick={() => navigate('/vacancies')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 mb-6"
      >

        <ArrowLeft className="w-4 h-4" />

        Back to Careers

      </button>


      {/* =====================================================
          JOB DETAILS
      ===================================================== */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">

        <div className="flex items-start gap-4">

          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">

            <Briefcase className="w-6 h-6" />

          </div>


          <div className="min-w-0">

            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">

              {vacancy.department || 'Veterinary Care'}

            </span>


            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">

              {vacancy.title}

            </h1>


            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">

              {vacancy.clinicName && (

                <span className="flex items-center gap-1.5">

                  <Building2 className="w-4 h-4" />

                  {vacancy.clinicName}

                </span>

              )}


              {vacancy.location && (

                <span>
                  📍 {vacancy.location}
                </span>

              )}


              {vacancy.employmentType && (

                <span>
                  💼 {vacancy.employmentType.replaceAll('_', ' ')}
                </span>

              )}

            </div>

          </div>

        </div>


        {/* DESCRIPTION */}

        {vacancy.description && (

          <div className="mt-6">

            <h2 className="font-bold text-slate-900 mb-2">
              Job Description
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {vacancy.description}
            </p>

          </div>

        )}


        {/* REQUIREMENTS */}

        {vacancy.requirements && (

          <div className="mt-6">

            <h2 className="font-bold text-slate-900 mb-2">
              Requirements
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {vacancy.requirements}
            </p>

          </div>

        )}

      </div>


      {/* =====================================================
          APPLICATION FORM
      ===================================================== */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">

        <div className="mb-6">

          <h2 className="text-xl font-extrabold text-slate-900">
            Apply for this position
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Submit your details and resume to apply.
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* FULL NAME */}

          <div>

            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">

              Full Name

            </label>


            <div className="relative">

              <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />

              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Enter your full name"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

            </div>

          </div>


          {/* EMAIL */}

          <div>

            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">

              Email Address

            </label>


            <div className="relative">

              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={150}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

            </div>

          </div>


          {/* PHONE */}

          <div>

            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">

              Phone Number

            </label>


            <div className="relative">

              <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                maxLength={20}
                placeholder="+91 XXXXX XXXXX"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

            </div>

          </div>


          {/* COVER LETTER */}

          <div>

            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">

              Cover Letter

            </label>


            <textarea
              name="coverLetter"
              value={form.coverLetter}
              onChange={handleChange}
              rows={5}
              maxLength={3000}
              placeholder="Tell us briefly why you are suitable for this position..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />

          </div>


          {/* RESUME */}

          <div>

            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">

              Resume

            </label>


            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 hover:border-brand-300 transition">

              <div className="flex items-center gap-3 mb-3">

                <FileText className="w-5 h-5 text-brand-600" />

                <div>

                  <p className="text-sm font-bold text-slate-800">
                    Upload Resume
                  </p>

                  <p className="text-xs text-slate-500">
                    PDF, DOC or DOCX — maximum 5 MB
                  </p>

                </div>

              </div>


              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
                required
                className="w-full text-sm"
              />

            </div>

          </div>


          {/* SECURITY NOTICE */}

          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">

            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />

            <p className="text-xs text-emerald-800 leading-relaxed">

              Your application will be securely submitted to the
              recruitment system for review by the relevant clinic.
              Your information will not be sent through your email
              application.

            </p>

          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {submitting ? (

              'Submitting Application...'

            ) : (

              <>
                Submit Application
                <Send className="w-4 h-4" />
              </>

            )}

          </button>

        </form>

      </div>

    </div>

  );
};
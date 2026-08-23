import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  Search
} from 'lucide-react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import api from '../services/api';

export const PublicVacanciesPage = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const res = await api.get('/vacancies');

        const data = Array.isArray(res.data)
          ? res.data
          : [];

        setVacancies(data);

      } catch (err) {
        console.error('Failed to load vacancies:', err);
        setVacancies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVacancies();
  }, []);


  // =========================================================
  // SEARCH
  // =========================================================

  const searchText = search.toLowerCase().trim();

  const filtered = vacancies.filter((v) =>
    v.title?.toLowerCase().includes(searchText) ||
    v.location?.toLowerCase().includes(searchText) ||
    v.department?.toLowerCase().includes(searchText) ||
    v.clinicName?.toLowerCase().includes(searchText)
  );


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDeadline = (deadline) => {
    if (!deadline) {
      return 'Not specified';
    }

    try {
      return new Date(deadline).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return deadline;
    }
  };


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="text-center max-w-3xl mx-auto mb-10">

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">

          <Briefcase className="w-3.5 h-3.5" />

          <span>
            Veterinary Career Opportunities
          </span>

        </div>


        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">

          Join Our Veterinary Healthcare Network

        </h1>


        <p className="text-slate-600 text-sm mt-2">

          Explore rewarding opportunities for veterinarians,
          licensed veterinary technicians, practice managers,
          and client care coordinators.

        </p>


        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="mt-6 max-w-md mx-auto relative">

          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by position, department, hospital, or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          />

        </div>

      </div>


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (

        <LoadingSpinner
          message="Loading career opportunities..."
        />

      ) : filtered.length === 0 ? (

        /* ===================================================
           NO VACANCIES
        =================================================== */

        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">

          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />

          <p className="text-base font-bold text-slate-700">

            {search
              ? 'No vacancies match your search'
              : 'No vacancies are currently available'}

          </p>

          <p className="text-xs text-slate-500 mt-1">

            {search
              ? 'Try a different position, hospital, department, or location.'
              : 'Please check back soon for new career opportunities.'}

          </p>

        </div>

      ) : (

        /* ===================================================
           VACANCIES
        =================================================== */

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {filtered.map((v) => (

            <div
              key={v.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >

              <div>

                {/* =========================================
                    TITLE + STATUS
                ========================================= */}

                <div className="flex items-start justify-between gap-3 mb-3">

                  <div>

                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">

                      {v.department || 'Veterinary Care'}

                    </span>


                    <h3 className="text-lg font-bold text-slate-900 mt-2">

                      {v.title}

                    </h3>

                  </div>


                  {v.status && (
                    <Badge status={v.status} />
                  )}

                </div>


                {/* =========================================
                    JOB DETAILS
                ========================================= */}

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 font-medium mb-4">

                  {v.clinicName && (

                    <span className="flex items-center gap-1">

                      <Building2 className="w-3.5 h-3.5 text-slate-400" />

                      {v.clinicName}

                    </span>

                  )}


                  {v.location && (

                    <span className="flex items-center gap-1">

                      <MapPin className="w-3.5 h-3.5 text-slate-400" />

                      {v.location}

                    </span>

                  )}


                  {v.employmentType && (

                    <span className="flex items-center gap-1">

                      <Clock className="w-3.5 h-3.5 text-slate-400" />

                      {v.employmentType.replaceAll('_', ' ')}

                    </span>

                  )}


                  {v.salaryRange && (

                    <span className="flex items-center gap-1 text-emerald-700 font-bold">

                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />

                      {v.salaryRange}

                    </span>

                  )}

                </div>


                {/* =========================================
                    DESCRIPTION
                ========================================= */}

                {v.description && (

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">

                    {v.description}

                  </p>

                )}


                {/* =========================================
                    REQUIREMENTS
                ========================================= */}

                {v.requirements && (

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4">

                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">

                      Key Requirements:

                    </p>


                    <p className="text-xs text-slate-600 leading-relaxed">

                      {v.requirements}

                    </p>

                  </div>

                )}

              </div>


              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">

                <span className="text-[11px] text-slate-500 flex items-center gap-1">

                  <Calendar className="w-3.5 h-3.5" />

                  Deadline: {formatDeadline(v.deadline)}

                </span>


                {/* =================================================
                    APPLY BUTTON
                ================================================= */}

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/vacancies/${v.id}/apply`)
                  }
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Apply Now
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Syringe, AlertTriangle, CheckCircle2, Calendar, Shield, Dog, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import api from '../services/api';

export const MyVaccinationsPage = () => {
  const { error } = useToast();
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [vaccinations, setVaccinations] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [petsRes, upcomingRes, overdueRes] = await Promise.all([
          api.get('/pets'),
          api.get('/vaccinations/upcoming'),
          api.get('/vaccinations/overdue')
        ]);

        setPets(petsRes.data);
        setUpcoming(upcomingRes.data);
        setOverdue(overdueRes.data);

        if (petsRes.data.length > 0) {
          setSelectedPetId(petsRes.data[0].id);
          const vacRes = await api.get(`/vaccinations/pet/${petsRes.data[0].id}`);
          setVaccinations(vacRes.data);
        }
      } catch (err) {
        error('Failed to load vaccination records');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePetChange = async (petId) => {
    setSelectedPetId(petId);
    setLoading(true);
    try {
      const res = await api.get(`/vaccinations/pet/${petId}`);
      setVaccinations(res.data);
    } catch (err) {
      error('Failed to load vaccinations for selected pet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Syringe className="w-8 h-8 text-brand-600" />
          <span>Vaccination Records & Immunization Reminders</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track verified core vaccinations, rabies immunization certificates, and upcoming booster schedules.
        </p>
      </div>

      {/* Overdue Alert Banner if any */}
      {overdue.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Vaccination Overdue Notice ({overdue.length})
            </h4>
            <p className="text-xs text-rose-700 mt-0.5">
              The following vaccinations are overdue: {overdue.map(o => `${o.petName} (${o.vaccineName} due ${o.nextDueDate})`).join(', ')}. Please schedule a booster appointment.
            </p>
          </div>
        </div>
      )}

      {/* Pet Selector Tabs */}
      {pets.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {pets.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePetChange(p.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
                selectedPetId === p.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Dog className="w-4 h-4" />
              <span>{p.name} ({p.species})</span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading immunization certificates..." />
      ) : vaccinations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Syringe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Vaccination History Logged</h3>
          <p className="text-xs text-slate-500 mt-1">
            Vaccination records are officially created by licensed veterinarians upon administration during clinic consultations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {vaccinations.map((v) => (
            <div
              key={v.id}
              className={`rounded-3xl border p-6 shadow-sm flex flex-col justify-between ${
                v.overdue
                  ? 'bg-rose-50/40 border-rose-200'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      v.overdue ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{v.vaccineName}</h3>
                      <p className="text-xs text-slate-500 font-medium">Batch: {v.batchNumber || 'Official Stock'}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    v.overdue
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {v.overdue ? 'OVERDUE' : 'PROTECTED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Administered:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {v.administeredDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Next Due Date:</span>
                    <span className={`font-bold flex items-center gap-1 mt-0.5 ${
                      v.overdue ? 'text-rose-700' : 'text-emerald-700'
                    }`}>
                      <Clock className="w-3.5 h-3.5" /> {v.nextDueDate}
                    </span>
                  </div>
                </div>

                {v.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl leading-relaxed">
                    <strong>Vet Notes:</strong> {v.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center justify-between">
                <span>Administered by: Dr. {v.veterinarianName || 'Clinic Staff'}</span>
                <span>ID: #{v.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { FileText, Stethoscope, Dog, Calendar, Pill, Search, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import api from '../services/api';

export const MyMedicalRecordsPage = () => {
  const { error } = useToast();
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('RECORDS'); // RECORDS or PRESCRIPTIONS

  useEffect(() => {
    const loadPetsAndRecords = async () => {
      try {
        const petsRes = await api.get('/pets');
        setPets(petsRes.data);

        if (petsRes.data.length > 0) {
          const firstPetId = petsRes.data[0].id;
          setSelectedPetId(firstPetId);

          const [recRes, rxRes] = await Promise.all([
            api.get(`/medical-records/pet/${firstPetId}`),
            api.get(`/prescriptions/pet/${firstPetId}`)
          ]);

          setRecords(recRes.data);
          setPrescriptions(rxRes.data);
        }
      } catch (err) {
        error('Failed to load medical history');
      } finally {
        setLoading(false);
      }
    };

    loadPetsAndRecords();
  }, []);

  const handlePetChange = async (petId) => {
    setSelectedPetId(petId);
    setLoading(true);
    try {
      const [recRes, rxRes] = await Promise.all([
        api.get(`/medical-records/pet/${petId}`),
        api.get(`/prescriptions/pet/${petId}`)
      ]);
      setRecords(recRes.data);
      setPrescriptions(rxRes.data);
    } catch (err) {
      error('Failed to load records for pet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <FileText className="w-8 h-8 text-brand-600" />
          <span>Electronic Medical Records & Prescriptions</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review verified clinical diagnosis history, veterinarian SOAP examination notes, and prescription instructions.
        </p>
      </div>

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

      {/* View Mode Toggle: Medical Records vs Prescriptions */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('RECORDS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'RECORDS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Clinical Records ({records.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('PRESCRIPTIONS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'PRESCRIPTIONS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Active Prescriptions ({prescriptions.length})</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading electronic patient records..." />
      ) : activeTab === 'RECORDS' ? (
        records.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Clinical Records Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Official medical records are created by attending veterinarians following a completed physical consultation.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {records.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {r.recordType}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1.5">{r.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Recorded on {r.createdAt ? r.createdAt.split('T')[0] : 'Today'} • Attending: Dr. {r.veterinarianName || 'Staff Vet'}
                    </p>
                  </div>
                  {r.diagnosis && (
                    <div className="sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Diagnosis:</span>
                      <span className="inline-block mt-0.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
                        {r.diagnosis}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider mb-1">
                      Veterinary Clinical Notes (SOAP Observations):
                    </h4>
                    <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line font-mono text-xs">
                      {r.clinicalNotes}
                    </p>
                  </div>

                  {r.treatmentSummary && (
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider mb-1">
                        Treatment & Follow-Up Recommendations:
                      </h4>
                      <p className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-900 leading-relaxed font-medium">
                        {r.treatmentSummary}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Veterinary Record
                  </span>
                  <span>Record ID: #{r.id}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Prescriptions Tab */
        prescriptions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Prescriptions Logged</h3>
            <p className="text-xs text-slate-500 mt-1">
              Active medical prescriptions will appear here once authorized by your veterinarian.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-tight">{rx.medicineName}</h3>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">Dosage: {rx.dosage}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                      Rx #{rx.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Frequency:</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{rx.frequency}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration:</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{rx.duration}</span>
                    </div>
                  </div>

                  {rx.instructions && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 text-xs">
                      <span className="font-bold text-slate-700 block mb-0.5">Administration Instructions:</span>
                      <p className="text-slate-600 leading-relaxed">{rx.instructions}</p>
                    </div>
                  )}

                  {rx.notes && (
                    <p className="text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-lg leading-relaxed">
                      <strong>Special Precaution:</strong> {rx.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center justify-between">
                  <span>Prescribed by: Dr. {rx.veterinarianName || 'Licensed Veterinarian'}</span>
                  <span>{rx.createdAt ? rx.createdAt.split('T')[0] : 'Active'}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Dog,
  Scale,
  Thermometer,
  Pill,
  Syringe,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../services/api';

export const VetConsultationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const appointmentId = searchParams.get('appointmentId');
  const petIdParam = searchParams.get('petId');

  const [pet, setPet] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [observations, setObservations] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  // Embedded Prescriptions
  const [prescriptions, setPrescriptions] = useState([]);
  const [newRx, setNewRx] = useState({
    medicineId: '',
    dosage: '1 tablet',
    frequency: 'Twice daily with meals',
    duration: '7 days',
    instructions: 'Administer with food. Complete the full course.',
  });

  // Embedded Vaccine Record
  const [addVaccine, setAddVaccine] = useState(false);
  const [vaccineData, setVaccineData] = useState({
    vaccineName: 'Rabies 1-Year Booster',
    batchNumber: 'BAT-2026-V01',
    nextDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Administered right hind limb subcutaneously.',
  });

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [medsRes] = await Promise.all([api.get('/medicines')]);
        setMedicines(medsRes.data);

        if (petIdParam) {
          const petRes = await api.get(`/pets/${petIdParam}`);
          setPet(petRes.data);
          if (petRes.data.weight) {
            setWeight(petRes.data.weight);
          }
        }
      } catch (err) {
        error('Failed to load consultation prerequisites');
      } finally {
        setLoading(false);
      }
    };

    loadPrerequisites();
  }, [petIdParam]);

  const handleAddPrescription = () => {
    if (!newRx.medicineId) {
      error('Please select a medicine from formulary');
      return;
    }
    const selectedMed = medicines.find(m => m.id === Number(newRx.medicineId));
    setPrescriptions([
      ...prescriptions,
      {
        ...newRx,
        medicineName: selectedMed?.name || 'Medication',
      }
    ]);
    setNewRx({
      medicineId: '',
      dosage: '1 tablet',
      frequency: 'Twice daily with meals',
      duration: '7 days',
      instructions: 'Administer with food. Complete the full course.',
    });
  };

  const handleRemovePrescription = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSubmitConsultation = async (e) => {
    e.preventDefault();
    if (!observations.trim() || !diagnosis.trim()) {
      error('Please provide clinical observations and diagnosis');
      return;
    }

    if (!appointmentId || !petIdParam) {
      error('Missing appointment or pet reference ID');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Consultation
      const consultPayload = {
        appointmentId: Number(appointmentId),
        petId: Number(petIdParam),
        observations,
        treatmentPlan,
        prescriptionSummary: prescriptions.map(p => `${p.medicineName} (${p.dosage}, ${p.frequency} x ${p.duration})`).join('; '),
        temperature: temperature ? parseFloat(temperature) : null,
        weight: weight ? parseFloat(weight) : null,
        nextFollowUpDate: nextFollowUpDate || null,
      };

      const consultRes = await api.post('/consultations', consultPayload);
      const consultationId = consultRes.data.id;

      // 2. Create Official Medical Record
      await api.post('/medical-records', {
        petId: Number(petIdParam),
        consultationId,
        title: `Clinical Examination: ${diagnosis}`,
        recordType: 'EXAMINATION',
        diagnosis,
        clinicalNotes: observations,
        treatmentSummary: treatmentPlan,
      });

      // 3. Create Prescriptions
      for (const rx of prescriptions) {
        await api.post('/prescriptions', {
          petId: Number(petIdParam),
          consultationId,
          medicineId: Number(rx.medicineId),
          medicineName: rx.medicineName,
          dosage: rx.dosage,
          frequency: rx.frequency,
          duration: rx.duration,
          instructions: rx.instructions,
        });
      }

      // 4. Create Vaccination Record if included
      if (addVaccine && vaccineData.vaccineName) {
        await api.post('/vaccinations', {
          petId: Number(petIdParam),
          vaccineName: vaccineData.vaccineName,
          batchNumber: vaccineData.batchNumber,
          administeredDate: new Date().toISOString().split('T')[0],
          nextDueDate: vaccineData.nextDueDate,
          notes: vaccineData.notes,
        });
      }

      success('Consultation concluded, medical record archived, and prescription issued!');
      navigate('/vet/queue');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to complete consultation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Opening clinical examination suite..." />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Stethoscope className="w-8 h-8 text-sky-700" />
            <span>Clinical Examination & Consultation Suite</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Author SOAP notes, record vital signs, prescribe medications from pharmacy formulary, and log vaccines.
          </p>
        </div>
      </div>

      {/* Patient Background Card */}
      {pet && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-2xl">
              {pet.species?.toLowerCase() === 'cat' ? '🐱' : pet.species?.toLowerCase() === 'dog' ? '🐶' : '🐾'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{pet.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {pet.species} • {pet.breed || 'Mixed'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Gender: {pet.gender} • DOB: {pet.dateOfBirth || 'N/A'} • Owner: {pet.ownerName}
              </p>
            </div>
          </div>

          <div className="text-xs bg-slate-800/80 p-3 rounded-2xl border border-slate-700 max-w-sm">
            <p className="font-bold text-rose-400 uppercase text-[10px] tracking-wider">Allergy Alert:</p>
            <p className="text-slate-300 leading-tight mt-0.5">{pet.allergies || 'None reported'}</p>
          </div>
        </div>
      )}

      {/* Consultation Form */}
      <form onSubmit={handleSubmitConsultation} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-700" />
            <span>Vitals & Clinical Examination (SOAP)</span>
          </h3>

          {/* Vitals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-sky-700" />
                <span>Patient Weight (kg)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 28.5"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-sky-700" />
                <span>Body Temperature (°C)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="e.g. 38.5"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subjective & Objective Clinical Observations *
            </label>
            <textarea
              rows="4"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="e.g. Patient presents with localized tenderness over right carpal joint. Lung sounds clear, mucosal membranes pink. Gait evaluation shows grade 2 lameness."
              required
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          {/* Primary Diagnosis & Treatment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Clinical Diagnosis *
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Right Carpal Joint Sprain / Soft Tissue Strain"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Next Follow-Up Date (Optional)
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Treatment Plan & Home Care Instructions
            </label>
            <textarea
              rows="3"
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="e.g. 5 days restricted exercise. Avoid stairs or vigorous fetch. Administer NSAID with food. Return if swelling worsens."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Prescription Authoring Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-sky-700" />
              <span>Electronic Prescriptions ({prescriptions.length})</span>
            </h3>
          </div>

          {/* List of currently attached prescriptions */}
          {prescriptions.length > 0 && (
            <div className="space-y-3">
              {prescriptions.map((rx, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-sky-950 text-sm">{rx.medicineName}</h4>
                    <p className="text-sky-800 mt-0.5">
                      {rx.dosage} • {rx.frequency} • Duration: {rx.duration}
                    </p>
                    <p className="text-sky-700 italic mt-0.5">{rx.instructions}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePrescription(idx)}
                    className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Rx Input Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Add Medication from Formulary:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={newRx.medicineId}
                  onChange={(e) => setNewRx({ ...newRx, medicineId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Choose Medicine --</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.brandName || m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  value={newRx.dosage}
                  onChange={(e) => setNewRx({ ...newRx, dosage: e.target.value })}
                  placeholder="Dosage (e.g. 75mg chewable)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={newRx.frequency}
                  onChange={(e) => setNewRx({ ...newRx, frequency: e.target.value })}
                  placeholder="Frequency (e.g. Once daily in morning)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={newRx.duration}
                  onChange={(e) => setNewRx({ ...newRx, duration: e.target.value })}
                  placeholder="Duration (e.g. 5 days)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <input
                type="text"
                value={newRx.instructions}
                onChange={(e) => setNewRx({ ...newRx, instructions: e.target.value })}
                placeholder="Client administration instructions"
                className="flex-1 mr-3 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={handleAddPrescription}
                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rx</span>
              </button>
            </div>
          </div>
        </div>

        {/* Optional Vaccination Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900 cursor-pointer">
              <input
                type="checkbox"
                checked={addVaccine}
                onChange={(e) => setAddVaccine(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
              <Syringe className="w-4 h-4 text-amber-600" />
              <span>Administered Vaccination during this Visit?</span>
            </label>
          </div>

          {addVaccine && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vaccine Name
                </label>
                <input
                  type="text"
                  value={vaccineData.vaccineName}
                  onChange={(e) => setVaccineData({ ...vaccineData, vaccineName: e.target.value })}
                  placeholder="e.g. Rabies 3-Year Vaccine"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={vaccineData.batchNumber}
                  onChange={(e) => setVaccineData({ ...vaccineData, batchNumber: e.target.value })}
                  placeholder="e.g. RAB-2026-99"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Next Booster Due Date
                </label>
                <input
                  type="date"
                  value={vaccineData.nextDueDate}
                  onChange={(e) => setVaccineData({ ...vaccineData, nextDueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/vet/queue')}
            className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel & Return
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl text-sm shadow-md shadow-emerald-500/25 transition duration-200 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{submitting ? 'Archiving Consultation...' : 'Complete & Sign Consultation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

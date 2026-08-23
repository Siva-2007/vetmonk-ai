import React, { useState, useEffect } from 'react';
import { Dog, Plus, Edit2, Trash2, Shield, Calendar, Scale, AlertCircle, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import api from '../services/api';

export const MyPetsPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [deletingPetId, setDeletingPetId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    dateOfBirth: '',
    gender: 'Male',
    weight: '',
    allergies: '',
    existingConditions: '',
  });

  const fetchPets = async () => {
    try {
      const res = await api.get('/pets');
      setPets(res.data);
    } catch (err) {
      error('Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleOpenAdd = () => {
    setEditingPet(null);
    setFormData({
      name: '',
      species: 'Dog',
      breed: '',
      dateOfBirth: '',
      gender: 'Male',
      weight: '',
      allergies: '',
      existingConditions: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name || '',
      species: pet.species || 'Dog',
      breed: pet.breed || '',
      dateOfBirth: pet.dateOfBirth || '',
      gender: pet.gender || 'Male',
      weight: pet.weight || '',
      allergies: pet.allergies || '',
      existingConditions: pet.existingConditions || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSavePet = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };

      if (editingPet) {
        await api.put(`/pets/${editingPet.id}`, payload);
        success(`Pet profile for ${formData.name} updated!`);
      } else {
        await api.post('/pets', payload);
        success(`Registered ${formData.name} successfully!`);
      }

      setIsAddModalOpen(false);
      fetchPets();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save pet details');
    }
  };

  const handleDeletePet = async () => {
    if (!deletingPetId) return;
    try {
      await api.delete(`/pets/${deletingPetId}`);
      success('Pet profile removed.');
      setDeletingPetId(null);
      fetchPets();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete pet');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Dog className="w-8 h-8 text-brand-600" />
            <span>My Pets</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain your pets' medical identification, allergies, weights, and health background.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Pet</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your pets..." />
      ) : pets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <Dog className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Pets Registered Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm mx-auto">
            Register your dog, cat, or other companion animal to enable appointments, medical history tracking, and AI guidance.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Pet</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-black text-xl border border-brand-200/60">
                      {p.species?.toLowerCase() === 'cat' ? '🐱' : p.species?.toLowerCase() === 'dog' ? '🐶' : '🐾'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-none">{p.name}</h3>
                      <p className="text-xs font-semibold text-brand-600 mt-1">
                        {p.species} • {p.breed || 'Breed Unspecified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Edit Pet"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingPetId(p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Pet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-100 mb-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Scale className="w-3.5 h-3.5 text-slate-400" />
                    <span>Weight: <strong>{p.weight ? `${p.weight} kg` : 'N/A'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Heart className="w-3.5 h-3.5 text-slate-400" />
                    <span>Gender: <strong>{p.gender || 'Unknown'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 col-span-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>DOB: <strong>{p.dateOfBirth || 'Not specified'}</strong></span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block mb-0.5">
                      Allergies & Sensitivities:
                    </span>
                    <p className={`p-2 rounded-lg text-xs leading-relaxed ${
                      p.allergies && p.allergies.toLowerCase() !== 'none'
                        ? 'bg-rose-50 text-rose-800 border border-rose-100 font-medium'
                        : 'bg-slate-50 text-slate-600'
                    }`}>
                      {p.allergies || 'None reported'}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block mb-0.5">
                      Existing Medical Conditions:
                    </span>
                    <p className="bg-slate-50 p-2 rounded-lg text-slate-600 leading-relaxed text-xs">
                      {p.existingConditions || 'None reported'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>ID: #{p.id}</span>
                <span className="text-[11px] text-slate-400">Added: {p.createdAt ? p.createdAt.split('T')[0] : 'Today'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Pet Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingPet ? `Edit Pet: ${editingPet.name}` : 'Register New Pet Profile'}
      >
        <form onSubmit={handleSavePet} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pet Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Max"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Species *
              </label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="Dog">Dog (Canine)</option>
                <option value="Cat">Cat (Feline)</option>
                <option value="Bird">Bird (Avian)</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Other">Other Species</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Breed
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="e.g. Golden Retriever"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Neutered Male">Neutered Male</option>
                <option value="Spayed Female">Spayed Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g. 25.5"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Allergies & Dietary Sensitivities
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="e.g. Chicken protein, Penicillin, Flea allergy dermatitis"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Existing Conditions / Chronic Notes
            </label>
            <textarea
              rows="2"
              value={formData.existingConditions}
              onChange={(e) => setFormData({ ...formData, existingConditions: e.target.value })}
              placeholder="e.g. Mild hip dysplasia, indoor-only, sensitive digestion"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              {editingPet ? 'Update Pet' : 'Register Pet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingPetId}
        onClose={() => setDeletingPetId(null)}
        onConfirm={handleDeletePet}
        title="Delete Pet Profile"
        message="Are you sure you want to remove this pet profile? All associated records will remain archived."
        confirmText="Yes, Delete Profile"
        isDangerous={true}
      />
    </div>
  );
};

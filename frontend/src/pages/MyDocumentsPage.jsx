import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Upload,
  FileText,
  Eye,
  Download,
  Sparkles,
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import api from '../services/api';

export const MyDocumentsPage = () => {
  const { success, error } = useToast();

  const [pets, setPets] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    documentType: 'LAB_REPORT',
    petId: '',
    file: null,
  });

  // ---------------------------------------------------------
  // LOAD PETS + DOCUMENTS
  // ---------------------------------------------------------
  const fetchDocs = async () => {
    try {
      const [docRes, petRes] = await Promise.all([
        api.get('/documents/my'),
        api.get('/pets'),
      ]);

      const loadedDocuments = Array.isArray(docRes.data)
        ? docRes.data
        : [];

      const loadedPets = Array.isArray(petRes.data)
        ? petRes.data
        : [];

      setDocuments(loadedDocuments);
      setPets(loadedPets);

      // Select first real pet from backend if no pet selected
      setFormData((prev) => {
        if (!prev.petId && loadedPets.length > 0) {
          return {
            ...prev,
            petId: loadedPets[0].id,
          };
        }

        return prev;
      });
    } catch (err) {
      console.error('Failed to load documents:', err);

      error(
        err.response?.data?.message ||
        'Failed to load documents'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // ---------------------------------------------------------
  // FILE SELECTION
  // ---------------------------------------------------------
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.type)) {
      error('Only PDF, JPG, JPEG, and PNG files are allowed.');
      e.target.value = '';
      return;
    }

    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  // ---------------------------------------------------------
  // UPLOAD + OCR
  // ---------------------------------------------------------
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!formData.petId) {
      error('Please select a pet.');
      return;
    }

    if (!formData.file) {
      error('Please select a PDF or image file.');
      return;
    }

    setUploading(true);

    try {
      const data = new FormData();

      data.append('file', formData.file);
      data.append(
        'title',
        formData.title.trim() || formData.file.name
      );
      data.append(
        'documentType',
        formData.documentType
      );
      data.append(
        'petId',
        String(formData.petId)
      );

      /*
       * IMPORTANT:
       * Do NOT manually set Content-Type here.
       *
       * Axios/browser will automatically create:
       * multipart/form-data; boundary=...
       *
       * This is required for multipart file uploads.
       */
      const res = await api.post(
        '/documents/upload',
        data
      );

      console.log('Upload response:', res.data);

      success(
        'Document uploaded and OCR text extracted successfully!'
      );

      // Close modal
      setIsUploadOpen(false);

      // Reset form using real pet data
      setFormData({
        title: '',
        documentType: 'LAB_REPORT',
        petId: pets.length > 0 ? pets[0].id : '',
        file: null,
      });

      // Reload documents from backend
      await fetchDocs();

    } catch (err) {
      console.error('Document upload failed:', err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to upload document';

      error(message);

    } finally {
      setUploading(false);
    }
  };

  // ---------------------------------------------------------
  // DOWNLOAD DOCUMENT
  // ---------------------------------------------------------
  const handleDownload = async (docId, fileName) => {
    try {
      const res = await api.get(
        `/documents/${docId}/download`,
        {
          responseType: 'blob',
        }
      );

      const blob = new Blob(
        [res.data],
        {
          type:
            res.headers['content-type'] ||
            'application/octet-stream',
        }
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = url;
      link.download = fileName || 'document';

      document.body.appendChild(link);
      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Download failed:', err);

      error(
        err.response?.data?.message ||
        'Failed to download document'
      );
    }
  };

  // ---------------------------------------------------------
  // OPEN UPLOAD MODAL
  // ---------------------------------------------------------
  const openUploadModal = () => {
    setFormData((prev) => ({
      ...prev,
      petId:
        prev.petId ||
        (pets.length > 0 ? pets[0].id : ''),
    }));

    setIsUploadOpen(true);
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderOpen className="w-8 h-8 text-brand-600" />

            <span>
              Pet Documents & OCR Text Extraction
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload diagnostic bloodwork, radiographs,
            discharge summaries, or external lab PDFs
            with automated OCR parsing.
          </p>
        </div>

        <button
          onClick={openUploadModal}
          disabled={pets.length === 0}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />

          <span>
            Upload Document
          </span>
        </button>

      </div>

      {/* LOADING */}
      {loading && (
        <LoadingSpinner
          message="Loading your diagnostic records..."
        />
      )}

      {/* NO DOCUMENTS */}
      {!loading && documents.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">

          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />

          <h3 className="text-base font-bold text-slate-800">
            No Documents Uploaded
          </h3>

          <p className="text-xs text-slate-500 mt-1 mb-6">
            Upload diagnostic lab reports,
            vaccination certificates, or clinical
            notes in PDF, JPG, or PNG format.
          </p>

          <button
            onClick={openUploadModal}
            disabled={pets.length === 0}
            className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />

            <span>
              Upload First File
            </span>
          </button>

        </div>
      )}

      {/* DOCUMENT LIST */}
      {!loading && documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {documents.map((d) => (

            <div
              key={d.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >

              <div>

                {/* DOCUMENT HEADER */}
                <div className="flex items-start justify-between gap-3 mb-3">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div>

                      <h3 className="text-base font-bold text-slate-900 leading-tight truncate max-w-[160px]">
                        {d.title}
                      </h3>

                      <p className="text-[11px] font-semibold text-brand-700 mt-0.5">
                        {d.documentType}
                      </p>

                    </div>

                  </div>

                  {d.extractedText && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">

                      <Sparkles className="w-3 h-3 text-emerald-600" />

                      OCR Ready

                    </span>
                  )}

                </div>

                {/* DOCUMENT DETAILS */}
                <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs mb-3">

                  <div className="flex items-center justify-between text-slate-600">

                    <span className="text-slate-400">
                      Pet:
                    </span>

                    <span className="font-semibold text-slate-900">
                      {d.petName}
                    </span>

                  </div>

                  <div className="flex items-center justify-between text-slate-600">

                    <span className="text-slate-400">
                      Uploaded:
                    </span>

                    <span>
                      {d.createdAt
                        ? d.createdAt.split('T')[0]
                        : 'Today'}
                    </span>

                  </div>

                  <div className="flex items-center justify-between text-slate-600">

                    <span className="text-slate-400">
                      File Type:
                    </span>

                    <span className="font-mono text-[11px]">
                      {d.contentType}
                    </span>

                  </div>

                </div>

                {/* AI SUMMARY */}
                {d.aiSummary ? (

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl line-clamp-3 leading-relaxed">

                    <strong>
                      AI Summary:
                    </strong>{' '}

                    {d.aiSummary}

                  </p>

                ) : (

                  <p className="text-xs text-slate-400 italic">
                    No summary available.
                  </p>

                )}

              </div>

              {/* ACTIONS */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">

                <button
                  onClick={() => setSelectedDoc(d)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
                >

                  <Eye className="w-3.5 h-3.5" />

                  <span>
                    View OCR
                  </span>

                </button>

                <button
                  onClick={() =>
                    handleDownload(
                      d.id,
                      d.fileName
                    )
                  }
                  className="flex items-center gap-1 text-xs font-bold text-brand-700 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition"
                >

                  <Download className="w-3.5 h-3.5" />

                  <span>
                    Download
                  </span>

                </button>

              </div>

            </div>

          ))}

        </div>
      )}

      {/* =====================================================
          UPLOAD MODAL
         ===================================================== */}

      <Modal
        isOpen={isUploadOpen}
        onClose={() => {
          if (!uploading) {
            setIsUploadOpen(false);
          }
        }}
        title="Upload Diagnostic File & Process OCR"
      >

        <form
          onSubmit={handleUpload}
          className="space-y-4"
        >

          {/* PET */}
          <div>

            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Pet *
            </label>

            <select
              value={formData.petId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  petId: e.target.value,
                }))
              }
              required
              disabled={uploading}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white disabled:opacity-60"
            >

              <option value="">
                -- Select Pet --
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

          {/* TITLE + TYPE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* TITLE */}
            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Document Title
              </label>

              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                disabled={uploading}
                placeholder="e.g. Complete Blood Count (CBC) Panel"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white disabled:opacity-60"
              />

            </div>

            {/* DOCUMENT TYPE */}
            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Document Type
              </label>

              <select
                value={formData.documentType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    documentType: e.target.value,
                  }))
                }
                disabled={uploading}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white disabled:opacity-60"
              >

                <option value="LAB_REPORT">
                  Lab Bloodwork / Pathology
                </option>

                <option value="RADIOLOGY">
                  Radiology / Ultrasound / X-Ray
                </option>

                <option value="VACCINATION_CERTIFICATE">
                  Vaccination Certificate
                </option>

                <option value="PRESCRIPTION">
                  External Prescription
                </option>

                <option value="DISCHARGE_SUMMARY">
                  Hospital Discharge Summary
                </option>

              </select>

            </div>

          </div>

          {/* FILE */}
          <div>

            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select File (PDF, JPG, PNG) *
            </label>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={handleFileChange}
              required
              disabled={uploading}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-100 file:text-brand-800 hover:file:bg-brand-200 disabled:opacity-60"
            />

            {formData.file && (
              <p className="text-[11px] text-slate-500 mt-1">
                Selected:{' '}
                <span className="font-semibold">
                  {formData.file.name}
                </span>
              </p>
            )}

          </div>

          {/* BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">

            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              disabled={uploading}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                uploading ||
                !formData.file ||
                !formData.petId
              }
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >

              {uploading ? (

                <>
                  <Sparkles className="w-4 h-4 animate-spin" />

                  <span>
                    Extracting OCR...
                  </span>
                </>

              ) : (

                <>
                  <Upload className="w-4 h-4" />

                  <span>
                    Upload & Process
                  </span>
                </>

              )}

            </button>

          </div>

        </form>

      </Modal>

      {/* =====================================================
          OCR VIEWER MODAL
         ===================================================== */}

      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={`Extracted OCR Content: ${
          selectedDoc?.title || 'Document'
        }`}
        maxWidth="max-w-2xl"
      >

        {selectedDoc && (

          <div className="space-y-4 text-xs">

            {/* DOCUMENT INFO */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">

              <span className="font-semibold text-slate-600">
                Patient: {selectedDoc.petName}
              </span>

              <button
                onClick={() =>
                  handleDownload(
                    selectedDoc.id,
                    selectedDoc.fileName
                  )
                }
                className="flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
              >

                <Download className="w-3.5 h-3.5" />

                <span>
                  Download Original (
                  {selectedDoc.fileName}
                  )
                </span>

              </button>

            </div>

            {/* AI SUMMARY */}
            {selectedDoc.aiSummary && (

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">

                <p className="font-bold text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">

                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />

                  <span>
                    AI Clinical Summary:
                  </span>

                </p>

                <p className="leading-relaxed font-medium">
                  {selectedDoc.aiSummary}
                </p>

              </div>

            )}

            {/* OCR TEXT */}
            <div>

              <p className="font-bold text-slate-800 uppercase text-[11px] tracking-wider mb-1.5">
                Full Extracted OCR Text:
              </p>

              <div className="p-4 bg-slate-900 text-emerald-400 font-mono rounded-2xl max-h-72 overflow-y-auto whitespace-pre-line leading-relaxed text-xs">
                {selectedDoc.extractedText ||
                  'No text extracted from this file.'}
              </div>

            </div>

          </div>

        )}

      </Modal>

    </div>
  );
};
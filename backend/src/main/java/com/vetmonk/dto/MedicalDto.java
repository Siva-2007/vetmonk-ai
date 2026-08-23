package com.vetmonk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class MedicalDto {

    // --- Consultation ---
    public static class ConsultationRequest {
        @NotNull(message = "Appointment ID is required")
        private Long appointmentId;

        @NotBlank(message = "Observations are required")
        private String observations;

        private String notes;

        @NotBlank(message = "Treatment plan is required")
        private String treatmentPlan;

        private Double temperature;
        private Double weight;
        private LocalDate followUpDate;

        // Optional embedded items created directly within consultation
        private List<PrescriptionItemRequest> prescriptions;
        private List<VaccinationItemRequest> vaccinations;
        private MedicalRecordItemRequest medicalRecord;

        public Long getAppointmentId() { return appointmentId; }
        public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
        public String getObservations() { return observations; }
        public void setObservations(String observations) { this.observations = observations; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getTreatmentPlan() { return treatmentPlan; }
        public void setTreatmentPlan(String treatmentPlan) { this.treatmentPlan = treatmentPlan; }
        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }
        public Double getWeight() { return weight; }
        public void setWeight(Double weight) { this.weight = weight; }
        public LocalDate getFollowUpDate() { return followUpDate; }
        public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }
        public List<PrescriptionItemRequest> getPrescriptions() { return prescriptions; }
        public void setPrescriptions(List<PrescriptionItemRequest> prescriptions) { this.prescriptions = prescriptions; }
        public List<VaccinationItemRequest> getVaccinations() { return vaccinations; }
        public void setVaccinations(List<VaccinationItemRequest> vaccinations) { this.vaccinations = vaccinations; }
        public MedicalRecordItemRequest getMedicalRecord() { return medicalRecord; }
        public void setMedicalRecord(MedicalRecordItemRequest medicalRecord) { this.medicalRecord = medicalRecord; }
    }

    public static class ConsultationResponse {
        private Long id;
        private Long appointmentId;
        private Long petId;
        private String petName;
        private Long veterinarianId;
        private String veterinarianName;
        private String observations;
        private String notes;
        private String treatmentPlan;
        private Double temperature;
        private Double weight;
        private LocalDate followUpDate;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getAppointmentId() { return appointmentId; }
        public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
        public Long getPetId() { return petId; }
        public void setPetId(Long petId) { this.petId = petId; }
        public String getPetName() { return petName; }
        public void setPetName(String petName) { this.petName = petName; }
        public Long getVeterinarianId() { return veterinarianId; }
        public void setVeterinarianId(Long veterinarianId) { this.veterinarianId = veterinarianId; }
        public String getVeterinarianName() { return veterinarianName; }
        public void setVeterinarianName(String veterinarianName) { this.veterinarianName = veterinarianName; }
        public String getObservations() { return observations; }
        public void setObservations(String observations) { this.observations = observations; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getTreatmentPlan() { return treatmentPlan; }
        public void setTreatmentPlan(String treatmentPlan) { this.treatmentPlan = treatmentPlan; }
        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }
        public Double getWeight() { return weight; }
        public void setWeight(Double weight) { this.weight = weight; }
        public LocalDate getFollowUpDate() { return followUpDate; }
        public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    // --- Medical Record ---
    public static class MedicalRecordItemRequest {
        private String title;
        private String recordType = "GENERAL_CONSULTATION";
        private String diagnosis;
        private String clinicalNotes;
        private String treatmentSummary;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getRecordType() { return recordType; }
        public void setRecordType(String recordType) { this.recordType = recordType; }
        public String getDiagnosis() { return diagnosis; }
        public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
        public String getClinicalNotes() { return clinicalNotes; }
        public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }
        public String getTreatmentSummary() { return treatmentSummary; }
        public void setTreatmentSummary(String treatmentSummary) { this.treatmentSummary = treatmentSummary; }
    }

    public static class MedicalRecordRequest {
        @NotNull(message = "Pet ID is required")
        private Long petId;

        private Long consultationId;

        @NotBlank(message = "Title is required")
        private String title;

        private String recordType = "GENERAL_CONSULTATION";
        private String diagnosis;

        @NotBlank(message = "Clinical notes are required")
        private String clinicalNotes;

        private String treatmentSummary;

        public Long getPetId() { return petId; }
        public void setPetId(Long petId) { this.petId = petId; }
        public Long getConsultationId() { return consultationId; }
        public void setConsultationId(Long consultationId) { this.consultationId = consultationId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getRecordType() { return recordType; }
        public void setRecordType(String recordType) { this.recordType = recordType; }
        public String getDiagnosis() { return diagnosis; }
        public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
        public String getClinicalNotes() { return clinicalNotes; }
        public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }
        public String getTreatmentSummary() { return treatmentSummary; }
        public void setTreatmentSummary(String treatmentSummary) { this.treatmentSummary = treatmentSummary; }
    }

    public static class MedicalRecordResponse {
        private Long id;
        private Long petId;
        private String petName;
        private String petSpecies;
        private Long veterinarianId;
        private String veterinarianName;
        private Long consultationId;
        private String title;
        private String recordType;
        private String diagnosis;
        private String clinicalNotes;
        private String treatmentSummary;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getPetId() { return petId; }
        public void setPetId(Long petId) { this.petId = petId; }
        public String getPetName() { return petName; }
        public void setPetName(String petName) { this.petName = petName; }
        public String getPetSpecies() { return petSpecies; }
        public void setPetSpecies(String petSpecies) { this.petSpecies = petSpecies; }
        public Long getVeterinarianId() { return veterinarianId; }
        public void setVeterinarianId(Long veterinarianId) { this.veterinarianId = veterinarianId; }
        public String getVeterinarianName() { return veterinarianName; }
        public void setVeterinarianName(String veterinarianName) { this.veterinarianName = veterinarianName; }
        public Long getConsultationId() { return consultationId; }
        public void setConsultationId(Long consultationId) { this.consultationId = consultationId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getRecordType() { return recordType; }
        public void setRecordType(String recordType) { this.recordType = recordType; }
        public String getDiagnosis() { return diagnosis; }
        public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
        public String getClinicalNotes() { return clinicalNotes; }
        public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }
        public String getTreatmentSummary() { return treatmentSummary; }
        public void setTreatmentSummary(String treatmentSummary) { this.treatmentSummary = treatmentSummary; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    // --- Prescription ---
    public static class PrescriptionItemRequest {
        private Long medicineId;
        private String medicineName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
        private String notes;

        public Long getMedicineId() { return medicineId; }
        public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }
        public String getMedicineName() { return medicineName; }
        public void setMedicineName(String medicineName) { this.medicineName = medicineName; }
        public String getDosage() { return dosage; }
        public void setDosage(String dosage) { this.dosage = dosage; }
        public String getFrequency() { return frequency; }
        public void setFrequency(String frequency) { this.frequency = frequency; }
        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }
        public String getInstructions() { return instructions; }
        public void setInstructions(String instructions) { this.instructions = instructions; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class PrescriptionRequest {
        @NotNull(message = "Pet ID is required")
        private Long petId;

        private Long consultationId;
        private Long medicineId;

        @NotBlank(message = "Medicine name is required")
        private String medicineName;

        @NotBlank(message = "Dosage is required")
        private String dosage;

        @NotBlank(message = "Frequency is required")
        private String frequency;

        @NotBlank(message = "Duration is required")
        private String duration;

        private String instructions;
        private String notes;

        public Long getPetId() { return petId; }
        public void setPetId(Long petId) { this.petId = petId; }
        public Long getConsultationId() { return consultationId; }
        public void setConsultationId(Long consultationId) { this.consultationId = consultationId; }
        public Long getMedicineId() { return medicineId; }
        public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }
        public String getMedicineName() { return medicineName; }
        public void setMedicineName(String medicineName) { this.medicineName = medicineName; }
        public String getDosage() { return dosage; }
        public void setDosage(String dosage) { this.dosage = dosage; }
        public String getFrequency() { return frequency; }
        public void setFrequency(String frequency) { this.frequency = frequency; }
        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }
        public String getInstructions() { return instructions; }
        public void setInstructions(String instructions) { this.instructions = instructions; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class PrescriptionResponse {
        private Long id;
        private Long petId;
        private String petName;
        private Long veterinarianId;
        private String veterinarianName;
        private Long consultationId;
        private Long medicineId;
        private String medicineName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
        private String notes;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getPetId() { return petId; }
        public void setPetId(Long petId) { this.petId = petId; }
        public String getPetName() { return petName; }
        public void setPetName(String petName) { this.petName = petName; }
        public Long getVeterinarianId() { return veterinarianId; }
        public void setVeterinarianId(Long veterinarianId) { this.veterinarianId = veterinarianId; }
        public String getVeterinarianName() { return veterinarianName; }
        public void setVeterinarianName(String veterinarianName) { this.veterinarianName = veterinarianName; }
        public Long getConsultationId() { return consultationId; }
        public void setConsultationId(Long consultationId) { this.consultationId = consultationId; }
        public Long getMedicineId() { return medicineId; }
        public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }
        public String getMedicineName() { return medicineName; }
        public void setMedicineName(String medicineName) { this.medicineName = medicineName; }
        public String getDosage() { return dosage; }
        public void setDosage(String dosage) { this.dosage = dosage; }
        public String getFrequency() { return frequency; }
        public void setFrequency(String frequency) { this.frequency = frequency; }
        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }
        public String getInstructions() { return instructions; }
        public void setInstructions(String instructions) { this.instructions = instructions; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    // --- Vaccination ---
    public static class VaccinationItemRequest {
        private String vaccineName;
        private String batchNumber;
        private LocalDate administeredDate;
        private LocalDate nextDueDate;
        private String notes;

        public String getVaccineName() { return vaccineName; }
        public void setVaccineName(String vaccineName) { this.vaccineName = vaccineName; }
        public String getBatchNumber() { return batchNumber; }
        public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
        public LocalDate getAdministeredDate() { return administeredDate; }
        public void setAdministeredDate(LocalDate administeredDate) { this.administeredDate = administeredDate; }
        public LocalDate getNextDueDate() { return nextDueDate; }
        public void setNextDueDate(LocalDate nextDueDate) { this.nextDueDate = nextDueDate; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class VaccinationRecordRequest {
        @NotNull(message = "Pet ID is required")
        private Long petId;

        @NotBlank(message = "Vaccine name is required")
        private String vaccineName;

        private String batchNumber;

        @NotNull(message = "Administered date is required")
        private LocalDate administeredDate;

        @NotNull(message = "Next due date is required")
        private LocalDate nextDueDate;

        private String notes;

        public Long getPetId() { return petId; }
        public void setPetId(Long petId) { this.petId = petId; }
        public String getVaccineName() { return vaccineName; }
        public void setVaccineName(String vaccineName) { this.vaccineName = vaccineName; }
        public String getBatchNumber() { return batchNumber; }
        public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
        public LocalDate getAdministeredDate() { return administeredDate; }
        public void setAdministeredDate(LocalDate administeredDate) { this.administeredDate = administeredDate; }
        public LocalDate getNextDueDate() { return nextDueDate; }
        public void setNextDueDate(LocalDate nextDueDate) { this.nextDueDate = nextDueDate; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class VaccinationRecordResponse {
        private Long id;
        private Long petId;
        private String petName;
        private String petSpecies;
        private String vaccineName;
        private String batchNumber;
        private LocalDate administeredDate;
        private LocalDate nextDueDate;
        private Long veterinarianId;
        private String veterinarianName;
        private String notes;
        private boolean isOverdue;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getPetId() { return petId; }
        public void setPetId(Long petId) { this.petId = petId; }
        public String getPetName() { return petName; }
        public void setPetName(String petName) { this.petName = petName; }
        public String getPetSpecies() { return petSpecies; }
        public void setPetSpecies(String petSpecies) { this.petSpecies = petSpecies; }
        public String getVaccineName() { return vaccineName; }
        public void setVaccineName(String vaccineName) { this.vaccineName = vaccineName; }
        public String getBatchNumber() { return batchNumber; }
        public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
        public LocalDate getAdministeredDate() { return administeredDate; }
        public void setAdministeredDate(LocalDate administeredDate) { this.administeredDate = administeredDate; }
        public LocalDate getNextDueDate() { return nextDueDate; }
        public void setNextDueDate(LocalDate nextDueDate) { this.nextDueDate = nextDueDate; }
        public Long getVeterinarianId() { return veterinarianId; }
        public void setVeterinarianId(Long veterinarianId) { this.veterinarianId = veterinarianId; }
        public String getVeterinarianName() { return veterinarianName; }
        public void setVeterinarianName(String veterinarianName) { this.veterinarianName = veterinarianName; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public boolean isOverdue() { return isOverdue; }
        public void setOverdue(boolean overdue) { isOverdue = overdue; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}

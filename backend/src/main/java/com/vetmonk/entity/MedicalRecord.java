package com.vetmonk.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records", indexes = {
    @Index(name = "idx_medrec_pet", columnList = "pet_id"),
    @Index(name = "idx_medrec_vet", columnList = "veterinarian_id")
})
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    private User veterinarian;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id")
    private Consultation consultation;

    @Column(nullable = false)
    private String title;

    @Column(name = "record_type", length = 50)
    private String recordType = "GENERAL_CONSULTATION"; // DIAGNOSIS, SURGERY, LAB_TEST, CHECKUP, EMERGENCY

    @Column(length = 1000)
    private String diagnosis;

    @Column(name = "clinical_notes", nullable = false, length = 4000)
    private String clinicalNotes;

    @Column(name = "treatment_summary", length = 2000)
    private String treatmentSummary;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public MedicalRecord() {
    }

    public MedicalRecord(Pet pet, User veterinarian, Consultation consultation, String title, String recordType, String diagnosis, String clinicalNotes, String treatmentSummary) {
        this.pet = pet;
        this.veterinarian = veterinarian;
        this.consultation = consultation;
        this.title = title;
        this.recordType = recordType;
        this.diagnosis = diagnosis;
        this.clinicalNotes = clinicalNotes;
        this.treatmentSummary = treatmentSummary;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Pet getPet() {
        return pet;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

    public User getVeterinarian() {
        return veterinarian;
    }

    public void setVeterinarian(User veterinarian) {
        this.veterinarian = veterinarian;
    }

    public Consultation getConsultation() {
        return consultation;
    }

    public void setConsultation(Consultation consultation) {
        this.consultation = consultation;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getRecordType() {
        return recordType;
    }

    public void setRecordType(String recordType) {
        this.recordType = recordType;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public String getTreatmentSummary() {
        return treatmentSummary;
    }

    public void setTreatmentSummary(String treatmentSummary) {
        this.treatmentSummary = treatmentSummary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

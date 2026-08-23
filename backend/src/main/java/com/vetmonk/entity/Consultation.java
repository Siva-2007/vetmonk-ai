package com.vetmonk.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultations", indexes = {
    @Index(name = "idx_consultation_pet", columnList = "pet_id"),
    @Index(name = "idx_consultation_vet", columnList = "veterinarian_id"),
    @Index(name = "idx_consultation_appt", columnList = "appointment_id")
})
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    private User veterinarian;

    @Column(length = 2000)
    private String observations;

    @Column(length = 2000)
    private String notes;

    @Column(name = "treatment_plan", length = 3000)
    private String treatmentPlan;

    private Double temperature; // In Celsius or Fahrenheit
    private Double weight; // Recorded during consultation

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Consultation() {
    }

    public Consultation(Appointment appointment, Pet pet, User veterinarian, String observations, String notes, String treatmentPlan, LocalDate followUpDate) {
        this.appointment = appointment;
        this.pet = pet;
        this.veterinarian = veterinarian;
        this.observations = observations;
        this.notes = notes;
        this.treatmentPlan = treatmentPlan;
        this.followUpDate = followUpDate;
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

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
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

    public String getObservations() {
        return observations;
    }

    public void setObservations(String observations) {
        this.observations = observations;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getTreatmentPlan() {
        return treatmentPlan;
    }

    public void setTreatmentPlan(String treatmentPlan) {
        this.treatmentPlan = treatmentPlan;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
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

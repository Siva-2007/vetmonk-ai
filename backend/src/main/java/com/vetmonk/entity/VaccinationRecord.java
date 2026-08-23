package com.vetmonk.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vaccination_records", indexes = {
    @Index(name = "idx_vac_pet", columnList = "pet_id"),
    @Index(name = "idx_vac_due", columnList = "next_due_date")
})
public class VaccinationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(name = "vaccine_name", nullable = false)
    private String vaccineName; // e.g. Rabies, DHPP, FVRCP, Bordetella

    @Column(name = "batch_number")
    private String batchNumber;

    @Column(name = "administered_date", nullable = false)
    private LocalDate administeredDate;

    @Column(name = "next_due_date", nullable = false)
    private LocalDate nextDueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinarian_id")
    private User veterinarian;

    @Column(length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public VaccinationRecord() {
    }

    public VaccinationRecord(Pet pet, String vaccineName, String batchNumber, LocalDate administeredDate, LocalDate nextDueDate, User veterinarian, String notes) {
        this.pet = pet;
        this.vaccineName = vaccineName;
        this.batchNumber = batchNumber;
        this.administeredDate = administeredDate;
        this.nextDueDate = nextDueDate;
        this.veterinarian = veterinarian;
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
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

    public String getVaccineName() {
        return vaccineName;
    }

    public void setVaccineName(String vaccineName) {
        this.vaccineName = vaccineName;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public LocalDate getAdministeredDate() {
        return administeredDate;
    }

    public void setAdministeredDate(LocalDate administeredDate) {
        this.administeredDate = administeredDate;
    }

    public LocalDate getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
    }

    public User getVeterinarian() {
        return veterinarian;
    }

    public void setVeterinarian(User veterinarian) {
        this.veterinarian = veterinarian;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

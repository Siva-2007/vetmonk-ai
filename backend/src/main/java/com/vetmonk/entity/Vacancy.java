package com.vetmonk.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vacancies", indexes = {
    @Index(name = "idx_vacancy_clinic", columnList = "clinic_id")
})
public class Vacancy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clinic_id", nullable = false)
    private Clinic clinic;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 100)
    private String department = "Veterinary Care";

    @Column(nullable = false)
    private String location;

    @Column(nullable = false, length = 100)
    private String experience; // e.g. "2-5 years"

    @Column(name = "employment_type", nullable = false, length = 50)
    private String employmentType = "FULL_TIME"; // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP

    @Column(name = "salary_range")
    private String salaryRange;

    @Column(nullable = false)
    private LocalDate deadline;

    @Column(nullable = false, length = 3000)
    private String description;

    @Column(length = 2000)
    private String requirements;

    @Column(nullable = false, length = 30)
    private String status = "OPEN"; // OPEN, CLOSED, FILLED

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Vacancy() {
    }

    public Vacancy(Clinic clinic, String title, String department, String location, String experience, String employmentType, String salaryRange, LocalDate deadline, String description, String requirements) {
        this.clinic = clinic;
        this.title = title;
        this.department = department;
        this.location = location;
        this.experience = experience;
        this.employmentType = employmentType;
        this.salaryRange = salaryRange;
        this.deadline = deadline;
        this.description = description;
        this.requirements = requirements;
        this.status = "OPEN";
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

    public Clinic getClinic() {
        return clinic;
    }

    public void setClinic(Clinic clinic) {
        this.clinic = clinic;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getSalaryRange() {
        return salaryRange;
    }

    public void setSalaryRange(String salaryRange) {
        this.salaryRange = salaryRange;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

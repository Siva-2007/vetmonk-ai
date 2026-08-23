package com.vetmonk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class VacancyDto {

    // =========================================================
    // VACANCY REQUEST
    // =========================================================
    public static class VacancyRequest {

        private Long clinicId;

        @NotBlank(message = "Title is required")
        private String title;

        private String department = "Veterinary Care";

        @NotBlank(message = "Location is required")
        private String location;

        /*
         * Experience is optional because the current frontend
         * vacancy form does not contain an Experience field.
         *
         * Defaulting to an empty string prevents:
         * request.getExperience().trim()
         *
         * from throwing NullPointerException.
         */
        private String experience = "";

        private String employmentType = "FULL_TIME";

        private String salaryRange;

        @NotNull(message = "Deadline is required")
        private LocalDate deadline;

        @NotBlank(message = "Description is required")
        private String description;

        private String requirements;

        private String status = "OPEN";

        // -----------------------------------------------------
        // Getters and Setters
        // -----------------------------------------------------

        public Long getClinicId() {
            return clinicId;
        }

        public void setClinicId(Long clinicId) {
            this.clinicId = clinicId;
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
            this.experience = experience == null ? "" : experience;
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
    }


    // =========================================================
    // VACANCY RESPONSE
    // =========================================================
    public static class VacancyResponse {

        private Long id;
        private Long clinicId;
        private String clinicName;
        private String title;
        private String department;
        private String location;
        private String experience = "";
        private String employmentType;
        private String salaryRange;
        private LocalDate deadline;
        private String description;
        private String requirements;
        private String status;
        private LocalDateTime createdAt;

        // -----------------------------------------------------
        // Getters and Setters
        // -----------------------------------------------------

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getClinicId() {
            return clinicId;
        }

        public void setClinicId(Long clinicId) {
            this.clinicId = clinicId;
        }

        public String getClinicName() {
            return clinicName;
        }

        public void setClinicName(String clinicName) {
            this.clinicName = clinicName;
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
    }
}
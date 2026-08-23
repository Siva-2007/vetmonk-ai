package com.vetmonk.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class VacancyApplicationDto {

    // =========================================================
    // APPLICATION RESPONSE
    // =========================================================

    public static class ApplicationResponse {

        private Long id;
        private Long vacancyId;
        private Long clinicId;
        private String clinicName;

        private String vacancyTitle;

        private String fullName;
        private String email;
        private String phone;
        private String coverLetter;

        private String resumeFileName;
        private String resumeContentType;
        private long resumeSize;

        private String status;

        private LocalDateTime createdAt;


        public ApplicationResponse() {
        }


        // -----------------------------------------------------
        // Getters and Setters
        // -----------------------------------------------------

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }


        public Long getVacancyId() {
            return vacancyId;
        }

        public void setVacancyId(Long vacancyId) {
            this.vacancyId = vacancyId;
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


        public String getVacancyTitle() {
            return vacancyTitle;
        }

        public void setVacancyTitle(String vacancyTitle) {
            this.vacancyTitle = vacancyTitle;
        }


        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }


        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }


        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }


        public String getCoverLetter() {
            return coverLetter;
        }

        public void setCoverLetter(String coverLetter) {
            this.coverLetter = coverLetter;
        }


        public String getResumeFileName() {
            return resumeFileName;
        }

        public void setResumeFileName(String resumeFileName) {
            this.resumeFileName = resumeFileName;
        }


        public String getResumeContentType() {
            return resumeContentType;
        }

        public void setResumeContentType(String resumeContentType) {
            this.resumeContentType = resumeContentType;
        }


        public long getResumeSize() {
            return resumeSize;
        }

        public void setResumeSize(long resumeSize) {
            this.resumeSize = resumeSize;
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
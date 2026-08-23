package com.vetmonk.dto;

import com.vetmonk.entity.AppointmentStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AppointmentDto {

    public static class BookAppointmentRequest {
        @NotNull(message = "Pet ID is required")
        private Long petId;

        @NotNull(message = "Clinic ID is required")
        private Long clinicId;

        private Long veterinarianId; // Optional: can be assigned by clinic or selected by owner

        @NotNull(message = "Appointment date is required")
        @FutureOrPresent(message = "Appointment date cannot be in the past")
        private LocalDate appointmentDate;

        @NotNull(message = "Appointment time is required")
        private LocalTime appointmentTime;

        @NotBlank(message = "Reason for appointment is required")
        private String reason;

        public Long getPetId() { return petId; }
        public void setPetId(Long petId) { this.petId = petId; }
        public Long getClinicId() { return clinicId; }
        public void setClinicId(Long clinicId) { this.clinicId = clinicId; }
        public Long getVeterinarianId() { return veterinarianId; }
        public void setVeterinarianId(Long veterinarianId) { this.veterinarianId = veterinarianId; }
        public LocalDate getAppointmentDate() { return appointmentDate; }
        public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
        public LocalTime getAppointmentTime() { return appointmentTime; }
        public void setAppointmentTime(LocalTime appointmentTime) { this.appointmentTime = appointmentTime; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class UpdateAppointmentStatusRequest {
        @NotNull(message = "Status is required")
        private AppointmentStatus status;

        private Long veterinarianId;

        public AppointmentStatus getStatus() { return status; }
        public void setStatus(AppointmentStatus status) { this.status = status; }
        public Long getVeterinarianId() { return veterinarianId; }
        public void setVeterinarianId(Long veterinarianId) { this.veterinarianId = veterinarianId; }
    }

    public static class AppointmentResponse {
        private Long id;
        private Long petId;
        private String petName;
        private String petSpecies;
        private String petBreed;
        private Long ownerId;
        private String ownerName;
        private String ownerPhone;
        private String ownerEmail;
        private Long clinicId;
        private String clinicName;
        private Long veterinarianId;
        private String veterinarianName;
        private LocalDate appointmentDate;
        private LocalTime appointmentTime;
        private String reason;
        private AppointmentStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getPetId() { return petId; }
        public void setPetId(Long petId) { this.petId = petId; }
        public String getPetName() { return petName; }
        public void setPetName(String petName) { this.petName = petName; }
        public String getPetSpecies() { return petSpecies; }
        public void setPetSpecies(String petSpecies) { this.petSpecies = petSpecies; }
        public String getPetBreed() { return petBreed; }
        public void setPetBreed(String petBreed) { this.petBreed = petBreed; }
        public Long getOwnerId() { return ownerId; }
        public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
        public String getOwnerName() { return ownerName; }
        public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
        public String getOwnerPhone() { return ownerPhone; }
        public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }
        public String getOwnerEmail() { return ownerEmail; }
        public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
        public Long getClinicId() { return clinicId; }
        public void setClinicId(Long clinicId) { this.clinicId = clinicId; }
        public String getClinicName() { return clinicName; }
        public void setClinicName(String clinicName) { this.clinicName = clinicName; }
        public Long getVeterinarianId() { return veterinarianId; }
        public void setVeterinarianId(Long veterinarianId) { this.veterinarianId = veterinarianId; }
        public String getVeterinarianName() { return veterinarianName; }
        public void setVeterinarianName(String veterinarianName) { this.veterinarianName = veterinarianName; }
        public LocalDate getAppointmentDate() { return appointmentDate; }
        public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
        public LocalTime getAppointmentTime() { return appointmentTime; }
        public void setAppointmentTime(LocalTime appointmentTime) { this.appointmentTime = appointmentTime; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public AppointmentStatus getStatus() { return status; }
        public void setStatus(AppointmentStatus status) { this.status = status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }
}

package com.vetmonk.dto;

import com.vetmonk.entity.QueueStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class QueueDto {

    public static class CheckInRequest {
        @NotNull(message = "Appointment ID is required")
        private Long appointmentId;

        private Long veterinarianId; // Optional: specify or assign attending vet
        private String notes;

        public Long getAppointmentId() { return appointmentId; }
        public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
        public Long getVeterinarianId() { return veterinarianId; }
        public void setVeterinarianId(Long veterinarianId) { this.veterinarianId = veterinarianId; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class UpdateQueueStatusRequest {
        @NotNull(message = "Status is required")
        private QueueStatus status;

        public QueueStatus getStatus() { return status; }
        public void setStatus(QueueStatus status) { this.status = status; }
    }

    public static class QueueEntryResponse {
        private Long id;
        private Long appointmentId;
        private Long petId;
        private String petName;
        private String petSpecies;
        private String petBreed;
        private Long ownerId;
        private String ownerName;
        private String ownerPhone;
        private Long clinicId;
        private String clinicName;
        private Long veterinarianId;
        private String veterinarianName;
        private Integer queueNumber;
        private QueueStatus status;
        private LocalDateTime checkInTime;
        private LocalDateTime consultationStartTime;
        private LocalDateTime consultationEndTime;
        private String reason;
        private String notes;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getAppointmentId() { return appointmentId; }
        public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
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
        public Long getClinicId() { return clinicId; }
        public void setClinicId(Long clinicId) { this.clinicId = clinicId; }
        public String getClinicName() { return clinicName; }
        public void setClinicName(String clinicName) { this.clinicName = clinicName; }
        public Long getVeterinarianId() { return veterinarianId; }
        public void setVeterinarianId(Long veterinarianId) { this.veterinarianId = veterinarianId; }
        public String getVeterinarianName() { return veterinarianName; }
        public void setVeterinarianName(String veterinarianName) { this.veterinarianName = veterinarianName; }
        public Integer getQueueNumber() { return queueNumber; }
        public void setQueueNumber(Integer queueNumber) { this.queueNumber = queueNumber; }
        public QueueStatus getStatus() { return status; }
        public void setStatus(QueueStatus status) { this.status = status; }
        public LocalDateTime getCheckInTime() { return checkInTime; }
        public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }
        public LocalDateTime getConsultationStartTime() { return consultationStartTime; }
        public void setConsultationStartTime(LocalDateTime consultationStartTime) { this.consultationStartTime = consultationStartTime; }
        public LocalDateTime getConsultationEndTime() { return consultationEndTime; }
        public void setConsultationEndTime(LocalDateTime consultationEndTime) { this.consultationEndTime = consultationEndTime; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}

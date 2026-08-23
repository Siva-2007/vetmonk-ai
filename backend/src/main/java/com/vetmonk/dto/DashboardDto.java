package com.vetmonk.dto;

import java.util.List;
import java.util.Map;

public class DashboardDto {

    public static class PetOwnerDashboardResponse {
        private long totalPets;
        private long upcomingAppointmentsCount;
        private long pendingVaccinationsCount;
        private long totalMedicalRecordsCount;
        private long openQueriesCount;
        private List<AppointmentDto.AppointmentResponse> upcomingAppointments;
        private List<MedicalDto.VaccinationRecordResponse> upcomingVaccinations;
        private List<PetDto.PetResponse> pets;

        public long getTotalPets() { return totalPets; }
        public void setTotalPets(long totalPets) { this.totalPets = totalPets; }
        public long getUpcomingAppointmentsCount() { return upcomingAppointmentsCount; }
        public void setUpcomingAppointmentsCount(long upcomingAppointmentsCount) { this.upcomingAppointmentsCount = upcomingAppointmentsCount; }
        public long getPendingVaccinationsCount() { return pendingVaccinationsCount; }
        public void setPendingVaccinationsCount(long pendingVaccinationsCount) { this.pendingVaccinationsCount = pendingVaccinationsCount; }
        public long getTotalMedicalRecordsCount() { return totalMedicalRecordsCount; }
        public void setTotalMedicalRecordsCount(long totalMedicalRecordsCount) { this.totalMedicalRecordsCount = totalMedicalRecordsCount; }
        public long getOpenQueriesCount() { return openQueriesCount; }
        public void setOpenQueriesCount(long openQueriesCount) { this.openQueriesCount = openQueriesCount; }
        public List<AppointmentDto.AppointmentResponse> getUpcomingAppointments() { return upcomingAppointments; }
        public void setUpcomingAppointments(List<AppointmentDto.AppointmentResponse> upcomingAppointments) { this.upcomingAppointments = upcomingAppointments; }
        public List<MedicalDto.VaccinationRecordResponse> getUpcomingVaccinations() { return upcomingVaccinations; }
        public void setUpcomingVaccinations(List<MedicalDto.VaccinationRecordResponse> upcomingVaccinations) { this.upcomingVaccinations = upcomingVaccinations; }
        public List<PetDto.PetResponse> getPets() { return pets; }
        public void setPets(List<PetDto.PetResponse> pets) { this.pets = pets; }
    }

    public static class VetDashboardResponse {
        private long todayAppointmentsCount;
        private long waitingQueueCount;
        private long completedConsultationsCount;
        private List<QueueDto.QueueEntryResponse> currentQueue;
        private List<AppointmentDto.AppointmentResponse> todayAppointments;

        public long getTodayAppointmentsCount() { return todayAppointmentsCount; }
        public void setTodayAppointmentsCount(long todayAppointmentsCount) { this.todayAppointmentsCount = todayAppointmentsCount; }
        public long getWaitingQueueCount() { return waitingQueueCount; }
        public void setWaitingQueueCount(long waitingQueueCount) { this.waitingQueueCount = waitingQueueCount; }
        public long getCompletedConsultationsCount() { return completedConsultationsCount; }
        public void setCompletedConsultationsCount(long completedConsultationsCount) { this.completedConsultationsCount = completedConsultationsCount; }
        public List<QueueDto.QueueEntryResponse> getCurrentQueue() { return currentQueue; }
        public void setCurrentQueue(List<QueueDto.QueueEntryResponse> currentQueue) { this.currentQueue = currentQueue; }
        public List<AppointmentDto.AppointmentResponse> getTodayAppointments() { return todayAppointments; }
        public void setTodayAppointments(List<AppointmentDto.AppointmentResponse> todayAppointments) { this.todayAppointments = todayAppointments; }
    }

    public static class ReceptionistDashboardResponse {
        private long todayAppointmentsCount;
        private long checkedInCount;
        private long inQueueCount;
        private long openQueriesCount;
        private List<QueueDto.QueueEntryResponse> liveQueue;
        private List<AppointmentDto.AppointmentResponse> todayAppointments;

        public long getTodayAppointmentsCount() { return todayAppointmentsCount; }
        public void setTodayAppointmentsCount(long todayAppointmentsCount) { this.todayAppointmentsCount = todayAppointmentsCount; }
        public long getCheckedInCount() { return checkedInCount; }
        public void setCheckedInCount(long checkedInCount) { this.checkedInCount = checkedInCount; }
        public long getInQueueCount() { return inQueueCount; }
        public void setInQueueCount(long inQueueCount) { this.inQueueCount = inQueueCount; }
        public long getOpenQueriesCount() { return openQueriesCount; }
        public void setOpenQueriesCount(long openQueriesCount) { this.openQueriesCount = openQueriesCount; }
        public List<QueueDto.QueueEntryResponse> getLiveQueue() { return liveQueue; }
        public void setLiveQueue(List<QueueDto.QueueEntryResponse> liveQueue) { this.liveQueue = liveQueue; }
        public List<AppointmentDto.AppointmentResponse> getTodayAppointments() { return todayAppointments; }
        public void setTodayAppointments(List<AppointmentDto.AppointmentResponse> todayAppointments) { this.todayAppointments = todayAppointments; }
    }

    public static class ClinicAdminDashboardResponse {
        private String clinicName;
        private long totalVets;
        private long totalAppointmentsToday;
        private long currentWaitingQueue;
        private long lowStockCount;
        private long expiringMedicinesCount;
        private long openQueriesCount;
        private long activeVacanciesCount;
        private List<InventoryDto.InventoryItemResponse> criticalInventory;
        private List<QueueDto.QueueEntryResponse> liveQueue;

        public String getClinicName() { return clinicName; }
        public void setClinicName(String clinicName) { this.clinicName = clinicName; }
        public long getTotalVets() { return totalVets; }
        public void setTotalVets(long totalVets) { this.totalVets = totalVets; }
        public long getTotalAppointmentsToday() { return totalAppointmentsToday; }
        public void setTotalAppointmentsToday(long totalAppointmentsToday) { this.totalAppointmentsToday = totalAppointmentsToday; }
        public long getCurrentWaitingQueue() { return currentWaitingQueue; }
        public void setCurrentWaitingQueue(long currentWaitingQueue) { this.currentWaitingQueue = currentWaitingQueue; }
        public long getLowStockCount() { return lowStockCount; }
        public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }
        public long getExpiringMedicinesCount() { return expiringMedicinesCount; }
        public void setExpiringMedicinesCount(long expiringMedicinesCount) { this.expiringMedicinesCount = expiringMedicinesCount; }
        public long getOpenQueriesCount() { return openQueriesCount; }
        public void setOpenQueriesCount(long openQueriesCount) { this.openQueriesCount = openQueriesCount; }
        public long getActiveVacanciesCount() { return activeVacanciesCount; }
        public void setActiveVacanciesCount(long activeVacanciesCount) { this.activeVacanciesCount = activeVacanciesCount; }
        public List<InventoryDto.InventoryItemResponse> getCriticalInventory() { return criticalInventory; }
        public void setCriticalInventory(List<InventoryDto.InventoryItemResponse> criticalInventory) { this.criticalInventory = criticalInventory; }
        public List<QueueDto.QueueEntryResponse> getLiveQueue() { return liveQueue; }
        public void setLiveQueue(List<QueueDto.QueueEntryResponse> liveQueue) { this.liveQueue = liveQueue; }
    }

    public static class SuperAdminDashboardResponse {
        private long totalUsers;
        private long totalClinics;
        private long totalPets;
        private long totalAppointments;
        private long totalConsultations;
        private Map<String, Long> usersByRole;
        private List<AuditDto.AuditLogResponse> recentAuditLogs;

        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
        public long getTotalClinics() { return totalClinics; }
        public void setTotalClinics(long totalClinics) { this.totalClinics = totalClinics; }
        public long getTotalPets() { return totalPets; }
        public void setTotalPets(long totalPets) { this.totalPets = totalPets; }
        public long getTotalAppointments() { return totalAppointments; }
        public void setTotalAppointments(long totalAppointments) { this.totalAppointments = totalAppointments; }
        public long getTotalConsultations() { return totalConsultations; }
        public void setTotalConsultations(long totalConsultations) { this.totalConsultations = totalConsultations; }
        public Map<String, Long> getUsersByRole() { return usersByRole; }
        public void setUsersByRole(Map<String, Long> usersByRole) { this.usersByRole = usersByRole; }
        public List<AuditDto.AuditLogResponse> getRecentAuditLogs() { return recentAuditLogs; }
        public void setRecentAuditLogs(List<AuditDto.AuditLogResponse> recentAuditLogs) { this.recentAuditLogs = recentAuditLogs; }
    }
}

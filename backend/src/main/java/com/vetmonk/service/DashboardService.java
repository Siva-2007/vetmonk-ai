package com.vetmonk.service;

import com.vetmonk.dto.*;
import com.vetmonk.entity.*;
import com.vetmonk.repository.*;
import com.vetmonk.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ClinicRepository clinicRepository;
    private final PetRepository petRepository;
    private final AppointmentRepository appointmentRepository;
    private final QueueEntryRepository queueEntryRepository;
    private final ConsultationRepository consultationRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccinationRecordRepository vaccinationRecordRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final CustomerQueryRepository customerQueryRepository;
    private final VacancyRepository vacancyRepository;
    private final AuditLogRepository auditLogRepository;

    private final PetService petService;
    private final AppointmentService appointmentService;
    private final QueueService queueService;
    private final VaccinationService vaccinationService;
    private final InventoryService inventoryService;
    private final AuditService auditService;

    public DashboardService(UserRepository userRepository,
                            ClinicRepository clinicRepository,
                            PetRepository petRepository,
                            AppointmentRepository appointmentRepository,
                            QueueEntryRepository queueEntryRepository,
                            ConsultationRepository consultationRepository,
                            MedicalRecordRepository medicalRecordRepository,
                            VaccinationRecordRepository vaccinationRecordRepository,
                            InventoryItemRepository inventoryItemRepository,
                            CustomerQueryRepository customerQueryRepository,
                            VacancyRepository vacancyRepository,
                            AuditLogRepository auditLogRepository,
                            PetService petService,
                            AppointmentService appointmentService,
                            QueueService queueService,
                            VaccinationService vaccinationService,
                            InventoryService inventoryService,
                            AuditService auditService) {
        this.userRepository = userRepository;
        this.clinicRepository = clinicRepository;
        this.petRepository = petRepository;
        this.appointmentRepository = appointmentRepository;
        this.queueEntryRepository = queueEntryRepository;
        this.consultationRepository = consultationRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.vaccinationRecordRepository = vaccinationRecordRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.customerQueryRepository = customerQueryRepository;
        this.vacancyRepository = vacancyRepository;
        this.auditLogRepository = auditLogRepository;
        this.petService = petService;
        this.appointmentService = appointmentService;
        this.queueService = queueService;
        this.vaccinationService = vaccinationService;
        this.inventoryService = inventoryService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public DashboardDto.PetOwnerDashboardResponse getPetOwnerDashboard() {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        List<Pet> pets = petRepository.findByOwnerId(currentUserId);
        List<AppointmentDto.AppointmentResponse> myAppointments = appointmentService.getMyAppointments();
        List<MedicalDto.VaccinationRecordResponse> upcomingVaccinations = vaccinationService.getUpcomingVaccinationsForCurrentUser();
        List<CustomerQuery> queries = customerQueryRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);

        long totalMedicalRecords = 0;
        for (Pet p : pets) {
            totalMedicalRecords += medicalRecordRepository.findByPetIdOrderByCreatedAtDesc(p.getId()).size();
        }

        DashboardDto.PetOwnerDashboardResponse resp = new DashboardDto.PetOwnerDashboardResponse();
        resp.setTotalPets(pets.size());
        resp.setUpcomingAppointmentsCount(myAppointments.stream().filter(a -> a.getStatus() == AppointmentStatus.CONFIRMED || a.getStatus() == AppointmentStatus.REQUESTED).count());
        resp.setPendingVaccinationsCount(upcomingVaccinations.size());
        resp.setTotalMedicalRecordsCount(totalMedicalRecords);
        resp.setOpenQueriesCount(queries.stream().filter(q -> q.getStatus() == QueryStatus.OPEN || q.getStatus() == QueryStatus.IN_PROGRESS).count());
        resp.setUpcomingAppointments(myAppointments.stream().limit(5).toList());
        resp.setUpcomingVaccinations(upcomingVaccinations.stream().limit(5).toList());
        resp.setPets(pets.stream().map(petService::mapToResponse).toList());

        return resp;
    }

    @Transactional(readOnly = true)
    public DashboardDto.VetDashboardResponse getVetDashboard() {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        List<AppointmentDto.AppointmentResponse> todayAppts = appointmentService.getTodayVetAppointments();
        List<QueueDto.QueueEntryResponse> vetQueue = queueService.getVetQueue(currentUserId);
        long completed = consultationRepository.findByVeterinarianIdOrderByCreatedAtDesc(currentUserId).size();

        DashboardDto.VetDashboardResponse resp = new DashboardDto.VetDashboardResponse();
        resp.setTodayAppointmentsCount(todayAppts.size());
        resp.setWaitingQueueCount(vetQueue.size());
        resp.setCompletedConsultationsCount(completed);
        resp.setCurrentQueue(vetQueue);
        resp.setTodayAppointments(todayAppts);

        return resp;
    }

    @Transactional(readOnly = true)
    public DashboardDto.ReceptionistDashboardResponse getReceptionistDashboard(Long clinicId) {
        Long targetClinicId = clinicId != null ? clinicId : getFallbackClinicId();

        List<AppointmentDto.AppointmentResponse> todayAppts = appointmentService.getTodayClinicAppointments(targetClinicId);
        List<QueueDto.QueueEntryResponse> liveQueue = queueService.getClinicLiveQueue(targetClinicId);
        long openQueries = customerQueryRepository.countByStatus(QueryStatus.OPEN);

        DashboardDto.ReceptionistDashboardResponse resp = new DashboardDto.ReceptionistDashboardResponse();
        resp.setTodayAppointmentsCount(todayAppts.size());
        resp.setCheckedInCount(liveQueue.size());
        resp.setInQueueCount(liveQueue.stream().filter(q -> q.getStatus() == QueueStatus.WAITING).count());
        resp.setOpenQueriesCount(openQueries);
        resp.setLiveQueue(liveQueue);
        resp.setTodayAppointments(todayAppts);

        return resp;
    }

    @Transactional(readOnly = true)
    public DashboardDto.ClinicAdminDashboardResponse getClinicAdminDashboard(Long clinicId) {
        Long targetClinicId = clinicId != null ? clinicId : getFallbackClinicId();
        Clinic clinic = clinicRepository.findById(targetClinicId).orElse(null);

        List<User> vets = userRepository.findByClinicIdAndRole(targetClinicId, Role.VETERINARIAN);
        List<AppointmentDto.AppointmentResponse> todayAppts = appointmentService.getTodayClinicAppointments(targetClinicId);
        List<QueueDto.QueueEntryResponse> liveQueue = queueService.getClinicLiveQueue(targetClinicId);
        List<InventoryDto.InventoryItemResponse> lowStock = inventoryService.getLowStockItems(targetClinicId);
        List<InventoryDto.InventoryItemResponse> expiring = inventoryService.getExpiringItems(targetClinicId);
        long vacanciesCount = vacancyRepository.findByClinicIdOrderByDeadlineAsc(targetClinicId).size();
        long openQueries = customerQueryRepository.countByStatus(QueryStatus.OPEN);

        DashboardDto.ClinicAdminDashboardResponse resp = new DashboardDto.ClinicAdminDashboardResponse();
        resp.setClinicName(clinic != null ? clinic.getName() : "Main Veterinary Clinic");
        resp.setTotalVets(vets.size());
        resp.setTotalAppointmentsToday(todayAppts.size());
        resp.setCurrentWaitingQueue(liveQueue.size());
        resp.setLowStockCount(lowStock.size());
        resp.setExpiringMedicinesCount(expiring.size());
        resp.setOpenQueriesCount(openQueries);
        resp.setActiveVacanciesCount(vacanciesCount);
        resp.setCriticalInventory(lowStock.stream().limit(5).toList());
        resp.setLiveQueue(liveQueue);

        return resp;
    }

    @Transactional(readOnly = true)
    public DashboardDto.SuperAdminDashboardResponse getSuperAdminDashboard() {
        long totalUsers = userRepository.count();
        long totalClinics = clinicRepository.count();
        long totalPets = petRepository.count();
        long totalAppointments = appointmentRepository.count();
        long totalConsultations = consultationRepository.count();

        Map<String, Long> roleDistribution = new HashMap<>();
        for (Role r : Role.values()) {
            roleDistribution.put(r.name(), (long) userRepository.findByRole(r).size());
        }

        List<AuditDto.AuditLogResponse> recentLogs = auditService.getRecentLogs();

        DashboardDto.SuperAdminDashboardResponse resp = new DashboardDto.SuperAdminDashboardResponse();
        resp.setTotalUsers(totalUsers);
        resp.setTotalClinics(totalClinics);
        resp.setTotalPets(totalPets);
        resp.setTotalAppointments(totalAppointments);
        resp.setTotalConsultations(totalConsultations);
        resp.setUsersByRole(roleDistribution);
        resp.setRecentAuditLogs(recentLogs);

        return resp;
    }

    private Long getFallbackClinicId() {
        if (SecurityUtils.getCurrentUser().getClinicId() != null) {
            return SecurityUtils.getCurrentUser().getClinicId();
        }
        return clinicRepository.findAll().stream().findFirst().map(Clinic::getId).orElse(1L);
    }
}

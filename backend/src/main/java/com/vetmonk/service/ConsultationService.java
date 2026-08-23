package com.vetmonk.service;

import com.vetmonk.dto.MedicalDto;
import com.vetmonk.entity.*;
import com.vetmonk.exception.ResourceNotFoundException;
import com.vetmonk.exception.SecurityViolationException;
import com.vetmonk.repository.*;
import com.vetmonk.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VaccinationRecordRepository vaccinationRecordRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final QueueEntryRepository queueEntryRepository;
    private final AuditService auditService;

    public ConsultationService(ConsultationRepository consultationRepository,
                               AppointmentRepository appointmentRepository,
                               MedicalRecordRepository medicalRecordRepository,
                               PrescriptionRepository prescriptionRepository,
                               VaccinationRecordRepository vaccinationRecordRepository,
                               MedicineRepository medicineRepository,
                               UserRepository userRepository,
                               QueueEntryRepository queueEntryRepository,
                               AuditService auditService) {
        this.consultationRepository = consultationRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.vaccinationRecordRepository = vaccinationRecordRepository;
        this.medicineRepository = medicineRepository;
        this.userRepository = userRepository;
        this.queueEntryRepository = queueEntryRepository;
        this.auditService = auditService;
    }

    @Transactional
    public MedicalDto.ConsultationResponse createConsultation(MedicalDto.ConsultationRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentUserRole = SecurityUtils.getCurrentUserRole();

        if (currentUserRole != Role.VETERINARIAN && currentUserRole != Role.SUPER_ADMIN) {
            throw new SecurityViolationException("Access denied: Only licensed veterinarians can create clinical consultations.");
        }

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        User vet = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        // Create and save consultation
        Consultation consultation = new Consultation();
        consultation.setAppointment(appointment);
        consultation.setPet(appointment.getPet());
        consultation.setVeterinarian(vet);
        consultation.setObservations(request.getObservations());
        consultation.setNotes(request.getNotes());
        consultation.setTreatmentPlan(request.getTreatmentPlan());
        consultation.setTemperature(request.getTemperature());
        consultation.setWeight(request.getWeight());
        consultation.setFollowUpDate(request.getFollowUpDate());

        Consultation savedConsultation = consultationRepository.save(consultation);

        // Update appointment status to COMPLETED
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        // Complete queue entry if exists
        queueEntryRepository.findByAppointmentId(appointment.getId()).ifPresent(q -> {
            q.setStatus(QueueStatus.COMPLETED);
            queueEntryRepository.save(q);
        });

        // 1. Process Embedded Medical Record if provided
        if (request.getMedicalRecord() != null) {
            MedicalDto.MedicalRecordItemRequest mrReq = request.getMedicalRecord();
            MedicalRecord record = new MedicalRecord();
            record.setPet(appointment.getPet());
            record.setVeterinarian(vet);
            record.setConsultation(savedConsultation);
            record.setTitle(mrReq.getTitle() != null ? mrReq.getTitle() : "Consultation Record");
            record.setRecordType(mrReq.getRecordType() != null ? mrReq.getRecordType() : "GENERAL_CONSULTATION");
            record.setDiagnosis(mrReq.getDiagnosis());
            record.setClinicalNotes(mrReq.getClinicalNotes() != null ? mrReq.getClinicalNotes() : request.getObservations());
            record.setTreatmentSummary(mrReq.getTreatmentSummary() != null ? mrReq.getTreatmentSummary() : request.getTreatmentPlan());
            medicalRecordRepository.save(record);
        }

        // 2. Process Embedded Prescriptions if provided
        if (request.getPrescriptions() != null && !request.getPrescriptions().isEmpty()) {
            for (MedicalDto.PrescriptionItemRequest pReq : request.getPrescriptions()) {
                Prescription p = new Prescription();
                p.setPet(appointment.getPet());
                p.setVeterinarian(vet);
                p.setConsultation(savedConsultation);
                p.setMedicineName(pReq.getMedicineName());
                p.setDosage(pReq.getDosage() != null ? pReq.getDosage() : "As directed");
                p.setFrequency(pReq.getFrequency() != null ? pReq.getFrequency() : "Daily");
                p.setDuration(pReq.getDuration() != null ? pReq.getDuration() : "5 days");
                p.setInstructions(pReq.getInstructions());
                p.setNotes(pReq.getNotes());

                if (pReq.getMedicineId() != null) {
                    medicineRepository.findById(pReq.getMedicineId()).ifPresent(p::setMedicine);
                }
                prescriptionRepository.save(p);
            }
        }

        // 3. Process Embedded Vaccinations if provided
        if (request.getVaccinations() != null && !request.getVaccinations().isEmpty()) {
            for (MedicalDto.VaccinationItemRequest vReq : request.getVaccinations()) {
                VaccinationRecord vr = new VaccinationRecord();
                vr.setPet(appointment.getPet());
                vr.setVeterinarian(vet);
                vr.setVaccineName(vReq.getVaccineName());
                vr.setBatchNumber(vReq.getBatchNumber());
                vr.setAdministeredDate(vReq.getAdministeredDate());
                vr.setNextDueDate(vReq.getNextDueDate());
                vr.setNotes(vReq.getNotes());
                vaccinationRecordRepository.save(vr);
            }
        }

        auditService.logAction(currentUserId, SecurityUtils.getCurrentUserEmail(),
                "CONSULTATION_CREATE", "Consultation", savedConsultation.getId().toString(), null, "SUCCESS",
                "Completed consultation for pet " + appointment.getPet().getName());

        return mapToResponse(savedConsultation);
    }

    @Transactional(readOnly = true)
    public MedicalDto.ConsultationResponse getConsultationById(Long id) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", id));

        validatePetAccess(consultation.getPet());

        return mapToResponse(consultation);
    }

    @Transactional(readOnly = true)
    public List<MedicalDto.ConsultationResponse> getPetConsultations(Long petId) {
        Pet pet = appointmentRepository.findById(petId).map(Appointment::getPet)
                .orElse(null);

        return consultationRepository.findByPetIdOrderByCreatedAtDesc(petId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void validatePetAccess(Pet pet) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentUserRole = SecurityUtils.getCurrentUserRole();

        if (currentUserRole == Role.PET_OWNER && !pet.getOwner().getId().equals(currentUserId)) {
            throw new SecurityViolationException("Access denied: You cannot view consultation details for pets you do not own.");
        }
    }

    public MedicalDto.ConsultationResponse mapToResponse(Consultation c) {
        MedicalDto.ConsultationResponse resp = new MedicalDto.ConsultationResponse();
        resp.setId(c.getId());
        if (c.getAppointment() != null) resp.setAppointmentId(c.getAppointment().getId());
        if (c.getPet() != null) {
            resp.setPetId(c.getPet().getId());
            resp.setPetName(c.getPet().getName());
        }
        if (c.getVeterinarian() != null) {
            resp.setVeterinarianId(c.getVeterinarian().getId());
            resp.setVeterinarianName(c.getVeterinarian().getName());
        }
        resp.setObservations(c.getObservations());
        resp.setNotes(c.getNotes());
        resp.setTreatmentPlan(c.getTreatmentPlan());
        resp.setTemperature(c.getTemperature());
        resp.setWeight(c.getWeight());
        resp.setFollowUpDate(c.getFollowUpDate());
        resp.setCreatedAt(c.getCreatedAt());
        return resp;
    }
}

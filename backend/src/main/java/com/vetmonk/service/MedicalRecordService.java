package com.vetmonk.service;

import com.vetmonk.dto.MedicalDto;
import com.vetmonk.entity.*;
import com.vetmonk.exception.ResourceNotFoundException;
import com.vetmonk.exception.SecurityViolationException;
import com.vetmonk.repository.ConsultationRepository;
import com.vetmonk.repository.MedicalRecordRepository;
import com.vetmonk.repository.PetRepository;
import com.vetmonk.repository.UserRepository;
import com.vetmonk.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final ConsultationRepository consultationRepository;
    private final AuditService auditService;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository,
                                PetRepository petRepository,
                                UserRepository userRepository,
                                ConsultationRepository consultationRepository,
                                AuditService auditService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.consultationRepository = consultationRepository;
        this.auditService = auditService;
    }

    @Transactional
    public MedicalDto.MedicalRecordResponse createMedicalRecord(MedicalDto.MedicalRecordRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentUserRole = SecurityUtils.getCurrentUserRole();

        if (currentUserRole != Role.VETERINARIAN && currentUserRole != Role.SUPER_ADMIN) {
            throw new SecurityViolationException("Access denied: Only licensed veterinarians can create medical records.");
        }

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", request.getPetId()));

        User vet = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        Consultation consultation = null;
        if (request.getConsultationId() != null) {
            consultation = consultationRepository.findById(request.getConsultationId()).orElse(null);
        }

        MedicalRecord record = new MedicalRecord();
        record.setPet(pet);
        record.setVeterinarian(vet);
        record.setConsultation(consultation);
        record.setTitle(request.getTitle().trim());
        record.setRecordType(request.getRecordType() != null ? request.getRecordType() : "GENERAL_CONSULTATION");
        record.setDiagnosis(request.getDiagnosis());
        record.setClinicalNotes(request.getClinicalNotes());
        record.setTreatmentSummary(request.getTreatmentSummary());

        MedicalRecord saved = medicalRecordRepository.save(record);

        auditService.logAction(currentUserId, SecurityUtils.getCurrentUserEmail(),
                "RECORD_CREATE", "MedicalRecord", saved.getId().toString(), null, "SUCCESS",
                "Created medical record: " + saved.getTitle() + " for pet " + pet.getName());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MedicalDto.MedicalRecordResponse> getPetMedicalRecords(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", petId));

        validatePetAccess(pet);

        auditService.logAction(SecurityUtils.getCurrentUserId(), SecurityUtils.getCurrentUserEmail(),
                "RECORD_VIEW", "MedicalRecord", "Pet:" + petId, null, "SUCCESS", "Viewed medical records for " + pet.getName());

        return medicalRecordRepository.findByPetIdOrderByCreatedAtDesc(petId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<MedicalDto.MedicalRecordResponse> getPetMedicalRecordsPaged(Long petId, Pageable pageable) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", petId));

        validatePetAccess(pet);

        return medicalRecordRepository.findByPetId(petId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public MedicalDto.MedicalRecordResponse getMedicalRecordById(Long id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", "id", id));

        validatePetAccess(record.getPet());

        return mapToResponse(record);
    }

    private void validatePetAccess(Pet pet) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentUserRole = SecurityUtils.getCurrentUserRole();

        if (currentUserRole == Role.PET_OWNER && !pet.getOwner().getId().equals(currentUserId)) {
            throw new SecurityViolationException("Access denied: You cannot access medical records of pets you do not own.");
        }
    }

    public MedicalDto.MedicalRecordResponse mapToResponse(MedicalRecord r) {
        MedicalDto.MedicalRecordResponse resp = new MedicalDto.MedicalRecordResponse();
        resp.setId(r.getId());
        if (r.getPet() != null) {
            resp.setPetId(r.getPet().getId());
            resp.setPetName(r.getPet().getName());
            resp.setPetSpecies(r.getPet().getSpecies());
        }
        if (r.getVeterinarian() != null) {
            resp.setVeterinarianId(r.getVeterinarian().getId());
            resp.setVeterinarianName(r.getVeterinarian().getName());
        }
        if (r.getConsultation() != null) {
            resp.setConsultationId(r.getConsultation().getId());
        }
        resp.setTitle(r.getTitle());
        resp.setRecordType(r.getRecordType());
        resp.setDiagnosis(r.getDiagnosis());
        resp.setClinicalNotes(r.getClinicalNotes());
        resp.setTreatmentSummary(r.getTreatmentSummary());
        resp.setCreatedAt(r.getCreatedAt());
        return resp;
    }
}

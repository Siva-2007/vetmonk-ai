package com.vetmonk.service;

import com.vetmonk.dto.MedicalDto;
import com.vetmonk.entity.*;
import com.vetmonk.exception.ResourceNotFoundException;
import com.vetmonk.exception.SecurityViolationException;
import com.vetmonk.repository.PetRepository;
import com.vetmonk.repository.UserRepository;
import com.vetmonk.repository.VaccinationRecordRepository;
import com.vetmonk.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class VaccinationService {

    private final VaccinationRecordRepository vaccinationRecordRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public VaccinationService(VaccinationRecordRepository vaccinationRecordRepository,
                              PetRepository petRepository,
                              UserRepository userRepository,
                              AuditService auditService) {
        this.vaccinationRecordRepository = vaccinationRecordRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public MedicalDto.VaccinationRecordResponse recordVaccination(MedicalDto.VaccinationRecordRequest request) {
        if (!SecurityUtils.isStaffMember()) {
            throw new SecurityViolationException("Access denied: Only clinical staff can record administered vaccinations.");
        }

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", request.getPetId()));

        User vet = userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null);

        VaccinationRecord record = new VaccinationRecord();
        record.setPet(pet);
        record.setVaccineName(request.getVaccineName().trim());
        record.setBatchNumber(request.getBatchNumber());
        record.setAdministeredDate(request.getAdministeredDate());
        record.setNextDueDate(request.getNextDueDate());
        record.setVeterinarian(vet);
        record.setNotes(request.getNotes());

        VaccinationRecord saved = vaccinationRecordRepository.save(record);

        auditService.logAction(SecurityUtils.getCurrentUserId(), SecurityUtils.getCurrentUserEmail(),
                "VACCINATION_RECORD", "VaccinationRecord", saved.getId().toString(), null, "SUCCESS",
                "Recorded vaccine " + saved.getVaccineName() + " for pet " + pet.getName());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MedicalDto.VaccinationRecordResponse> getPetVaccinations(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", petId));

        validatePetAccess(pet);

        return vaccinationRecordRepository.findByPetIdOrderByAdministeredDateDesc(petId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MedicalDto.VaccinationRecordResponse> getUpcomingVaccinationsForCurrentUser() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return vaccinationRecordRepository.findUpcomingForOwner(currentUserId, LocalDate.now()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MedicalDto.VaccinationRecordResponse> getOverdueVaccinationsForCurrentUser() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return vaccinationRecordRepository.findOverdueForOwner(currentUserId, LocalDate.now()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void validatePetAccess(Pet pet) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentUserRole = SecurityUtils.getCurrentUserRole();

        if (currentUserRole == Role.PET_OWNER && !pet.getOwner().getId().equals(currentUserId)) {
            throw new SecurityViolationException("Access denied: You cannot view vaccination records for pets you do not own.");
        }
    }

    public MedicalDto.VaccinationRecordResponse mapToResponse(VaccinationRecord v) {
        MedicalDto.VaccinationRecordResponse resp = new MedicalDto.VaccinationRecordResponse();
        resp.setId(v.getId());
        if (v.getPet() != null) {
            resp.setPetId(v.getPet().getId());
            resp.setPetName(v.getPet().getName());
            resp.setPetSpecies(v.getPet().getSpecies());
        }
        if (v.getVeterinarian() != null) {
            resp.setVeterinarianId(v.getVeterinarian().getId());
            resp.setVeterinarianName(v.getVeterinarian().getName());
        }
        resp.setVaccineName(v.getVaccineName());
        resp.setBatchNumber(v.getBatchNumber());
        resp.setAdministeredDate(v.getAdministeredDate());
        resp.setNextDueDate(v.getNextDueDate());
        resp.setNotes(v.getNotes());
        resp.setOverdue(v.getNextDueDate() != null && v.getNextDueDate().isBefore(LocalDate.now()));
        resp.setCreatedAt(v.getCreatedAt());
        return resp;
    }
}

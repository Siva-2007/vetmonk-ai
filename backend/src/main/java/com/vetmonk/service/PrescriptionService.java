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
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final ConsultationRepository consultationRepository;
    private final AuditService auditService;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                               PetRepository petRepository,
                               UserRepository userRepository,
                               MedicineRepository medicineRepository,
                               ConsultationRepository consultationRepository,
                               AuditService auditService) {
        this.prescriptionRepository = prescriptionRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.medicineRepository = medicineRepository;
        this.consultationRepository = consultationRepository;
        this.auditService = auditService;
    }

    @Transactional
    public MedicalDto.PrescriptionResponse createPrescription(MedicalDto.PrescriptionRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentUserRole = SecurityUtils.getCurrentUserRole();

        // STRICT SECURITY: AI or non-vets cannot create prescriptions
        if (currentUserRole != Role.VETERINARIAN && currentUserRole != Role.SUPER_ADMIN) {
            throw new SecurityViolationException("Access denied: Only licensed veterinarians can author prescriptions.");
        }

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", request.getPetId()));

        User vet = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        Medicine medicine = null;
        if (request.getMedicineId() != null) {
            medicine = medicineRepository.findById(request.getMedicineId()).orElse(null);
        }

        Consultation consultation = null;
        if (request.getConsultationId() != null) {
            consultation = consultationRepository.findById(request.getConsultationId()).orElse(null);
        }

        Prescription prescription = new Prescription();
        prescription.setPet(pet);
        prescription.setVeterinarian(vet);
        prescription.setConsultation(consultation);
        prescription.setMedicine(medicine);
        prescription.setMedicineName(request.getMedicineName().trim());
        prescription.setDosage(request.getDosage().trim());
        prescription.setFrequency(request.getFrequency().trim());
        prescription.setDuration(request.getDuration().trim());
        prescription.setInstructions(request.getInstructions());
        prescription.setNotes(request.getNotes());

        Prescription saved = prescriptionRepository.save(prescription);

        auditService.logAction(currentUserId, SecurityUtils.getCurrentUserEmail(),
                "PRESCRIPTION_CREATE", "Prescription", saved.getId().toString(), null, "SUCCESS",
                "Authored prescription: " + saved.getMedicineName() + " for pet " + pet.getName());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MedicalDto.PrescriptionResponse> getPetPrescriptions(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", petId));

        validatePetAccess(pet);

        return prescriptionRepository.findByPetIdOrderByCreatedAtDesc(petId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void validatePetAccess(Pet pet) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentUserRole = SecurityUtils.getCurrentUserRole();

        if (currentUserRole == Role.PET_OWNER && !pet.getOwner().getId().equals(currentUserId)) {
            throw new SecurityViolationException("Access denied: You cannot view prescriptions for pets you do not own.");
        }
    }

    public MedicalDto.PrescriptionResponse mapToResponse(Prescription p) {
        MedicalDto.PrescriptionResponse resp = new MedicalDto.PrescriptionResponse();
        resp.setId(p.getId());
        if (p.getPet() != null) {
            resp.setPetId(p.getPet().getId());
            resp.setPetName(p.getPet().getName());
        }
        if (p.getVeterinarian() != null) {
            resp.setVeterinarianId(p.getVeterinarian().getId());
            resp.setVeterinarianName(p.getVeterinarian().getName());
        }
        if (p.getConsultation() != null) {
            resp.setConsultationId(p.getConsultation().getId());
        }
        if (p.getMedicine() != null) {
            resp.setMedicineId(p.getMedicine().getId());
        }
        resp.setMedicineName(p.getMedicineName());
        resp.setDosage(p.getDosage());
        resp.setFrequency(p.getFrequency());
        resp.setDuration(p.getDuration());
        resp.setInstructions(p.getInstructions());
        resp.setNotes(p.getNotes());
        resp.setCreatedAt(p.getCreatedAt());
        return resp;
    }
}

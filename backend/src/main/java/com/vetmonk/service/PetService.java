package com.vetmonk.service;

import com.vetmonk.dto.PetDto;
import com.vetmonk.entity.Pet;
import com.vetmonk.entity.Role;
import com.vetmonk.entity.User;
import com.vetmonk.exception.ResourceNotFoundException;
import com.vetmonk.exception.SecurityViolationException;
import com.vetmonk.repository.PetRepository;
import com.vetmonk.repository.UserRepository;
import com.vetmonk.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public PetService(
            PetRepository petRepository,
            UserRepository userRepository,
            AuditService auditService) {

        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    // =========================================================
    // CREATE PET
    // =========================================================

    @Transactional
    public PetDto.PetResponse createPet(PetDto.PetRequest request) {

        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentUserRole = SecurityUtils.getCurrentUserRole();

        User owner;

        /*
         * PET_OWNER:
         * Always use the currently authenticated user.
         *
         * Staff:
         * Can specify ownerId.
         */
        if (currentUserRole == Role.PET_OWNER || request.getOwnerId() == null) {

            owner = userRepository.findById(currentUserId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "User",
                                    "id",
                                    currentUserId
                            ));

        } else {

            owner = userRepository.findById(request.getOwnerId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "User",
                                    "id",
                                    request.getOwnerId()
                            ));
        }

        Pet pet = new Pet();

        pet.setName(request.getName().trim());
        pet.setSpecies(request.getSpecies().trim());
        pet.setBreed(request.getBreed());
        pet.setDateOfBirth(request.getDateOfBirth());
        pet.setGender(request.getGender());
        pet.setWeight(request.getWeight());
        pet.setAllergies(request.getAllergies());
        pet.setExistingConditions(request.getExistingConditions());
        pet.setProfileImageReference(request.getProfileImageReference());
        pet.setOwner(owner);

        Pet saved = petRepository.save(pet);

        auditService.logAction(
                currentUserId,
                SecurityUtils.getCurrentUserEmail(),
                "PET_CREATE",
                "Pet",
                saved.getId().toString(),
                null,
                "SUCCESS",
                "Added pet: " + saved.getName()
        );

        return mapToResponse(saved);
    }


    // =========================================================
    // GET PET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public PetDto.PetResponse getPetById(Long id) {

        Pet pet = petRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Pet",
                                "id",
                                id
                        ));

        validatePetAccess(pet);

        return mapToResponse(pet);
    }


    // =========================================================
    // GET MY PETS
    // =========================================================

    @Transactional(readOnly = true)
    public List<PetDto.PetResponse> getMyPets() {

        Long currentUserId = SecurityUtils.getCurrentUserId();

        return petRepository.findByOwnerId(currentUserId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET PETS BY OWNER
    // =========================================================

    @Transactional(readOnly = true)
    public List<PetDto.PetResponse> getPetsByOwnerId(Long ownerId) {

        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role role = SecurityUtils.getCurrentUserRole();

        if (role == Role.PET_OWNER &&
                !currentUserId.equals(ownerId)) {

            throw new SecurityViolationException(
                    "Access denied: You cannot view other pet owners' profiles."
            );
        }

        return petRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // SEARCH PETS
    // =========================================================

    @Transactional(readOnly = true)
    public Page<PetDto.PetResponse> searchPets(
            String query,
            Pageable pageable) {

        if (!SecurityUtils.isStaffMember()) {

            throw new SecurityViolationException(
                    "Access denied: Pet search is restricted to staff members."
            );
        }

        if (query == null || query.trim().isEmpty()) {

            return petRepository
                    .findAll(pageable)
                    .map(this::mapToResponse);
        }

        return petRepository
                .searchPets(query.trim(), pageable)
                .map(this::mapToResponse);
    }


    // =========================================================
    // GET OWNER DETAILS
    // =========================================================
    /*
     * Returns owner information for a specific pet.
     *
     * Full Aadhaar is deliberately restricted to:
     * - CLINIC_ADMIN
     * - SUPER_ADMIN
     *
     * Veterinarians and Receptionists do not receive Aadhaar.
     */
    @Transactional(readOnly = true)
    public PetDto.OwnerDetailsResponse getOwnerDetails(Long petId) {

        Role currentRole = SecurityUtils.getCurrentUserRole();

        if (currentRole != Role.CLINIC_ADMIN &&
                currentRole != Role.SUPER_ADMIN) {

            throw new SecurityViolationException(
                    "Access denied: Only Clinic Admins and Super Admins can view Aadhaar details."
            );
        }

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Pet",
                                "id",
                                petId
                        ));

        User owner = pet.getOwner();

        if (owner == null) {

            throw new ResourceNotFoundException(
                    "Owner",
                    "petId",
                    petId
            );
        }

        PetDto.OwnerDetailsResponse response =
                new PetDto.OwnerDetailsResponse();

        response.setOwnerId(owner.getId());
        response.setOwnerName(owner.getName());
        response.setOwnerEmail(owner.getEmail());
        response.setOwnerPhone(owner.getPhone());
        response.setAadhaarNumber(owner.getAadhaarNumber());

        return response;
    }


    // =========================================================
    // UPDATE PET
    // =========================================================

    @Transactional
    public PetDto.PetResponse updatePet(
            Long id,
            PetDto.PetRequest request) {

        Pet pet = petRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Pet",
                                "id",
                                id
                        ));

        validatePetAccess(pet);

        pet.setName(request.getName().trim());
        pet.setSpecies(request.getSpecies().trim());
        pet.setBreed(request.getBreed());
        pet.setDateOfBirth(request.getDateOfBirth());
        pet.setGender(request.getGender());
        pet.setWeight(request.getWeight());
        pet.setAllergies(request.getAllergies());
        pet.setExistingConditions(request.getExistingConditions());

        if (request.getProfileImageReference() != null) {
            pet.setProfileImageReference(
                    request.getProfileImageReference()
            );
        }

        Pet updated = petRepository.save(pet);

        auditService.logAction(
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.getCurrentUserEmail(),
                "PET_UPDATE",
                "Pet",
                updated.getId().toString(),
                null,
                "SUCCESS",
                "Updated pet: " + updated.getName()
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // DELETE PET
    // =========================================================

    @Transactional
    public void deletePet(Long id) {

        Pet pet = petRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Pet",
                                "id",
                                id
                        ));

        validatePetAccess(pet);

        petRepository.delete(pet);

        auditService.logAction(
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.getCurrentUserEmail(),
                "PET_DELETE",
                "Pet",
                id.toString(),
                null,
                "SUCCESS",
                "Deleted pet: " + pet.getName()
        );
    }


    // =========================================================
    // VALIDATE PET ACCESS
    // =========================================================

    public void validatePetAccess(Pet pet) {

        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentUserRole = SecurityUtils.getCurrentUserRole();

        /*
         * PET_OWNER can only access their own pets.
         */
        if (currentUserRole == Role.PET_OWNER) {

            if (!pet.getOwner().getId().equals(currentUserId)) {

                throw new SecurityViolationException(
                        "Access denied: You do not have permission to access this pet's profile."
                );
            }
        }

        /*
         * VETERINARIAN
         * RECEPTIONIST
         * CLINIC_ADMIN
         * SUPER_ADMIN
         *
         * have authorized staff access.
         */
    }


    // =========================================================
    // MAP PET TO RESPONSE
    // =========================================================

    public PetDto.PetResponse mapToResponse(Pet pet) {

        PetDto.PetResponse resp =
                new PetDto.PetResponse();

        resp.setId(pet.getId());
        resp.setName(pet.getName());
        resp.setSpecies(pet.getSpecies());
        resp.setBreed(pet.getBreed());
        resp.setDateOfBirth(pet.getDateOfBirth());
        resp.setGender(pet.getGender());
        resp.setWeight(pet.getWeight());
        resp.setAllergies(pet.getAllergies());
        resp.setExistingConditions(
                pet.getExistingConditions()
        );
        resp.setProfileImageReference(
                pet.getProfileImageReference()
        );

        if (pet.getOwner() != null) {

            resp.setOwnerId(
                    pet.getOwner().getId()
            );

            resp.setOwnerName(
                    pet.getOwner().getName()
            );

            resp.setOwnerEmail(
                    pet.getOwner().getEmail()
            );

            resp.setOwnerPhone(
                    pet.getOwner().getPhone()
            );
        }

        resp.setCreatedAt(pet.getCreatedAt());
        resp.setUpdatedAt(pet.getUpdatedAt());

        return resp;
    }
}
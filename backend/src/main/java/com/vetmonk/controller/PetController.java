package com.vetmonk.controller;

import com.vetmonk.dto.PetDto;
import com.vetmonk.service.PetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
@Tag(
        name = "Pets",
        description = "Pet profile registration, medical background, and ownership access"
)
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    // =========================================================
    // REGISTER PET
    // =========================================================

    @PostMapping
    @Operation(summary = "Register a new pet")
    public ResponseEntity<PetDto.PetResponse> createPet(
            @Valid @RequestBody PetDto.PetRequest request) {

        PetDto.PetResponse response =
                petService.createPet(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }


    // =========================================================
    // GET MY PETS
    // =========================================================

    @GetMapping
    @Operation(summary = "Get pets owned by authenticated user")
    public ResponseEntity<List<PetDto.PetResponse>> getMyPets() {

        return ResponseEntity.ok(
                petService.getMyPets()
        );
    }


    // =========================================================
    // GET PET BY ID
    // =========================================================

    @GetMapping("/{id}")
    @Operation(
            summary = "Get pet details by ID with authorization verification"
    )
    public ResponseEntity<PetDto.PetResponse> getPetById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                petService.getPetById(id)
        );
    }


    // =========================================================
    // GET PETS BY OWNER
    // =========================================================

    @GetMapping("/owner/{ownerId}")
    @Operation(summary = "Get pets belonging to a specific owner")
    public ResponseEntity<List<PetDto.PetResponse>> getPetsByOwnerId(
            @PathVariable Long ownerId) {

        return ResponseEntity.ok(
                petService.getPetsByOwnerId(ownerId)
        );
    }


    // =========================================================
    // SEARCH PETS
    // =========================================================

    @GetMapping("/search")
    @Operation(
            summary = "Search pets by name, breed, or species (Staff only)"
    )
    public ResponseEntity<Page<PetDto.PetResponse>> searchPets(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<PetDto.PetResponse> results =
                petService.searchPets(
                        query,
                        PageRequest.of(
                                page,
                                size,
                                Sort.by("name").ascending()
                        )
                );

        return ResponseEntity.ok(results);
    }


    // =========================================================
    // OWNER DETAILS
    // =========================================================
    /*
     * Only Clinic Admin and Super Admin can view
     * the owner's full details including Aadhaar.
     */
    @GetMapping("/{id}/owner-details")
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN')")
    @Operation(
            summary = "Get owner details for a pet"
    )
    public ResponseEntity<PetDto.OwnerDetailsResponse> getOwnerDetails(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                petService.getOwnerDetails(id)
        );
    }


    // =========================================================
    // UPDATE PET
    // =========================================================

    @PutMapping("/{id}")
    @Operation(summary = "Update pet details")
    public ResponseEntity<PetDto.PetResponse> updatePet(
            @PathVariable Long id,
            @Valid @RequestBody PetDto.PetRequest request) {

        return ResponseEntity.ok(
                petService.updatePet(id, request)
        );
    }


    // =========================================================
    // DELETE PET
    // =========================================================

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete pet profile")
    public ResponseEntity<Void> deletePet(
            @PathVariable Long id) {

        petService.deletePet(id);

        return ResponseEntity.noContent().build();
    }
}
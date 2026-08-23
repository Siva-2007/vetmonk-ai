package com.vetmonk.controller;

import com.vetmonk.dto.VacancyDto;
import com.vetmonk.service.VacancyService;

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
@RequestMapping("/api/vacancies")
@Tag(
        name = "Clinic Vacancies",
        description = "Veterinary job openings and career recruitment"
)
public class VacancyController {

    private final VacancyService vacancyService;

    public VacancyController(VacancyService vacancyService) {
        this.vacancyService = vacancyService;
    }

    // =========================================================
    // PUBLIC
    // =========================================================

    @GetMapping
    @Operation(summary = "Get all open job vacancies")
    public ResponseEntity<List<VacancyDto.VacancyResponse>>
    getOpenVacancies() {

        return ResponseEntity.ok(
                vacancyService.getPublicOpenVacancies()
        );
    }

    @GetMapping("/paged")
    @Operation(summary = "Get open job vacancies paged")
    public ResponseEntity<Page<VacancyDto.VacancyResponse>>
    getOpenVacanciesPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                vacancyService.getPublicOpenVacanciesPaged(
                        PageRequest.of(
                                page,
                                size,
                                Sort.by("deadline").ascending()
                        )
                )
        );
    }

    @GetMapping("/clinic/{clinicId}")
    @Operation(summary = "Get vacancies for a clinic")
    public ResponseEntity<List<VacancyDto.VacancyResponse>>
    getClinicVacancies(
            @PathVariable Long clinicId) {

        return ResponseEntity.ok(
                vacancyService.getClinicVacancies(clinicId)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vacancy details")
    public ResponseEntity<VacancyDto.VacancyResponse>
    getVacancyById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                vacancyService.getVacancyById(id)
        );
    }

    // =========================================================
    // SUPER ADMIN ONLY
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create vacancy - Super Admin only")
    public ResponseEntity<VacancyDto.VacancyResponse>
    createVacancy(
            @Valid @RequestBody VacancyDto.VacancyRequest request) {

        VacancyDto.VacancyResponse response =
                vacancyService.createVacancy(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update vacancy - Super Admin only")
    public ResponseEntity<VacancyDto.VacancyResponse>
    updateVacancy(
            @PathVariable Long id,
            @Valid @RequestBody VacancyDto.VacancyRequest request) {

        return ResponseEntity.ok(
                vacancyService.updateVacancy(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete vacancy - Super Admin only")
    public ResponseEntity<Void> deleteVacancy(
            @PathVariable Long id) {

        vacancyService.deleteVacancy(id);

        return ResponseEntity.noContent().build();
    }
}
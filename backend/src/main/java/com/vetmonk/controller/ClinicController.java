package com.vetmonk.controller;

import com.vetmonk.dto.ClinicDto;
import com.vetmonk.service.ClinicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clinics")
@Tag(name = "Clinics", description = "Clinic information and administrative management")
public class ClinicController {

    private final ClinicService clinicService;

    public ClinicController(ClinicService clinicService) {
        this.clinicService = clinicService;
    }

    @GetMapping
    @Operation(summary = "Get all active clinics")
    public ResponseEntity<List<ClinicDto.ClinicResponse>> getAllClinics() {
        return ResponseEntity.ok(clinicService.getAllActiveClinics());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get clinic details by ID")
    public ResponseEntity<ClinicDto.ClinicResponse> getClinicById(@PathVariable Long id) {
        return ResponseEntity.ok(clinicService.getClinicById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create new clinic (Super Admin only)")
    public ResponseEntity<ClinicDto.ClinicResponse> createClinic(@Valid @RequestBody ClinicDto.ClinicRequest request) {
        ClinicDto.ClinicResponse response = clinicService.createClinic(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CLINIC_ADMIN')")
    @Operation(summary = "Update clinic details")
    public ResponseEntity<ClinicDto.ClinicResponse> updateClinic(@PathVariable Long id, @Valid @RequestBody ClinicDto.ClinicRequest request) {
        ClinicDto.ClinicResponse response = clinicService.updateClinic(id, request);
        return ResponseEntity.ok(response);
    }
}

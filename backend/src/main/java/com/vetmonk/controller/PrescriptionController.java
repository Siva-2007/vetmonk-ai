package com.vetmonk.controller;

import com.vetmonk.dto.MedicalDto;
import com.vetmonk.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@Tag(name = "Prescriptions", description = "Veterinarian prescription authoring and dosage records")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    @Operation(summary = "Create prescription (Veterinarians only)")
    public ResponseEntity<MedicalDto.PrescriptionResponse> createPrescription(@Valid @RequestBody MedicalDto.PrescriptionRequest request) {
        MedicalDto.PrescriptionResponse response = prescriptionService.createPrescription(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/pet/{petId}")
    @Operation(summary = "Get all prescriptions for a pet")
    public ResponseEntity<List<MedicalDto.PrescriptionResponse>> getPetPrescriptions(@PathVariable Long petId) {
        return ResponseEntity.ok(prescriptionService.getPetPrescriptions(petId));
    }
}

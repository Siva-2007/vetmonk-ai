package com.vetmonk.controller;

import com.vetmonk.dto.MedicalDto;
import com.vetmonk.service.MedicalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@Tag(name = "Medical Records", description = "Authorized clinical medical records and history")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping
    @Operation(summary = "Create medical record (Veterinarians only)")
    public ResponseEntity<MedicalDto.MedicalRecordResponse> createMedicalRecord(@Valid @RequestBody MedicalDto.MedicalRecordRequest request) {
        MedicalDto.MedicalRecordResponse response = medicalRecordService.createMedicalRecord(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/pet/{petId}")
    @Operation(summary = "Get all medical records for a pet")
    public ResponseEntity<List<MedicalDto.MedicalRecordResponse>> getPetMedicalRecords(@PathVariable Long petId) {
        return ResponseEntity.ok(medicalRecordService.getPetMedicalRecords(petId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get medical record by ID")
    public ResponseEntity<MedicalDto.MedicalRecordResponse> getMedicalRecordById(@PathVariable Long id) {
        return ResponseEntity.ok(medicalRecordService.getMedicalRecordById(id));
    }
}

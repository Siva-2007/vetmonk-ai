package com.vetmonk.controller;

import com.vetmonk.dto.MedicalDto;
import com.vetmonk.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@Tag(name = "Consultations", description = "Veterinarian clinical consultations, observations, and treatment plans")
public class ConsultationController {

    private final ConsultationService consultationService;

    public ConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @PostMapping
    @Operation(summary = "Create clinical consultation (Veterinarians only)")
    public ResponseEntity<MedicalDto.ConsultationResponse> createConsultation(@Valid @RequestBody MedicalDto.ConsultationRequest request) {
        MedicalDto.ConsultationResponse response = consultationService.createConsultation(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get consultation details by ID")
    public ResponseEntity<MedicalDto.ConsultationResponse> getConsultationById(@PathVariable Long id) {
        return ResponseEntity.ok(consultationService.getConsultationById(id));
    }

    @GetMapping("/pet/{petId}")
    @Operation(summary = "Get past consultations for a pet")
    public ResponseEntity<List<MedicalDto.ConsultationResponse>> getPetConsultations(@PathVariable Long petId) {
        return ResponseEntity.ok(consultationService.getPetConsultations(petId));
    }
}

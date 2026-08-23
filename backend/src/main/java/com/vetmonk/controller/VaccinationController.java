package com.vetmonk.controller;

import com.vetmonk.dto.MedicalDto;
import com.vetmonk.service.VaccinationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vaccinations")
@Tag(name = "Vaccinations", description = "Vaccine administration records, schedule tracking, and due date reminders")
public class VaccinationController {

    private final VaccinationService vaccinationService;

    public VaccinationController(VaccinationService vaccinationService) {
        this.vaccinationService = vaccinationService;
    }

    @PostMapping
    @Operation(summary = "Record administered vaccination (Staff only)")
    public ResponseEntity<MedicalDto.VaccinationRecordResponse> recordVaccination(@Valid @RequestBody MedicalDto.VaccinationRecordRequest request) {
        MedicalDto.VaccinationRecordResponse response = vaccinationService.recordVaccination(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/pet/{petId}")
    @Operation(summary = "Get vaccination history for a pet")
    public ResponseEntity<List<MedicalDto.VaccinationRecordResponse>> getPetVaccinations(@PathVariable Long petId) {
        return ResponseEntity.ok(vaccinationService.getPetVaccinations(petId));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming vaccination reminders for authenticated user's pets")
    public ResponseEntity<List<MedicalDto.VaccinationRecordResponse>> getUpcomingVaccinations() {
        return ResponseEntity.ok(vaccinationService.getUpcomingVaccinationsForCurrentUser());
    }

    @GetMapping("/overdue")
    @Operation(summary = "Get overdue vaccination alerts for authenticated user's pets")
    public ResponseEntity<List<MedicalDto.VaccinationRecordResponse>> getOverdueVaccinations() {
        return ResponseEntity.ok(vaccinationService.getOverdueVaccinationsForCurrentUser());
    }
}

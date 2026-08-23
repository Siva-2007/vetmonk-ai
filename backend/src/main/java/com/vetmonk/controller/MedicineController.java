package com.vetmonk.controller;

import com.vetmonk.dto.InventoryDto;
import com.vetmonk.service.MedicineService;
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
@RequestMapping("/api/medicines")
@Tag(name = "Medicines", description = "Veterinary pharmaceutical formulary and catalog")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @GetMapping
    @Operation(summary = "Get all medicines from catalog")
    public ResponseEntity<List<InventoryDto.MedicineResponse>> getAllMedicines() {
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    @GetMapping("/search")
    @Operation(summary = "Search medicine catalog (Paged)")
    public ResponseEntity<Page<InventoryDto.MedicineResponse>> searchMedicines(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(medicineService.searchMedicines(query, PageRequest.of(page, size, Sort.by("name").ascending())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get medicine details by ID")
    public ResponseEntity<InventoryDto.MedicineResponse> getMedicineById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getMedicineById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CLINIC_ADMIN', 'VETERINARIAN')")
    @Operation(summary = "Add new medicine to catalog")
    public ResponseEntity<InventoryDto.MedicineResponse> createMedicine(@Valid @RequestBody InventoryDto.MedicineRequest request) {
        InventoryDto.MedicineResponse response = medicineService.createMedicine(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}

package com.vetmonk.controller;

import com.vetmonk.dto.InventoryDto;
import com.vetmonk.service.InventoryService;
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
@RequestMapping("/api/inventory")
@Tag(name = "Inventory", description = "Clinic pharmacy stock, batch numbers, expiring medicines, and stock adjustments")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN', 'VETERINARIAN', 'RECEPTIONIST')")
    @Operation(summary = "Get all inventory items across clinics (or current user's clinic)")
    public ResponseEntity<List<InventoryDto.InventoryItemResponse>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN', 'VETERINARIAN', 'RECEPTIONIST')")
    @Operation(summary = "Get all low stock inventory items")
    public ResponseEntity<List<InventoryDto.InventoryItemResponse>> getAllLowStock() {
        return ResponseEntity.ok(inventoryService.getAllLowStockItems());
    }

    @GetMapping("/expiring-soon")
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN', 'VETERINARIAN', 'RECEPTIONIST')")
    @Operation(summary = "Get all expiring medicines")
    public ResponseEntity<List<InventoryDto.InventoryItemResponse>> getAllExpiring() {
        return ResponseEntity.ok(inventoryService.getAllExpiringSoonItems());
    }

    @GetMapping("/clinic/{clinicId}")
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN', 'VETERINARIAN', 'RECEPTIONIST')")
    @Operation(summary = "Get clinic inventory stock (List)")
    public ResponseEntity<List<InventoryDto.InventoryItemResponse>> getClinicInventory(@PathVariable Long clinicId) {
        return ResponseEntity.ok(inventoryService.getClinicInventory(clinicId));
    }

    @GetMapping("/clinic/{clinicId}/paged")
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN', 'VETERINARIAN', 'RECEPTIONIST')")
    @Operation(summary = "Get clinic inventory stock (Paged)")
    public ResponseEntity<Page<InventoryDto.InventoryItemResponse>> getClinicInventoryPaged(
            @PathVariable Long clinicId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(inventoryService.getClinicInventoryPaged(clinicId, PageRequest.of(page, size, Sort.by("expiryDate").ascending())));
    }

    @GetMapping("/clinic/{clinicId}/low-stock")
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN', 'VETERINARIAN', 'RECEPTIONIST')")
    @Operation(summary = "Get low stock inventory items for a clinic")
    public ResponseEntity<List<InventoryDto.InventoryItemResponse>> getLowStockItems(@PathVariable Long clinicId) {
        return ResponseEntity.ok(inventoryService.getLowStockItems(clinicId));
    }

    @GetMapping("/clinic/{clinicId}/expiring")
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN', 'VETERINARIAN', 'RECEPTIONIST')")
    @Operation(summary = "Get expiring medicines (within 45 days) for a clinic")
    public ResponseEntity<List<InventoryDto.InventoryItemResponse>> getExpiringItems(@PathVariable Long clinicId) {
        return ResponseEntity.ok(inventoryService.getExpiringItems(clinicId));
    }

    @GetMapping("/clinic/{clinicId}/summary")
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN', 'VETERINARIAN', 'RECEPTIONIST')")
    @Operation(summary = "Get summary metrics for inventory dashboard")
    public ResponseEntity<InventoryDto.InventorySummaryResponse> getInventorySummary(@PathVariable Long clinicId) {
        return ResponseEntity.ok(inventoryService.getInventorySummary(clinicId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN', 'VETERINARIAN', 'RECEPTIONIST')")
    @Operation(summary = "Add inventory batch to clinic pharmacy")
    public ResponseEntity<InventoryDto.InventoryItemResponse> addInventoryItem(@Valid @RequestBody InventoryDto.InventoryItemRequest request) {
        InventoryDto.InventoryItemResponse response = inventoryService.addInventoryItem(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/adjust")
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN', 'VETERINARIAN', 'RECEPTIONIST')")
    @Operation(summary = "Adjust inventory quantity (Dispense, Restock, or Discard)")
    public ResponseEntity<InventoryDto.InventoryItemResponse> adjustStock(
            @PathVariable Long id,
            @Valid @RequestBody InventoryDto.StockAdjustmentRequest request) {
        return ResponseEntity.ok(inventoryService.adjustStock(id, request));
    }
}

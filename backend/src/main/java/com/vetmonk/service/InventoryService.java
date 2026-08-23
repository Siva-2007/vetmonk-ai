package com.vetmonk.service;

import com.vetmonk.dto.InventoryDto;
import com.vetmonk.entity.Clinic;
import com.vetmonk.entity.InventoryItem;
import com.vetmonk.entity.Medicine;
import com.vetmonk.exception.BadRequestException;
import com.vetmonk.exception.ResourceNotFoundException;
import com.vetmonk.exception.SecurityViolationException;
import com.vetmonk.repository.ClinicRepository;
import com.vetmonk.repository.InventoryItemRepository;
import com.vetmonk.repository.MedicineRepository;
import com.vetmonk.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final ClinicRepository clinicRepository;
    private final MedicineRepository medicineRepository;
    private final AuditService auditService;

    public InventoryService(InventoryItemRepository inventoryItemRepository,
                            ClinicRepository clinicRepository,
                            MedicineRepository medicineRepository,
                            AuditService auditService) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.clinicRepository = clinicRepository;
        this.medicineRepository = medicineRepository;
        this.auditService = auditService;
    }

    @Transactional
    public InventoryDto.InventoryItemResponse addInventoryItem(InventoryDto.InventoryItemRequest request) {
        if (!SecurityUtils.isStaffMember()) {
            throw new SecurityViolationException("Access denied: Only clinic staff can manage inventory.");
        }

        Clinic clinic = clinicRepository.findById(request.getClinicId())
                .orElseThrow(() -> new ResourceNotFoundException("Clinic", "id", request.getClinicId()));

        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", request.getMedicineId()));

        if (request.getQuantity() < 0) {
            throw new BadRequestException("Initial quantity cannot be negative.");
        }

        InventoryItem item = new InventoryItem();
        item.setClinic(clinic);
        item.setMedicine(medicine);
        item.setBatchNumber(request.getBatchNumber().trim());
        item.setQuantity(request.getQuantity());
        item.setUnit(request.getUnit() != null ? request.getUnit() : "Pills");
        item.setMinThreshold(request.getMinThreshold() != null ? request.getMinThreshold() : 10);
        item.setUnitPrice(request.getUnitPrice() != null ? request.getUnitPrice() : 0.0);
        item.setExpiryDate(request.getExpiryDate());
        item.setSupplier(request.getSupplier());
        item.setPurchaseDate(request.getPurchaseDate() != null ? request.getPurchaseDate() : LocalDate.now());

        InventoryItem saved = inventoryItemRepository.save(item);

        auditService.logAction(SecurityUtils.getCurrentUserId(), SecurityUtils.getCurrentUserEmail(),
                "INVENTORY_ADD", "InventoryItem", saved.getId().toString(), null, "SUCCESS",
                "Added batch " + saved.getBatchNumber() + " of " + medicine.getName() + " (Qty: " + saved.getQuantity() + ")");

        return mapToResponse(saved);
    }

    @Transactional
    public InventoryDto.InventoryItemResponse adjustStock(Long itemId, InventoryDto.StockAdjustmentRequest request) {
        if (!SecurityUtils.isStaffMember()) {
            throw new SecurityViolationException("Access denied: Only clinic staff can adjust inventory stock.");
        }

        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", itemId));

        int newQuantity = item.getQuantity() + request.getDelta();
        if (newQuantity < 0) {
            throw new BadRequestException("Cannot adjust stock below zero. Current quantity is " + item.getQuantity() + ", requested reduction is " + Math.abs(request.getDelta()));
        }

        int previousQty = item.getQuantity();
        item.setQuantity(newQuantity);
        InventoryItem updated = inventoryItemRepository.save(item);

        auditService.logAction(SecurityUtils.getCurrentUserId(), SecurityUtils.getCurrentUserEmail(),
                "INVENTORY_ADJUST", "InventoryItem", updated.getId().toString(), null, "SUCCESS",
                "Adjusted stock for " + item.getMedicine().getName() + " from " + previousQty + " to " + newQuantity + " (Reason: " + request.getReason() + ")");

        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<InventoryDto.InventoryItemResponse> getClinicInventory(Long clinicId) {
        return inventoryItemRepository.findByClinicId(clinicId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<InventoryDto.InventoryItemResponse> getClinicInventoryPaged(Long clinicId, Pageable pageable) {
        return inventoryItemRepository.findByClinicId(clinicId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<InventoryDto.InventoryItemResponse> getLowStockItems(Long clinicId) {
        return inventoryItemRepository.findLowStockItems(clinicId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InventoryDto.InventoryItemResponse> getAllInventory() {
        return inventoryItemRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InventoryDto.InventoryItemResponse> getAllLowStockItems() {
        return inventoryItemRepository.findAllLowStock().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InventoryDto.InventoryItemResponse> getAllExpiringSoonItems() {
        LocalDate today = LocalDate.now();
        LocalDate target = today.plusDays(45);
        return inventoryItemRepository.findAllExpiringSoon(today, target).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InventoryDto.InventoryItemResponse> getExpiringItems(Long clinicId) {
        LocalDate today = LocalDate.now();
        LocalDate target = today.plusDays(45);
        return inventoryItemRepository.findExpiringSoonItems(clinicId, today, target).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InventoryDto.InventorySummaryResponse getInventorySummary(Long clinicId) {
        LocalDate today = LocalDate.now();
        LocalDate target = today.plusDays(30);

        List<InventoryItem> all = inventoryItemRepository.findByClinicId(clinicId);
        long total = all.size();
        long low = all.stream().filter(i -> i.getQuantity() <= i.getMinThreshold()).count();
        long expiring = all.stream().filter(i -> !i.getExpiryDate().isBefore(today) && !i.getExpiryDate().isAfter(target)).count();
        long expired = all.stream().filter(i -> i.getExpiryDate().isBefore(today)).count();

        return new InventoryDto.InventorySummaryResponse(total, low, expiring, expired);
    }

    public InventoryDto.InventoryItemResponse mapToResponse(InventoryItem i) {
        InventoryDto.InventoryItemResponse resp = new InventoryDto.InventoryItemResponse();
        resp.setId(i.getId());
        if (i.getClinic() != null) {
            resp.setClinicId(i.getClinic().getId());
            resp.setClinicName(i.getClinic().getName());
        }
        if (i.getMedicine() != null) {
            resp.setMedicineId(i.getMedicine().getId());
            resp.setMedicineName(i.getMedicine().getName());
            resp.setGenericName(i.getMedicine().getGenericName());
            resp.setCategory(i.getMedicine().getCategory());
        }
        resp.setBatchNumber(i.getBatchNumber());
        resp.setQuantity(i.getQuantity());
        resp.setUnit(i.getUnit());
        resp.setMinThreshold(i.getMinThreshold());
        resp.setUnitPrice(i.getUnitPrice());
        resp.setExpiryDate(i.getExpiryDate());
        resp.setSupplier(i.getSupplier());
        resp.setPurchaseDate(i.getPurchaseDate());
        resp.setLowStock(i.getQuantity() <= i.getMinThreshold());

        LocalDate today = LocalDate.now();
        resp.setExpired(i.getExpiryDate().isBefore(today));
        resp.setExpiringSoon(!i.getExpiryDate().isBefore(today) && !i.getExpiryDate().isAfter(today.plusDays(30)));
        resp.setUpdatedAt(i.getUpdatedAt());
        return resp;
    }
}

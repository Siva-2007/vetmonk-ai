package com.vetmonk.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class InventoryDto {

    // =========================================================
    // MEDICINE REQUEST
    // =========================================================

    public static class MedicineRequest {

        @NotBlank(message = "Medicine name is required")
        private String name;

        private String genericName;
        private String category;
        private String dosageForm;
        private String description;
        private String manufacturer;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getGenericName() {
            return genericName;
        }

        public void setGenericName(String genericName) {
            this.genericName = genericName;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getDosageForm() {
            return dosageForm;
        }

        public void setDosageForm(String dosageForm) {
            this.dosageForm = dosageForm;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getManufacturer() {
            return manufacturer;
        }

        public void setManufacturer(String manufacturer) {
            this.manufacturer = manufacturer;
        }
    }


    // =========================================================
    // MEDICINE RESPONSE
    // =========================================================

    public static class MedicineResponse {

        private Long id;
        private String name;
        private String genericName;
        private String category;
        private String dosageForm;
        private String description;
        private String manufacturer;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getGenericName() {
            return genericName;
        }

        public void setGenericName(String genericName) {
            this.genericName = genericName;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getDosageForm() {
            return dosageForm;
        }

        public void setDosageForm(String dosageForm) {
            this.dosageForm = dosageForm;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getManufacturer() {
            return manufacturer;
        }

        public void setManufacturer(String manufacturer) {
            this.manufacturer = manufacturer;
        }
    }


    // =========================================================
    // INVENTORY ITEM REQUEST
    // =========================================================

    public static class InventoryItemRequest {

        /*
         * IMPORTANT:
         * Clinic ID is still required.
         *
         * Do NOT remove this validation yet.
         * We need to check InventoryService to see whether
         * clinicId is obtained from the logged-in user.
         */
        @NotNull(message = "Clinic ID is required")
        private Long clinicId;

        @NotNull(message = "Medicine ID is required")
        private Long medicineId;

        @NotBlank(message = "Batch number is required")
        private String batchNumber;

        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity cannot be negative")
        private Integer quantity;

        private String unit = "Pills";

        /*
         * Frontend currently sends:
         * lowStockThreshold
         *
         * Backend internally uses:
         * minThreshold
         *
         * JsonAlias allows BOTH names.
         */
        @JsonAlias("lowStockThreshold")
        @Min(value = 0, message = "Min threshold cannot be negative")
        private Integer minThreshold = 10;

        /*
         * Frontend currently sends:
         * unitCost
         *
         * Backend internally uses:
         * unitPrice
         *
         * JsonAlias allows BOTH names.
         */
        @JsonAlias("unitCost")
        @Min(value = 0, message = "Unit price cannot be negative")
        private Double unitPrice = 0.0;

        @NotNull(message = "Expiry date is required")
        private LocalDate expiryDate;

        private String supplier;

        private LocalDate purchaseDate;


        // =====================================================
        // GETTERS & SETTERS
        // =====================================================

        public Long getClinicId() {
            return clinicId;
        }

        public void setClinicId(Long clinicId) {
            this.clinicId = clinicId;
        }

        public Long getMedicineId() {
            return medicineId;
        }

        public void setMedicineId(Long medicineId) {
            this.medicineId = medicineId;
        }

        public String getBatchNumber() {
            return batchNumber;
        }

        public void setBatchNumber(String batchNumber) {
            this.batchNumber = batchNumber;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public String getUnit() {
            return unit;
        }

        public void setUnit(String unit) {
            this.unit = unit;
        }

        public Integer getMinThreshold() {
            return minThreshold;
        }

        public void setMinThreshold(Integer minThreshold) {
            this.minThreshold = minThreshold;
        }

        public Double getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(Double unitPrice) {
            this.unitPrice = unitPrice;
        }

        public LocalDate getExpiryDate() {
            return expiryDate;
        }

        public void setExpiryDate(LocalDate expiryDate) {
            this.expiryDate = expiryDate;
        }

        public String getSupplier() {
            return supplier;
        }

        public void setSupplier(String supplier) {
            this.supplier = supplier;
        }

        public LocalDate getPurchaseDate() {
            return purchaseDate;
        }

        public void setPurchaseDate(LocalDate purchaseDate) {
            this.purchaseDate = purchaseDate;
        }
    }


    // =========================================================
    // STOCK ADJUSTMENT REQUEST
    // =========================================================

    public static class StockAdjustmentRequest {

        @NotNull(message = "Adjustment amount is required")
        private Integer delta;

        private String reason;


        public Integer getDelta() {
            return delta;
        }

        public void setDelta(Integer delta) {
            this.delta = delta;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }


    // =========================================================
    // INVENTORY ITEM RESPONSE
    // =========================================================

    public static class InventoryItemResponse {

        private Long id;
        private Long clinicId;
        private String clinicName;

        private Long medicineId;
        private String medicineName;
        private String genericName;
        private String category;

        private String batchNumber;
        private Integer quantity;
        private String unit;

        private Integer minThreshold;
        private Double unitPrice;

        private LocalDate expiryDate;
        private String supplier;
        private LocalDate purchaseDate;

        private boolean isLowStock;
        private boolean isExpiringSoon;
        private boolean isExpired;

        private LocalDateTime updatedAt;


        // =====================================================
        // GETTERS & SETTERS
        // =====================================================

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getClinicId() {
            return clinicId;
        }

        public void setClinicId(Long clinicId) {
            this.clinicId = clinicId;
        }

        public String getClinicName() {
            return clinicName;
        }

        public void setClinicName(String clinicName) {
            this.clinicName = clinicName;
        }

        public Long getMedicineId() {
            return medicineId;
        }

        public void setMedicineId(Long medicineId) {
            this.medicineId = medicineId;
        }

        public String getMedicineName() {
            return medicineName;
        }

        public void setMedicineName(String medicineName) {
            this.medicineName = medicineName;
        }

        public String getGenericName() {
            return genericName;
        }

        public void setGenericName(String genericName) {
            this.genericName = genericName;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getBatchNumber() {
            return batchNumber;
        }

        public void setBatchNumber(String batchNumber) {
            this.batchNumber = batchNumber;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public String getUnit() {
            return unit;
        }

        public void setUnit(String unit) {
            this.unit = unit;
        }

        public Integer getMinThreshold() {
            return minThreshold;
        }

        public void setMinThreshold(Integer minThreshold) {
            this.minThreshold = minThreshold;
        }

        public Double getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(Double unitPrice) {
            this.unitPrice = unitPrice;
        }

        public LocalDate getExpiryDate() {
            return expiryDate;
        }

        public void setExpiryDate(LocalDate expiryDate) {
            this.expiryDate = expiryDate;
        }

        public String getSupplier() {
            return supplier;
        }

        public void setSupplier(String supplier) {
            this.supplier = supplier;
        }

        public LocalDate getPurchaseDate() {
            return purchaseDate;
        }

        public void setPurchaseDate(LocalDate purchaseDate) {
            this.purchaseDate = purchaseDate;
        }

        public boolean isLowStock() {
            return isLowStock;
        }

        public void setLowStock(boolean lowStock) {
            isLowStock = lowStock;
        }

        public boolean isExpiringSoon() {
            return isExpiringSoon;
        }

        public void setExpiringSoon(boolean expiringSoon) {
            isExpiringSoon = expiringSoon;
        }

        public boolean isExpired() {
            return isExpired;
        }

        public void setExpired(boolean expired) {
            isExpired = expired;
        }

        public LocalDateTime getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
        }
    }


    // =========================================================
    // INVENTORY SUMMARY RESPONSE
    // =========================================================

    public static class InventorySummaryResponse {

        private long totalItems;
        private long lowStockCount;
        private long expiringSoonCount;
        private long expiredCount;

        public InventorySummaryResponse(
                long totalItems,
                long lowStockCount,
                long expiringSoonCount,
                long expiredCount
        ) {
            this.totalItems = totalItems;
            this.lowStockCount = lowStockCount;
            this.expiringSoonCount = expiringSoonCount;
            this.expiredCount = expiredCount;
        }

        public long getTotalItems() {
            return totalItems;
        }

        public long getLowStockCount() {
            return lowStockCount;
        }

        public long getExpiringSoonCount() {
            return expiringSoonCount;
        }

        public long getExpiredCount() {
            return expiredCount;
        }
    }
}
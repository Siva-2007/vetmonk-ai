package com.vetmonk.repository;

import com.vetmonk.entity.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByClinicId(Long clinicId);

    Page<InventoryItem> findByClinicId(Long clinicId, Pageable pageable);

    List<InventoryItem> findByClinicIdAndMedicineId(Long clinicId, Long medicineId);

    // Low stock: quantity <= minThreshold
    @Query("SELECT i FROM InventoryItem i WHERE i.clinic.id = :clinicId AND i.quantity <= i.minThreshold")
    List<InventoryItem> findLowStockItems(@Param("clinicId") Long clinicId);

    // Expiring soon: between today and targetDate (e.g. 30 days ahead)
    @Query("SELECT i FROM InventoryItem i WHERE i.clinic.id = :clinicId AND i.expiryDate >= :today AND i.expiryDate <= :targetDate")
    List<InventoryItem> findExpiringSoonItems(@Param("clinicId") Long clinicId, @Param("today") LocalDate today, @Param("targetDate") LocalDate targetDate);

    // Expired: expiryDate < today
    @Query("SELECT i FROM InventoryItem i WHERE i.clinic.id = :clinicId AND i.expiryDate < :today")
    List<InventoryItem> findExpiredItems(@Param("clinicId") Long clinicId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.clinic.id = :clinicId AND i.quantity <= i.minThreshold")
    long countLowStock(@Param("clinicId") Long clinicId);

    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.clinic.id = :clinicId AND i.expiryDate <= :targetDate")
    long countExpiringOrExpired(@Param("clinicId") Long clinicId, @Param("targetDate") LocalDate targetDate);

    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.minThreshold")
    List<InventoryItem> findAllLowStock();

    @Query("SELECT i FROM InventoryItem i WHERE i.expiryDate >= :today AND i.expiryDate <= :targetDate")
    List<InventoryItem> findAllExpiringSoon(@Param("today") LocalDate today, @Param("targetDate") LocalDate targetDate);
}

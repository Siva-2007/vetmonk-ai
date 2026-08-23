package com.vetmonk.repository;

import com.vetmonk.entity.VaccinationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VaccinationRecordRepository extends JpaRepository<VaccinationRecord, Long> {

    List<VaccinationRecord> findByPetIdOrderByAdministeredDateDesc(Long petId);

    // Find upcoming due vaccinations for pets of an owner
    @Query("SELECT v FROM VaccinationRecord v WHERE v.pet.owner.id = :ownerId AND v.nextDueDate >= :today ORDER BY v.nextDueDate ASC")
    List<VaccinationRecord> findUpcomingForOwner(@Param("ownerId") Long ownerId, @Param("today") LocalDate today);

    // Overdue vaccinations
    @Query("SELECT v FROM VaccinationRecord v WHERE v.pet.owner.id = :ownerId AND v.nextDueDate < :today ORDER BY v.nextDueDate DESC")
    List<VaccinationRecord> findOverdueForOwner(@Param("ownerId") Long ownerId, @Param("today") LocalDate today);
}

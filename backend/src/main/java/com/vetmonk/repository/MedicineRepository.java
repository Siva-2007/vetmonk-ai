package com.vetmonk.repository;

import com.vetmonk.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    Optional<Medicine> findByNameIgnoreCase(String name);

    Page<Medicine> findByNameContainingIgnoreCaseOrGenericNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(
            String name, String genericName, String category, Pageable pageable);
}

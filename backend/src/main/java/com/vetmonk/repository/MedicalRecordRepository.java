package com.vetmonk.repository;

import com.vetmonk.entity.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    List<MedicalRecord> findByPetIdOrderByCreatedAtDesc(Long petId);

    Page<MedicalRecord> findByPetId(Long petId, Pageable pageable);

    List<MedicalRecord> findByVeterinarianIdOrderByCreatedAtDesc(Long vetId);
}

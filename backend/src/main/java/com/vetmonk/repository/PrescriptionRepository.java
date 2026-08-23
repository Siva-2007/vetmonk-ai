package com.vetmonk.repository;

import com.vetmonk.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPetIdOrderByCreatedAtDesc(Long petId);

    List<Prescription> findByConsultationId(Long consultationId);

    List<Prescription> findByVeterinarianIdOrderByCreatedAtDesc(Long vetId);
}

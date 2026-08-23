package com.vetmonk.repository;

import com.vetmonk.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    Optional<Consultation> findByAppointmentId(Long appointmentId);

    List<Consultation> findByPetIdOrderByCreatedAtDesc(Long petId);

    List<Consultation> findByVeterinarianIdOrderByCreatedAtDesc(Long vetId);
}

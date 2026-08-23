package com.vetmonk.repository;

import com.vetmonk.entity.VacancyApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VacancyApplicationRepository
        extends JpaRepository<VacancyApplication, Long> {

    boolean existsByVacancyIdAndEmailIgnoreCase(
            Long vacancyId,
            String email
    );

    Optional<VacancyApplication> findByIdAndClinicId(
            Long id,
            Long clinicId
    );

    Page<VacancyApplication> findByClinicIdOrderByCreatedAtDesc(
            Long clinicId,
            Pageable pageable
    );

    Page<VacancyApplication> findByVacancyIdOrderByCreatedAtDesc(
            Long vacancyId,
            Pageable pageable
    );
}
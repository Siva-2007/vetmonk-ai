package com.vetmonk.repository;

import com.vetmonk.entity.Vacancy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VacancyRepository extends JpaRepository<Vacancy, Long> {

    List<Vacancy> findByClinicIdOrderByDeadlineAsc(Long clinicId);

    List<Vacancy> findByStatusOrderByDeadlineAsc(String status);

    Page<Vacancy> findByStatus(String status, Pageable pageable);
}

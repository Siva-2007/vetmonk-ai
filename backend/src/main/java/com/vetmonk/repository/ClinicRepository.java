package com.vetmonk.repository;

import com.vetmonk.entity.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClinicRepository extends JpaRepository<Clinic, Long> {
    List<Clinic> findByStatus(String status);
}

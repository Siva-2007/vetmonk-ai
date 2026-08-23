package com.vetmonk.repository;

import com.vetmonk.entity.Role;
import com.vetmonk.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByClinicId(Long clinicId);

    List<User> findByClinicIdAndRole(Long clinicId, Role role);

    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name,
            String email,
            Pageable pageable
    );
}
package com.vetmonk.repository;

import com.vetmonk.entity.Pet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {

    List<Pet> findByOwnerId(Long ownerId);

    Page<Pet> findByOwnerId(Long ownerId, Pageable pageable);

    @Query("SELECT p FROM Pet p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.breed) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.species) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Pet> searchPets(@Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Pet p WHERE p.owner.id = :ownerId AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.breed) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Pet> searchOwnerPets(@Param("ownerId") Long ownerId, @Param("search") String search);

    long countByOwnerId(Long ownerId);
}

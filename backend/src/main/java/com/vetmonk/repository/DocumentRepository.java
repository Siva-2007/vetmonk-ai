package com.vetmonk.repository;

import com.vetmonk.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByPetIdOrderByCreatedAtDesc(Long petId);

    List<Document> findByUploadedByIdOrderByCreatedAtDesc(Long uploadedById);

    Page<Document> findByUploadedById(Long uploadedById, Pageable pageable);

    Optional<Document> findByStoredFileName(String storedFileName);
}

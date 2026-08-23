package com.vetmonk.repository;

import com.vetmonk.entity.KnowledgeChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunk, Long> {

    List<KnowledgeChunk> findByCategory(String category);

    List<KnowledgeChunk> findByDocumentId(Long documentId);

    @Query("SELECT c FROM KnowledgeChunk c WHERE LOWER(c.content) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.keywords) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<KnowledgeChunk> searchChunksByKeyword(@Param("query") String query);
}

package com.vetmonk.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "knowledge_chunks", indexes = {
    @Index(name = "idx_chunk_category", columnList = "category")
})
public class KnowledgeChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "document_id", nullable = false)
    private KnowledgeDocument document;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(nullable = false, length = 4000)
    private String content;

    @Column(length = 1000)
    private String keywords; // comma-separated terms for indexing/scoring

    @Column(length = 100)
    private String category;

    public KnowledgeChunk() {
    }

    public KnowledgeChunk(KnowledgeDocument document, Integer chunkIndex, String content, String keywords, String category) {
        this.document = document;
        this.chunkIndex = chunkIndex;
        this.content = content;
        this.keywords = keywords;
        this.category = category;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public KnowledgeDocument getDocument() {
        return document;
    }

    public void setDocument(KnowledgeDocument document) {
        this.document = document;
    }

    public Integer getChunkIndex() {
        return chunkIndex;
    }

    public void setChunkIndex(Integer chunkIndex) {
        this.chunkIndex = chunkIndex;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}

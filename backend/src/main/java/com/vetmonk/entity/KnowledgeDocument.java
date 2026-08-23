package com.vetmonk.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_documents")
public class KnowledgeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 100)
    private String category; // PREVENTIVE_CARE, VACCINATION, NUTRITION, TERMINOLOGY, EMERGENCY_CARE, BEHAVIOR

    @Column(length = 200)
    private String source; // Veterinary Guidelines, WSAVA, AAHA

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public KnowledgeDocument() {
    }

    public KnowledgeDocument(String title, String category, String source) {
        this.title = title;
        this.category = category;
        this.source = source;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

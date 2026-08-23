package com.vetmonk.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_queries", indexes = {
    @Index(name = "idx_query_user", columnList = "user_id"),
    @Index(name = "idx_query_status", columnList = "status"),
    @Index(name = "idx_query_priority", columnList = "priority")
})
public class CustomerQuery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id")
    private Pet pet;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, length = 100)
    private String category; // APPOINTMENT, BILLING, MEDICAL_INQUIRY, GENERAL_PET_CARE, TECHNICAL

    @Column(nullable = false, length = 3000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QueryPriority priority = QueryPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QueryStatus status = QueryStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @Column(name = "resolution_notes", length = 3000)
    private String resolutionNotes;

    @Column(name = "ai_suggested_category")
    private String aiSuggestedCategory;

    @Column(name = "ai_suggested_priority")
    private String aiSuggestedPriority;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CustomerQuery() {
    }

    public CustomerQuery(User user, Pet pet, String subject, String category, String description, QueryPriority priority) {
        this.user = user;
        this.pet = pet;
        this.subject = subject;
        this.category = category;
        this.description = description;
        this.priority = priority;
        this.status = QueryStatus.OPEN;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Pet getPet() {
        return pet;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public QueryPriority getPriority() {
        return priority;
    }

    public void setPriority(QueryPriority priority) {
        this.priority = priority;
    }

    public QueryStatus getStatus() {
        return status;
    }

    public void setStatus(QueryStatus status) {
        this.status = status;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getAiSuggestedCategory() {
        return aiSuggestedCategory;
    }

    public void setAiSuggestedCategory(String aiSuggestedCategory) {
        this.aiSuggestedCategory = aiSuggestedCategory;
    }

    public String getAiSuggestedPriority() {
        return aiSuggestedPriority;
    }

    public void setAiSuggestedPriority(String aiSuggestedPriority) {
        this.aiSuggestedPriority = aiSuggestedPriority;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

package com.vetmonk.dto;

import com.vetmonk.entity.QueryPriority;
import com.vetmonk.entity.QueryStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class CustomerQueryDto {

    public static class CreateQueryRequest {
        private Long petId;

        @NotBlank(message = "Subject is required")
        private String subject;

        private String category = "GENERAL_PET_CARE";

        @NotBlank(message = "Description is required")
        private String description;

        private QueryPriority priority = QueryPriority.MEDIUM;

        public Long getPetId() { return petId; }
        public void setPetId(Long petId) { this.petId = petId; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public QueryPriority getPriority() { return priority; }
        public void setPriority(QueryPriority priority) { this.priority = priority; }
    }

    public static class UpdateQueryRequest {
        private QueryStatus status;
        private QueryPriority priority;
        private Long assignedToId;
        private String resolutionNotes;

        public QueryStatus getStatus() { return status; }
        public void setStatus(QueryStatus status) { this.status = status; }
        public QueryPriority getPriority() { return priority; }
        public void setPriority(QueryPriority priority) { this.priority = priority; }
        public Long getAssignedToId() { return assignedToId; }
        public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    }

    public static class CustomerQueryResponse {
        private Long id;
        private Long userId;
        private String userName;
        private String userEmail;
        private String userPhone;
        private Long petId;
        private String petName;
        private String petSpecies;
        private String subject;
        private String category;
        private String description;
        private QueryPriority priority;
        private QueryStatus status;
        private Long assignedToId;
        private String assignedToName;
        private String resolutionNotes;
        private String aiSuggestedCategory;
        private String aiSuggestedPriority;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getUserPhone() { return userPhone; }
        public void setUserPhone(String userPhone) { this.userPhone = userPhone; }
        public Long getPetId() { return petId; }
        public void setPetId(Long petId) { this.petId = petId; }
        public String getPetName() { return petName; }
        public void setPetName(String petName) { this.petName = petName; }
        public String getPetSpecies() { return petSpecies; }
        public void setPetSpecies(String petSpecies) { this.petSpecies = petSpecies; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public QueryPriority getPriority() { return priority; }
        public void setPriority(QueryPriority priority) { this.priority = priority; }
        public QueryStatus getStatus() { return status; }
        public void setStatus(QueryStatus status) { this.status = status; }
        public Long getAssignedToId() { return assignedToId; }
        public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
        public String getAssignedToName() { return assignedToName; }
        public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }
        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
        public String getAiSuggestedCategory() { return aiSuggestedCategory; }
        public void setAiSuggestedCategory(String aiSuggestedCategory) { this.aiSuggestedCategory = aiSuggestedCategory; }
        public String getAiSuggestedPriority() { return aiSuggestedPriority; }
        public void setAiSuggestedPriority(String aiSuggestedPriority) { this.aiSuggestedPriority = aiSuggestedPriority; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }
}

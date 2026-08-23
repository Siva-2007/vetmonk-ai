package com.vetmonk.dto;

import java.time.LocalDateTime;

public class DocumentDto {

    public static class DocumentResponse {
        private Long id;
        private Long petId;
        private String petName;
        private Long uploadedById;
        private String uploadedByName;
        private String originalFileName;
        private String contentType;
        private Long fileSize;
        private String documentType;
        private String extractedText;
        private String aiSummary;
        private boolean ocrProcessed;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getPetId() { return petId; }
        public void setPetId(Long petId) { this.petId = petId; }
        public String getPetName() { return petName; }
        public void setPetName(String petName) { this.petName = petName; }
        public Long getUploadedById() { return uploadedById; }
        public void setUploadedById(Long uploadedById) { this.uploadedById = uploadedById; }
        public String getUploadedByName() { return uploadedByName; }
        public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }
        public String getOriginalFileName() { return originalFileName; }
        public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }
        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
        public String getDocumentType() { return documentType; }
        public void setDocumentType(String documentType) { this.documentType = documentType; }
        public String getExtractedText() { return extractedText; }
        public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
        public String getAiSummary() { return aiSummary; }
        public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
        public boolean isOcrProcessed() { return ocrProcessed; }
        public void setOcrProcessed(boolean ocrProcessed) { this.ocrProcessed = ocrProcessed; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class DocumentOcrResult {
        private String text;
        private String summary;
        private boolean success;
        private String message;

        public DocumentOcrResult(String text, String summary, boolean success, String message) {
            this.text = text;
            this.summary = summary;
            this.success = success;
            this.message = message;
        }

        public String getText() { return text; }
        public String getSummary() { return summary; }
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }
}

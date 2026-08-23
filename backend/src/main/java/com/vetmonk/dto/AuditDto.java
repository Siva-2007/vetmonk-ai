package com.vetmonk.dto;

import java.time.LocalDateTime;

public class AuditDto {

    public static class AuditLogResponse {
        private Long id;
        private Long userId;
        private String userEmail;
        private String action;
        private String resourceType;
        private String resourceId;
        private String ipAddress;
        private String status;
        private String details;
        private LocalDateTime timestamp;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getResourceType() { return resourceType; }
        public void setResourceType(String resourceType) { this.resourceType = resourceType; }
        public String getResourceId() { return resourceId; }
        public void setResourceId(String resourceId) { this.resourceId = resourceId; }
        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
}

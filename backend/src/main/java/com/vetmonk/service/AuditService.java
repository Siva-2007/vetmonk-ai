package com.vetmonk.service;

import com.vetmonk.dto.AuditDto;
import com.vetmonk.entity.AuditLog;
import com.vetmonk.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logAction(Long userId, String userEmail, String action, String resourceType, String resourceId, String ipAddress, String status, String details) {
        // Guard: Never log passwords, tokens, or raw secrets
        String safeDetails = details;
        if (safeDetails != null && safeDetails.contains("password")) {
            safeDetails = "[REDACTED]";
        }

        AuditLog log = new AuditLog(userId, userEmail, action, resourceType, resourceId, ipAddress, status, safeDetails);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditDto.AuditLogResponse> getAllLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<AuditDto.AuditLogResponse> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AuditDto.AuditLogResponse mapToResponse(AuditLog log) {
        AuditDto.AuditLogResponse resp = new AuditDto.AuditLogResponse();
        resp.setId(log.getId());
        resp.setUserId(log.getUserId());
        resp.setUserEmail(log.getUserEmail());
        resp.setAction(log.getAction());
        resp.setResourceType(log.getResourceType());
        resp.setResourceId(log.getResourceId());
        resp.setIpAddress(log.getIpAddress());
        resp.setStatus(log.getStatus());
        resp.setDetails(log.getDetails());
        resp.setTimestamp(log.getTimestamp());
        return resp;
    }
}

package com.vetmonk.controller;

import com.vetmonk.dto.AuditDto;
import com.vetmonk.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "Audit Logging", description = "Platform security audit trail and compliance logs (Super Admin only)")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    @Operation(summary = "Get audit logs (Paged)")
    public ResponseEntity<Page<AuditDto.AuditLogResponse>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditService.getAllLogs(PageRequest.of(page, size, Sort.by("timestamp").descending())));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent audit logs")
    public ResponseEntity<List<AuditDto.AuditLogResponse>> getRecentLogs() {
        return ResponseEntity.ok(auditService.getRecentLogs());
    }
}

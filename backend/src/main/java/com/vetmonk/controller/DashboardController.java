package com.vetmonk.controller;

import com.vetmonk.dto.DashboardDto;
import com.vetmonk.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboards", description = "Role-based consolidated analytics and real-time operational statistics")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/pet-owner")
    @Operation(summary = "Get Pet Owner dashboard overview metrics")
    public ResponseEntity<DashboardDto.PetOwnerDashboardResponse> getPetOwnerDashboard() {
        return ResponseEntity.ok(dashboardService.getPetOwnerDashboard());
    }

    @GetMapping("/vet")
    @PreAuthorize("hasAnyRole('VETERINARIAN', 'SUPER_ADMIN')")
    @Operation(summary = "Get Veterinarian clinical dashboard metrics")
    public ResponseEntity<DashboardDto.VetDashboardResponse> getVetDashboard() {
        return ResponseEntity.ok(dashboardService.getVetDashboard());
    }

    @GetMapping("/receptionist")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'CLINIC_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get Receptionist front-desk dashboard metrics")
    public ResponseEntity<DashboardDto.ReceptionistDashboardResponse> getReceptionistDashboard(
            @RequestParam(required = false) Long clinicId) {
        return ResponseEntity.ok(dashboardService.getReceptionistDashboard(clinicId));
    }

    @GetMapping("/clinic-admin")
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get Clinic Administrator operations and pharmacy metrics")
    public ResponseEntity<DashboardDto.ClinicAdminDashboardResponse> getClinicAdminDashboard(
            @RequestParam(required = false) Long clinicId) {
        return ResponseEntity.ok(dashboardService.getClinicAdminDashboard(clinicId));
    }

    @GetMapping("/super-admin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get Super Administrator platform-wide metrics")
    public ResponseEntity<DashboardDto.SuperAdminDashboardResponse> getSuperAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getSuperAdminDashboard());
    }
}

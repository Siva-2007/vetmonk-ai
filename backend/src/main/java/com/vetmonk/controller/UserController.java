package com.vetmonk.controller;

import com.vetmonk.dto.AuthDto;
import com.vetmonk.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(
        name = "Users",
        description = "User administration and profile settings"
)
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // =========================================================
    // ALL USERS - SUPER ADMIN ONLY
    // Includes PET_OWNER + STAFF + SUPER_ADMIN
    // =========================================================

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get all platform users")
    public ResponseEntity<List<AuthDto.UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }

    // =========================================================
    // CLINIC STAFF ONLY
    // PET_OWNER IS NEVER RETURNED HERE
    // =========================================================

    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get clinic staff directory")
    public ResponseEntity<List<AuthDto.UserResponse>> getClinicStaff(
            @RequestParam(required = false) Long clinicId) {

        return ResponseEntity.ok(
                userService.getClinicStaff(clinicId)
        );
    }

    // =========================================================
    // CREATE STAFF
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('CLINIC_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Create a clinic staff user")
    public ResponseEntity<AuthDto.UserResponse> createStaffUser(
            @Valid
            @RequestBody
            AuthDto.CreateStaffUserRequest request) {

        AuthDto.UserResponse response =
                userService.createStaffUser(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }

    // =========================================================
    // GET VETERINARIANS
    // =========================================================

    @GetMapping("/veterinarians")
    @Operation(summary = "Get all veterinarians")
    public ResponseEntity<List<AuthDto.UserResponse>> getVeterinarians(
            @RequestParam(required = false) Long clinicId) {

        if (clinicId != null) {

            return ResponseEntity.ok(
                    userService.getVeterinariansByClinic(clinicId)
            );
        }

        return ResponseEntity.ok(
                userService.getAllVeterinarians()
        );
    }

    // =========================================================
    // GET USER BY ID
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CLINIC_ADMIN')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<AuthDto.UserResponse> getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userService.getUserById(id)
        );
    }

    // =========================================================
    // UPDATE LANGUAGE
    // =========================================================

    @PatchMapping("/{id}/language")
    @Operation(summary = "Update preferred interface language")
    public ResponseEntity<AuthDto.UserResponse> updateLanguage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String language =
                body.getOrDefault("language", "en");

        return ResponseEntity.ok(
                userService.updateUserLanguage(
                        id,
                        language
                )
        );
    }
}
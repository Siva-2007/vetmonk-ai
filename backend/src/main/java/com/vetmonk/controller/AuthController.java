package com.vetmonk.controller;

import com.vetmonk.dto.AuthDto;
import com.vetmonk.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration, login, token retrieval, and profile verification")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Public User Registration (Registers as Pet Owner)")
    public ResponseEntity<AuthDto.AuthResponse> register(@Valid @RequestBody AuthDto.RegisterRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        AuthDto.AuthResponse response = authService.register(request, ip);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "User Login and JWT issuance")
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        AuthDto.AuthResponse response = authService.login(request, ip);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<AuthDto.UserResponse> getCurrentUser() {
        AuthDto.UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/staff")
    @Operation(summary = "Create staff user (Veterinarian, Receptionist, Clinic Admin)")
    public ResponseEntity<AuthDto.UserResponse> createStaff(@Valid @RequestBody AuthDto.CreateStaffUserRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        AuthDto.UserResponse response = authService.createStaffUser(request, ip);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}

package com.vetmonk.dto;

import com.vetmonk.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class AuthDto {

    // =========================================================
    // PET OWNER REGISTRATION
    // =========================================================

    public static class RegisterRequest {

        @NotBlank(message = "Name is required")
        @Size(
                min = 2,
                max = 100,
                message = "Name must be between 2 and 100 characters"
        )
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(
                min = 6,
                max = 100,
                message = "Password must be at least 6 characters"
        )
        private String password;

        private String phone;

        private String preferredLanguage = "en";

        /*
         * Aadhaar is stored as String because it is an identifier.
         * No Aadhaar verification is performed here.
         */
        @Size(
                min = 12,
                max = 12,
                message = "Aadhaar number must contain exactly 12 digits"
        )
        private String aadhaarNumber;

        /*
         * SECURITY:
         * Public registration always creates PET_OWNER.
         * This field is retained for compatibility, but the
         * backend must ignore any role supplied by the client.
         */
        private String role;

        // -----------------------------------------------------
        // Getters and Setters
        // -----------------------------------------------------

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getPreferredLanguage() {
            return preferredLanguage;
        }

        public void setPreferredLanguage(String preferredLanguage) {
            this.preferredLanguage = preferredLanguage;
        }

        public String getAadhaarNumber() {
            return aadhaarNumber;
        }

        public void setAadhaarNumber(String aadhaarNumber) {
            this.aadhaarNumber = aadhaarNumber;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }


    // =========================================================
    // LOGIN
    // =========================================================

    public static class LoginRequest {

        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        /*
         * These two fields are used only for Hospital Staff Login.
         *
         * Pet Owner Login sends only:
         *
         * {
         *     "email": "...",
         *     "password": "..."
         * }
         *
         * Hospital Login sends:
         *
         * {
         *     "email": "...",
         *     "password": "...",
         *     "clinicId": 1,
         *     "role": "VETERINARIAN"
         * }
         *
         * IMPORTANT:
         * The backend NEVER trusts these values.
         * It compares them with the authenticated user's
         * actual role and clinicId from the database.
         */

        private Long clinicId;

        private Role role;

        // -----------------------------------------------------
        // Getters and Setters
        // -----------------------------------------------------

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public Long getClinicId() {
            return clinicId;
        }

        public void setClinicId(Long clinicId) {
            this.clinicId = clinicId;
        }

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }
    }


    // =========================================================
    // AUTH RESPONSE
    // =========================================================

    public static class AuthResponse {

        private String token;
        private String type = "Bearer";
        private Long id;
        private String name;
        private String email;
        private Role role;
        private String preferredLanguage;
        private Long clinicId;

        public AuthResponse(
                String token,
                Long id,
                String name,
                String email,
                Role role,
                String preferredLanguage,
                Long clinicId
        ) {
            this.token = token;
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
            this.preferredLanguage = preferredLanguage;
            this.clinicId = clinicId;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }

        public String getPreferredLanguage() {
            return preferredLanguage;
        }

        public void setPreferredLanguage(String preferredLanguage) {
            this.preferredLanguage = preferredLanguage;
        }

        public Long getClinicId() {
            return clinicId;
        }

        public void setClinicId(Long clinicId) {
            this.clinicId = clinicId;
        }
    }


    // =========================================================
    // NORMAL USER RESPONSE
    // =========================================================

    public static class UserResponse {

        private Long id;
        private String name;
        private String email;
        private String phone;
        private Role role;
        private String preferredLanguage;
        private Long clinicId;
        private boolean enabled;
        private LocalDateTime createdAt;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }

        public String getPreferredLanguage() {
            return preferredLanguage;
        }

        public void setPreferredLanguage(String preferredLanguage) {
            this.preferredLanguage = preferredLanguage;
        }

        public Long getClinicId() {
            return clinicId;
        }

        public void setClinicId(Long clinicId) {
            this.clinicId = clinicId;
        }

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }


    // =========================================================
    // PET OWNER RESPONSE
    // =========================================================

    public static class PetOwnerResponse {

        private Long id;
        private String name;
        private String email;
        private String phone;

        private String aadhaarNumber;

        private String preferredLanguage;
        private boolean enabled;
        private LocalDateTime createdAt;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getAadhaarNumber() {
            return aadhaarNumber;
        }

        public void setAadhaarNumber(String aadhaarNumber) {
            this.aadhaarNumber = aadhaarNumber;
        }

        public String getPreferredLanguage() {
            return preferredLanguage;
        }

        public void setPreferredLanguage(String preferredLanguage) {
            this.preferredLanguage = preferredLanguage;
        }

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }


    // =========================================================
    // CREATE STAFF USER
    // =========================================================

    public static class CreateStaffUserRequest {

        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(
                min = 6,
                message = "Password must be at least 6 characters"
        )
        private String password;

        private String phone;

        private Role role;

        private Long clinicId;

        private String preferredLanguage = "en";

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }

        public Long getClinicId() {
            return clinicId;
        }

        public void setClinicId(Long clinicId) {
            this.clinicId = clinicId;
        }

        public String getPreferredLanguage() {
            return preferredLanguage;
        }

        public void setPreferredLanguage(String preferredLanguage) {
            this.preferredLanguage = preferredLanguage;
        }
    }
}
package com.vetmonk.service;

import com.vetmonk.dto.AuthDto;
import com.vetmonk.entity.Role;
import com.vetmonk.entity.User;
import com.vetmonk.exception.BadRequestException;
import com.vetmonk.exception.ResourceNotFoundException;
import com.vetmonk.exception.SecurityViolationException;
import com.vetmonk.repository.UserRepository;
import com.vetmonk.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================================================
    // GET ALL USERS - SUPER ADMIN
    // Includes PET_OWNER + STAFF + SUPER_ADMIN
    // =========================================================

    @Transactional(readOnly = true)
    public List<AuthDto.UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET CLINIC STAFF
    // ONLY STAFF - NEVER PET OWNERS
    // =========================================================

    @Transactional(readOnly = true)
    public List<AuthDto.UserResponse> getClinicStaff(Long clinicId) {

        List<User> users;

        if (clinicId != null) {
            users = userRepository.findByClinicId(clinicId);
        } else {
            users = userRepository.findAll();
        }

        return users.stream()
                .filter(user ->
                        user.getRole() == Role.VETERINARIAN ||
                        user.getRole() == Role.RECEPTIONIST ||
                        user.getRole() == Role.CLINIC_ADMIN
                )
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // CREATE STAFF USER
    // =========================================================

    @Transactional
    public AuthDto.UserResponse createStaffUser(
            AuthDto.CreateStaffUserRequest request) {

        if (!SecurityUtils.isClinicAdmin()
                && !SecurityUtils.isSuperAdmin()) {

            throw new SecurityViolationException(
                    "Access denied: Only clinic administrators can create staff users."
            );
        }

        if (request.getRole() == null) {
            throw new BadRequestException(
                    "Staff role is required."
            );
        }

        if (request.getRole() != Role.VETERINARIAN
                && request.getRole() != Role.RECEPTIONIST
                && request.getRole() != Role.CLINIC_ADMIN) {

            throw new BadRequestException(
                    "Only VETERINARIAN, RECEPTIONIST, or CLINIC_ADMIN users can be created here."
            );
        }

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException(
                    "A user with this email already exists."
            );
        }

        Long clinicId = request.getClinicId();

        if (clinicId == null && !SecurityUtils.isSuperAdmin()) {
            clinicId = SecurityUtils
                    .getCurrentUser()
                    .getClinicId();
        }

        if (clinicId == null) {
            throw new BadRequestException(
                    "Clinic ID is required when creating a staff user."
            );
        }

        User user = new User();

        user.setName(request.getName().trim());
        user.setEmail(email);

        // Never store raw password
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setClinicId(clinicId);

        user.setPreferredLanguage(
                request.getPreferredLanguage() != null
                        ? request.getPreferredLanguage()
                        : "en"
        );

        user.setEnabled(true);

        User saved = userRepository.save(user);

        return mapToResponse(saved);
    }

    // =========================================================
    // GET VETERINARIANS BY CLINIC
    // =========================================================

    @Transactional(readOnly = true)
    public List<AuthDto.UserResponse> getVeterinariansByClinic(
            Long clinicId) {

        return userRepository
                .findByClinicIdAndRole(
                        clinicId,
                        Role.VETERINARIAN
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET ALL VETERINARIANS
    // =========================================================

    @Transactional(readOnly = true)
    public List<AuthDto.UserResponse> getAllVeterinarians() {

        return userRepository
                .findByRole(Role.VETERINARIAN)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET USER BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public AuthDto.UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User",
                                "id",
                                id
                        )
                );

        return mapToResponse(user);
    }

    // =========================================================
    // UPDATE LANGUAGE
    // =========================================================

    @Transactional
    public AuthDto.UserResponse updateUserLanguage(
            Long userId,
            String language) {

        Long currentUserId =
                SecurityUtils.getCurrentUserId();

        if (!currentUserId.equals(userId)
                && !SecurityUtils.isSuperAdmin()) {

            throw new SecurityViolationException(
                    "Access denied: You can only update your own language."
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User",
                                "id",
                                userId
                        )
                );

        user.setPreferredLanguage(language);

        User updated = userRepository.save(user);

        return mapToResponse(updated);
    }

    // =========================================================
    // ENTITY -> DTO
    // =========================================================

    private AuthDto.UserResponse mapToResponse(User user) {

        AuthDto.UserResponse resp =
                new AuthDto.UserResponse();

        resp.setId(user.getId());
        resp.setName(user.getName());
        resp.setEmail(user.getEmail());
        resp.setPhone(user.getPhone());
        resp.setRole(user.getRole());
        resp.setPreferredLanguage(user.getPreferredLanguage());
        resp.setClinicId(user.getClinicId());
        resp.setEnabled(user.isEnabled());
        resp.setCreatedAt(user.getCreatedAt());

        return resp;
    }
}
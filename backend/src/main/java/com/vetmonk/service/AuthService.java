package com.vetmonk.service;

import com.vetmonk.dto.AuthDto;
import com.vetmonk.entity.Role;
import com.vetmonk.entity.User;
import com.vetmonk.exception.BadRequestException;
import com.vetmonk.repository.UserRepository;
import com.vetmonk.security.JwtTokenProvider;
import com.vetmonk.security.SecurityUtils;
import com.vetmonk.security.UserPrincipal;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditService auditService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.auditService = auditService;
    }


    // =========================================================
    // REGISTER PET OWNER
    // =========================================================

    @Transactional
    public AuthDto.AuthResponse register(
            AuthDto.RegisterRequest request,
            String ipAddress
    ) {

        String email = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {

            auditService.logAction(
                    null,
                    request.getEmail(),
                    "REGISTER_FAILURE",
                    "User",
                    null,
                    ipAddress,
                    "FAILURE",
                    "Email already exists"
            );

            throw new BadRequestException(
                    "An account with this email address already exists."
            );
        }


        User user = new User();

        user.setName(request.getName().trim());

        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setPhone(
                request.getPhone() != null
                        ? request.getPhone().trim()
                        : null
        );


        // =====================================================
        // AADHAAR
        // =====================================================

        user.setAadhaarNumber(
                request.getAadhaarNumber() != null
                        ? request.getAadhaarNumber().trim()
                        : null
        );


        // =====================================================
        // LANGUAGE
        // =====================================================

        user.setPreferredLanguage(
                request.getPreferredLanguage() != null
                        ? request.getPreferredLanguage()
                        : "en"
        );


        // =====================================================
        // SECURITY
        // =====================================================

        /*
         * Public registration can NEVER create a staff account.
         *
         * Even if somebody sends:
         *
         * {
         *   "role": "SUPER_ADMIN"
         * }
         *
         * it will be ignored.
         */

        user.setRole(Role.PET_OWNER);

        user.setClinicId(null);

        user.setEnabled(true);


        User savedUser = userRepository.save(user);


        // =====================================================
        // AUDIT
        // =====================================================

        auditService.logAction(
                savedUser.getId(),
                savedUser.getEmail(),
                "REGISTER_SUCCESS",
                "User",
                savedUser.getId().toString(),
                ipAddress,
                "SUCCESS",
                "New pet owner account registered"
        );


        // =====================================================
        // JWT
        // =====================================================

        String token =
                jwtTokenProvider.generateTokenFromUser(
                        savedUser.getId(),
                        savedUser.getEmail(),
                        savedUser.getRole().name(),
                        savedUser.getName()
                );


        return new AuthDto.AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getPreferredLanguage(),
                savedUser.getClinicId()
        );
    }


    // =========================================================
    // LOGIN
    // =========================================================

    public AuthDto.AuthResponse login(
            AuthDto.LoginRequest request,
            String ipAddress
    ) {

        try {

            // =================================================
            // STEP 1
            // Authenticate email + password
            // =================================================

            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.getEmail().toLowerCase().trim(),
                                    request.getPassword()
                            )
                    );


            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);


            UserPrincipal userPrincipal =
                    (UserPrincipal) authentication.getPrincipal();


            // =================================================
            // STEP 2
            // Determine whether this is Hospital Login
            // =================================================

            boolean hospitalLogin =
                    request.getClinicId() != null
                            || request.getRole() != null;


            if (hospitalLogin) {

                // =============================================
                // Both hospital and role are required
                // =============================================

                if (request.getClinicId() == null
                        || request.getRole() == null) {

                    auditService.logAction(
                            userPrincipal.getId(),
                            userPrincipal.getEmail(),
                            "LOGIN_FAILURE",
                            "Auth",
                            userPrincipal.getId().toString(),
                            ipAddress,
                            "FAILURE",
                            "Incomplete hospital login information"
                    );

                    throw new BadRequestException(
                            "Please select a hospital and role"
                    );
                }


                // =============================================
                // Super Admin is platform-wide
                // =============================================

                if (userPrincipal.getRole() == Role.SUPER_ADMIN) {

                    auditService.logAction(
                            userPrincipal.getId(),
                            userPrincipal.getEmail(),
                            "LOGIN_FAILURE",
                            "Auth",
                            userPrincipal.getId().toString(),
                            ipAddress,
                            "FAILURE",
                            "Super Admin attempted hospital login"
                    );

                    throw new BadRequestException(
                            "Super Admin must use the Super Admin login"
                    );
                }


                // =============================================
                // Only hospital staff can use hospital login
                // =============================================

                if (userPrincipal.getRole() != Role.VETERINARIAN
                        && userPrincipal.getRole() != Role.RECEPTIONIST
                        && userPrincipal.getRole() != Role.CLINIC_ADMIN) {

                    auditService.logAction(
                            userPrincipal.getId(),
                            userPrincipal.getEmail(),
                            "LOGIN_FAILURE",
                            "Auth",
                            userPrincipal.getId().toString(),
                            ipAddress,
                            "FAILURE",
                            "Non-staff account attempted hospital login"
                    );

                    throw new BadRequestException(
                            "This account is not a hospital staff account"
                    );
                }


                // =============================================
                // SECURITY CHECK #1
                // Actual role vs selected role
                // =============================================

                if (userPrincipal.getRole() != request.getRole()) {

                    auditService.logAction(
                            userPrincipal.getId(),
                            userPrincipal.getEmail(),
                            "LOGIN_FAILURE",
                            "Auth",
                            userPrincipal.getId().toString(),
                            ipAddress,
                            "FAILURE",
                            "Hospital login role mismatch"
                    );

                    throw new BadRequestException(
                            "Selected role does not match this account"
                    );
                }


                // =============================================
                // SECURITY CHECK #2
                // Actual clinic vs selected clinic
                // =============================================

                if (userPrincipal.getClinicId() == null
                        || !userPrincipal.getClinicId()
                        .equals(request.getClinicId())) {

                    auditService.logAction(
                            userPrincipal.getId(),
                            userPrincipal.getEmail(),
                            "LOGIN_FAILURE",
                            "Auth",
                            userPrincipal.getId().toString(),
                            ipAddress,
                            "FAILURE",
                            "Hospital selection does not match this account"
                    );

                    throw new BadRequestException(
                            "Selected hospital does not match this account"
                    );
                }
            }


            // =================================================
            // STEP 3
            // Generate JWT
            // =================================================

            String jwt =
                    jwtTokenProvider.generateToken(authentication);


            // =================================================
            // STEP 4
            // Audit successful login
            // =================================================

            auditService.logAction(
                    userPrincipal.getId(),
                    userPrincipal.getEmail(),
                    "LOGIN_SUCCESS",
                    "Auth",
                    userPrincipal.getId().toString(),
                    ipAddress,
                    "SUCCESS",
                    "User logged in successfully"
            );


            // =================================================
            // STEP 5
            // Return authenticated user
            // =================================================

            return new AuthDto.AuthResponse(
                    jwt,
                    userPrincipal.getId(),
                    userPrincipal.getName(),
                    userPrincipal.getEmail(),
                    userPrincipal.getRole(),
                    userPrincipal.getPreferredLanguage(),
                    userPrincipal.getClinicId()
            );

        } catch (BadRequestException ex) {

            throw ex;

        } catch (Exception ex) {

            auditService.logAction(
                    null,
                    request.getEmail(),
                    "LOGIN_FAILURE",
                    "Auth",
                    null,
                    ipAddress,
                    "FAILURE",
                    "Invalid credentials"
            );

            throw ex;
        }
    }


    // =========================================================
    // GET CURRENT USER
    // =========================================================

    @Transactional(readOnly = true)
    public AuthDto.UserResponse getCurrentUser() {

        UserPrincipal principal =
                SecurityUtils.getCurrentUser();

        User user =
                userRepository.findById(principal.getId())
                        .orElseThrow(
                                () -> new BadRequestException(
                                        "User not found"
                                )
                        );

        return mapToUserResponse(user);
    }


    // =========================================================
    // CREATE STAFF USER
    // =========================================================

    @Transactional
    public AuthDto.UserResponse createStaffUser(
            AuthDto.CreateStaffUserRequest request,
            String ipAddress
    ) {

        // =====================================================
        // SECURITY
        // =====================================================

        if (!SecurityUtils.isSuperAdmin()
                && !SecurityUtils.isClinicAdmin()) {

            throw new BadRequestException(
                    "Only Super Admins or Clinic Admins can create staff accounts"
            );
        }


        String email =
                request.getEmail().toLowerCase().trim();


        if (userRepository.existsByEmail(email)) {

            throw new BadRequestException(
                    "Email address already registered"
            );
        }


        // =====================================================
        // CREATE USER
        // =====================================================

        User user = new User();

        user.setName(
                request.getName().trim()
        );

        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setPhone(
                request.getPhone() != null
                        ? request.getPhone().trim()
                        : null
        );


        user.setRole(
                request.getRole() != null
                        ? request.getRole()
                        : Role.VETERINARIAN
        );


        user.setClinicId(
                request.getClinicId()
        );


        user.setPreferredLanguage(
                request.getPreferredLanguage() != null
                        ? request.getPreferredLanguage()
                        : "en"
        );


        user.setEnabled(true);


        User savedUser =
                userRepository.save(user);


        // =====================================================
        // AUDIT
        // =====================================================

        auditService.logAction(
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.getCurrentUserEmail(),
                "STAFF_CREATE",
                "User",
                savedUser.getId().toString(),
                ipAddress,
                "SUCCESS",
                "Created staff user with role "
                        + savedUser.getRole()
        );


        return mapToUserResponse(savedUser);
    }


    // =========================================================
    // USER RESPONSE MAPPER
    // =========================================================

    private AuthDto.UserResponse mapToUserResponse(User user) {

        AuthDto.UserResponse resp =
                new AuthDto.UserResponse();

        resp.setId(
                user.getId()
        );

        resp.setName(
                user.getName()
        );

        resp.setEmail(
                user.getEmail()
        );

        resp.setPhone(
                user.getPhone()
        );

        resp.setRole(
                user.getRole()
        );

        resp.setPreferredLanguage(
                user.getPreferredLanguage()
        );

        resp.setClinicId(
                user.getClinicId()
        );

        resp.setEnabled(
                user.isEnabled()
        );

        resp.setCreatedAt(
                user.getCreatedAt()
        );

        /*
         * Aadhaar is intentionally not included
         * in UserResponse.
         */

        return resp;
    }
}
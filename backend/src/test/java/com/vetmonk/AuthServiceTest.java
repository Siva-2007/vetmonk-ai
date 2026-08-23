package com.vetmonk;

import com.vetmonk.dto.AuthDto;
import com.vetmonk.entity.Role;
import com.vetmonk.entity.User;
import com.vetmonk.exception.BadRequestException;
import com.vetmonk.repository.UserRepository;
import com.vetmonk.security.JwtTokenProvider;
import com.vetmonk.service.AuditService;
import com.vetmonk.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthService authService;

    private AuthDto.RegisterRequest registerRequest;
    private AuthDto.LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new AuthDto.RegisterRequest();
        registerRequest.setName("Test Owner");
        registerRequest.setEmail("owner@test.com");
        registerRequest.setPassword("Secret@123");
        registerRequest.setPhone("+1234567890");

        loginRequest = new AuthDto.LoginRequest();
        loginRequest.setEmail("owner@test.com");
        loginRequest.setPassword("Secret@123");
    }

    @Test
    @DisplayName("Registration succeeds and securely enforces PET_OWNER role even if client passes SUPER_ADMIN")
    void testRegisterEnforcesPetOwnerRole() {
        registerRequest.setRole("SUPER_ADMIN"); // Malicious client attempt

        when(userRepository.existsByEmail("owner@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("$2a$10$hashedPassword");

        User savedUser = new User("Test Owner", "owner@test.com", "$2a$10$hashedPassword", Role.PET_OWNER, "+1234567890");
        savedUser.setId(10L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateTokenFromUser(any(), any(), any(), any())).thenReturn("mocked.jwt.token");

        AuthDto.AuthResponse response = authService.register(registerRequest, "127.0.0.1");

        assertNotNull(response);
        assertEquals(Role.PET_OWNER, response.getRole());
        assertEquals("owner@test.com", response.getEmail());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals(Role.PET_OWNER, userCaptor.getValue().getRole());
    }

    @Test
    @DisplayName("Registration rejects duplicate email with BadRequestException")
    void testRegisterRejectsDuplicateEmail() {
        when(userRepository.existsByEmail("owner@test.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest, "127.0.0.1"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login fails when bad credentials are provided")
    void testLoginFailsBadCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid email or password"));

        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest, "127.0.0.1"));
    }
}

package com.vetmonk;

import com.vetmonk.config.AppProperties;
import com.vetmonk.entity.Role;
import com.vetmonk.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private AppProperties appProperties;

    @BeforeEach
    void setUp() {
        appProperties = new AppProperties();
        appProperties.getJwt().setSecret("test-mock-secret-key-for-jwt-provider-unit-testing-only-12345678901234567890");
        appProperties.getJwt().setExpirationMs(3600000); // 1 hour
        jwtTokenProvider = new JwtTokenProvider(appProperties);
    }

    @Test
    @DisplayName("Generates valid JWT token and correctly parses claims")
    void testGenerateAndValidateToken() {
        String token = jwtTokenProvider.generateTokenFromUser(42L, "alex@test.com", "PET_OWNER", "Alex Morgan");

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(42L, jwtTokenProvider.getUserIdFromToken(token));
        assertEquals("alex@test.com", jwtTokenProvider.getEmailFromToken(token));
        assertEquals("PET_OWNER", jwtTokenProvider.getRoleFromToken(token));
    }

    @Test
    @DisplayName("Rejects tampered JWT tokens")
    void testRejectTamperedToken() {
        String token = jwtTokenProvider.generateTokenFromUser(42L, "alex@test.com", "PET_OWNER", "Alex Morgan");
        String tamperedToken = token.substring(0, token.length() - 5) + "abcde";

        assertFalse(jwtTokenProvider.validateToken(tamperedToken));
    }

    @Test
    @DisplayName("Rejects null or blank JWT tokens")
    void testRejectBlankToken() {
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken(null));
        assertFalse(jwtTokenProvider.validateToken("random-invalid-string"));
    }

    @Test
    @DisplayName("Rejects expired tokens")
    void testRejectExpiredToken() {
        AppProperties expiredProps = new AppProperties();
        expiredProps.getJwt().setSecret("test-mock-secret-key-for-jwt-provider-unit-testing-only-12345678901234567890");
        expiredProps.getJwt().setExpirationMs(-1000); // Expired in past
        JwtTokenProvider expiredProvider = new JwtTokenProvider(expiredProps);

        String expiredToken = expiredProvider.generateTokenFromUser(42L, "alex@test.com", "PET_OWNER", "Alex Morgan");

        assertFalse(jwtTokenProvider.validateToken(expiredToken));
    }
}

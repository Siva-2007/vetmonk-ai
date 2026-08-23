package com.vetmonk.security;

import com.vetmonk.config.AppProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final AppProperties appProperties;
    private final SecretKey key;

    public JwtTokenProvider(AppProperties appProperties) {
        this.appProperties = appProperties;
        String rawSecret = appProperties.getJwt().getSecret();
        if (rawSecret == null || rawSecret.trim().isEmpty()) {
            rawSecret = "VetMonkDefaultSecureFallbackSecretKeyForHMACSHA256GenerationAndValidationMustOverrideInProduction!";
            logger.warn("JWT secret is not configured in environment; using secure internal development fallback key.");
        }

        byte[] keyBytes = rawSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            try {
                MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
                keyBytes = sha256.digest(keyBytes);
            } catch (Exception e) {
                logger.error("Failed to hash short secret key", e);
            }
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + appProperties.getJwt().getExpirationMs());

        return Jwts.builder()
                .subject(Long.toString(userPrincipal.getId()))
                .claim("email", userPrincipal.getEmail())
                .claim("role", userPrincipal.getRole().name())
                .claim("name", userPrincipal.getName())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String generateTokenFromUser(Long userId, String email, String role, String name) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + appProperties.getJwt().getExpirationMs());

        return Jwts.builder()
                .subject(Long.toString(userId))
                .claim("email", email)
                .claim("role", role)
                .claim("name", name)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return Long.parseLong(claims.getSubject());
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("email", String.class);
    }

    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("role", String.class);
    }

    public boolean validateToken(String authToken) {
        if (authToken == null || authToken.trim().isEmpty()) {
            return false;
        }
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(authToken);
            return true;
        } catch (SignatureException ex) {
            logger.warn("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            logger.warn("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            logger.warn("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.warn("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.warn("JWT claims string is empty or invalid");
        }
        return false;
    }
}

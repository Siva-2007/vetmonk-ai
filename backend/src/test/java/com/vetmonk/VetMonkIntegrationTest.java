package com.vetmonk;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vetmonk.dto.AuthDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class VetMonkIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Complete Auth Flow: Register -> Login -> Retrieve /api/auth/me Profile")
    void testAuthenticationFlow() throws Exception {
        String uniqueEmail = "jane." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";

        // 1. Register a new pet owner
        AuthDto.RegisterRequest registerReq = new AuthDto.RegisterRequest();
        registerReq.setName("Jane Doe");
        registerReq.setEmail(uniqueEmail);
        registerReq.setPassword("Password@123");
        registerReq.setPhone("+15551234567");

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value(uniqueEmail))
                .andExpect(jsonPath("$.role").value("PET_OWNER"))
                .andReturn();

        // 2. Login
        AuthDto.LoginRequest loginReq = new AuthDto.LoginRequest();
        loginReq.setEmail(uniqueEmail);
        loginReq.setPassword("Password@123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        // 3. Access protected /api/auth/me with JWT
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(uniqueEmail))
                .andExpect(jsonPath("$.role").value("PET_OWNER"));
    }

    @Test
    @DisplayName("Security: Unauthenticated request to protected endpoint returns 401 Unauthorized")
    void testUnauthenticatedAccessDenied() throws Exception {
        mockMvc.perform(get("/api/pets"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Security: Pet Owner attempting to access Super Admin audit logs returns 403 Forbidden")
    void testRbacForbiddenForPetOwner() throws Exception {
        // Login as seeded Pet Owner
        AuthDto.LoginRequest loginReq = new AuthDto.LoginRequest();
        loginReq.setEmail("owner.alex@vetmonk.ai");
        loginReq.setPassword("Owner@12345");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        // Attempt to access Super Admin endpoint
        mockMvc.perform(get("/api/audit/recent")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security: Super Admin can access audit logs")
    void testSuperAdminAccessAuditLogs() throws Exception {
        AuthDto.LoginRequest loginReq = new AuthDto.LoginRequest();
        loginReq.setEmail("superadmin@vetmonk.ai");
        loginReq.setPassword("Admin@12345");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        mockMvc.perform(get("/api/audit/recent")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}

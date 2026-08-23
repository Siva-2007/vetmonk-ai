package com.vetmonk.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "System Health", description = "System health, database connectivity, and environment status")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    @Operation(summary = "Check application and database health status")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "VetMonk AI Healthcare Platform");
        health.put("version", "1.0.0");
        health.put("timestamp", Instant.now().toString());

        // Check real database connectivity
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            String dbProduct = metaData.getDatabaseProductName();
            String dbVersion = metaData.getDatabaseProductVersion();
            String url = metaData.getURL();

            Map<String, Object> dbInfo = new HashMap<>();
            dbInfo.put("status", "CONNECTED");
            dbInfo.put("databaseProduct", dbProduct);
            dbInfo.put("databaseVersion", dbVersion);
            dbInfo.put("connectionValid", connection.isValid(2));
            
            // Mask password if present in JDBC URL
            String sanitizedUrl = url.replaceAll("password=[^;&]*", "password=***");
            dbInfo.put("jdbcUrl", sanitizedUrl);
            dbInfo.put("isProductionDb", !dbProduct.toLowerCase().contains("h2"));

            health.put("database", dbInfo);
        } catch (Exception e) {
            Map<String, Object> dbInfo = new HashMap<>();
            dbInfo.put("status", "DISCONNECTED");
            dbInfo.put("error", e.getMessage());
            health.put("database", dbInfo);
            health.put("status", "DOWN");
            return ResponseEntity.status(503).body(health);
        }

        return ResponseEntity.ok(health);
    }
}

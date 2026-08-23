package com.vetmonk.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class ClinicDto {

    public static class ClinicRequest {
        @NotBlank(message = "Clinic name is required")
        private String name;

        @NotBlank(message = "Address is required")
        private String address;

        @NotBlank(message = "Phone number is required")
        private String phone;

        private String email;
        private String openingHours;
        private String services;
        private String status = "ACTIVE";

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOpeningHours() { return openingHours; }
        public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }
        public String getServices() { return services; }
        public void setServices(String services) { this.services = services; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class ClinicResponse {
        private Long id;
        private String name;
        private String address;
        private String phone;
        private String email;
        private String openingHours;
        private String services;
        private String status;
        private LocalDateTime createdAt;

        public ClinicResponse() {}

        public ClinicResponse(Long id, String name, String address, String phone, String email, String openingHours, String services, String status, LocalDateTime createdAt) {
            this.id = id;
            this.name = name;
            this.address = address;
            this.phone = phone;
            this.email = email;
            this.openingHours = openingHours;
            this.services = services;
            this.status = status;
            this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOpeningHours() { return openingHours; }
        public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }
        public String getServices() { return services; }
        public void setServices(String services) { this.services = services; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}

package com.vetmonk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PetDto {

    // =========================================================
    // PET REQUEST
    // =========================================================
    public static class PetRequest {

        @NotBlank(message = "Pet name is required")
        private String name;

        @NotBlank(message = "Species is required")
        private String species;

        private String breed;

        private LocalDate dateOfBirth;

        private String gender;

        @Positive(message = "Weight must be greater than zero")
        private Double weight;

        private String allergies;

        private String existingConditions;

        private String profileImageReference;

        /*
         * Optional:
         * Only staff/admin can specify ownerId.
         * PET_OWNER will automatically use the authenticated user.
         */
        private Long ownerId;

        // -----------------------------------------------------
        // Getters and Setters
        // -----------------------------------------------------

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getSpecies() {
            return species;
        }

        public void setSpecies(String species) {
            this.species = species;
        }

        public String getBreed() {
            return breed;
        }

        public void setBreed(String breed) {
            this.breed = breed;
        }

        public LocalDate getDateOfBirth() {
            return dateOfBirth;
        }

        public void setDateOfBirth(LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
        }

        public String getGender() {
            return gender;
        }

        public void setGender(String gender) {
            this.gender = gender;
        }

        public Double getWeight() {
            return weight;
        }

        public void setWeight(Double weight) {
            this.weight = weight;
        }

        public String getAllergies() {
            return allergies;
        }

        public void setAllergies(String allergies) {
            this.allergies = allergies;
        }

        public String getExistingConditions() {
            return existingConditions;
        }

        public void setExistingConditions(String existingConditions) {
            this.existingConditions = existingConditions;
        }

        public String getProfileImageReference() {
            return profileImageReference;
        }

        public void setProfileImageReference(String profileImageReference) {
            this.profileImageReference = profileImageReference;
        }

        public Long getOwnerId() {
            return ownerId;
        }

        public void setOwnerId(Long ownerId) {
            this.ownerId = ownerId;
        }
    }


    // =========================================================
    // PET RESPONSE
    // =========================================================
    public static class PetResponse {

        private Long id;

        private String name;

        private String species;

        private String breed;

        private LocalDate dateOfBirth;

        private String gender;

        private Double weight;

        private String allergies;

        private String existingConditions;

        private String profileImageReference;

        private Long ownerId;

        private String ownerName;

        private String ownerEmail;

        private String ownerPhone;

        private LocalDateTime createdAt;

        private LocalDateTime updatedAt;

        // -----------------------------------------------------
        // Getters and Setters
        // -----------------------------------------------------

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

        public String getSpecies() {
            return species;
        }

        public void setSpecies(String species) {
            this.species = species;
        }

        public String getBreed() {
            return breed;
        }

        public void setBreed(String breed) {
            this.breed = breed;
        }

        public LocalDate getDateOfBirth() {
            return dateOfBirth;
        }

        public void setDateOfBirth(LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
        }

        public String getGender() {
            return gender;
        }

        public void setGender(String gender) {
            this.gender = gender;
        }

        public Double getWeight() {
            return weight;
        }

        public void setWeight(Double weight) {
            this.weight = weight;
        }

        public String getAllergies() {
            return allergies;
        }

        public void setAllergies(String allergies) {
            this.allergies = allergies;
        }

        public String getExistingConditions() {
            return existingConditions;
        }

        public void setExistingConditions(String existingConditions) {
            this.existingConditions = existingConditions;
        }

        public String getProfileImageReference() {
            return profileImageReference;
        }

        public void setProfileImageReference(String profileImageReference) {
            this.profileImageReference = profileImageReference;
        }

        public Long getOwnerId() {
            return ownerId;
        }

        public void setOwnerId(Long ownerId) {
            this.ownerId = ownerId;
        }

        public String getOwnerName() {
            return ownerName;
        }

        public void setOwnerName(String ownerName) {
            this.ownerName = ownerName;
        }

        public String getOwnerEmail() {
            return ownerEmail;
        }

        public void setOwnerEmail(String ownerEmail) {
            this.ownerEmail = ownerEmail;
        }

        public String getOwnerPhone() {
            return ownerPhone;
        }

        public void setOwnerPhone(String ownerPhone) {
            this.ownerPhone = ownerPhone;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public LocalDateTime getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
        }
    }


    // =========================================================
    // OWNER DETAILS RESPONSE
    // =========================================================
    public static class OwnerDetailsResponse {

        private Long ownerId;

        private String ownerName;

        private String ownerEmail;

        private String ownerPhone;

        /*
         * Full 12-digit Aadhaar number.
         *
         * This response should only be returned through
         * an authorized staff/admin endpoint.
         */
        private String aadhaarNumber;

        // -----------------------------------------------------
        // Getters and Setters
        // -----------------------------------------------------

        public Long getOwnerId() {
            return ownerId;
        }

        public void setOwnerId(Long ownerId) {
            this.ownerId = ownerId;
        }

        public String getOwnerName() {
            return ownerName;
        }

        public void setOwnerName(String ownerName) {
            this.ownerName = ownerName;
        }

        public String getOwnerEmail() {
            return ownerEmail;
        }

        public void setOwnerEmail(String ownerEmail) {
            this.ownerEmail = ownerEmail;
        }

        public String getOwnerPhone() {
            return ownerPhone;
        }

        public void setOwnerPhone(String ownerPhone) {
            this.ownerPhone = ownerPhone;
        }

        public String getAadhaarNumber() {
            return aadhaarNumber;
        }

        public void setAadhaarNumber(String aadhaarNumber) {
            this.aadhaarNumber = aadhaarNumber;
        }
    }
}
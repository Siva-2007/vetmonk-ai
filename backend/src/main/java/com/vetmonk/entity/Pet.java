package com.vetmonk.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pets", indexes = {
    @Index(name = "idx_pet_owner", columnList = "owner_id"),
    @Index(name = "idx_pet_species", columnList = "species")
})
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 50)
    private String species; // Dog, Cat, Bird, Rabbit, etc.

    private String breed;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 20)
    private String gender; // Male, Female, Neutered Male, Spayed Female

    private Double weight; // in kg

    @Column(length = 500)
    private String allergies;

    @Column(name = "existing_conditions", length = 1000)
    private String existingConditions;

    @Column(name = "profile_image_reference")
    private String profileImageReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Pet() {
    }

    public Pet(String name, String species, String breed, LocalDate dateOfBirth, String gender, Double weight, User owner) {
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.weight = weight;
        this.owner = owner;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
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

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
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

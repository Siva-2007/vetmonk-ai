package com.vetmonk.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "medicines")
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "generic_name")
    private String genericName;

    private String category; // Antibiotic, Painkiller, Vaccine, Dewormer, Topical, Supplement

    @Column(name = "dosage_form")
    private String dosageForm; // Tablet, Syrup, Injectable, Ointment, Spray

    @Column(length = 1000)
    private String description;

    private String manufacturer;

    public Medicine() {
    }

    public Medicine(String name, String genericName, String category, String dosageForm, String description, String manufacturer) {
        this.name = name;
        this.genericName = genericName;
        this.category = category;
        this.dosageForm = dosageForm;
        this.description = description;
        this.manufacturer = manufacturer;
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

    public String getGenericName() {
        return genericName;
    }

    public void setGenericName(String genericName) {
        this.genericName = genericName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDosageForm() {
        return dosageForm;
    }

    public void setDosageForm(String dosageForm) {
        this.dosageForm = dosageForm;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }
}

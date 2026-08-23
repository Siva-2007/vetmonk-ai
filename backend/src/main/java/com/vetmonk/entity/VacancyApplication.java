package com.vetmonk.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "vacancy_applications",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_vacancy_applicant_email",
            columnNames = {"vacancy_id", "email"}
        )
    },
    indexes = {
        @Index(
            name = "idx_application_vacancy",
            columnList = "vacancy_id"
        ),
        @Index(
            name = "idx_application_email",
            columnList = "email"
        ),
        @Index(
            name = "idx_application_clinic",
            columnList = "clinic_id"
        )
    }
)
public class VacancyApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // VACANCY
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "vacancy_id",
        nullable = false
    )
    private Vacancy vacancy;


    // =========================================================
    // CLINIC
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "clinic_id",
        nullable = false
    )
    private Clinic clinic;


    // =========================================================
    // APPLICANT DETAILS
    // =========================================================

    @Column(
        name = "full_name",
        nullable = false,
        length = 100
    )
    private String fullName;


    @Column(
        nullable = false,
        length = 150
    )
    private String email;


    @Column(
        nullable = false,
        length = 20
    )
    private String phone;


    @Column(
        name = "cover_letter",
        length = 3000
    )
    private String coverLetter;


    // =========================================================
    // RESUME
    // =========================================================

    @Column(
        name = "resume_file_name",
        nullable = false,
        length = 255
    )
    private String resumeFileName;


    @Column(
        name = "resume_content_type",
        nullable = false,
        length = 100
    )
    private String resumeContentType;


    @Lob
    @Column(
        name = "resume_data",
        nullable = false
    )
    private byte[] resumeData;


    @Column(
        name = "resume_size",
        nullable = false
    )
    private long resumeSize;


    // =========================================================
    // APPLICATION STATUS
    // =========================================================

    @Column(
        nullable = false,
        length = 30
    )
    private String status = "SUBMITTED";


    // =========================================================
    // TIMESTAMPS
    // =========================================================

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    private LocalDateTime createdAt;


    @Column(
        name = "updated_at"
    )
    private LocalDateTime updatedAt;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public VacancyApplication() {
    }


    // =========================================================
    // JPA CALLBACKS
    // =========================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();

    }


    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Vacancy getVacancy() {
        return vacancy;
    }

    public void setVacancy(Vacancy vacancy) {
        this.vacancy = vacancy;
    }


    public Clinic getClinic() {
        return clinic;
    }

    public void setClinic(Clinic clinic) {
        this.clinic = clinic;
    }


    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }


    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }


    public String getResumeFileName() {
        return resumeFileName;
    }

    public void setResumeFileName(String resumeFileName) {
        this.resumeFileName = resumeFileName;
    }


    public String getResumeContentType() {
        return resumeContentType;
    }

    public void setResumeContentType(String resumeContentType) {
        this.resumeContentType = resumeContentType;
    }


    public byte[] getResumeData() {
        return resumeData;
    }

    public void setResumeData(byte[] resumeData) {
        this.resumeData = resumeData;
    }


    public long getResumeSize() {
        return resumeSize;
    }

    public void setResumeSize(long resumeSize) {
        this.resumeSize = resumeSize;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
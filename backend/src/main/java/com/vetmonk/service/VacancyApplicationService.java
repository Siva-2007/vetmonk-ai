package com.vetmonk.service;

import com.vetmonk.dto.VacancyApplicationDto;
import com.vetmonk.entity.Clinic;
import com.vetmonk.entity.Vacancy;
import com.vetmonk.entity.VacancyApplication;
import com.vetmonk.repository.VacancyApplicationRepository;
import com.vetmonk.repository.VacancyRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

@Service
public class VacancyApplicationService {

    private static final long MAX_RESUME_SIZE =
            5L * 1024L * 1024L; // 5 MB


    private final VacancyRepository vacancyRepository;

    private final VacancyApplicationRepository
            vacancyApplicationRepository;


    public VacancyApplicationService(
            VacancyRepository vacancyRepository,
            VacancyApplicationRepository vacancyApplicationRepository) {

        this.vacancyRepository = vacancyRepository;

        this.vacancyApplicationRepository =
                vacancyApplicationRepository;
    }


    // =========================================================
    // SUBMIT APPLICATION
    // =========================================================

    @Transactional
    public VacancyApplicationDto.ApplicationResponse
    submitApplication(
            Long vacancyId,
            String fullName,
            String email,
            String phone,
            String coverLetter,
            MultipartFile resume) {


        // -----------------------------------------------------
        // BASIC INPUT VALIDATION
        // -----------------------------------------------------

        if (vacancyId == null) {

            throw new IllegalArgumentException(
                    "Vacancy ID is required"
            );
        }


        if (fullName == null ||
                fullName.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Full name is required"
            );
        }


        if (email == null ||
                email.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Email address is required"
            );
        }


        if (phone == null ||
                phone.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Phone number is required"
            );
        }


        if (resume == null ||
                resume.isEmpty()) {

            throw new IllegalArgumentException(
                    "Resume is required"
            );
        }


        // -----------------------------------------------------
        // CLEAN INPUT
        // -----------------------------------------------------

        String cleanName =
                fullName.trim();

        String cleanEmail =
                email.trim().toLowerCase();

        String cleanPhone =
                phone.trim();

        String cleanCoverLetter =
                coverLetter == null
                        ? ""
                        : coverLetter.trim();


        // -----------------------------------------------------
        // LENGTH VALIDATION
        // -----------------------------------------------------

        if (cleanName.length() > 100) {

            throw new IllegalArgumentException(
                    "Full name must not exceed 100 characters"
            );
        }


        if (cleanEmail.length() > 150) {

            throw new IllegalArgumentException(
                    "Email must not exceed 150 characters"
            );
        }


        if (cleanPhone.length() > 20) {

            throw new IllegalArgumentException(
                    "Phone number must not exceed 20 characters"
            );
        }


        if (cleanCoverLetter.length() > 3000) {

            throw new IllegalArgumentException(
                    "Cover letter must not exceed 3000 characters"
            );
        }


        // -----------------------------------------------------
        // EMAIL VALIDATION
        // -----------------------------------------------------

        if (!cleanEmail.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

            throw new IllegalArgumentException(
                    "Please provide a valid email address"
            );
        }


        // -----------------------------------------------------
        // PHONE VALIDATION
        // -----------------------------------------------------

        if (!cleanPhone.matches(
                "^\\+?[0-9][0-9\\s-]{6,19}$")) {

            throw new IllegalArgumentException(
                    "Please provide a valid phone number"
            );
        }


        // -----------------------------------------------------
        // FIND VACANCY
        // -----------------------------------------------------

        Vacancy vacancy =
                vacancyRepository.findById(vacancyId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Vacancy not found"
                                )
                        );


        // -----------------------------------------------------
        // CHECK VACANCY STATUS
        // -----------------------------------------------------

        if (!"OPEN".equalsIgnoreCase(
                vacancy.getStatus())) {

            throw new IllegalArgumentException(
                    "This vacancy is no longer accepting applications"
            );
        }


        // -----------------------------------------------------
        // CHECK DEADLINE
        // -----------------------------------------------------

        LocalDate deadline =
                vacancy.getDeadline();

        if (deadline == null) {

            throw new IllegalArgumentException(
                    "This vacancy does not have a valid deadline"
            );
        }


        if (deadline.isBefore(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "The application deadline has passed"
            );
        }


        // -----------------------------------------------------
        // CHECK CLINIC
        // -----------------------------------------------------

        Clinic clinic =
                vacancy.getClinic();

        if (clinic == null) {

            throw new IllegalArgumentException(
                    "This vacancy is not associated with a clinic"
            );
        }


        // -----------------------------------------------------
        // DUPLICATE APPLICATION CHECK
        // -----------------------------------------------------

        boolean alreadyApplied =
                vacancyApplicationRepository
                        .existsByVacancyIdAndEmailIgnoreCase(
                                vacancyId,
                                cleanEmail
                        );


        if (alreadyApplied) {

            throw new IllegalArgumentException(
                    "You have already applied for this vacancy"
            );
        }


        // -----------------------------------------------------
        // RESUME SIZE
        // -----------------------------------------------------

        if (resume.getSize() > MAX_RESUME_SIZE) {

            throw new IllegalArgumentException(
                    "Resume must be smaller than 5 MB"
            );
        }


        // -----------------------------------------------------
        // RESUME FILE NAME
        // -----------------------------------------------------

        String originalFileName =
                resume.getOriginalFilename();

        if (originalFileName == null ||
                originalFileName.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Resume file name is required"
            );
        }


        String fileName =
                originalFileName.trim();


        // -----------------------------------------------------
        // RESUME EXTENSION
        // -----------------------------------------------------

        String lowerFileName =
                fileName.toLowerCase();


        boolean validExtension =
                lowerFileName.endsWith(".pdf") ||
                lowerFileName.endsWith(".doc") ||
                lowerFileName.endsWith(".docx");


        if (!validExtension) {

            throw new IllegalArgumentException(
                    "Only PDF, DOC and DOCX resumes are allowed"
            );
        }


        // -----------------------------------------------------
        // CONTENT TYPE
        // -----------------------------------------------------

        String contentType =
                resume.getContentType();


        boolean validContentType =
                "application/pdf".equalsIgnoreCase(
                        contentType
                )
                ||
                "application/msword".equalsIgnoreCase(
                        contentType
                )
                ||
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        .equalsIgnoreCase(contentType);


        if (!validContentType) {

            throw new IllegalArgumentException(
                    "Invalid resume file type"
            );
        }


        // -----------------------------------------------------
        // READ RESUME
        // -----------------------------------------------------

        byte[] resumeData;

        try {

            resumeData =
                    resume.getBytes();

        } catch (IOException e) {

            throw new IllegalArgumentException(
                    "Unable to read the uploaded resume"
            );
        }


        // -----------------------------------------------------
        // CREATE APPLICATION
        // -----------------------------------------------------

        VacancyApplication application =
                new VacancyApplication();


        application.setVacancy(vacancy);

        application.setClinic(clinic);

        application.setFullName(cleanName);

        application.setEmail(cleanEmail);

        application.setPhone(cleanPhone);

        application.setCoverLetter(cleanCoverLetter);

        application.setResumeFileName(fileName);

        application.setResumeContentType(contentType);

        application.setResumeData(resumeData);

        application.setResumeSize(resume.getSize());

        application.setStatus("SUBMITTED");


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        VacancyApplication saved;

        try {

            saved =
                    vacancyApplicationRepository.save(
                            application
                    );

        } catch (DataIntegrityViolationException e) {

            /*
             * Protects against two identical requests arriving
             * at almost exactly the same time.
             */

            throw new IllegalArgumentException(
                    "You have already applied for this vacancy"
            );
        }


        return toResponse(saved);
    }


    // =========================================================
    // CONVERT ENTITY → DTO
    // =========================================================

    private VacancyApplicationDto.ApplicationResponse
    toResponse(VacancyApplication application) {

        VacancyApplicationDto.ApplicationResponse
                response =
                new VacancyApplicationDto.ApplicationResponse();


        response.setId(
                application.getId()
        );


        Vacancy vacancy =
                application.getVacancy();


        Clinic clinic =
                application.getClinic();


        response.setVacancyId(
                vacancy.getId()
        );


        response.setVacancyTitle(
                vacancy.getTitle()
        );


        response.setClinicId(
                clinic.getId()
        );


        /*
         * Clinic.getName() is expected here based on the
         * existing Clinic entity used by your vacancy system.
         */

        response.setClinicName(
                clinic.getName()
        );


        response.setFullName(
                application.getFullName()
        );


        response.setEmail(
                application.getEmail()
        );


        response.setPhone(
                application.getPhone()
        );


        response.setCoverLetter(
                application.getCoverLetter()
        );


        response.setResumeFileName(
                application.getResumeFileName()
        );


        response.setResumeContentType(
                application.getResumeContentType()
        );


        response.setResumeSize(
                application.getResumeSize()
        );


        response.setStatus(
                application.getStatus()
        );


        response.setCreatedAt(
                application.getCreatedAt()
        );


        return response;
    }
}
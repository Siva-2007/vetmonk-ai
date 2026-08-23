package com.vetmonk.service;

import com.vetmonk.dto.VacancyDto;
import com.vetmonk.entity.Clinic;
import com.vetmonk.entity.Vacancy;
import com.vetmonk.exception.BadRequestException;
import com.vetmonk.exception.ResourceNotFoundException;
import com.vetmonk.exception.SecurityViolationException;
import com.vetmonk.repository.ClinicRepository;
import com.vetmonk.repository.VacancyRepository;
import com.vetmonk.security.SecurityUtils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VacancyService {

    private final VacancyRepository vacancyRepository;
    private final ClinicRepository clinicRepository;
    private final AuditService auditService;

    public VacancyService(
            VacancyRepository vacancyRepository,
            ClinicRepository clinicRepository,
            AuditService auditService) {

        this.vacancyRepository = vacancyRepository;
        this.clinicRepository = clinicRepository;
        this.auditService = auditService;
    }

    // =========================================================
    // PUBLIC - GET OPEN VACANCIES
    // =========================================================

    @Transactional(readOnly = true)
    public List<VacancyDto.VacancyResponse> getPublicOpenVacancies() {

        return vacancyRepository
                .findByStatusOrderByDeadlineAsc("OPEN")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // PUBLIC - PAGED VACANCIES
    // =========================================================

    @Transactional(readOnly = true)
    public Page<VacancyDto.VacancyResponse> getPublicOpenVacanciesPaged(
            Pageable pageable) {

        return vacancyRepository
                .findByStatus("OPEN", pageable)
                .map(this::mapToResponse);
    }

    // =========================================================
    // GET CLINIC VACANCIES
    // =========================================================

    @Transactional(readOnly = true)
    public List<VacancyDto.VacancyResponse> getClinicVacancies(
            Long clinicId) {

        return vacancyRepository
                .findByClinicIdOrderByDeadlineAsc(clinicId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET VACANCY BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public VacancyDto.VacancyResponse getVacancyById(Long id) {

        Vacancy vacancy = vacancyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Vacancy",
                                "id",
                                id
                        )
                );

        return mapToResponse(vacancy);
    }

    // =========================================================
    // CREATE VACANCY
    // SUPER ADMIN ONLY
    // =========================================================

    @Transactional
    public VacancyDto.VacancyResponse createVacancy(
            VacancyDto.VacancyRequest request) {

        requireSuperAdmin();

        if (request.getTitle() == null ||
                request.getTitle().trim().isEmpty()) {

            throw new BadRequestException(
                    "Vacancy title is required."
            );
        }

        if (request.getLocation() == null ||
                request.getLocation().trim().isEmpty()) {

            throw new BadRequestException(
                    "Vacancy location is required."
            );
        }

        if (request.getDeadline() == null) {

            throw new BadRequestException(
                    "Vacancy deadline is required."
            );
        }

        if (request.getDescription() == null ||
                request.getDescription().trim().isEmpty()) {

            throw new BadRequestException(
                    "Vacancy description is required."
            );
        }

        // -----------------------------------------------------
        // Determine clinic
        // -----------------------------------------------------

        Clinic clinic = null;

        if (request.getClinicId() != null) {

            clinic = clinicRepository.findById(
                    request.getClinicId()
            ).orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Clinic",
                            "id",
                            request.getClinicId()
                    )
            );

        } else {

            // Super admin must specify a clinic if multiple clinics
            // exist. For a single-clinic installation, use the first one.
            List<Clinic> clinics = clinicRepository.findAll();

            if (clinics.isEmpty()) {

                throw new ResourceNotFoundException(
                        "No clinic available"
                );
            }

            if (clinics.size() == 1) {

                clinic = clinics.get(0);

            } else {

                throw new BadRequestException(
                        "Clinic ID is required when multiple clinics exist."
                );
            }
        }

        // -----------------------------------------------------
        // Create vacancy
        // -----------------------------------------------------

        Vacancy vacancy = new Vacancy();

        vacancy.setClinic(clinic);

        vacancy.setTitle(
                request.getTitle().trim()
        );

        vacancy.setDepartment(
                request.getDepartment() != null &&
                !request.getDepartment().trim().isEmpty()
                        ? request.getDepartment().trim()
                        : "Veterinary Care"
        );

        vacancy.setLocation(
                request.getLocation().trim()
        );

        vacancy.setExperience(
                request.getExperience() != null
                        ? request.getExperience().trim()
                        : ""
        );

        vacancy.setEmploymentType(
                request.getEmploymentType() != null
                        ? request.getEmploymentType()
                        : "FULL_TIME"
        );

        vacancy.setSalaryRange(
                request.getSalaryRange()
        );

        vacancy.setDeadline(
                request.getDeadline()
        );

        vacancy.setDescription(
                request.getDescription().trim()
        );

        vacancy.setRequirements(
                request.getRequirements()
        );

        // New vacancy is visible publicly
        vacancy.setStatus("OPEN");

        Vacancy saved = vacancyRepository.save(vacancy);

        // -----------------------------------------------------
        // Audit
        // -----------------------------------------------------

        auditService.logAction(
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.getCurrentUserEmail(),
                "VACANCY_CREATE",
                "Vacancy",
                saved.getId().toString(),
                null,
                "SUCCESS",
                "Created vacancy posting: " + saved.getTitle()
        );

        return mapToResponse(saved);
    }

    // =========================================================
    // UPDATE VACANCY
    // SUPER ADMIN ONLY
    // =========================================================

    @Transactional
    public VacancyDto.VacancyResponse updateVacancy(
            Long id,
            VacancyDto.VacancyRequest request) {

        requireSuperAdmin();

        Vacancy vacancy = vacancyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Vacancy",
                                "id",
                                id
                        )
                );

        // -----------------------------------------------------
        // Update basic information
        // -----------------------------------------------------

        if (request.getTitle() != null &&
                !request.getTitle().trim().isEmpty()) {

            vacancy.setTitle(
                    request.getTitle().trim()
            );
        }

        if (request.getDepartment() != null) {

            vacancy.setDepartment(
                    request.getDepartment().trim()
            );
        }

        if (request.getLocation() != null &&
                !request.getLocation().trim().isEmpty()) {

            vacancy.setLocation(
                    request.getLocation().trim()
            );
        }

        if (request.getExperience() != null) {

            vacancy.setExperience(
                    request.getExperience().trim()
            );
        }

        if (request.getEmploymentType() != null) {

            vacancy.setEmploymentType(
                    request.getEmploymentType()
            );
        }

        if (request.getSalaryRange() != null) {

            vacancy.setSalaryRange(
                    request.getSalaryRange()
            );
        }

        if (request.getDeadline() != null) {

            vacancy.setDeadline(
                    request.getDeadline()
            );
        }

        if (request.getDescription() != null) {

            vacancy.setDescription(
                    request.getDescription().trim()
            );
        }

        if (request.getRequirements() != null) {

            vacancy.setRequirements(
                    request.getRequirements()
            );
        }

        // -----------------------------------------------------
        // Status
        // -----------------------------------------------------

        if (request.getStatus() != null &&
                !request.getStatus().trim().isEmpty()) {

            String status =
                    request.getStatus().trim().toUpperCase();

            if (!status.equals("OPEN") &&
                    !status.equals("CLOSED") &&
                    !status.equals("FILLED")) {

                throw new BadRequestException(
                        "Invalid vacancy status. Use OPEN, CLOSED, or FILLED."
                );
            }

            vacancy.setStatus(status);
        }

        Vacancy updated =
                vacancyRepository.save(vacancy);

        // -----------------------------------------------------
        // Audit
        // -----------------------------------------------------

        auditService.logAction(
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.getCurrentUserEmail(),
                "VACANCY_UPDATE",
                "Vacancy",
                updated.getId().toString(),
                null,
                "SUCCESS",
                "Updated vacancy: " + updated.getTitle()
        );

        return mapToResponse(updated);
    }

    // =========================================================
    // DELETE VACANCY
    // SUPER ADMIN ONLY
    // =========================================================

    @Transactional
    public void deleteVacancy(Long id) {

        requireSuperAdmin();

        Vacancy vacancy = vacancyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Vacancy",
                                "id",
                                id
                        )
                );

        String vacancyTitle = vacancy.getTitle();

        vacancyRepository.delete(vacancy);

        // -----------------------------------------------------
        // Audit
        // -----------------------------------------------------

        auditService.logAction(
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.getCurrentUserEmail(),
                "VACANCY_DELETE",
                "Vacancy",
                id.toString(),
                null,
                "SUCCESS",
                "Deleted vacancy: " + vacancyTitle
        );
    }

    // =========================================================
    // SUPER ADMIN SECURITY CHECK
    // =========================================================

    private void requireSuperAdmin() {

        if (!SecurityUtils.isSuperAdmin()) {

            throw new SecurityViolationException(
                    "Access denied: Only Super Admin can manage vacancies."
            );
        }
    }

    // =========================================================
    // ENTITY -> DTO
    // =========================================================

    public VacancyDto.VacancyResponse mapToResponse(
            Vacancy vacancy) {

        VacancyDto.VacancyResponse response =
                new VacancyDto.VacancyResponse();

        response.setId(vacancy.getId());

        if (vacancy.getClinic() != null) {

            response.setClinicId(
                    vacancy.getClinic().getId()
            );

            response.setClinicName(
                    vacancy.getClinic().getName()
            );
        }

        response.setTitle(
                vacancy.getTitle()
        );

        response.setDepartment(
                vacancy.getDepartment()
        );

        response.setLocation(
                vacancy.getLocation()
        );

        response.setExperience(
                vacancy.getExperience()
        );

        response.setEmploymentType(
                vacancy.getEmploymentType()
        );

        response.setSalaryRange(
                vacancy.getSalaryRange()
        );

        response.setDeadline(
                vacancy.getDeadline()
        );

        response.setDescription(
                vacancy.getDescription()
        );

        response.setRequirements(
                vacancy.getRequirements()
        );

        response.setStatus(
                vacancy.getStatus()
        );

        response.setCreatedAt(
                vacancy.getCreatedAt()
        );

        return response;
    }
}
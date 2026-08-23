package com.vetmonk.service;

import com.vetmonk.dto.AppointmentDto;
import com.vetmonk.entity.Appointment;
import com.vetmonk.entity.AppointmentStatus;
import com.vetmonk.entity.Clinic;
import com.vetmonk.entity.Pet;
import com.vetmonk.entity.Role;
import com.vetmonk.entity.User;
import com.vetmonk.exception.BadRequestException;
import com.vetmonk.exception.ResourceNotFoundException;
import com.vetmonk.exception.SecurityViolationException;
import com.vetmonk.repository.AppointmentRepository;
import com.vetmonk.repository.ClinicRepository;
import com.vetmonk.repository.PetRepository;
import com.vetmonk.repository.UserRepository;
import com.vetmonk.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final ClinicRepository clinicRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PetRepository petRepository,
            ClinicRepository clinicRepository,
            UserRepository userRepository,
            AuditService auditService) {

        this.appointmentRepository = appointmentRepository;
        this.petRepository = petRepository;
        this.clinicRepository = clinicRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    // =========================================================
    // BOOK APPOINTMENT
    // =========================================================

    @Transactional
    public AppointmentDto.AppointmentResponse bookAppointment(
            AppointmentDto.BookAppointmentRequest request) {

        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentUserRole = SecurityUtils.getCurrentUserRole();

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Pet",
                                "id",
                                request.getPetId()
                        ));

        if (currentUserRole == Role.PET_OWNER
                && !pet.getOwner().getId().equals(currentUserId)) {

            throw new SecurityViolationException(
                    "Access denied: You cannot book appointments for pets you do not own."
            );
        }

        Clinic clinic = clinicRepository.findById(request.getClinicId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Clinic",
                                "id",
                                request.getClinicId()
                        ));

        User veterinarian = null;

        if (request.getVeterinarianId() != null) {

            veterinarian = userRepository.findById(
                            request.getVeterinarianId()
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Veterinarian",
                                    "id",
                                    request.getVeterinarianId()
                            ));

            if (veterinarian.getRole() != Role.VETERINARIAN) {
                throw new BadRequestException(
                        "Selected user is not a veterinarian."
                );
            }

            boolean isDoubleBooked =
                    appointmentRepository
                            .existsByVeterinarianIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                                    veterinarian.getId(),
                                    request.getAppointmentDate(),
                                    request.getAppointmentTime(),
                                    AppointmentStatus.CANCELLED
                            );

            if (isDoubleBooked) {
                throw new BadRequestException(
                        "The selected veterinarian is already booked at this exact date and time. Please choose another time slot."
                );
            }
        }

        Appointment appointment = new Appointment();

        appointment.setPet(pet);
        appointment.setOwner(pet.getOwner());
        appointment.setClinic(clinic);
        appointment.setVeterinarian(veterinarian);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setReason(request.getReason().trim());
        appointment.setStatus(AppointmentStatus.REQUESTED);

        Appointment saved = appointmentRepository.save(appointment);

        auditService.logAction(
                currentUserId,
                SecurityUtils.getCurrentUserEmail(),
                "APPOINTMENT_BOOK",
                "Appointment",
                saved.getId().toString(),
                null,
                "SUCCESS",
                "Booked appointment for "
                        + pet.getName()
                        + " on "
                        + saved.getAppointmentDate()
        );

        return mapToResponse(saved);
    }

    // =========================================================
    // GET APPOINTMENT BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public AppointmentDto.AppointmentResponse getAppointmentById(Long id) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Appointment",
                                "id",
                                id
                        ));

        validateAppointmentAccess(appointment);

        return mapToResponse(appointment);
    }

    // =========================================================
    // GET CURRENT USER APPOINTMENTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<AppointmentDto.AppointmentResponse> getMyAppointments() {

        Long currentUserId = SecurityUtils.getCurrentUserId();

        return appointmentRepository
                .findByOwnerIdOrderByAppointmentDateDescAppointmentTimeDesc(
                        currentUserId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET TODAY'S APPOINTMENTS FOR CURRENT VETERINARIAN
    // =========================================================

    @Transactional(readOnly = true)
    public List<AppointmentDto.AppointmentResponse> getTodayVetAppointments() {

        Long currentUserId = SecurityUtils.getCurrentUserId();

        return appointmentRepository
                .findTodayVetAppointments(
                        currentUserId,
                        LocalDate.now()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET TODAY'S APPOINTMENTS FOR CURRENT USER
    // =========================================================

    @Transactional(readOnly = true)
    public List<AppointmentDto.AppointmentResponse> getTodayAppointmentsForCurrentUser() {

        User currentUser = userRepository.findById(
                        SecurityUtils.getCurrentUserId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User",
                                "id",
                                SecurityUtils.getCurrentUserId()
                        ));

        if (SecurityUtils.isVeterinarian()) {
            return getTodayVetAppointments();
        }

        if (SecurityUtils.isReceptionist()
                || SecurityUtils.isClinicAdmin()) {

            if (currentUser.getClinicId() == null) {
                throw new BadRequestException(
                        "Current user is not assigned to a clinic."
                );
            }

            return getTodayClinicAppointments(
                    currentUser.getClinicId()
            );
        }

        if (SecurityUtils.isSuperAdmin()) {
            return List.of();
        }

        throw new SecurityViolationException(
                "Access denied for today's appointment schedule."
        );
    }

    // =========================================================
    // GET TODAY'S CLINIC APPOINTMENTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<AppointmentDto.AppointmentResponse> getTodayClinicAppointments(
            Long clinicId) {

        return appointmentRepository
                .findByClinicIdAndAppointmentDateOrderByAppointmentTimeAsc(
                        clinicId,
                        LocalDate.now()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET PAGINATED CLINIC APPOINTMENTS
    // =========================================================

    @Transactional(readOnly = true)
    public Page<AppointmentDto.AppointmentResponse> getClinicAppointments(
            Long clinicId,
            Pageable pageable) {

        return appointmentRepository
                .findByClinicId(clinicId, pageable)
                .map(this::mapToResponse);
    }

    // =========================================================
    // UPDATE APPOINTMENT STATUS
    // =========================================================

    @Transactional
    public AppointmentDto.AppointmentResponse updateStatus(
            Long id,
            AppointmentDto.UpdateAppointmentStatusRequest request) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Appointment",
                                "id",
                                id
                        ));

        validateAppointmentAccess(appointment);

        AppointmentStatus current = appointment.getStatus();
        AppointmentStatus target = request.getStatus();

        validateStateTransition(current, target);

        appointment.setStatus(target);

        if (request.getVeterinarianId() != null) {

            User vet = userRepository.findById(
                            request.getVeterinarianId()
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Veterinarian",
                                    "id",
                                    request.getVeterinarianId()
                            ));

            if (vet.getRole() != Role.VETERINARIAN) {
                throw new BadRequestException(
                        "Selected user is not a veterinarian."
                );
            }

            boolean doubleBooked =
                    appointmentRepository
                            .existsByVeterinarianIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                                    vet.getId(),
                                    appointment.getAppointmentDate(),
                                    appointment.getAppointmentTime(),
                                    AppointmentStatus.CANCELLED
                            );

            boolean sameExistingVeterinarian =
                    appointment.getVeterinarian() != null
                            && appointment.getVeterinarian()
                            .getId()
                            .equals(vet.getId());

            if (doubleBooked && !sameExistingVeterinarian) {
                throw new BadRequestException(
                        "The selected veterinarian is already booked at this exact date and time."
                );
            }

            appointment.setVeterinarian(vet);
        }

        Appointment updated = appointmentRepository.save(appointment);

        auditService.logAction(
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.getCurrentUserEmail(),
                "APPOINTMENT_STATUS_UPDATE",
                "Appointment",
                id.toString(),
                null,
                "SUCCESS",
                "Updated status from "
                        + current
                        + " to "
                        + target
        );

        return mapToResponse(updated);
    }

    // =========================================================
    // CANCEL APPOINTMENT
    // =========================================================

    @Transactional
    public void cancelAppointment(Long id) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Appointment",
                                "id",
                                id
                        ));

        validateAppointmentAccess(appointment);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException(
                    "Completed appointments cannot be cancelled."
            );
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);

        appointmentRepository.save(appointment);

        auditService.logAction(
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.getCurrentUserEmail(),
                "APPOINTMENT_CANCEL",
                "Appointment",
                id.toString(),
                null,
                "SUCCESS",
                "Cancelled appointment"
        );
    }

    // =========================================================
    // VALIDATE STATUS TRANSITION
    // =========================================================

    private void validateStateTransition(
            AppointmentStatus current,
            AppointmentStatus target) {

        if (current == target) {
            return;
        }

        if (current == AppointmentStatus.CANCELLED
                || current == AppointmentStatus.COMPLETED) {

            throw new BadRequestException(
                    "Cannot change status of a "
                            + current
                            + " appointment."
            );
        }

        if (SecurityUtils.isPetOwner()
                && target != AppointmentStatus.CANCELLED) {

            throw new SecurityViolationException(
                    "Pet owners are only permitted to cancel appointments."
            );
        }
    }

    // =========================================================
    // VALIDATE APPOINTMENT ACCESS
    // =========================================================

    private void validateAppointmentAccess(
            Appointment appointment) {

        Long currentUserId =
                SecurityUtils.getCurrentUserId();

        Role currentUserRole =
                SecurityUtils.getCurrentUserRole();

        if (currentUserRole == Role.PET_OWNER
                && !appointment.getOwner()
                .getId()
                .equals(currentUserId)) {

            throw new SecurityViolationException(
                    "Access denied: You do not have permission to view or modify this appointment."
            );
        }
    }

    // =========================================================
    // MAP ENTITY TO RESPONSE DTO
    // =========================================================

    public AppointmentDto.AppointmentResponse mapToResponse(
            Appointment a) {

        AppointmentDto.AppointmentResponse resp =
                new AppointmentDto.AppointmentResponse();

        resp.setId(a.getId());

        if (a.getPet() != null) {
            resp.setPetId(a.getPet().getId());
            resp.setPetName(a.getPet().getName());
            resp.setPetSpecies(a.getPet().getSpecies());
            resp.setPetBreed(a.getPet().getBreed());
        }

        if (a.getOwner() != null) {
            resp.setOwnerId(a.getOwner().getId());
            resp.setOwnerName(a.getOwner().getName());
            resp.setOwnerPhone(a.getOwner().getPhone());
            resp.setOwnerEmail(a.getOwner().getEmail());
        }

        if (a.getClinic() != null) {
            resp.setClinicId(a.getClinic().getId());
            resp.setClinicName(a.getClinic().getName());
        }

        if (a.getVeterinarian() != null) {
            resp.setVeterinarianId(a.getVeterinarian().getId());
            resp.setVeterinarianName(a.getVeterinarian().getName());
        }

        resp.setAppointmentDate(a.getAppointmentDate());
        resp.setAppointmentTime(a.getAppointmentTime());
        resp.setReason(a.getReason());
        resp.setStatus(a.getStatus());
        resp.setCreatedAt(a.getCreatedAt());
        resp.setUpdatedAt(a.getUpdatedAt());

        return resp;
    }
}
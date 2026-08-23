package com.vetmonk.controller;

import com.vetmonk.dto.AppointmentDto;
import com.vetmonk.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@Tag(
        name = "Appointments",
        description = "Appointment booking, double-booking prevention, status transitions, and schedules"
)
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    /**
     * Book a new appointment.
     *
     * Appointment details are persisted to the database.
     */
    @PostMapping
    @Operation(summary = "Book an appointment (Pet owner or staff)")
    public ResponseEntity<AppointmentDto.AppointmentResponse> bookAppointment(
            @Valid @RequestBody AppointmentDto.BookAppointmentRequest request) {

        AppointmentDto.AppointmentResponse response =
                appointmentService.bookAppointment(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get appointments belonging to the currently authenticated user.
     */
    @GetMapping("/my")
    @Operation(summary = "Get current user's appointments")
    public ResponseEntity<List<AppointmentDto.AppointmentResponse>> getMyAppointments() {

        return ResponseEntity.ok(
                appointmentService.getMyAppointments()
        );
    }

    /**
     * Get today's appointments for the currently authenticated user.
     *
     * The service determines the user's role:
     *
     * VETERINARIAN  -> appointments assigned to that veterinarian
     * RECEPTIONIST  -> appointments belonging to that user's clinic
     * CLINIC_ADMIN  -> appointments belonging to that user's clinic
     *
     * No patient, appointment, or clinic values are hardcoded.
     */
    @GetMapping("/today")
    @Operation(
            summary = "Get today's appointments for the current user's role and clinic"
    )
    public ResponseEntity<List<AppointmentDto.AppointmentResponse>> getTodayAppointments() {

        return ResponseEntity.ok(
                appointmentService.getTodayAppointmentsForCurrentUser()
        );
    }

    /**
     * Get today's appointments for the currently authenticated veterinarian.
     *
     * Kept as a veterinarian-specific endpoint.
     */
    @GetMapping("/vet/today")
    @Operation(summary = "Get today's appointments for current veterinarian")
    public ResponseEntity<List<AppointmentDto.AppointmentResponse>> getTodayVetAppointments() {

        return ResponseEntity.ok(
                appointmentService.getTodayVetAppointments()
        );
    }

    /**
     * Get today's appointments for a specific clinic.
     *
     * Access control for the requested clinic is handled by the service layer.
     */
    @GetMapping("/clinic/{clinicId}/today")
    @Operation(summary = "Get today's appointments for a clinic")
    public ResponseEntity<List<AppointmentDto.AppointmentResponse>> getTodayClinicAppointments(
            @PathVariable Long clinicId) {

        return ResponseEntity.ok(
                appointmentService.getTodayClinicAppointments(clinicId)
        );
    }

    /**
     * Get paginated appointments for a clinic.
     */
    @GetMapping("/clinic/{clinicId}")
    @Operation(summary = "Get clinic appointments (Paged)")
    public ResponseEntity<Page<AppointmentDto.AppointmentResponse>> getClinicAppointments(
            @PathVariable Long clinicId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by("appointmentDate")
                        .descending()
                        .and(Sort.by("appointmentTime").ascending())
        );

        return ResponseEntity.ok(
                appointmentService.getClinicAppointments(
                        clinicId,
                        pageRequest
                )
        );
    }

    /**
     * Get a single appointment by ID.
     *
     * Specific routes such as /today and /vet/today are declared
     * separately above this mapping.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get appointment details by ID")
    public ResponseEntity<AppointmentDto.AppointmentResponse> getAppointmentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentById(id)
        );
    }

    /**
     * Update appointment status.
     */
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update appointment status")
    public ResponseEntity<AppointmentDto.AppointmentResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentDto.UpdateAppointmentStatusRequest request) {

        return ResponseEntity.ok(
                appointmentService.updateStatus(id, request)
        );
    }

    /**
     * Cancel an appointment.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel an appointment")
    public ResponseEntity<Void> cancelAppointment(
            @PathVariable Long id) {

        appointmentService.cancelAppointment(id);

        return ResponseEntity.noContent().build();
    }
}
package com.vetmonk.repository;

import com.vetmonk.entity.Appointment;
import com.vetmonk.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // =========================================================
    // PET OWNER APPOINTMENTS
    // =========================================================

    List<Appointment> findByOwnerIdOrderByAppointmentDateDescAppointmentTimeDesc(
            Long ownerId
    );

    // =========================================================
    // PET APPOINTMENTS
    // =========================================================

    List<Appointment> findByPetIdOrderByAppointmentDateDesc(
            Long petId
    );

    // =========================================================
    // VETERINARIAN APPOINTMENTS
    // =========================================================

    List<Appointment> findByVeterinarianIdAndAppointmentDateOrderByAppointmentTimeAsc(
            Long veterinarianId,
            LocalDate date
    );

    /**
     * Get today's appointments for the current veterinarian.
     *
     * Cancelled appointments are excluded.
     */
    @Query("""
            SELECT a
            FROM Appointment a
            WHERE a.veterinarian.id = :vetId
              AND a.appointmentDate = :date
              AND a.status <> 'CANCELLED'
            ORDER BY a.appointmentTime ASC
            """)
    List<Appointment> findTodayVetAppointments(
            @Param("vetId") Long vetId,
            @Param("date") LocalDate date
    );

    // =========================================================
    // CLINIC APPOINTMENTS
    // =========================================================

    List<Appointment> findByClinicIdAndAppointmentDateOrderByAppointmentTimeAsc(
            Long clinicId,
            LocalDate date
    );

    @Query("""
            SELECT a
            FROM Appointment a
            WHERE a.clinic.id = :clinicId
              AND a.appointmentDate = :date
              AND a.status IN (:statuses)
            ORDER BY a.appointmentTime ASC
            """)
    List<Appointment> findTodayClinicAppointments(
            @Param("clinicId") Long clinicId,
            @Param("date") LocalDate date,
            @Param("statuses") List<AppointmentStatus> statuses
    );

    // =========================================================
    // PAGINATION
    // =========================================================

    Page<Appointment> findByClinicId(
            Long clinicId,
            Pageable pageable
    );

    // =========================================================
    // DOUBLE-BOOKING PREVENTION
    // =========================================================

    /**
     * Prevents the same veterinarian from having
     * two non-cancelled appointments at the same
     * date and time.
     */
    boolean existsByVeterinarianIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
            Long veterinarianId,
            LocalDate date,
            LocalTime time,
            AppointmentStatus excludedStatus
    );

    // =========================================================
    // STATISTICS
    // =========================================================

    long countByClinicIdAndAppointmentDate(
            Long clinicId,
            LocalDate date
    );

    long countByStatus(
            AppointmentStatus status
    );
}
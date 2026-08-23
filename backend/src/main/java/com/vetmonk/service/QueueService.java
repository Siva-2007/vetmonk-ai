package com.vetmonk.service;

import com.vetmonk.dto.QueueDto;
import com.vetmonk.entity.*;
import com.vetmonk.exception.BadRequestException;
import com.vetmonk.exception.ResourceNotFoundException;
import com.vetmonk.exception.SecurityViolationException;
import com.vetmonk.repository.AppointmentRepository;
import com.vetmonk.repository.QueueEntryRepository;
import com.vetmonk.repository.UserRepository;
import com.vetmonk.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class QueueService {

    private final QueueEntryRepository queueEntryRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public QueueService(QueueEntryRepository queueEntryRepository,
                        AppointmentRepository appointmentRepository,
                        UserRepository userRepository,
                        AuditService auditService) {
        this.queueEntryRepository = queueEntryRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public QueueDto.QueueEntryResponse checkIn(QueueDto.CheckInRequest request) {
        if (!SecurityUtils.isStaffMember()) {
            throw new SecurityViolationException("Access denied: Only receptionists or clinic staff can perform patient check-in.");
        }

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot check in a cancelled appointment.");
        }

        if (queueEntryRepository.findByAppointmentId(appointment.getId()).isPresent()) {
            throw new BadRequestException("This appointment is already checked in and in the queue.");
        }

        // Determine next sequential queue number for today in this clinic
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        Integer maxQueueNumber = queueEntryRepository.findMaxQueueNumberForClinicAndDate(appointment.getClinic().getId(), startOfDay, endOfDay);
        int nextQueueNumber = (maxQueueNumber != null ? maxQueueNumber : 0) + 1;

        User vet = null;
        if (request.getVeterinarianId() != null) {
            vet = userRepository.findById(request.getVeterinarianId())
                    .orElse(appointment.getVeterinarian());
        } else {
            vet = appointment.getVeterinarian();
        }

        // Update appointment status to CHECKED_IN / IN_QUEUE
        appointment.setStatus(AppointmentStatus.IN_QUEUE);
        if (vet != null) {
            appointment.setVeterinarian(vet);
        }
        appointmentRepository.save(appointment);

        QueueEntry entry = new QueueEntry();
        entry.setAppointment(appointment);
        entry.setClinic(appointment.getClinic());
        entry.setVeterinarian(vet);
        entry.setQueueNumber(nextQueueNumber);
        entry.setStatus(QueueStatus.WAITING);
        entry.setCheckInTime(LocalDateTime.now());
        entry.setNotes(request.getNotes());

        QueueEntry saved = queueEntryRepository.save(entry);

        auditService.logAction(SecurityUtils.getCurrentUserId(), SecurityUtils.getCurrentUserEmail(),
                "QUEUE_CHECK_IN", "QueueEntry", saved.getId().toString(), null, "SUCCESS",
                "Patient " + appointment.getPet().getName() + " checked in. Queue #" + nextQueueNumber);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<QueueDto.QueueEntryResponse> getClinicLiveQueue(Long clinicId) {
        return queueEntryRepository.findByClinicIdAndStatusInOrderByQueueNumberAsc(
                clinicId, List.of(QueueStatus.WAITING, QueueStatus.WITH_VET)
        ).stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<QueueDto.QueueEntryResponse> getVetQueue(Long vetId) {
        return queueEntryRepository.findByVeterinarianIdAndStatusInOrderByQueueNumberAsc(
                vetId, List.of(QueueStatus.WAITING, QueueStatus.WITH_VET)
        ).stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public QueueDto.QueueEntryResponse updateQueueStatus(Long queueId, QueueDto.UpdateQueueStatusRequest request) {
        QueueEntry entry = queueEntryRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("QueueEntry", "id", queueId));

        QueueStatus target = request.getStatus();
        entry.setStatus(target);

        Appointment appointment = entry.getAppointment();

        if (target == QueueStatus.WITH_VET) {
            entry.setConsultationStartTime(LocalDateTime.now());
            if (appointment != null) {
                appointment.setStatus(AppointmentStatus.IN_CONSULTATION);
                appointmentRepository.save(appointment);
            }
        } else if (target == QueueStatus.COMPLETED) {
            entry.setConsultationEndTime(LocalDateTime.now());
            if (appointment != null) {
                appointment.setStatus(AppointmentStatus.COMPLETED);
                appointmentRepository.save(appointment);
            }
        }

        QueueEntry updated = queueEntryRepository.save(entry);

        auditService.logAction(SecurityUtils.getCurrentUserId(), SecurityUtils.getCurrentUserEmail(),
                "QUEUE_STATUS_UPDATE", "QueueEntry", updated.getId().toString(), null, "SUCCESS",
                "Queue entry #" + updated.getQueueNumber() + " updated to " + target);

        return mapToResponse(updated);
    }

    public QueueDto.QueueEntryResponse mapToResponse(QueueEntry q) {
        QueueDto.QueueEntryResponse resp = new QueueDto.QueueEntryResponse();
        resp.setId(q.getId());
        if (q.getAppointment() != null) {
            resp.setAppointmentId(q.getAppointment().getId());
            resp.setReason(q.getAppointment().getReason());
            if (q.getAppointment().getPet() != null) {
                resp.setPetId(q.getAppointment().getPet().getId());
                resp.setPetName(q.getAppointment().getPet().getName());
                resp.setPetSpecies(q.getAppointment().getPet().getSpecies());
                resp.setPetBreed(q.getAppointment().getPet().getBreed());
            }
            if (q.getAppointment().getOwner() != null) {
                resp.setOwnerId(q.getAppointment().getOwner().getId());
                resp.setOwnerName(q.getAppointment().getOwner().getName());
                resp.setOwnerPhone(q.getAppointment().getOwner().getPhone());
            }
        }
        if (q.getClinic() != null) {
            resp.setClinicId(q.getClinic().getId());
            resp.setClinicName(q.getClinic().getName());
        }
        if (q.getVeterinarian() != null) {
            resp.setVeterinarianId(q.getVeterinarian().getId());
            resp.setVeterinarianName(q.getVeterinarian().getName());
        }
        resp.setQueueNumber(q.getQueueNumber());
        resp.setStatus(q.getStatus());
        resp.setCheckInTime(q.getCheckInTime());
        resp.setConsultationStartTime(q.getConsultationStartTime());
        resp.setConsultationEndTime(q.getConsultationEndTime());
        resp.setNotes(q.getNotes());
        return resp;
    }
}

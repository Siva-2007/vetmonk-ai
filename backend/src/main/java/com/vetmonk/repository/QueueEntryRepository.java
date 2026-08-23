package com.vetmonk.repository;

import com.vetmonk.entity.QueueEntry;
import com.vetmonk.entity.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {

    Optional<QueueEntry> findByAppointmentId(Long appointmentId);

    List<QueueEntry> findByClinicIdAndStatusInOrderByQueueNumberAsc(Long clinicId, List<QueueStatus> statuses);

    List<QueueEntry> findByVeterinarianIdAndStatusInOrderByQueueNumberAsc(Long vetId, List<QueueStatus> statuses);

    @Query("SELECT COALESCE(MAX(q.queueNumber), 0) FROM QueueEntry q WHERE q.clinic.id = :clinicId AND q.checkInTime >= :startOfDay AND q.checkInTime <= :endOfDay")
    Integer findMaxQueueNumberForClinicAndDate(@Param("clinicId") Long clinicId, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    long countByClinicIdAndStatus(Long clinicId, QueueStatus status);
}

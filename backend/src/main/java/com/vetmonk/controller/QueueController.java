package com.vetmonk.controller;

import com.vetmonk.dto.QueueDto;
import com.vetmonk.security.SecurityUtils;
import com.vetmonk.service.QueueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
@Tag(
        name = "Queue Management",
        description = "Reception check-in, real-time waiting queue, and token sequence management"
)
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    @PostMapping("/check-in")
    @Operation(summary = "Check in an appointment to generate a queue entry token")
    public ResponseEntity<QueueDto.QueueEntryResponse> checkIn(
            @Valid @RequestBody QueueDto.CheckInRequest request) {

        QueueDto.QueueEntryResponse response =
                queueService.checkIn(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Receptionist live queue.
     *
     * Frontend calls:
     * GET /api/queue/live?clinicId=1
     */
    @GetMapping("/live")
    @Operation(summary = "Get live reception queue")
    public ResponseEntity<List<QueueDto.QueueEntryResponse>> getLiveQueue(
            @RequestParam(defaultValue = "1") Long clinicId) {

        return ResponseEntity.ok(
                queueService.getClinicLiveQueue(clinicId)
        );
    }

    /**
     * Get the active queue assigned to the currently authenticated veterinarian.
     */
    @GetMapping("/my-queue")
    @Operation(summary = "Get the current veterinarian's waiting queue")
    public ResponseEntity<List<QueueDto.QueueEntryResponse>> getMyQueue() {

        Long currentUserId = SecurityUtils.getCurrentUserId();

        return ResponseEntity.ok(
                queueService.getVetQueue(currentUserId)
        );
    }

    @GetMapping("/clinic/{clinicId}")
    @Operation(summary = "Get live active queue for a clinic")
    public ResponseEntity<List<QueueDto.QueueEntryResponse>> getClinicLiveQueue(
            @PathVariable Long clinicId) {

        return ResponseEntity.ok(
                queueService.getClinicLiveQueue(clinicId)
        );
    }

    @GetMapping("/vet/{vetId}")
    @Operation(summary = "Get waiting and active queue for a veterinarian")
    public ResponseEntity<List<QueueDto.QueueEntryResponse>> getVetQueue(
            @PathVariable Long vetId) {

        return ResponseEntity.ok(
                queueService.getVetQueue(vetId)
        );
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update queue entry status")
    public ResponseEntity<QueueDto.QueueEntryResponse> updateQueueStatus(
            @PathVariable Long id,
            @Valid @RequestBody QueueDto.UpdateQueueStatusRequest request) {

        return ResponseEntity.ok(
                queueService.updateQueueStatus(id, request)
        );
    }
}
package com.vetmonk.service;

import com.vetmonk.ai.PromptSafetyService;
import com.vetmonk.dto.CustomerQueryDto;
import com.vetmonk.entity.*;
import com.vetmonk.exception.ResourceNotFoundException;
import com.vetmonk.exception.SecurityViolationException;
import com.vetmonk.repository.CustomerQueryRepository;
import com.vetmonk.repository.PetRepository;
import com.vetmonk.repository.UserRepository;
import com.vetmonk.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerQueryService {

    private final CustomerQueryRepository queryRepository;
    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final PromptSafetyService promptSafetyService;
    private final AuditService auditService;

    public CustomerQueryService(CustomerQueryRepository queryRepository,
                                UserRepository userRepository,
                                PetRepository petRepository,
                                PromptSafetyService promptSafetyService,
                                AuditService auditService) {
        this.queryRepository = queryRepository;
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.promptSafetyService = promptSafetyService;
        this.auditService = auditService;
    }

    @Transactional
    public CustomerQueryDto.CustomerQueryResponse createQuery(CustomerQueryDto.CreateQueryRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        Pet pet = null;
        if (request.getPetId() != null) {
            pet = petRepository.findById(request.getPetId()).orElse(null);
        }

        // AI Assistant Auto-classification & Triage Assessment
        PromptSafetyService.SafetyAssessment safety = promptSafetyService.assessSafety(request.getDescription());
        String aiPriority = safety.isEmergency() ? "URGENT" : (safety.getTriageLevel().equals("MEDIUM") ? "HIGH" : "MEDIUM");
        String aiCategory = inferCategory(request.getSubject() + " " + request.getDescription());

        CustomerQuery query = new CustomerQuery();
        query.setUser(currentUser);
        query.setPet(pet);
        query.setSubject(request.getSubject().trim());
        query.setCategory(request.getCategory() != null ? request.getCategory() : aiCategory);
        query.setDescription(request.getDescription().trim());
        query.setPriority(safety.isEmergency() ? QueryPriority.URGENT : (request.getPriority() != null ? request.getPriority() : QueryPriority.MEDIUM));
        query.setStatus(QueryStatus.OPEN);
        query.setAiSuggestedCategory(aiCategory);
        query.setAiSuggestedPriority(aiPriority);

        CustomerQuery saved = queryRepository.save(query);

        auditService.logAction(currentUserId, currentUser.getEmail(),
                "QUERY_CREATE", "CustomerQuery", saved.getId().toString(), null, "SUCCESS",
                "Created query: " + saved.getSubject() + " (Priority: " + saved.getPriority() + ")");

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CustomerQueryDto.CustomerQueryResponse> getMyQueries() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return queryRepository.findByUserIdOrderByCreatedAtDesc(currentUserId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<CustomerQueryDto.CustomerQueryResponse> getAllQueriesPaged(Pageable pageable) {
        if (!SecurityUtils.isStaffMember()) {
            throw new SecurityViolationException("Access denied: Only staff members can view the all queries queue.");
        }
        return queryRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public CustomerQueryDto.CustomerQueryResponse getQueryById(Long id) {
        CustomerQuery query = queryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CustomerQuery", "id", id));

        if (SecurityUtils.isPetOwner() && !query.getUser().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new SecurityViolationException("Access denied: You cannot view queries authored by other users.");
        }

        return mapToResponse(query);
    }

    @Transactional
    public CustomerQueryDto.CustomerQueryResponse updateQuery(Long id, CustomerQueryDto.UpdateQueryRequest request) {
        if (!SecurityUtils.isStaffMember()) {
            throw new SecurityViolationException("Access denied: Only staff members can update customer query status.");
        }

        CustomerQuery query = queryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CustomerQuery", "id", id));

        if (request.getStatus() != null) query.setStatus(request.getStatus());
        if (request.getPriority() != null) query.setPriority(request.getPriority());
        if (request.getResolutionNotes() != null) query.setResolutionNotes(request.getResolutionNotes());

        if (request.getAssignedToId() != null) {
            User staff = userRepository.findById(request.getAssignedToId()).orElse(null);
            query.setAssignedTo(staff);
        }

        CustomerQuery updated = queryRepository.save(query);

        auditService.logAction(SecurityUtils.getCurrentUserId(), SecurityUtils.getCurrentUserEmail(),
                "QUERY_UPDATE", "CustomerQuery", updated.getId().toString(), null, "SUCCESS",
                "Updated query status to " + updated.getStatus());

        return mapToResponse(updated);
    }

    private String inferCategory(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("appointment") || lower.contains("booking") || lower.contains("reschedule")) return "APPOINTMENT";
        if (lower.contains("bill") || lower.contains("payment") || lower.contains("invoice") || lower.contains("cost")) return "BILLING";
        if (lower.contains("vomit") || lower.contains("pain") || lower.contains("sick") || lower.contains("medicine") || lower.contains("vaccin")) return "MEDICAL_INQUIRY";
        if (lower.contains("app") || lower.contains("login") || lower.contains("password") || lower.contains("bug")) return "TECHNICAL";
        return "GENERAL_PET_CARE";
    }

    public CustomerQueryDto.CustomerQueryResponse mapToResponse(CustomerQuery q) {
        CustomerQueryDto.CustomerQueryResponse resp = new CustomerQueryDto.CustomerQueryResponse();
        resp.setId(q.getId());
        if (q.getUser() != null) {
            resp.setUserId(q.getUser().getId());
            resp.setUserName(q.getUser().getName());
            resp.setUserEmail(q.getUser().getEmail());
            resp.setUserPhone(q.getUser().getPhone());
        }
        if (q.getPet() != null) {
            resp.setPetId(q.getPet().getId());
            resp.setPetName(q.getPet().getName());
            resp.setPetSpecies(q.getPet().getSpecies());
        }
        resp.setSubject(q.getSubject());
        resp.setCategory(q.getCategory());
        resp.setDescription(q.getDescription());
        resp.setPriority(q.getPriority());
        resp.setStatus(q.getStatus());
        if (q.getAssignedTo() != null) {
            resp.setAssignedToId(q.getAssignedTo().getId());
            resp.setAssignedToName(q.getAssignedTo().getName());
        }
        resp.setResolutionNotes(q.getResolutionNotes());
        resp.setAiSuggestedCategory(q.getAiSuggestedCategory());
        resp.setAiSuggestedPriority(q.getAiSuggestedPriority());
        resp.setCreatedAt(q.getCreatedAt());
        resp.setUpdatedAt(q.getUpdatedAt());
        return resp;
    }
}

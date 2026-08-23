package com.vetmonk.controller;

import com.vetmonk.ai.AiAssistantService;
import com.vetmonk.dto.AiDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "VetMonk AI Assistant", description = "AI Veterinary Assistant, RAG Knowledge Base Retrieval, Safety Triage, and Prompt Injection Defense")
public class AiController {

    private final AiAssistantService aiAssistantService;

    public AiController(AiAssistantService aiAssistantService) {
        this.aiAssistantService = aiAssistantService;
    }

    @PostMapping("/chat")
    @Operation(summary = "Send question to VetMonk AI Assistant (with safety triage and grounded RAG)")
    public ResponseEntity<AiDto.AiChatResponse> chat(@Valid @RequestBody AiDto.AiChatRequest request) {
        AiDto.AiChatResponse response = aiAssistantService.processChat(request);
        return ResponseEntity.ok(response);
    }
}

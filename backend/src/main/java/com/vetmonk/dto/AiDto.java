package com.vetmonk.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class AiDto {

    public static class AiChatRequest {
        @NotBlank(message = "Message cannot be empty")
        private String message;

        private Long petId; // Optional: If provided, backend validates ownership and adds authorized pet context (species, breed, age, allergies, existing conditions)
        private String language = "en"; // en, ta, hi, te, ml, kn
        private List<ChatMessage> history;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Long getPetId() { return petId; }
        public void setPetId(Long petId) { this.petId = petId; }
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        public List<ChatMessage> getHistory() { return history; }
        public void setHistory(List<ChatMessage> history) { this.history = history; }
    }

    public static class ChatMessage {
        private String role; // "user" or "model" / "assistant"
        private String content;

        public ChatMessage() {}
        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class AiChatResponse {
        private String response;
        private String triageLevel; // LOW, MEDIUM, HIGH (EMERGENCY)
        private boolean emergencyAlert;
        private List<String> groundedSources;
        private String suggestedAction;
        private String disclaimer;

        public AiChatResponse() {}

        public AiChatResponse(String response, String triageLevel, boolean emergencyAlert, List<String> groundedSources, String suggestedAction) {
            this.response = response;
            this.triageLevel = triageLevel;
            this.emergencyAlert = emergencyAlert;
            this.groundedSources = groundedSources;
            this.suggestedAction = suggestedAction;
            this.disclaimer = "VetMonk AI provides educational assistance only and cannot replace professional veterinary clinical diagnosis or treatment.";
        }

        public String getResponse() { return response; }
        public void setResponse(String response) { this.response = response; }
        public String getTriageLevel() { return triageLevel; }
        public void setTriageLevel(String triageLevel) { this.triageLevel = triageLevel; }
        public boolean isEmergencyAlert() { return emergencyAlert; }
        public void setEmergencyAlert(boolean emergencyAlert) { this.emergencyAlert = emergencyAlert; }
        public List<String> getGroundedSources() { return groundedSources; }
        public void setGroundedSources(List<String> groundedSources) { this.groundedSources = groundedSources; }
        public String getSuggestedAction() { return suggestedAction; }
        public void setSuggestedAction(String suggestedAction) { this.suggestedAction = suggestedAction; }
        public String getDisclaimer() { return disclaimer; }
        public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
    }
}

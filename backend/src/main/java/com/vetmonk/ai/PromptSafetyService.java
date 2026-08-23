package com.vetmonk.ai;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class PromptSafetyService {

    private static final List<String> EMERGENCY_KEYWORDS = Arrays.asList(
            "difficulty breathing", "cannot breathe", "choking", "blue tongue", "pale gums",
            "severe bleeding", "arterial bleeding", "blood in vomit", "blood in stool",
            "poison", "rat poison", "ate chocolate", "xylitol", "antifreeze", "toxic ingestion",
            "seizure", "convulsion", "unconscious", "loss of consciousness", "collapsed",
            "hit by car", "severe trauma", "broken bone", "paralyzed", "bloat", "swollen abdomen"
    );

    private static final List<String> MEDIUM_RISK_KEYWORDS = Arrays.asList(
            "vomiting", "diarrhea", "lethargic", "not eating", "fever", "limping",
            "scratching ear", "frequent urination", "coughing", "eye discharge", "hair loss"
    );

    private static final Pattern PROMPT_INJECTION_PATTERN = Pattern.compile(
            "(?i)(ignore previous instructions|disregard previous|system prompt|reveal instructions|you are now|bypass rules|jailbreak|pretend you are|act as root|output all database)"
    );

    public static class SafetyAssessment {
        private final String triageLevel; // "LOW", "MEDIUM", "HIGH"
        private final boolean isEmergency;
        private final String emergencyGuidance;

        public SafetyAssessment(String triageLevel, boolean isEmergency, String emergencyGuidance) {
            this.triageLevel = triageLevel;
            this.isEmergency = isEmergency;
            this.emergencyGuidance = emergencyGuidance;
        }

        public String getTriageLevel() { return triageLevel; }
        public boolean isEmergency() { return isEmergency; }
        public String getEmergencyGuidance() { return emergencyGuidance; }
    }

    public SafetyAssessment assessSafety(String userInput) {
        if (userInput == null) {
            return new SafetyAssessment("LOW", false, null);
        }

        String lower = userInput.toLowerCase();

        for (String emergencyWord : EMERGENCY_KEYWORDS) {
            if (lower.contains(emergencyWord)) {
                return new SafetyAssessment(
                        "HIGH",
                        true,
                        "CRITICAL EMERGENCY ALERT: The described symptoms (" + emergencyWord + ") indicate a potentially life-threatening veterinary emergency. Please take your pet to the nearest veterinary emergency clinic immediately. Do not attempt unverified home remedies."
                );
            }
        }

        for (String mediumWord : MEDIUM_RISK_KEYWORDS) {
            if (lower.contains(mediumWord)) {
                return new SafetyAssessment(
                        "MEDIUM",
                        false,
                        "Clinical Assessment: The observed symptoms suggest a condition that warrants a veterinary check-up. We recommend scheduling an appointment with a veterinarian."
                );
            }
        }

        return new SafetyAssessment("LOW", false, null);
    }

    public String sanitizeUserInput(String input) {
        if (input == null) return "";

        // Remove or neutralize prompt injection attempts
        String sanitized = PROMPT_INJECTION_PATTERN.matcher(input).replaceAll("[USER_INPUT_FILTERED]");

        if (sanitized.length() > 4000) {
            sanitized = sanitized.substring(0, 4000);
        }

        return sanitized;
    }
}

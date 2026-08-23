package com.vetmonk.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vetmonk.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
public class AiClient {

    private static final Logger logger = LoggerFactory.getLogger(AiClient.class);

    private final AppProperties appProperties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AiClient(AppProperties appProperties) {
        this.appProperties = appProperties;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String generateResponse(String systemPrompt, String userPrompt, String ragContext, String language) {
        String apiKey = appProperties.getAi().getApiKey();

        if (apiKey != null && !apiKey.trim().isEmpty()) {
            try {
                return callGeminiApi(apiKey, systemPrompt, userPrompt, ragContext, language);
            } catch (Exception e) {
                logger.warn("External AI call failed ({}), falling back to grounded domain expert generator", e.getMessage());
            }
        }

        // Safe, intelligent grounded domain fallback response
        return generateGroundedExpertFallback(userPrompt, ragContext, language);
    }

    private String callGeminiApi(String apiKey, String systemPrompt, String userPrompt, String ragContext, String language) throws Exception {
        String url = String.format("%s/%s:generateContent?key=%s",
                appProperties.getAi().getEndpoint(),
                appProperties.getAi().getModel(),
                apiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String fullPrompt = String.format(
                "%s\n\nLanguage instruction: Please provide the response in '%s' language.\n\nKnowledge Context:\n%s\n\nUser Question:\n%s",
                systemPrompt, language, (ragContext.isEmpty() ? "No specific knowledge articles attached." : ragContext), userPrompt
        );

        Map<String, Object> textPart = Map.of("text", fullPrompt);
        Map<String, Object> contentPart = Map.of("parts", List.of(textPart));
        Map<String, Object> requestBody = Map.of("contents", List.of(contentPart));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                if (!textNode.isMissingNode()) {
                    return textNode.asText();
                }
            }
        }

        throw new RuntimeException("Unexpected response structure from AI service");
    }

    private String generateGroundedExpertFallback(String userPrompt, String ragContext, String language) {
        StringBuilder sb = new StringBuilder();

        // Multilingual greeting
        String greeting = switch (language != null ? language.toLowerCase() : "en") {
            case "ta" -> "வணக்கம்! வெட்மான்க் ஏஐ (VetMonk AI) கால்நடை மருத்துவ உதவியாளர்:";
            case "hi" -> "नमस्ते! वेटमोंक एआई (VetMonk AI) पशु चिकित्सा सहायक:";
            case "te" -> "నమస్కారం! వెట్మోంక్ ఏఐ (VetMonk AI) పశువైద్య సహాయకుడు:";
            case "ml" -> "നമസ്കാരം! വെറ്റ്മോങ്ക് എഐ (VetMonk AI) മൃഗസംരക്ഷണ സഹായി:";
            case "kn" -> "ನಮಸ್ಕಾರ! ವೆಟ್‌ಮಾಂಕ್ ಎಐ (VetMonk AI) ಪಶುವೈದ್ಯಕೀಯ ಸಹಾಯಕ:";
            default -> "Hello! I am your VetMonk AI Veterinary Healthcare Assistant.";
        };

        sb.append(greeting).append("\n\n");

        if (ragContext != null && !ragContext.trim().isEmpty()) {
            sb.append("Based on our verified veterinary medical library:\n");
            // Extract the core guidance from RAG context
            String[] lines = ragContext.split("\n");
            for (String line : lines) {
                if (!line.startsWith("[Source") && !line.trim().isEmpty()) {
                    sb.append("• ").append(line.trim()).append("\n");
                }
            }
            sb.append("\n");
        } else {
            sb.append("Thank you for your question regarding veterinary health and pet care.\n\n");
            sb.append("Key Recommendations for your pet's wellness:\n");
            sb.append("• Ensure continuous access to fresh water and age-appropriate balanced nutrition.\n");
            sb.append("• Maintain an up-to-date core vaccination and parasite prevention schedule.\n");
            sb.append("• Monitor for changes in appetite, energy levels, hydration, or behavior.\n");
            sb.append("• If symptoms persist or worsen, please schedule a clinic consultation.\n\n");
        }

        sb.append("\n*Important Reminder: This information is for pet care education only. Always consult a licensed veterinarian for definitive diagnosis and treatment plans.*");

        return sb.toString();
    }
}

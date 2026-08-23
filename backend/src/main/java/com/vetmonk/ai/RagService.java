package com.vetmonk.ai;

import com.vetmonk.entity.KnowledgeChunk;
import com.vetmonk.repository.KnowledgeChunkRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final KnowledgeChunkRepository knowledgeChunkRepository;

    public RagService(KnowledgeChunkRepository knowledgeChunkRepository) {
        this.knowledgeChunkRepository = knowledgeChunkRepository;
    }

    public static class RetrievalResult {
        private final String contextText;
        private final List<String> sourceCitations;
        private final boolean hasRelevantKnowledge;

        public RetrievalResult(String contextText, List<String> sourceCitations, boolean hasRelevantKnowledge) {
            this.contextText = contextText;
            this.sourceCitations = sourceCitations;
            this.hasRelevantKnowledge = hasRelevantKnowledge;
        }

        public String getContextText() { return contextText; }
        public List<String> getSourceCitations() { return sourceCitations; }
        public boolean isHasRelevantKnowledge() { return hasRelevantKnowledge; }
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public RetrievalResult retrieveRelevantKnowledge(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new RetrievalResult("", Collections.emptyList(), false);
        }

        List<KnowledgeChunk> allChunks = knowledgeChunkRepository.findAll();
        if (allChunks.isEmpty()) {
            return new RetrievalResult("", Collections.emptyList(), false);
        }

        // Tokenize query
        Set<String> queryTokens = Arrays.stream(query.toLowerCase().split("[^a-zA-Z0-9]+"))
                .filter(s -> s.length() > 2)
                .filter(s -> !isStopWord(s))
                .collect(Collectors.toSet());

        if (queryTokens.isEmpty()) {
            return new RetrievalResult("", Collections.emptyList(), false);
        }

        // Score chunks based on term frequency and keyword matches
        List<ScoredChunk> scoredList = new ArrayList<>();
        for (KnowledgeChunk chunk : allChunks) {
            double score = calculateScore(chunk, queryTokens);
            if (score > 0) {
                scoredList.add(new ScoredChunk(chunk, score));
            }
        }

        scoredList.sort((a, b) -> Double.compare(b.score, a.score));

        // Take top 3 most relevant chunks
        List<KnowledgeChunk> topChunks = scoredList.stream()
                .limit(3)
                .map(sc -> sc.chunk)
                .toList();

        if (topChunks.isEmpty()) {
            return new RetrievalResult("", Collections.emptyList(), false);
        }

        StringBuilder contextBuilder = new StringBuilder();
        List<String> citations = new ArrayList<>();

        for (int i = 0; i < topChunks.size(); i++) {
            KnowledgeChunk chunk = topChunks.get(i);
            String docTitle = chunk.getDocument() != null ? chunk.getDocument().getTitle() : "Veterinary Care Guidelines";
            String source = chunk.getDocument() != null ? chunk.getDocument().getSource() : "VetMonk Knowledge Base";

            contextBuilder.append(String.format("[Source %d: %s (%s)]\n%s\n\n", i + 1, docTitle, source, chunk.getContent()));
            citations.add(docTitle + " (" + source + ")");
        }

        return new RetrievalResult(contextBuilder.toString().trim(), citations, true);
    }

    private double calculateScore(KnowledgeChunk chunk, Set<String> queryTokens) {
        String content = chunk.getContent().toLowerCase();
        String keywords = chunk.getKeywords() != null ? chunk.getKeywords().toLowerCase() : "";
        String category = chunk.getCategory() != null ? chunk.getCategory().toLowerCase() : "";

        double score = 0;
        for (String token : queryTokens) {
            if (keywords.contains(token)) {
                score += 3.0; // Higher weight for indexed keywords
            }
            if (category.contains(token)) {
                score += 2.0;
            }
            if (content.contains(token)) {
                score += 1.0;
            }
        }
        return score;
    }

    private boolean isStopWord(String word) {
        Set<String> stopWords = Set.of(
                "the", "and", "for", "that", "this", "with", "have", "from", "what",
                "how", "can", "why", "when", "where", "which", "are", "about", "your"
        );
        return stopWords.contains(word);
    }

    private static class ScoredChunk {
        final KnowledgeChunk chunk;
        final double score;

        ScoredChunk(KnowledgeChunk chunk, double score) {
            this.chunk = chunk;
            this.score = score;
        }
    }
}

package com.vetmonk.service;

import com.vetmonk.dto.DocumentDto;
import com.vetmonk.entity.Document;
import com.vetmonk.entity.Pet;
import com.vetmonk.entity.Role;
import com.vetmonk.entity.User;
import com.vetmonk.exception.ResourceNotFoundException;
import com.vetmonk.exception.SecurityViolationException;
import com.vetmonk.repository.DocumentRepository;
import com.vetmonk.repository.PetRepository;
import com.vetmonk.repository.UserRepository;
import com.vetmonk.security.SecurityUtils;
import com.vetmonk.storage.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final OcrService ocrService;
    private final AuditService auditService;

    public DocumentService(DocumentRepository documentRepository,
                           PetRepository petRepository,
                           UserRepository userRepository,
                           FileStorageService fileStorageService,
                           OcrService ocrService,
                           AuditService auditService) {
        this.documentRepository = documentRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.ocrService = ocrService;
        this.auditService = auditService;
    }

    @Transactional
    public DocumentDto.DocumentResponse uploadDocument(MultipartFile file, Long petId, String documentType) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        Pet pet = null;
        if (petId != null) {
            pet = petRepository.findById(petId)
                    .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", petId));

            if (SecurityUtils.isPetOwner() && !pet.getOwner().getId().equals(currentUserId)) {
                throw new SecurityViolationException("Access denied: You cannot upload documents for pets you do not own.");
            }
        }

        // 1. Secure storage with UUID filename & path traversal protection
        String storedFileName = fileStorageService.store(file);

        // 2. Perform OCR and Text Extraction
        DocumentDto.DocumentOcrResult ocrResult = ocrService.processDocument(storedFileName, file.getContentType());

        Document document = new Document();
        document.setPet(pet);
        document.setUploadedBy(currentUser);
        document.setStoredFileName(storedFileName);
        document.setOriginalFileName(file.getOriginalFilename());
        document.setContentType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setDocumentType(documentType != null ? documentType : "LAB_REPORT");
        document.setExtractedText(ocrResult.getText());
        document.setAiSummary(ocrResult.getSummary());
        document.setOcrProcessed(ocrResult.isSuccess());

        Document saved = documentRepository.save(document);

        auditService.logAction(currentUserId, currentUser.getEmail(),
                "FILE_UPLOAD", "Document", saved.getId().toString(), null, "SUCCESS",
                "Uploaded document: " + saved.getOriginalFileName() + " (OCR Processed: " + saved.isOcrProcessed() + ")");

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public DocumentDto.DocumentResponse getDocumentById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));

        validateDocumentAccess(document);

        return mapToResponse(document);
    }

    @Transactional(readOnly = true)
    public Resource downloadDocumentFile(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));

        validateDocumentAccess(document);

        return fileStorageService.loadAsResource(document.getStoredFileName());
    }

    @Transactional(readOnly = true)
    public List<DocumentDto.DocumentResponse> getMyDocuments() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return documentRepository.findByUploadedByIdOrderByCreatedAtDesc(currentUserId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentDto.DocumentResponse> getPetDocuments(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet", "id", petId));

        if (SecurityUtils.isPetOwner() && !pet.getOwner().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new SecurityViolationException("Access denied: You cannot view documents for pets you do not own.");
        }

        return documentRepository.findByPetIdOrderByCreatedAtDesc(petId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void deleteDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));

        validateDocumentAccess(document);

        fileStorageService.delete(document.getStoredFileName());
        documentRepository.delete(document);

        auditService.logAction(SecurityUtils.getCurrentUserId(), SecurityUtils.getCurrentUserEmail(),
                "DOCUMENT_DELETE", "Document", id.toString(), null, "SUCCESS", "Deleted document: " + document.getOriginalFileName());
    }

    private void validateDocumentAccess(Document document) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role currentUserRole = SecurityUtils.getCurrentUserRole();

        if (currentUserRole == Role.PET_OWNER) {
            boolean isUploader = document.getUploadedBy().getId().equals(currentUserId);
            boolean isPetOwner = document.getPet() != null && document.getPet().getOwner().getId().equals(currentUserId);

            if (!isUploader && !isPetOwner) {
                throw new SecurityViolationException("Access denied: You do not have permission to view or download this document.");
            }
        }
    }

    public DocumentDto.DocumentResponse mapToResponse(Document d) {
        DocumentDto.DocumentResponse resp = new DocumentDto.DocumentResponse();
        resp.setId(d.getId());
        if (d.getPet() != null) {
            resp.setPetId(d.getPet().getId());
            resp.setPetName(d.getPet().getName());
        }
        if (d.getUploadedBy() != null) {
            resp.setUploadedById(d.getUploadedBy().getId());
            resp.setUploadedByName(d.getUploadedBy().getName());
        }
        resp.setOriginalFileName(d.getOriginalFileName());
        resp.setContentType(d.getContentType());
        resp.setFileSize(d.getFileSize());
        resp.setDocumentType(d.getDocumentType());
        resp.setExtractedText(d.getExtractedText());
        resp.setAiSummary(d.getAiSummary());
        resp.setOcrProcessed(d.isOcrProcessed());
        resp.setCreatedAt(d.getCreatedAt());
        return resp;
    }
}

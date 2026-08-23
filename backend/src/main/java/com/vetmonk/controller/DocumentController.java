package com.vetmonk.controller;

import com.vetmonk.dto.DocumentDto;
import com.vetmonk.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@Tag(
        name = "Documents & OCR",
        description = "Secure veterinary document upload, OCR parsing, text extraction, and private download"
)
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    // =========================================================
    // UPLOAD DOCUMENT
    // Supports:
    // POST /api/documents
    // POST /api/documents/upload
    // =========================================================

    @PostMapping(
            value = {"", "/upload"},
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(
            summary = "Upload document (PDF, JPG, PNG) and trigger automatic OCR"
    )
    public ResponseEntity<DocumentDto.DocumentResponse> uploadDocument(

            @RequestParam("file")
            MultipartFile file,

            @RequestParam(value = "title", required = false)
            String title,

            @RequestParam(value = "petId", required = false)
            Long petId,

            @RequestParam(
                    value = "documentType",
                    defaultValue = "LAB_REPORT"
            )
            String documentType
    ) {

        // Validate file
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        /*
         * The current DocumentService accepts:
         *
         * uploadDocument(file, petId, documentType)
         *
         * Therefore title is accepted from the frontend,
         * but is not passed to the service here.
         *
         * If you want the custom title stored in the database,
         * we can add title support to DocumentService later.
         */

        DocumentDto.DocumentResponse response =
                documentService.uploadDocument(
                        file,
                        petId,
                        documentType
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }


    // =========================================================
    // GET MY DOCUMENTS
    // =========================================================

    @GetMapping("/my")
    @Operation(
            summary = "Get documents uploaded by current user"
    )
    public ResponseEntity<List<DocumentDto.DocumentResponse>>
    getMyDocuments() {

        return ResponseEntity.ok(
                documentService.getMyDocuments()
        );
    }


    // =========================================================
    // GET PET DOCUMENTS
    // =========================================================

    @GetMapping("/pet/{petId}")
    @Operation(
            summary = "Get all documents for a pet (With ownership check)"
    )
    public ResponseEntity<List<DocumentDto.DocumentResponse>>
    getPetDocuments(
            @PathVariable Long petId
    ) {

        return ResponseEntity.ok(
                documentService.getPetDocuments(petId)
        );
    }


    // =========================================================
    // GET DOCUMENT BY ID
    // =========================================================

    @GetMapping("/{id}")
    @Operation(
            summary = "Get document metadata and extracted OCR text"
    )
    public ResponseEntity<DocumentDto.DocumentResponse>
    getDocumentById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                documentService.getDocumentById(id)
        );
    }


    // =========================================================
    // DOWNLOAD DOCUMENT
    // =========================================================

    @GetMapping("/{id}/download")
    @Operation(
            summary = "Securely download raw document file"
    )
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id
    ) {

        DocumentDto.DocumentResponse doc =
                documentService.getDocumentById(id);

        Resource file =
                documentService.downloadDocumentFile(id);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                doc.getOriginalFileName() +
                                "\""
                )
                .contentType(
                        MediaType.parseMediaType(
                                doc.getContentType()
                        )
                )
                .body(file);
    }


    // =========================================================
    // DELETE DOCUMENT
    // =========================================================

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete document"
    )
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id
    ) {

        documentService.deleteDocument(id);

        return ResponseEntity.noContent().build();
    }
}
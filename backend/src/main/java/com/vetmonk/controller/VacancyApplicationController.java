package com.vetmonk.controller;

import com.vetmonk.dto.VacancyApplicationDto;
import com.vetmonk.service.VacancyApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/vacancies")
@Tag(
        name = "Vacancy Applications",
        description = "Public job vacancy applications"
)
public class VacancyApplicationController {


    private final VacancyApplicationService
            vacancyApplicationService;


    public VacancyApplicationController(
            VacancyApplicationService vacancyApplicationService) {

        this.vacancyApplicationService =
                vacancyApplicationService;
    }


    // =========================================================
    // SUBMIT APPLICATION
    // =========================================================

    @PostMapping(
            value = "/{vacancyId}/applications",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(
            summary = "Submit an application for a vacancy"
    )
    public ResponseEntity<?> submitApplication(

            @PathVariable Long vacancyId,

            @RequestParam
            @NotBlank(message = "Full name is required")
            String fullName,

            @RequestParam
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email address")
            String email,

            @RequestParam
            @NotBlank(message = "Phone number is required")
            String phone,

            @RequestParam(
                    required = false,
                    defaultValue = ""
            )
            String coverLetter,

            @RequestParam("resume")
            MultipartFile resume

    ) {

        try {

            VacancyApplicationDto.ApplicationResponse
                    response =
                    vacancyApplicationService.submitApplication(
                            vacancyId,
                            fullName,
                            email,
                            phone,
                            coverLetter,
                            resume
                    );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);


        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ErrorResponse(
                                    e.getMessage()
                            )
                    );

        } catch (Exception e) {

            /*
             * Do not expose internal exception details to
             * public users.
             */

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ErrorResponse(
                                    "Unable to submit application. Please try again later."
                            )
                    );
        }
    }


    // =========================================================
    // ERROR RESPONSE
    // =========================================================

    private static class ErrorResponse {

        private final String message;


        public ErrorResponse(String message) {
            this.message = message;
        }


        public String getMessage() {
            return message;
        }
    }
}
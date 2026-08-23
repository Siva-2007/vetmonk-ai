package com.vetmonk.controller;

import com.vetmonk.dto.CustomerQueryDto;
import com.vetmonk.service.CustomerQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer-queries")
@Tag(name = "Customer Support Queries", description = "Pet owner support tickets, AI auto-classification, and resolution tracking")
public class CustomerQueryController {

    private final CustomerQueryService queryService;

    public CustomerQueryController(CustomerQueryService queryService) {
        this.queryService = queryService;
    }

    @PostMapping
    @Operation(summary = "Submit a customer support query")
    public ResponseEntity<CustomerQueryDto.CustomerQueryResponse> createQuery(@Valid @RequestBody CustomerQueryDto.CreateQueryRequest request) {
        CustomerQueryDto.CustomerQueryResponse response = queryService.createQuery(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @Operation(summary = "Get support queries submitted by authenticated user")
    public ResponseEntity<List<CustomerQueryDto.CustomerQueryResponse>> getMyQueries() {
        return ResponseEntity.ok(queryService.getMyQueries());
    }

    @GetMapping
    @Operation(summary = "Get all support queries (Staff only, Paged)")
    public ResponseEntity<Page<CustomerQueryDto.CustomerQueryResponse>> getAllQueries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(queryService.getAllQueriesPaged(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get support query details by ID")
    public ResponseEntity<CustomerQueryDto.CustomerQueryResponse> getQueryById(@PathVariable Long id) {
        return ResponseEntity.ok(queryService.getQueryById(id));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update support query status and resolution (Staff only)")
    public ResponseEntity<CustomerQueryDto.CustomerQueryResponse> updateQuery(
            @PathVariable Long id,
            @RequestBody CustomerQueryDto.UpdateQueryRequest request) {
        return ResponseEntity.ok(queryService.updateQuery(id, request));
    }
}

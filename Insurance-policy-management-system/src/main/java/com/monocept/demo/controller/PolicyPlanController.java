package com.monocept.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.dto.PolicyPlanRequestDto;
import com.monocept.demo.dto.PolicyPlanResponseDto;
import com.monocept.demo.service.PolicyPlanService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PolicyPlanController {

    private final PolicyPlanService planService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PolicyPlanResponseDto>
    createPlan(
            @Valid
            @RequestBody PolicyPlanRequestDto dto) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        planService.createPlan(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public PolicyPlanResponseDto updatePlan(
            @PathVariable Long id,
            @Valid
            @RequestBody PolicyPlanRequestDto dto) {

        return planService.updatePlan(
                id,
                dto);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public PolicyPlanResponseDto updateStatus(
            @PathVariable Long id,
            @RequestParam Boolean active) {

        return planService.updateStatus(
                id,
                active);
    }

    @GetMapping("/{id}")
    @PreAuthorize(
    "hasAnyRole('ADMIN','AGENT','CUSTOMER')")
    public PolicyPlanResponseDto getPlan(
            @PathVariable Long id) {

        return planService.getPlanById(id);
    }

    @GetMapping
    @PreAuthorize(
    "hasAnyRole('ADMIN','AGENT','CUSTOMER')")
    public PageResponseDto<PolicyPlanResponseDto>
    getPlans(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "planId")
            String sortBy,

            @RequestParam(defaultValue = "asc")
            String direction,

            @RequestParam(required = false)
            Long productId,

            @RequestParam(required = false)
            Boolean active) {

        return planService.getAllPlans(
                page,
                size,
                sortBy,
                direction,
                productId,
                active);
    }
}

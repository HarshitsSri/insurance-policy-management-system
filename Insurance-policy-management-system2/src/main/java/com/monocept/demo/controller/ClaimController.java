package com.monocept.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.monocept.demo.dto.ClaimFinalDecisionRequestDto;
import com.monocept.demo.dto.ClaimRequestDto;
import com.monocept.demo.dto.ClaimReviewRequestDto;
import com.monocept.demo.service.ClaimService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

	private final ClaimService claimService;

	@PostMapping
	@PreAuthorize("hasRole('CUSTOMER')")
	public ResponseEntity<?> raiseClaim(@Valid @RequestBody ClaimRequestDto dto) {

		return ResponseEntity.status(HttpStatus.CREATED).body(claimService.raiseClaim(dto));
	}

	@PutMapping("/{id}/review")
	@PreAuthorize("hasRole('AGENT')")
	public ResponseEntity<?> reviewClaim(@PathVariable Long id, @Valid @RequestBody ClaimReviewRequestDto dto) {

		return ResponseEntity.ok(claimService.reviewClaim(id, dto));
	}

	@PutMapping("/{id}/decision")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> finalDecision(@PathVariable Long id,
			@Valid @RequestBody ClaimFinalDecisionRequestDto dto) {

		return ResponseEntity.ok(claimService.finalDecision(id, dto));
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getClaim(@PathVariable Long id) {

		return ResponseEntity.ok(claimService.getClaimById(id));
	}

	@GetMapping("/my")
	@PreAuthorize("hasRole('CUSTOMER')")
	public ResponseEntity<?> myClaims(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "createdDate") String sortBy,
			@RequestParam(defaultValue = "desc") String direction) {

		return ResponseEntity.ok(claimService.getMyClaims(page, size, sortBy, direction));
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN','AGENT')")
	public ResponseEntity<?> allClaims(

			@RequestParam(defaultValue = "0") int page,

			@RequestParam(defaultValue = "10") int size,

			@RequestParam(defaultValue = "createdDate") String sortBy,

			@RequestParam(defaultValue = "desc") String direction,

			@RequestParam(required = false) String status) {

		return ResponseEntity.ok(claimService.getAllClaims(page, size, sortBy, direction, status));
	}
}
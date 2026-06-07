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

import com.monocept.demo.dto.CustomerPolicyPurchaseRequestDto;
import com.monocept.demo.dto.PolicyIssueRequestDto;
import com.monocept.demo.service.PolicyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

	private final PolicyService policyService;

	@PostMapping("/purchase")
	@PreAuthorize("hasRole('CUSTOMER')")
	public ResponseEntity<?> purchasePolicy(

			@Valid @RequestBody CustomerPolicyPurchaseRequestDto request) {

		return ResponseEntity.status(HttpStatus.CREATED).body(policyService.purchasePolicy(request));
	}

	@PostMapping("/issue")
	@PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
	public ResponseEntity<?> issuePolicy(@RequestBody PolicyIssueRequestDto request) {

		return ResponseEntity.status(HttpStatus.CREATED).body(policyService.issuePolicy(request));
	}

	@GetMapping("/my-policies")
	@PreAuthorize("hasRole('CUSTOMER')")
	public ResponseEntity<?> myPolicies(

			@RequestParam(defaultValue = "0") int page,

			@RequestParam(defaultValue = "10") int size,

			@RequestParam(defaultValue = "policyId") String sortBy,

			@RequestParam(defaultValue = "desc") String direction) {

		return ResponseEntity.ok(policyService.getMyPolicies(page, size, sortBy, direction));
	}

	@GetMapping("/all-policies")
	@PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
	public ResponseEntity<?> getAllPolicies(

			@RequestParam(defaultValue = "0") int page,

			@RequestParam(defaultValue = "10") int size,

			@RequestParam(defaultValue = "id") String sortBy,

			@RequestParam(defaultValue = "desc") String direction,

			@RequestParam(required = false) String status) {

		return ResponseEntity.ok(policyService.getAllPolicies(page, size, sortBy, direction, status));
	}

	@GetMapping("/{policyId}")
	public ResponseEntity<?> getPolicy(@PathVariable Long policyId) {

		return ResponseEntity.ok(policyService.getPolicyById(policyId));
	}

	@PutMapping("/{policyId}/cancel")
	@PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
	public ResponseEntity<?> cancelPolicy(@PathVariable Long policyId) {

		return ResponseEntity.ok(policyService.cancelPolicy(policyId));
	}

}

package com.monocept.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.monocept.demo.dto.PremiumPaymentRequestDto;
import com.monocept.demo.service.PremiumPaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PremiumPaymentController {

	private final PremiumPaymentService paymentService;

	@PostMapping
	@PreAuthorize("hasAnyRole('CUSTOMER','AGENT')")
	public ResponseEntity<?> recordPayment(@Valid @RequestBody PremiumPaymentRequestDto dto) {

		return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.recordPayment(dto));
	}

	@GetMapping("/{paymentId}")
	@PreAuthorize("hasAnyRole('ADMIN','AGENT','CUSTOMER')")
	public ResponseEntity<?> getPayment(@PathVariable Long paymentId) {

		return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
	}

	@GetMapping("/my-payments")
	@PreAuthorize("hasRole('CUSTOMER')")
	public ResponseEntity<?> getMyPayments(

			@RequestParam(defaultValue = "0") int page,

			@RequestParam(defaultValue = "10") int size,

			@RequestParam(defaultValue = "paymentId") String sortBy,

			@RequestParam(defaultValue = "desc") String direction) {

		return ResponseEntity.ok(paymentService.getMyPayments(page, size, sortBy, direction));
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN','AGENT')")
	public ResponseEntity<?> getAllPayments(

			@RequestParam(defaultValue = "0") int page,

			@RequestParam(defaultValue = "10") int size,

			@RequestParam(defaultValue = "paymentId") String sortBy,

			@RequestParam(defaultValue = "desc") String direction,

			@RequestParam(required = false) String status) {

		return ResponseEntity.ok(paymentService.getAllPayments(page, size, sortBy, direction, status));
	}
}
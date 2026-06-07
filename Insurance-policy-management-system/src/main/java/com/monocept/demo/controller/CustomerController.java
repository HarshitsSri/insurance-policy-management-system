package com.monocept.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.monocept.demo.dto.CustomerRequestDto;
import com.monocept.demo.dto.CustomerResponseDto;
import com.monocept.demo.service.CustomerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

	private final CustomerService customerService;

	@PostMapping("/create-profile")
//    @PreAuthorize("hasRole('CUSTOMER')")
	public ResponseEntity<CustomerResponseDto> createProfile(@PathVariable String email,
			@Valid @RequestBody CustomerRequestDto request) {

		CustomerResponseDto response = customerService.createProfile(request, email);

		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PutMapping("/update-profile")
//	@PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CustomerResponseDto> updateProfile(
            @PathVariable Long customerId,
            @Valid @RequestBody CustomerRequestDto request,
            @PathVariable String email) {

        CustomerResponseDto response = customerService.updateProfile(customerId, request, email);
        return ResponseEntity.ok(response);
    }

	@GetMapping("/get-profile")
//	@PreAuthorize("hasRole('CUSTOMER')")
	public ResponseEntity<CustomerResponseDto> getProfile(@PathVariable String email) {

        CustomerResponseDto response = customerService.getOwnProfile(email);
        return ResponseEntity.ok(response);
    }

	@GetMapping("/{customerId}/profile")
//	@PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
	public ResponseEntity<CustomerResponseDto> getCustomer(@PathVariable Long customerId) {

        CustomerResponseDto response = customerService.getCustomerById(customerId);
        return ResponseEntity.ok(response);
    }

//	@GetMapping
////	@PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
//	public ResponseEntity<?> getCustomers(
//
//			@RequestParam(defaultValue = "0") int page,
//
//			@RequestParam(defaultValue = "10") int size,
//
//			@RequestParam(defaultValue = "id") String sortBy,
//
//			@RequestParam(defaultValue = "asc") String direction) {
//
//		return ResponseEntity.ok(customerService.getAllCustomers(page, size, sortBy, direction));
//	}

}
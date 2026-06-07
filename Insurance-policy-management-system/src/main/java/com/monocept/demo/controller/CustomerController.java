package com.monocept.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    // Customer creates own profile
    @PostMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CustomerResponseDto> createProfile(
            @Valid @RequestBody CustomerRequestDto request) {

        CustomerResponseDto response = customerService.createProfile(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Customer views own profile
    @GetMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CustomerResponseDto> getOwnProfile() {

        CustomerResponseDto response = customerService.getOwnProfile();

        return ResponseEntity.ok(response);
    }

    // Customer updates own profile
    @PutMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CustomerResponseDto> updateProfile(
            @Valid @RequestBody CustomerRequestDto request) {

        CustomerResponseDto response = customerService.updateProfile(request);

        return ResponseEntity.ok(response);
    }

    // Admin / Agent view customer by id
    @GetMapping("/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<CustomerResponseDto> getCustomer(
            @PathVariable Long customerId) {

        CustomerResponseDto response =
                customerService.getCustomerById(customerId);

        return ResponseEntity.ok(response);
    }

}
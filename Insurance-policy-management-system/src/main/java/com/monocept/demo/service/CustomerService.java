package com.monocept.demo.service;

import com.monocept.demo.dto.CustomerRequestDto;
import com.monocept.demo.dto.CustomerResponseDto;

public interface CustomerService {

	CustomerResponseDto createProfile(CustomerRequestDto request, String email);

	CustomerResponseDto updateProfile(Long customerId, CustomerRequestDto request, String email);

	CustomerResponseDto getOwnProfile(String email);

	CustomerResponseDto getCustomerById(Long customerId);

	PageResponseDto<CustomerResponseDto> getAllCustomers(int page, int size, String sortBy, String direction);
}
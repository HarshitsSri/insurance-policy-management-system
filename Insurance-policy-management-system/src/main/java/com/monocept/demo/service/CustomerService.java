package com.monocept.demo.service;

import com.monocept.demo.dto.CustomerRequestDto;
import com.monocept.demo.dto.CustomerResponseDto;
import com.monocept.demo.dto.PageResponseDto;

public interface CustomerService {

	CustomerResponseDto createProfile(CustomerRequestDto request);

	CustomerResponseDto updateProfile(CustomerRequestDto request);

	CustomerResponseDto getOwnProfile();

	CustomerResponseDto getCustomerById(Long customerId);

	PageResponseDto<CustomerResponseDto> getAllCustomers(int page, int size, String sortBy, String direction);
}
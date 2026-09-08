package com.monocept.demo.service;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

import com.monocept.demo.dto.CustomerRequestDto;
import com.monocept.demo.dto.CustomerResponseDto;
import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.entity.Customer;
import com.monocept.demo.entity.User;
import com.monocept.demo.enums.Role;
import com.monocept.demo.exception.DuplicateResourceException;
import com.monocept.demo.exception.ResourceNotFoundException;
import com.monocept.demo.exception.UnauthorizedAccessException;
import com.monocept.demo.repository.CustomerRepository;
import com.monocept.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
	private final CustomerRepository customerRepository;
	private final UserRepository userRepository;
	private final ModelMapper modelMapper;

	@Override
	public CustomerResponseDto createProfile(CustomerRequestDto request) {
		User user = getCurrentUser();
		validateCustomerAge(request.getDateOfBirth());
		if (user.getRole() != Role.CUSTOMER) {
			throw new UnauthorizedAccessException("Only customers can create profile");
		}
		
		if (customerRepository.existsByUserUserId(user.getUserId())) {
			throw new DuplicateResourceException("Profile already exists");
		}
		
		Customer customer = modelMapper.map(request, Customer.class);
		customer.setUser(user);
		Customer savedCustomer = customerRepository.save(customer);
		CustomerResponseDto response = modelMapper.map(savedCustomer, CustomerResponseDto.class);
		response.setFullName(user.getFullName());
		response.setEmail(user.getEmail());
		response.setMobileNumber(user.getMobileNumber());
		return response;
	}

	@Override
	public CustomerResponseDto updateProfile(CustomerRequestDto request) {
		
		User user = getCurrentUser();
		validateCustomerAge(request.getDateOfBirth());
		Customer customer = customerRepository.findByUserUserId(user.getUserId());
		if (customer == null) {
			throw new ResourceNotFoundException("Customer profile not found. Please create your profile first.");
		}
		customer.setDateOfBirth(request.getDateOfBirth());
		customer.setAddress(request.getAddress());
		customer.setCity(request.getCity());
		customer.setState(request.getState());
		customer.setPinCode(request.getPinCode());
		// Nominee name and nominee relation are set only once, at profile
		// creation, and cannot be changed afterwards. Any values sent in an
		// update request are ignored so the originally recorded nominee
		// details are always preserved.
		Customer updatedCustomer = customerRepository.save(customer);
		CustomerResponseDto response = modelMapper.map(updatedCustomer, CustomerResponseDto.class);
		response.setFullName(user.getFullName());
		response.setEmail(user.getEmail());
		response.setMobileNumber(user.getMobileNumber());
		return response;
	}

	@Override
	public CustomerResponseDto getOwnProfile() {
		User user = getCurrentUser();
		Customer customer = customerRepository.findByUserUserId(user.getUserId());
		if (customer == null) {
			throw new ResourceNotFoundException("Customer profile not found. Please create your profile first.");
		}
		CustomerResponseDto response = modelMapper.map(customer, CustomerResponseDto.class);
		response.setFullName(user.getFullName());
		response.setEmail(user.getEmail());
		response.setMobileNumber(user.getMobileNumber());
		return response;
	}

	@Override
	public CustomerResponseDto getCustomerById(Long customerId) {
		Customer customer = customerRepository.findById(customerId)
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
		CustomerResponseDto response = modelMapper.map(customer, CustomerResponseDto.class);
		response.setFullName(customer.getUser().getFullName());
		response.setEmail(customer.getUser().getEmail());
		response.setMobileNumber(customer.getUser().getMobileNumber());
		return response;
	}

	@Override
	public PageResponseDto<CustomerResponseDto> getAllCustomers(int page, int size, String sortBy, String direction,
			String search) {

		boolean isSearching = (search != null && !search.isBlank());

		// Nested path sorts like "user.fullName" crash with JPQL search queries.
		// When searching, always sort by customerId which is a safe direct column.
		String effectiveSortBy = isSearching ? "customerId" : sortBy;

		Sort sort = "desc".equalsIgnoreCase(direction)
				? Sort.by(effectiveSortBy).descending()
				: Sort.by(effectiveSortBy).ascending();

		Pageable pageable = PageRequest.of(page, size, sort);

		Page<Customer> customerPage = isSearching
				? customerRepository.searchByNameOrEmailOrMobile(search.trim(), pageable)
				: customerRepository.findAll(pageable);

		List<CustomerResponseDto> records = customerPage.getContent().stream().map(customer -> {
			CustomerResponseDto response = modelMapper.map(customer, CustomerResponseDto.class);
			response.setFullName(customer.getUser().getFullName());
			response.setEmail(customer.getUser().getEmail());
			response.setMobileNumber(customer.getUser().getMobileNumber());
			return response;
		}).toList();

		return new PageResponseDto<>(records, customerPage.getNumber(), customerPage.getSize(),
				customerPage.getTotalElements(), customerPage.getTotalPages(), customerPage.isLast(),
				effectiveSortBy, direction);
	}

	private User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String email = authentication.getName();
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with email : " + email));
	}
	private void validateCustomerAge(LocalDate dateOfBirth) {

	    if (dateOfBirth == null) {
	        throw new IllegalArgumentException("Date of birth is required");
	    }

	    int age = Period.between(dateOfBirth, LocalDate.now()).getYears();

	    if (age < 18) {
	        throw new IllegalArgumentException("Customer must be at least 18 years old.");
	    }
	}
}

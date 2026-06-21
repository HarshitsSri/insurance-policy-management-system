package com.monocept.demo.service;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
	private final CustomerRepository customerRepository;
	private final UserRepository userRepository;
	private final ModelMapper modelMapper;

	@Override
	public CustomerResponseDto createProfile(CustomerRequestDto request) {

		User user = getCurrentUser();

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

		Customer customer = customerRepository.findByUserUserId(user.getUserId());
		if (customer == null) {
			new ResourceNotFoundException("Customer profile not found");
		}

		customer.setDateOfBirth(request.getDateOfBirth());
		customer.setAddress(request.getAddress());
		customer.setCity(request.getCity());
		customer.setState(request.getState());
		customer.setPinCode(request.getPinCode());
		customer.setNomineeName(request.getNomineeName());
		customer.setNomineeRelation(request.getNomineeRelation());

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
			new ResourceNotFoundException("Customer profile not found");
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
	public PageResponseDto<CustomerResponseDto> getAllCustomers(int page, int size, String sortBy, String direction) {
		// TODO Auto-generated method stub
		return null;
	}

	private User getCurrentUser() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		String email = authentication.getName();

		return userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with email : " + email));
	}

}

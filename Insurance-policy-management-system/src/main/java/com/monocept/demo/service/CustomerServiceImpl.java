package com.monocept.demo.service;


import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;


import com.monocept.demo.dto.CustomerRequestDto;
import com.monocept.demo.dto.CustomerResponseDto;
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
	public CustomerResponseDto createProfile(CustomerRequestDto request, String email) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with Email: " + email));

		if (user.getRole() != Role.CUSTOMER) {
			throw new UnauthorizedAccessException("Only customer can create profile");
		}

		if (customerRepository.existsByUserId(user.getUserId())) {
			throw new DuplicateResourceException("Profile already exists");
		}
		Customer customer = modelMapper.map(request, Customer.class);

		customer.setUser(user);

		 Customer savedCustomer =
	                customerRepository.save(customer);

//	        return modelMapper.map(savedCustomer, CustomerResponseDto.class);
	        CustomerResponseDto customerResponseDto = modelMapper.map(savedCustomer, CustomerResponseDto.class);
	        customerResponseDto.setFullName(user.getFullName());

	        return  customerResponseDto;
	}

	@Override
	public CustomerResponseDto updateProfile(Long customerId, CustomerRequestDto request, String email) {

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with Email: " + email));
		Customer customer = customerRepository.findByUserId(user.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("User not linked with profile : " + user.getUserId()));
		customer.setDateOfBirth(request.getDateOfBirth());
		customer.setAddress(request.getAddress());
		customer.setCity(request.getCity());
		customer.setState(request.getState());
		customer.setPinCode(request.getPinCode());
		customer.setNomineeName(request.getNomineeName());
		customer.setNomineeRelation(request.getNomineeRelation());

		Customer updatedCustomer = customerRepository.save(customer);

		return modelMapper.map(updatedCustomer, CustomerResponseDto.class);
	}

	@Override
	public CustomerResponseDto getOwnProfile(String email) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with Email: " + email));
		Customer customer = customerRepository.findByUserId(user.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("User not linked with profile : " + user.getUserId()));
		return modelMapper.map(customer, CustomerResponseDto.class);

	}

	@Override
	public CustomerResponseDto getCustomerById(Long customerId) {
		Customer customer = customerRepository.findById(customerId)
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

		return modelMapper.map(customer, CustomerResponseDto.class);
	}

	@Override
	public PageResponseDto<CustomerResponseDto> getAllCustomers(int page, int size, String sortBy, String direction) {
		// TODO Auto-generated method stub
		return null;
	}

}

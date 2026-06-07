package com.monocept.demo.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.monocept.demo.dto.CreateAgentRequestDto;
import com.monocept.demo.dto.UserResponseDto;
import com.monocept.demo.dto.UserStatusUpdateRequestDto;
import com.monocept.demo.entity.User;
import com.monocept.demo.enums.Role;
import com.monocept.demo.exception.DuplicateResourceException;
import com.monocept.demo.exception.ResourceNotFoundException;
import com.monocept.demo.repository.UserRepository;

public class UserServiceImplementation implements UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final ModelMapper modelMapper;

	@Override
	public UserResponseDto createAgent(CreateAgentRequestDto dto) {

		if (userRepository.existsByEmail(dto.getEmail())) {
			throw new DuplicateResourceException("Email already exists");
		}

		User user = modelMapper.map(dto, User.class);

		user.setPassword(passwordEncoder.encode(dto.getPassword()));

		user.setRole(Role.AGENT);

		user.setActive(true);

		user = userRepository.save(user);

		return modelMapper.map(user, UserResponseDto.class);
	}

	@Override
	public UserResponseDto getUserById(Long userId) {

		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

		return modelMapper.map(user, UserResponseDto.class);
	}

	@Override
	public Page<UserResponseDto> getAllUsers(int page, int size) {

		Pageable pageable = PageRequest.of(page, size);

		return userRepository.findAll(pageable).map(user -> modelMapper.map(user, UserResponseDto.class));
	}

	@Override
	public UserResponseDto updateStatus(Long userId, UserStatusUpdateRequestDto dto) {

		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

		user.setActive(dto.isActive());

		user = userRepository.save(user);

		return modelMapper.map(user, UserResponseDto.class);
	}

}

package com.monocept.demo.controller;

import org.springframework.data.domain.Page;
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

import com.monocept.demo.dto.CreateAgentRequestDto;
import com.monocept.demo.dto.UserResponseDto;
import com.monocept.demo.dto.UserStatusUpdateRequestDto;
import com.monocept.demo.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;
	
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping("/agents")
	public ResponseEntity<UserResponseDto> createAgent(@RequestBody CreateAgentRequestDto dto) {

		return ResponseEntity.status(HttpStatus.CREATED).body(userService.createAgent(dto));
	}

	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping
	public Page<UserResponseDto> getAllUsers(@RequestParam(defaultValue = "0") int page,

			@RequestParam(defaultValue = "10") int size) {

		return userService.getAllUsers(page, size);
	}

	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping("/{id}")
	public UserResponseDto getUser(@PathVariable Long id) {

		return userService.getUserById(id);
	}

	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/{id}/status")
	public UserResponseDto updateStatus(@PathVariable Long id, @RequestBody UserStatusUpdateRequestDto dto) {

		return userService.updateStatus(id, dto);
	}

}

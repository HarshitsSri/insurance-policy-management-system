package com.monocept.demo.service;


import org.springframework.data.domain.Page;

import com.monocept.demo.dto.CreateAgentRequestDto;
import com.monocept.demo.dto.UserResponseDto;
import com.monocept.demo.dto.UserStatusUpdateRequestDto;

public interface UserService {

	UserResponseDto createAgent(
            CreateAgentRequestDto dto);

    UserResponseDto getUserById(
            Long userId);

    Page<UserResponseDto> getAllUsers(
            int page,
            int size);

    UserResponseDto updateStatus(
            Long userId,
            UserStatusUpdateRequestDto dto);
}
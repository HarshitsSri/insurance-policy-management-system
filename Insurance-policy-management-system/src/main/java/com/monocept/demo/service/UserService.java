package com.monocept.demo.service;

import com.monocept.demo.dto.UserResponseDto;

public interface UserService {

    UserResponseDto createAgent(CreateAgentRequestDto request);

    UserResponseDto getUserById(Long userId);

    PageResponseDto<UserResponseDto> getAllUsers(
            int page,
            int size,
            String sortBy,
            String direction);

    UserResponseDto updateUserStatus(
            Long userId,
            UserStatusUpdateRequestDto request);
}
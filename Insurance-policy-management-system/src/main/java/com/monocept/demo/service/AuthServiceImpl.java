package com.monocept.demo.service;


import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.monocept.demo.dto.LoginRequestDto;
import com.monocept.demo.dto.LoginResponseDto;
import com.monocept.demo.dto.RegisterRequestDto;
import com.monocept.demo.entity.User;
import com.monocept.demo.enums.Role;
import com.monocept.demo.exception.DuplicateResourceException;
import com.monocept.demo.exception.InactiveUserException;
import com.monocept.demo.exception.ResourceNotFoundException;
import com.monocept.demo.repository.UserRepository;
import com.monocept.demo.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public void register(RegisterRequestDto dto) {

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already exists");
        }

        User user = new User();

        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPassword(
                passwordEncoder.encode(
                        dto.getPassword()));
        user.setMobileNumber(
                dto.getMobileNumber());
        user.setRole(Role.CUSTOMER);
        user.setActive(true);

        userRepository.save(user);
    }

    @Override
    public LoginResponseDto login(
            LoginRequestDto dto) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        dto.getEmail(),
                        dto.getPassword()));

        User user = userRepository
                .findByEmail(dto.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"));

        if (!user.isActive()) {
            throw new InactiveUserException(
                    "User account inactive");
        }

        String token =
                jwtService.generateToken(
                        user.getEmail());

        return new LoginResponseDto(
                token,
                "Bearer",
                user.getEmail(),
                user.getRole().name(),
                86400000L);
    }
}
package com.monocept.demo.config;


import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.monocept.demo.entity.User;
import com.monocept.demo.enums.Role;
import com.monocept.demo.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository,
                                PasswordEncoder passwordEncoder) {

        return args -> {

            if (!userRepository.existsByEmail("admin@insurance.com")) {

                User admin = new User();

                admin.setFullName("System Admin");
                admin.setEmail("admin@insurance.com");
                admin.setPassword(
                        passwordEncoder.encode("Admin@123")
                );
                admin.setMobileNumber("9999999999");
                admin.setRole(Role.ADMIN);
                admin.setActive(true);

                userRepository.save(admin);

                System.out.println("Admin Created Successfully");
            }
        };
    }
}

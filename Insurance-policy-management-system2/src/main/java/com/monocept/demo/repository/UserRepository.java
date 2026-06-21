package com.monocept.demo.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.monocept.demo.entity.User;
import com.monocept.demo.enums.Role;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Authentication
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Optional but useful
    boolean existsByMobileNumber(String mobileNumber);

    Optional<User> findByMobileNumber(String mobileNumber);

    // User Management
    Page<User> findByRole(Role role, Pageable pageable);

    Page<User> findByActive(boolean active, Pageable pageable);

    Page<User> findByRoleAndActive(
            Role role,
            boolean active,
            Pageable pageable);
}

package com.monocept.demo.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.monocept.demo.entity.Customer;

@Repository
public interface CustomerRepository
        extends JpaRepository<Customer, Long> {

    Customer findByUserUserId(Long userId);

    boolean existsByUserUserId(Long userId);

    Page<Customer> findByCity(
            String city,
            Pageable pageable);
}
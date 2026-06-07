package com.monocept.demo.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.monocept.demo.entity.Policy;
import com.monocept.demo.enums.PolicyStatus;

@Repository
public interface PolicyRepository
        extends JpaRepository<Policy, Long> {

    Optional<Policy> findByPolicyNumber(String policyNumber);

    Page<Policy> findByCustomerId(
            Long customerId,
            Pageable pageable);

    Page<Policy> findByPolicyStatus(
            PolicyStatus status,
            Pageable pageable);

    boolean existsByPolicyNumber(String policyNumber);
}

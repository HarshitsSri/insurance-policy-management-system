package com.monocept.demo.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.monocept.demo.entity.Claim;
import com.monocept.demo.enums.ClaimStatus;

public interface ClaimRepository extends JpaRepository<Claim, Long> {

	Optional<Claim> findByClaimNumber(String claimNumber);

	boolean existsByClaimNumber(String claimNumber);

	Page<Claim> findByClaimStatus(ClaimStatus status, Pageable pageable);

	Page<Claim> findByPolicyCustomerCustomerId(Long customerId, Pageable pageable);

	Page<Claim> findByPolicyCustomerCustomerIdAndClaimStatus(Long customerId, ClaimStatus status, Pageable pageable);
}

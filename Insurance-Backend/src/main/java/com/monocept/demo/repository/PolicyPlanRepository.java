package com.monocept.demo.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.monocept.demo.entity.PolicyPlan;

public interface PolicyPlanRepository
        extends JpaRepository<PolicyPlan, Long> {

    // Duplicate plan check inside same product
    boolean existsByProductProductIdAndPlanNameIgnoreCase(
            Long productId,
            String planName);

    // Get all plans of a product
    Page<PolicyPlan> findByProductProductId(
            Long productId,
            Pageable pageable);

    // Filter by active status
    Page<PolicyPlan> findByActive(
            Boolean active,
            Pageable pageable);

    // Filter by product + active
    Page<PolicyPlan> findByProductProductIdAndActive(
            Long productId,
            Boolean active,
            Pageable pageable);
}
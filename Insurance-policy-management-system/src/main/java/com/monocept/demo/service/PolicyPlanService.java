package com.monocept.demo.service;

import java.util.List;

import com.monocept.demo.dto.PolicyPlanRequestDto;
import com.monocept.demo.dto.PolicyPlanResponseDto;

public interface PolicyPlanService {

    PolicyPlanResponseDto createPlan(
            PolicyPlanRequestDto request);

    PolicyPlanResponseDto updatePlan(
            Long planId,
            PolicyPlanRequestDto request);

    void deactivatePlan(Long planId);

    PolicyPlanResponseDto getPlanById(
            Long planId);

    List<PolicyPlanResponseDto> getPlansByProduct(
            Long productId);

    PageResponseDto<PolicyPlanResponseDto> getAllPlans(
            int page,
            int size,
            String sortBy,
            String direction);
}
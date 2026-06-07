package com.monocept.demo.service;

import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.dto.PolicyPlanRequestDto;
import com.monocept.demo.dto.PolicyPlanResponseDto;

	public interface PolicyPlanService {

	    PolicyPlanResponseDto createPlan(
	            PolicyPlanRequestDto dto);

	    PolicyPlanResponseDto updatePlan(
	            Long planId,
	            PolicyPlanRequestDto dto);

	    PolicyPlanResponseDto getPlanById(
	            Long planId);

	    PageResponseDto<PolicyPlanResponseDto> getAllPlans(
	            int page,
	            int size,
	            String sortBy,
	            String direction,
	            Long productId,
	            Boolean active);

	    PolicyPlanResponseDto updateStatus(
	            Long planId,
	            Boolean active);
	
}
package com.monocept.demo.service;

import com.monocept.demo.dto.CustomerPolicyPurchaseRequestDto;
import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.dto.PolicyIssueRequestDto;
import com.monocept.demo.dto.PolicyResponseDto;

public interface PolicyService {

	public PolicyResponseDto purchasePolicy(CustomerPolicyPurchaseRequestDto request);

	PolicyResponseDto issuePolicy(PolicyIssueRequestDto request);

	PolicyResponseDto getPolicyById(Long policyId);

	PageResponseDto<PolicyResponseDto> getMyPolicies(int page, int size, String sortBy, String direction);

	PageResponseDto<PolicyResponseDto> getAllPolicies(int page, int size, String sortBy, String direction,
			String status);

	PolicyResponseDto cancelPolicy(Long policyId);
}
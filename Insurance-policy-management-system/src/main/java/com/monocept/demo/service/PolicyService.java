package com.monocept.demo.service;

import java.util.List;

import com.monocept.demo.dto.CustomerPolicyPurchaseRequestDto;
import com.monocept.demo.dto.PolicyResponseDto;

public interface PolicyService {

    PolicyResponseDto purchasePolicy(
            CustomerPolicyPurchaseRequestDto request,
            String email);

    PolicyResponseDto issuePolicy(
            AgentAdminPolicyIssueRequestDto request);

    PolicyResponseDto getPolicyById(
            Long policyId);

    PageResponseDto<PolicyResponseDto> getAllPolicies(
            int page,
            int size,
            String sortBy,
            String direction);

    List<PolicyResponseDto> getCustomerPolicies(
            String email);

    void cancelPolicy(Long policyId);
}
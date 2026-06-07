package com.monocept.demo.service;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.monocept.demo.dto.CustomerPolicyPurchaseRequestDto;
import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.dto.PolicyIssueRequestDto;
import com.monocept.demo.dto.PolicyResponseDto;
import com.monocept.demo.entity.Customer;
import com.monocept.demo.entity.User;
import com.monocept.demo.exception.ResourceNotFoundException;
import com.monocept.demo.repository.CustomerRepository;
import com.monocept.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PolicyServiceImpl implements PolicyService {
	private final CustomerRepository customerRepository;
	private final UserRepository userRepository;
	private final ModelMapper modelMapper;

	@Override
	public PolicyResponseDto purchasePolicy(CustomerPolicyPurchaseRequestDto request, String email) {

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		Customer customer = customerRepository.findByUserId(user.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

		PolicyPlan plan = policyPlanRepository.findById(request.getPlanId())
				.orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

		if (!plan.isActive()) {
			throw new ApiException("Inactive plan cannot be purchased");
		}

		Policy policy = new Policy();

		policy.setCustomer(customer);
		policy.setPolicyPlan(plan);

		policy.setPolicyNumber(generatePolicyNumber());

		policy.setStartDate(request.getStartDate());

		policy.setEndDate(request.getStartDate().plusYears(plan.getDuration()));

		policy.setPolicyStatus(PolicyStatus.PENDING_PAYMENT);

		policy.setTotalPremiumPaid(BigDecimal.ZERO);

		Policy saved = policyRepository.save(policy);

		return mapToResponse(saved);
	}

	@Override
	public PolicyResponseDto issuePolicy(PolicyIssueRequestDto request) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public PolicyResponseDto getPolicyById(Long policyId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public PageResponseDto<PolicyResponseDto> getMyPolicies(String email, int page, int size, String sortBy,
			String direction) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public PageResponseDto<PolicyResponseDto> getAllPolicies(int page, int size, String sortBy, String direction,
			String status) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public PolicyResponseDto cancelPolicy(Long policyId) {
		// TODO Auto-generated method stub
		return null;
	}

}

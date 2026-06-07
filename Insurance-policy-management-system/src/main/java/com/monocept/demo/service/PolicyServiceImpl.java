package com.monocept.demo.service;

import java.math.BigDecimal;
import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.monocept.demo.dto.CustomerPolicyPurchaseRequestDto;
import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.dto.PolicyIssueRequestDto;
import com.monocept.demo.dto.PolicyResponseDto;
import com.monocept.demo.entity.Customer;
import com.monocept.demo.entity.Policy;
import com.monocept.demo.entity.PolicyPlan;
import com.monocept.demo.entity.User;
import com.monocept.demo.enums.PolicyStatus;
import com.monocept.demo.exception.InvalidPolicyStatusException;
import com.monocept.demo.exception.ResourceNotFoundException;
import com.monocept.demo.repository.CustomerRepository;
import com.monocept.demo.repository.PolicyPlanRepository;
import com.monocept.demo.repository.PolicyRepository;
import com.monocept.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PolicyServiceImpl implements PolicyService {
	private final CustomerRepository customerRepository;
	private final UserRepository userRepository;
	private final ModelMapper modelMapper;
	private final PolicyPlanRepository policyPlanRepository;
	private final PolicyRepository policyRepository;

	@Override
	public PolicyResponseDto purchasePolicy(CustomerPolicyPurchaseRequestDto request, String email) {

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		Customer customer = customerRepository.findByUserId(user.getUserId());
		if (customer == null) {
			throw new ResourceNotFoundException("Customer profile not found");
		}
		PolicyPlan plan = policyPlanRepository.findById(request.getPlanId())
				.orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

		if (!plan.isActive()) {
			throw new InvalidPolicyStatusException("Inactive plan cannot be purchased!...Plan status must be Active.");
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

		return modelMapper.map(saved, PolicyResponseDto.class);
	}

	@Override
	public PolicyResponseDto issuePolicy(PolicyIssueRequestDto request) {

		Customer customer = customerRepository.findById(request.getCustomerId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

		PolicyPlan plan = policyPlanRepository.findById(request.getPlanId())
				.orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

		if (!plan.isActive()) {
			throw new InvalidPolicyStatusException("Inactive plan cannot be purchased!...Plan status must be Active.");
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
		return modelMapper.map(saved, PolicyResponseDto.class);
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

		Policy policy = policyRepository.findById(policyId)
				.orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

		if (policy.getPolicyStatus() == PolicyStatus.CANCELLED) {

			throw new InvalidPolicyStatusException("Policy already cancelled");

		}

		policy.setPolicyStatus(PolicyStatus.CANCELLED);

		Policy saved = policyRepository.save(policy);
		return modelMapper.map(saved, PolicyResponseDto.class);
	}

//generating policy number method
	private String generatePolicyNumber() {

		String policyNumber = "POL-" + System.currentTimeMillis();

		while (policyRepository.existsByPolicyNumber(policyNumber)) {

			policyNumber = "POL-" + UUID.randomUUID().toString().substring(0, 8);
		}

		return policyNumber;
	}

}

package com.monocept.demo.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
	public PolicyResponseDto purchasePolicy(CustomerPolicyPurchaseRequestDto request) {

		User user = getCurrentUser();

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
		return convertToDto(saved);
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

		Policy policy = policyRepository.findById(policyId)
				.orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

		return convertToDto(policy);
	}

	@Override
	public PageResponseDto<PolicyResponseDto> getMyPolicies(int page, int size, String sortBy, String direction) {

		User user = getCurrentUser();

		Customer customer = customerRepository.findByUserId(user.getUserId());

		Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

		Pageable pageable = PageRequest.of(page, size, sort);

		Page<Policy> policyPage = policyRepository.findByCustomerCustomerId(customer.getCustomerId(), pageable);

		List<PolicyResponseDto> records = policyPage.getContent().stream().map(this::convertToDto).toList();

		return new PageResponseDto<>(records, policyPage.getNumber(), policyPage.getSize(),
				policyPage.getTotalElements(), policyPage.getTotalPages(), policyPage.isLast(), sortBy, direction);
	}

	@Override
	public PageResponseDto<PolicyResponseDto> getAllPolicies(int page, int size, String sortBy, String direction,
			String status) {

		Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

		Pageable pageable = PageRequest.of(page, size, sort);

		Page<Policy> policyPage;

		if (status != null) {

			PolicyStatus policyStatus = PolicyStatus.valueOf(status.toUpperCase());

			policyPage = policyRepository.findByPolicyStatus(policyStatus, pageable);

		} else {

			policyPage = policyRepository.findAll(pageable);
		}

		List<PolicyResponseDto> records = policyPage.getContent().stream().map(this::convertToDto).toList();

		return new PageResponseDto<>(records, policyPage.getNumber(), policyPage.getSize(),
				policyPage.getTotalElements(), policyPage.getTotalPages(), policyPage.isLast(), sortBy, direction);
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
		return convertToDto(saved);
	}

//generating policy number method
	private String generatePolicyNumber() {

		String policyNumber = "POL-" + System.currentTimeMillis();

		while (policyRepository.existsByPolicyNumber(policyNumber)) {

			policyNumber = "POL-" + UUID.randomUUID().toString().substring(0, 8);
		}

		return policyNumber;
	}

	private User getCurrentUser() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		String email = authentication.getName();

		return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

	private PolicyResponseDto convertToDto(Policy policy) {

		PolicyResponseDto dto = modelMapper.map(policy, PolicyResponseDto.class);

		dto.setCustomerName(policy.getCustomer().getUser().getFullName());

		dto.setPlanName(policy.getPolicyPlan().getPlanName());

		dto.setProductType(policy.getPolicyPlan().getProduct().getProductType());

		dto.setCoverageAmount(policy.getPolicyPlan().getCoverageAmount().doubleValue());

		dto.setPremiumAmount(policy.getPolicyPlan().getPremiumAmount().doubleValue());

		dto.setPremiumType(policy.getPolicyPlan().getPremiumType());

		dto.setTotalPremiumPaid(policy.getTotalPremiumPaid().doubleValue());

		return dto;
	}

}

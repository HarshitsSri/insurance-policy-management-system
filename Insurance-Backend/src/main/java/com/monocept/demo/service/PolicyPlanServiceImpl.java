package com.monocept.demo.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.dto.PolicyPlanRequestDto;
import com.monocept.demo.dto.PolicyPlanResponseDto;
import com.monocept.demo.entity.PolicyPlan;
import com.monocept.demo.entity.Product;
import com.monocept.demo.exception.DuplicateResourceException;
import com.monocept.demo.exception.ResourceNotFoundException;
import com.monocept.demo.repository.PolicyPlanRepository;
import com.monocept.demo.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PolicyPlanServiceImpl implements PolicyPlanService {

	private final PolicyPlanRepository planRepository;
	private final ProductRepository productRepository;
	private final ModelMapper modelMapper;

	@Override
	public PolicyPlanResponseDto createPlan(PolicyPlanRequestDto dto) {

		// Product validation
		Product product = productRepository.findById(dto.getProductId())
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));

		if (!product.getActive()) {
			throw new IllegalArgumentException("Inactive product cannot have plans.");
		}

		// Duplicate plan validation
		if (planRepository.existsByProductProductIdAndPlanNameIgnoreCase(dto.getProductId(), dto.getPlanName())) {

			throw new DuplicateResourceException("Plan already exists.");
		}

		// Plan name validation
		if (dto.getPlanName() == null || dto.getPlanName().trim().isEmpty()) {
			throw new IllegalArgumentException("Plan name is required.");
		}

		if (dto.getPlanName().trim().length() < 3) {
			throw new IllegalArgumentException("Plan name must be at least 3 characters.");
		}

		if (dto.getPlanName().trim().length() > 50) {
			throw new IllegalArgumentException("Plan name cannot exceed 50 characters.");
		}

		// Coverage validation
		if (dto.getCoverageAmount() <= 0) {
			throw new IllegalArgumentException("Coverage amount must be greater than 0.");
		}

		if (dto.getCoverageAmount() < 10000) {
			throw new IllegalArgumentException("Minimum coverage amount is 10,000.");
		}

		// Premium validation
		if (dto.getPremiumAmount() <= 0) {
			throw new IllegalArgumentException("Premium amount must be greater than 0.");
		}

		if (dto.getPremiumAmount() < 100) {
			throw new IllegalArgumentException("Minimum premium amount is 100.");
		}

		// Business validation
		if (dto.getCoverageAmount() <= dto.getPremiumAmount()) {
			throw new IllegalArgumentException("Coverage amount must be greater than premium amount.");
		}

		// Duration validation
		if (dto.getDuration() < 1 || dto.getDuration() > 50) {
			throw new IllegalArgumentException("Duration must be between 1 and 50 years.");
		}

		// Terms validation
		if (dto.getTermsAndConditions() == null || dto.getTermsAndConditions().trim().length() < 20) {
			throw new IllegalArgumentException("Terms and Conditions must contain at least 20 characters.");
		}

		// Entity mapping
		PolicyPlan plan = new PolicyPlan();

		plan.setProduct(product);
		plan.setPlanName(dto.getPlanName().trim());
		plan.setCoverageAmount(java.math.BigDecimal.valueOf(dto.getCoverageAmount()));
		plan.setPremiumAmount(java.math.BigDecimal.valueOf(dto.getPremiumAmount()));
		plan.setDuration(dto.getDuration());
		plan.setTermsAndConditions(dto.getTermsAndConditions().trim());
		plan.setActive(dto.getActive());

		PolicyPlan savedPlan = planRepository.save(plan);

		return convertToDto(savedPlan);
	}

	@Override
	public PolicyPlanResponseDto updatePlan(Long planId, PolicyPlanRequestDto dto) {

		PolicyPlan plan = planRepository.findById(planId)
				.orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

		// Duplicate plan validation
		if (!plan.getPlanName().equalsIgnoreCase(dto.getPlanName()) && planRepository
				.existsByProductProductIdAndPlanNameIgnoreCase(dto.getProductId(), dto.getPlanName())) {

			throw new DuplicateResourceException("Plan already exists");
		}

		// Product validation
		Product product = productRepository.findById(dto.getProductId())
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));

		if (!product.getActive()) {
			throw new IllegalArgumentException("Inactive product cannot have plans.");
		}

		// Plan name validation
		if (dto.getPlanName() == null || dto.getPlanName().trim().isEmpty()) {
			throw new IllegalArgumentException("Plan name is required.");
		}

		if (dto.getPlanName().trim().length() < 3) {
			throw new IllegalArgumentException("Plan name must be at least 3 characters.");
		}

		if (dto.getPlanName().trim().length() > 50) {
			throw new IllegalArgumentException("Plan name cannot exceed 50 characters.");
		}

		// Coverage validation
		if (dto.getCoverageAmount() <= 0) {
			throw new IllegalArgumentException("Coverage amount must be greater than 0.");
		}

		if (dto.getCoverageAmount() < 10000) {
			throw new IllegalArgumentException("Minimum coverage amount is 10,000.");
		}

		// Premium validation
		if (dto.getPremiumAmount() <= 0) {
			throw new IllegalArgumentException("Premium amount must be greater than 0.");
		}

		if (dto.getPremiumAmount() < 100) {
			throw new IllegalArgumentException("Minimum premium amount is 100.");
		}

		// Business validation
		if (dto.getCoverageAmount() <= dto.getPremiumAmount()) {
			throw new IllegalArgumentException("Coverage amount must be greater than premium amount.");
		}

		// Duration validation
		if (dto.getDuration() < 1 || dto.getDuration() > 50) {
			throw new IllegalArgumentException("Duration must be between 1 and 50 years.");
		}

		// Terms & Conditions validation
		if (dto.getTermsAndConditions() == null || dto.getTermsAndConditions().trim().isEmpty()) {
			throw new IllegalArgumentException("Terms and Conditions are required.");
		}

		if (dto.getTermsAndConditions().trim().length() < 20) {
			throw new IllegalArgumentException("Terms and Conditions must contain at least 20 characters.");
		}

		// Update entity
		plan.setPlanName(dto.getPlanName().trim());
		plan.setCoverageAmount(java.math.BigDecimal.valueOf(dto.getCoverageAmount()));
		plan.setPremiumAmount(java.math.BigDecimal.valueOf(dto.getPremiumAmount()));
		plan.setDuration(dto.getDuration());
		plan.setTermsAndConditions(dto.getTermsAndConditions().trim());
		plan.setActive(dto.getActive());
		plan.setProduct(product);

		PolicyPlan updatedPlan = planRepository.save(plan);

		return convertToDto(updatedPlan);
	}

	@Override
	public PolicyPlanResponseDto getPlanById(Long planId) {

		PolicyPlan plan = planRepository.findById(planId)
				.orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

		return convertToDto(plan);
	}

	@Override
	public PageResponseDto<PolicyPlanResponseDto> getAllPlans(int page, int size, String sortBy, String direction,
			Long productId, Boolean active) {

		Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

		Pageable pageable = PageRequest.of(page, size, sort);

		Page<PolicyPlan> planPage;
		if (productId != null && active != null) {
			planPage = planRepository.findByProductProductIdAndActive(productId, active, pageable);
		} else if (productId != null) {
			planPage = planRepository.findByProductProductId(productId, pageable);
		} else if (active != null) {
			planPage = planRepository.findByActive(active, pageable);
		} else {
			planPage = planRepository.findAll(pageable);
		}

		List<PolicyPlanResponseDto> records = planPage.getContent().stream().map(this::convertToDto).toList();

		return new PageResponseDto<>(records, planPage.getNumber(), planPage.getSize(), planPage.getTotalElements(),
				planPage.getTotalPages(), planPage.isLast(), sortBy, direction);
	}

	@Override
	public PolicyPlanResponseDto updateStatus(Long planId, Boolean active) {

		PolicyPlan plan = planRepository.findById(planId)
				.orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

		plan.setActive(active);

		return convertToDto(planRepository.save(plan));
	}

	private PolicyPlanResponseDto convertToDto(PolicyPlan plan) {

		PolicyPlanResponseDto dto = modelMapper.map(plan, PolicyPlanResponseDto.class);

		dto.setProductName(plan.getProduct().getProductName());

		dto.setProductType(plan.getProduct().getProductType());

		dto.setCoverageAmount(plan.getCoverageAmount().doubleValue());

		dto.setPremiumAmount(plan.getPremiumAmount().doubleValue());

		return dto;
	}
}
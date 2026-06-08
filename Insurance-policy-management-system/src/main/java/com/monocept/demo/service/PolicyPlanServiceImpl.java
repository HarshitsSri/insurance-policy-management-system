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

	    Product product = productRepository.findById(dto.getProductId())
	            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

	    PolicyPlan plan = new PolicyPlan();

	    plan.setProduct(product);
	    plan.setPlanName(dto.getPlanName());
	    plan.setCoverageAmount(java.math.BigDecimal.valueOf(dto.getCoverageAmount()));
	    plan.setPremiumAmount(java.math.BigDecimal.valueOf(dto.getPremiumAmount()));
	    plan.setPremiumType(dto.getPremiumType());
	    plan.setDuration(dto.getDuration());
	    plan.setTermsAndConditions(dto.getTermsAndConditions());
	    plan.setActive(dto.getActive());

	    System.out.println("PLAN ID = " + plan.getPlanId());

	    PolicyPlan savedPlan = planRepository.save(plan);

	    return convertToDto(savedPlan);
	}

	@Override
	public PolicyPlanResponseDto updatePlan(Long planId, PolicyPlanRequestDto dto) {
		
		

		PolicyPlan plan = planRepository.findById(planId)
				.orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

		if (!plan.getPlanName().equalsIgnoreCase(dto.getPlanName())
		        &&
		    planRepository
		        .existsByProductProductIdAndPlanNameIgnoreCase(
		                dto.getProductId(),
		                dto.getPlanName())) {

		    throw new DuplicateResourceException(
		            "Plan already exists");
		}
		
		Product product = productRepository.findById(dto.getProductId())
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));

		if(!product.getActive()) {
		    throw new RuntimeException(
		            "Inactive product cannot have plans");
		}
		
		plan.setPlanName(dto.getPlanName());
		
		if(dto.getCoverageAmount()
		        <=
		   dto.getPremiumAmount()) {

		    throw new IllegalArgumentException(
		            "Coverage amount must be greater than premium amount");
		}
		
		plan.setCoverageAmount(java.math.BigDecimal.valueOf(dto.getCoverageAmount()));

		plan.setPremiumAmount(java.math.BigDecimal.valueOf(dto.getPremiumAmount()));

		plan.setPremiumType(dto.getPremiumType());

		plan.setDuration(dto.getDuration());

		plan.setTermsAndConditions(dto.getTermsAndConditions());

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

		Page<PolicyPlan> planPage = planRepository.findAll(pageable);

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
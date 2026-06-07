package com.monocept.demo.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.monocept.demo.dto.ClaimDocumentRequestDto;
import com.monocept.demo.dto.ClaimFinalDecisionRequestDto;
import com.monocept.demo.dto.ClaimRequestDto;
import com.monocept.demo.dto.ClaimResponseDto;
import com.monocept.demo.dto.ClaimReviewRequestDto;
import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.entity.Claim;
import com.monocept.demo.entity.ClaimDocument;
import com.monocept.demo.entity.Customer;
import com.monocept.demo.entity.Policy;
import com.monocept.demo.entity.User;
import com.monocept.demo.enums.ClaimStatus;
import com.monocept.demo.enums.PolicyStatus;
import com.monocept.demo.exception.InvalidClaimStatusException;
import com.monocept.demo.exception.InvalidPolicyStatusException;
import com.monocept.demo.exception.ResourceNotFoundException;
import com.monocept.demo.exception.UnauthorizedAccessException;
import com.monocept.demo.repository.ClaimDocumentRepository;
import com.monocept.demo.repository.ClaimRepository;
import com.monocept.demo.repository.CustomerRepository;
import com.monocept.demo.repository.PolicyRepository;
import com.monocept.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClaimServiceImpl implements ClaimService {

	private final ClaimRepository claimRepository;
	private final PolicyRepository policyRepository;
	private final CustomerRepository customerRepository;
	private final UserRepository userRepository;
	private final ClaimDocumentRepository claimDocumentRepository;
	private final ClaimStatusHistoryService historyService;
	private final ModelMapper modelMapper;

	@Override
	public ClaimResponseDto raiseClaim(ClaimRequestDto dto) {

		User user = getCurrentUser();

		Customer customer = customerRepository.findByUserId(user.getUserId());

		if (customer == null) {
			throw new ResourceNotFoundException("Customer profile not found");
		}

		Policy policy = policyRepository.findById(dto.getPolicyId())
				.orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

		if (dto.getIncidentDate().isAfter(LocalDate.now())) {

			throw new RuntimeException("Incident date cannot be future");
		}
		if (!policy.getCustomer().getCustomerId().equals(customer.getCustomerId())) {

			throw new UnauthorizedAccessException("You can raise claim only for your own policy");
		}

		if (policy.getPolicyStatus() != PolicyStatus.ACTIVE) {

			throw new InvalidPolicyStatusException("Policy must be ACTIVE");
		}

		if (dto.getClaimAmount() > policy.getPolicyPlan().getCoverageAmount().doubleValue()) {

			throw new RuntimeException("Claim amount exceeds coverage amount");
		}

		Claim claim = new Claim();

		claim.setClaimNumber(generateClaimNumber());

		claim.setPolicy(policy);

		claim.setClaimAmount(BigDecimal.valueOf(dto.getClaimAmount()));

		claim.setClaimReason(dto.getClaimReason());

		claim.setIncidentDate(dto.getIncidentDate());

		claim.setClaimStatus(ClaimStatus.SUBMITTED);

		Claim savedClaim = claimRepository.save(claim);

		for (ClaimDocumentRequestDto doc : dto.getDocuments()) {

			ClaimDocument document = new ClaimDocument();

			document.setClaim(savedClaim);

			document.setDocumentName(doc.getDocumentName());

			document.setDocumentType(doc.getDocumentType());

			document.setDocumentReference(doc.getDocumentReference());

			claimDocumentRepository.save(document);
		}

		historyService.saveHistory(savedClaim, null, ClaimStatus.SUBMITTED, "Claim submitted", user);

		return convertToDto(savedClaim);
	}

	@Override
	public ClaimResponseDto reviewClaim(Long claimId, ClaimReviewRequestDto dto) {

		Claim claim = claimRepository.findById(claimId)
				.orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

		if (claim.getClaimStatus() != ClaimStatus.SUBMITTED) {

			throw new InvalidClaimStatusException("Only submitted claims can be reviewed");
		}

		if (dto.getRecommendedStatus() != ClaimStatus.RECOMMENDED_FOR_APPROVAL
				&& dto.getRecommendedStatus() != ClaimStatus.RECOMMENDED_FOR_REJECTION) {

			throw new InvalidClaimStatusException("Invalid recommendation status");
		}

		ClaimStatus oldStatus = claim.getClaimStatus();

		claim.setClaimStatus(dto.getRecommendedStatus());

		claim.setAgentRemarks(dto.getRemarks());

		Claim updated = claimRepository.save(claim);

		historyService.saveHistory(updated, oldStatus, dto.getRecommendedStatus(), dto.getRemarks(), getCurrentUser());

		return convertToDto(updated);
	}

	@Override
	public ClaimResponseDto finalDecision(Long claimId, ClaimFinalDecisionRequestDto dto) {

		Claim claim = claimRepository.findById(claimId)
				.orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

		if (claim.getClaimStatus() != ClaimStatus.RECOMMENDED_FOR_APPROVAL
				&& claim.getClaimStatus() != ClaimStatus.RECOMMENDED_FOR_REJECTION) {

			throw new InvalidClaimStatusException("Claim not ready for final decision");
		}

		if (dto.getFinalDecisionStatus() != ClaimStatus.APPROVED
				&& dto.getFinalDecisionStatus() != ClaimStatus.REJECTED) {

			throw new InvalidClaimStatusException("Invalid final status");
		}

		ClaimStatus oldStatus = claim.getClaimStatus();

		claim.setClaimStatus(dto.getFinalDecisionStatus());

		claim.setAdminRemarks(dto.getRemarks());

		Claim updated = claimRepository.save(claim);

		historyService.saveHistory(updated, oldStatus, dto.getFinalDecisionStatus(), dto.getRemarks(),
				getCurrentUser());

		return convertToDto(updated);
	}

	@Override
	public ClaimResponseDto getClaimById(Long claimId) {

		Claim claim = claimRepository.findById(claimId)
				.orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

		return convertToDto(claim);
	}

	private User getCurrentUser() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		String email = authentication.getName();

		return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

	private String generateClaimNumber() {

		String claimNumber = "CLM-" + System.currentTimeMillis();

		while (claimRepository.existsByClaimNumber(claimNumber)) {

			claimNumber = "CLM-" + UUID.randomUUID().toString().substring(0, 8);
		}

		return claimNumber;
	}

	private ClaimResponseDto convertToDto(Claim claim) {

		ClaimResponseDto dto = modelMapper.map(claim, ClaimResponseDto.class);

		dto.setPolicyNumber(claim.getPolicy().getPolicyNumber());

		dto.setCustomerName(claim.getPolicy().getCustomer().getUser().getFullName());

		dto.setClaimAmount(claim.getClaimAmount().doubleValue());

		return dto;
	}

	@Override
	public PageResponseDto<ClaimResponseDto> getMyClaims(int page, int size, String sortBy, String direction) {

		User user = getCurrentUser();

		Customer customer = customerRepository.findByUserId(user.getUserId());

		if (customer == null) {
			throw new ResourceNotFoundException("Customer profile not found");
		}

		Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

		Pageable pageable = PageRequest.of(page, size, sort);

		Page<Claim> claimPage = claimRepository.findByPolicyCustomerCustomerId(customer.getCustomerId(), pageable);

		List<ClaimResponseDto> records = claimPage.getContent().stream().map(this::convertToDto).toList();

		return new PageResponseDto<>(records, claimPage.getNumber(), claimPage.getSize(), claimPage.getTotalElements(),
				claimPage.getTotalPages(), claimPage.isLast(), sortBy, direction);
	}

	@Override
	public PageResponseDto<ClaimResponseDto> getAllClaims(int page, int size, String sortBy, String direction,
			String status) {

		Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

		Pageable pageable = PageRequest.of(page, size, sort);

		Page<Claim> claimPage;

		if (status != null && !status.isBlank()) {

			ClaimStatus claimStatus = ClaimStatus.valueOf(status.toUpperCase());

			claimPage = claimRepository.findByClaimStatus(claimStatus, pageable);

		} else {

			claimPage = claimRepository.findAll(pageable);
		}

		List<ClaimResponseDto> records = claimPage.getContent().stream().map(this::convertToDto).toList();

		return new PageResponseDto<>(records, claimPage.getNumber(), claimPage.getSize(), claimPage.getTotalElements(),
				claimPage.getTotalPages(), claimPage.isLast(), sortBy, direction);
	}

}

package com.monocept.demo.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.monocept.demo.dto.ClaimFinalDecisionRequestDto;
import com.monocept.demo.dto.ClaimRequestDto;
import com.monocept.demo.dto.ClaimResponseDto;
import com.monocept.demo.dto.ClaimReviewRequestDto;
import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.entity.Claim;
import com.monocept.demo.enums.ClaimStatus;

public interface ClaimService {

	ClaimResponseDto raiseClaim(ClaimRequestDto dto);

	ClaimResponseDto reviewClaim(Long claimId, ClaimReviewRequestDto dto);

	ClaimResponseDto finalDecision(Long claimId, ClaimFinalDecisionRequestDto dto);

	ClaimResponseDto getClaimById(Long claimId);

	PageResponseDto<ClaimResponseDto> getMyClaims(int page, int size, String sortBy, String direction);

	PageResponseDto<ClaimResponseDto> getAllClaims(int page, int size, String sortBy, String direction, String status);


}

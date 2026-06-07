package com.monocept.demo.service;

import java.util.List;

import com.monocept.demo.dto.ClaimFinalDecisionRequestDto;
import com.monocept.demo.dto.ClaimRequestDto;
import com.monocept.demo.dto.ClaimResponseDto;
import com.monocept.demo.dto.ClaimReviewRequestDto;

public interface ClaimService {

    ClaimResponseDto createClaim(
            ClaimRequestDto request,
            String email);

    ClaimResponseDto reviewClaim(
            Long claimId,
            ClaimReviewRequestDto request);

    ClaimResponseDto finalDecision(
            Long claimId,
            ClaimFinalDecisionRequestDto request);

    ClaimResponseDto getClaimById(
            Long claimId);

    PageResponseDto<ClaimResponseDto> getAllClaims(
            int page,
            int size,
            String sortBy,
            String direction);

    List<ClaimResponseDto> getOwnClaims(
            String email);
}

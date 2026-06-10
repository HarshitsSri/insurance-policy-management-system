package com.monocept.demo.service;

import com.monocept.demo.dto.ClaimStatusHistoryResponseDto;
import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.entity.Claim;
import com.monocept.demo.entity.User;
import com.monocept.demo.enums.ClaimStatus;

public interface ClaimStatusHistoryService {

	void saveHistory(Claim claim, ClaimStatus previousStatus, ClaimStatus newStatus, String remarks, User updatedBy);

	PageResponseDto<ClaimStatusHistoryResponseDto> getClaimHistory(Long claimId, int page, int size, String sortBy,
			String direction);
}
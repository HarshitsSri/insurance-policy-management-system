package com.monocept.demo.service;

import com.monocept.demo.entity.Claim;
import com.monocept.demo.entity.User;
import com.monocept.demo.enums.ClaimStatus;

public interface ClaimStatusHistoryService {

    void createHistory(
            Claim claim,
            ClaimStatus oldStatus,
            ClaimStatus newStatus,
            String remarks,
            User updatedBy);

    List<ClaimStatusHistoryResponseDto>
    getClaimHistory(Long claimId);
}

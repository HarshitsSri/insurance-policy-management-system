package com.monocept.demo.dto;

import java.time.LocalDateTime;

import com.monocept.demo.enums.ClaimStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClaimStatusHistoryResponseDto {

    private Long historyId;

    private Long claimId;

    private String claimNumber;

    private ClaimStatus previousStatus;

    private ClaimStatus newStatus;

    private String remarks;

    private String updatedBy;

    private LocalDateTime createdDate;;
}
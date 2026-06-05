package com.monocept.demo.dto;


import java.time.LocalDate;
import java.time.LocalDateTime;

import com.monocept.demo.enums.ClaimStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClaimResponseDto {

    private Long claimId;

    private String claimNumber;

    private String policyNumber;

    private String customerName;

    private Double claimAmount;

    private String claimReason;

    private LocalDate incidentDate;

    private ClaimStatus claimStatus;

    private String agentRemarks;

    private String adminRemarks;

    private LocalDateTime createdDate;

    private LocalDateTime updatedDate;
}
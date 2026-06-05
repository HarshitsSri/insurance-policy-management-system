package com.monocept.demo.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClaimRequestDto {

    @NotNull(message = "Policy id is required")
    private Long policyId;

    @NotNull(message = "Claim amount is required")
    @Positive(message = "Claim amount must be greater than zero")
    private Double claimAmount;

    @NotBlank(message = "Claim reason is required")
    private String claimReason;

    @NotNull(message = "Incident date is required")
    private LocalDate incidentDate;

    @NotEmpty(message = "At least one document is required")
    private List<ClaimDocumentRequestDto> documents;
}

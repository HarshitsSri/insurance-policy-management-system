package com.monocept.demo.dto;





import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClaimFinalDecisionRequestDto {

    @NotNull(message = "Final decision status is required")
    private ClaimStatus finalDecisionStatus;

    @NotBlank(message = "Remarks are required")
    private String remarks;
}
package com.monocept.demo.dto;



import com.monocept.demo.enums.ClaimStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClaimReviewRequestDto {

    @NotNull(message = "Recommended status is required")
    private ClaimStatus recommendedStatus;

    @NotBlank(message = "Remarks are required")
    private String remarks;
}

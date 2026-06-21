package com.monocept.demo.dto;


import com.monocept.demo.enums.ProductType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InsuranceProductRequestDto {
	@NotBlank(message = "Product name is required")
    private String productName;

    @NotNull(message = "Product type is required")
    private ProductType productType;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Active status is required")
    private Boolean active;

}

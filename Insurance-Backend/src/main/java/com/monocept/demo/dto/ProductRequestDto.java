package com.monocept.demo.dto;

import com.monocept.demo.enums.ProductType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequestDto {

    @NotBlank
    private String productName;

    @NotNull
    private ProductType productType;

    @NotBlank
    private String description;

    @NotNull
    private Boolean active;
}

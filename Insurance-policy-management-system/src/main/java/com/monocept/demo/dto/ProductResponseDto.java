package com.monocept.demo.dto;

import java.time.LocalDateTime;

import com.monocept.demo.enums.ProductType;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProductResponseDto {

    private Long productId;

    private String productName;

    private ProductType productType;

    private String description;

    private Boolean active;

    private LocalDateTime createdDate;

    private LocalDateTime updatedDate;
}
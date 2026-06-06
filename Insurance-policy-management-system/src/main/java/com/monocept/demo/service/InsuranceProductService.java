package com.monocept.demo.service;

import com.monocept.demo.dto.InsuranceProductRequestDto;
import com.monocept.demo.dto.InsuranceProductResponseDto;

public interface InsuranceProductService {

    InsuranceProductResponseDto createProduct(
            InsuranceProductRequestDto request);

    InsuranceProductResponseDto updateProduct(
            Long productId,
            InsuranceProductRequestDto request);

    void deactivateProduct(Long productId);

    InsuranceProductResponseDto getProductById(
            Long productId);

    PageResponseDto<InsuranceProductResponseDto> getAllProducts(
            int page,
            int size,
            String sortBy,
            String direction);

    List<InsuranceProductResponseDto> getActiveProducts();
}
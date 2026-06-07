package com.monocept.demo.service;


import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.dto.ProductRequestDto;
import com.monocept.demo.dto.ProductResponseDto;
import com.monocept.demo.dto.ProductStatusUpdateDto;
import com.monocept.demo.enums.ProductType;

public interface ProductService {

    ProductResponseDto createProduct(ProductRequestDto dto);

    ProductResponseDto updateProduct(
            Long productId,
            ProductRequestDto dto);

    ProductResponseDto getProductById(Long productId);

    PageResponseDto<ProductResponseDto> getAllProducts(
            int page,
            int size,
            String sortBy,
            String direction,
            ProductType productType,
            Boolean active);

    ProductResponseDto updateStatus(
            Long productId,
            ProductStatusUpdateDto dto);
}

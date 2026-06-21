package com.monocept.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.dto.ProductRequestDto;
import com.monocept.demo.dto.ProductResponseDto;
import com.monocept.demo.dto.ProductStatusUpdateDto;
import com.monocept.demo.enums.ProductType;
import com.monocept.demo.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

	private final ProductService productService;

	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ProductResponseDto> createProduct(@Valid @RequestBody ProductRequestDto dto) {

		return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(dto));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ProductResponseDto updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequestDto dto) {

		return productService.updateProduct(id, dto);
	}

	@PatchMapping("/{id}/status")
	@PreAuthorize("hasRole('ADMIN')")
	public ProductResponseDto updateStatus(@PathVariable Long id, @RequestBody ProductStatusUpdateDto dto) {

		return productService.updateStatus(id, dto);
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN','AGENT','CUSTOMER')")
	public ProductResponseDto getProduct(@PathVariable Long id) {

		return productService.getProductById(id);
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN','AGENT','CUSTOMER')")
	public PageResponseDto<ProductResponseDto> getProducts(

			@RequestParam(defaultValue = "0") int page,

			@RequestParam(defaultValue = "10") int size,

			@RequestParam(defaultValue = "createdDate") String sortBy,

			@RequestParam(defaultValue = "desc") String direction,

			@RequestParam(required = false) ProductType productType,

			@RequestParam(required = false) Boolean active) {

		return productService.getAllProducts(page, size, sortBy, direction, productType, active);
	}

}

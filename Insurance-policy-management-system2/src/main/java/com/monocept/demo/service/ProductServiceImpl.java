package com.monocept.demo.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.dto.ProductRequestDto;
import com.monocept.demo.dto.ProductResponseDto;
import com.monocept.demo.dto.ProductStatusUpdateDto;
import com.monocept.demo.entity.Product;
import com.monocept.demo.enums.ProductType;
import com.monocept.demo.exception.DuplicateResourceException;
import com.monocept.demo.exception.ResourceNotFoundException;
import com.monocept.demo.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

	private final ProductRepository productRepository;

	private final ModelMapper modelMapper;

	@Override
	public ProductResponseDto createProduct(ProductRequestDto dto) {

		if (productRepository.existsByProductNameIgnoreCase(dto.getProductName())) {

			throw new DuplicateResourceException("Product already exists");
		}

		Product product = modelMapper.map(dto, Product.class);

		Product savedProduct = productRepository.save(product);

		return modelMapper.map(savedProduct, ProductResponseDto.class);
	}

	@Override
	public ProductResponseDto updateProduct(Long productId, ProductRequestDto dto) {

		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));

		if (!product.getProductName().equalsIgnoreCase(dto.getProductName())
				&& productRepository.existsByProductNameIgnoreCase(dto.getProductName())) {

			throw new DuplicateResourceException("Product already exists");
		}

		product.setProductName(dto.getProductName());

		product.setProductType(dto.getProductType());

		product.setDescription(dto.getDescription());

		product.setActive(dto.getActive());

		Product updatedProduct = productRepository.save(product);

		return modelMapper.map(updatedProduct, ProductResponseDto.class);
	}

	@Override
	public ProductResponseDto getProductById(Long productId) {

		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));

		return modelMapper.map(product, ProductResponseDto.class);
	}

	@Override
	public ProductResponseDto updateStatus(Long productId, ProductStatusUpdateDto dto) {

		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));

		product.setActive(dto.getActive());

		Product updatedProduct = productRepository.save(product);

		return modelMapper.map(updatedProduct, ProductResponseDto.class);
	}

	@Override
	public PageResponseDto<ProductResponseDto> getAllProducts(

			int page, int size, String sortBy, String direction, ProductType productType, Boolean active) {

		Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

		Pageable pageable = PageRequest.of(page, size, sort);

		Page<Product> productPage;

		if (productType != null && active != null) {

			productPage = productRepository.findByProductTypeAndActive(productType, active, pageable);

		} else if (productType != null) {

			productPage = productRepository.findByProductType(productType, pageable);

		} else if (active != null) {

			productPage = productRepository.findByActive(active, pageable);

		} else {

			productPage = productRepository.findAll(pageable);
		}

		List<ProductResponseDto> records = productPage.getContent().stream()
				.map(product -> modelMapper.map(product, ProductResponseDto.class)).toList();

		return new PageResponseDto<>(records, productPage.getNumber(), productPage.getSize(),
				productPage.getTotalElements(), productPage.getTotalPages(), productPage.isLast(), sortBy, direction);
	}

}

package com.monocept.demo.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.monocept.demo.entity.Product;
import com.monocept.demo.enums.ProductType;

public interface ProductRepository extends JpaRepository<Product, Long> {

	boolean existsByProductNameIgnoreCase(String productName);

	Optional<Product> findByProductNameIgnoreCase(String productName);

	Page<Product> findByActive(Boolean active, Pageable pageable);

	Page<Product> findByProductType(ProductType productType, Pageable pageable);

	Page<Product> findByProductTypeAndActive(ProductType productType, Boolean active, Pageable pageable);
}

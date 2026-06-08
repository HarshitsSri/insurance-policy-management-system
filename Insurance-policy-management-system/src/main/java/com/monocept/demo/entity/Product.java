package com.monocept.demo.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.monocept.demo.enums.ProductType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products", uniqueConstraints = { @UniqueConstraint(columnNames = "product_name") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long productId;

	@Column(name = "product_name", nullable = false)
	private String productName;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ProductType productType;

	@Column(nullable = false)
	private String description;

	@Column(nullable = false)
	private Boolean active;

	private LocalDateTime createdDate;

	private LocalDateTime updatedDate;

	@PrePersist
	public void prePersist() {
		createdDate = LocalDateTime.now();
		updatedDate = LocalDateTime.now();
	}

	@PreUpdate
	public void preUpdate() {
		updatedDate = LocalDateTime.now();
	}

	@OneToMany(mappedBy = "product")
	private List<PolicyPlan> policyPlans;

}

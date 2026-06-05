package com.monocept.demo.dto;
import java.time.LocalDateTime;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InsuranceProductResponseDto {
	 private Long productId;

	    private String productName;

	    private ProductType productType;

	    private String description;

	    private Boolean active;

	    private LocalDateTime createdDate;

	    private LocalDateTime updatedDate;
}

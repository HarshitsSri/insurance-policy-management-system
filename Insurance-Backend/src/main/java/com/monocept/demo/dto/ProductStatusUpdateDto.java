package com.monocept.demo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductStatusUpdateDto {

    @NotNull
    private Boolean active;
}
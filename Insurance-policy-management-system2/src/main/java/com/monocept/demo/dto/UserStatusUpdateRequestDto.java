package com.monocept.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStatusUpdateRequestDto {

    private boolean active;

    private String remarks;
}

package com.monocept.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAgentRequestDto {

    private String fullName;

    private String email;

    private String password;

    private String mobileNumber;
}
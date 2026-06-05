package com.monocept.demo.dto;


import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerResponseDto {

    private Long customerId;

    private String fullName;

    private String email;

    private String mobileNumber;

    private LocalDate dob;

    private String address;

    private String city;

    private String state;

    private String pinCode;

    private String nomineeName;

    private String nomineeRelation;
}
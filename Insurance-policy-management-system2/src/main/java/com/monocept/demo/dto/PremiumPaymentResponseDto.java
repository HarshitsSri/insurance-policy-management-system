package com.monocept.demo.dto;


import java.time.LocalDateTime;

import com.monocept.demo.enums.PaymentMode;
import com.monocept.demo.enums.PaymentStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PremiumPaymentResponseDto {

    private Long paymentId;

    private String policyNumber;

    private Double amount;

    private LocalDateTime paymentDate;

    private PaymentMode paymentMode;

    private String transactionReference;

    private PaymentStatus paymentStatus;
}

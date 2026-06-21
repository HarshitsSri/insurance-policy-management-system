package com.monocept.demo.service;

import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.dto.PremiumPaymentRequestDto;
import com.monocept.demo.dto.PremiumPaymentResponseDto;

public interface PremiumPaymentService {

    PremiumPaymentResponseDto
    recordPayment(
            PremiumPaymentRequestDto dto);

    PremiumPaymentResponseDto
    getPaymentById(
            Long paymentId);

    PageResponseDto<PremiumPaymentResponseDto>
    getMyPayments(
            int page,
            int size,
            String sortBy,
            String direction);

    PageResponseDto<PremiumPaymentResponseDto>
    getAllPayments(
            int page,
            int size,
            String sortBy,
            String direction,
            String status);
}
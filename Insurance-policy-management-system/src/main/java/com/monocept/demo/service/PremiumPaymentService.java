package com.monocept.demo.service;

import com.monocept.demo.dto.PremiumPaymentRequestDto;
import com.monocept.demo.dto.PremiumPaymentResponseDto;

public interface PremiumPaymentService {

    PremiumPaymentResponseDto recordPayment(
            PremiumPaymentRequestDto request);

    PremiumPaymentResponseDto getPaymentById(
            Long paymentId);

    PageResponseDto<PremiumPaymentResponseDto> getAllPayments(
            int page,
            int size,
            String sortBy,
            String direction);

    List<PremiumPaymentResponseDto> getPolicyPayments(
            Long policyId);
}

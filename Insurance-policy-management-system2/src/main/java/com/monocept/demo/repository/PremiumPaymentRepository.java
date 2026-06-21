package com.monocept.demo.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.monocept.demo.entity.PremiumPayment;
import com.monocept.demo.enums.PaymentStatus;

public interface PremiumPaymentRepository extends JpaRepository<PremiumPayment, Long> {

	boolean existsByTransactionReference(String transactionReference);

	Optional<PremiumPayment> findByTransactionReference(String transactionReference);

	Page<PremiumPayment> findByPolicyPolicyId(Long policyId, Pageable pageable);

	Page<PremiumPayment> findByPaymentStatus(PaymentStatus paymentStatus, Pageable pageable);

	Page<PremiumPayment> findByPolicyPolicyIdAndPaymentStatus(Long policyId, PaymentStatus paymentStatus,
			Pageable pageable);

	// Customer's own payments
	Page<PremiumPayment> findByPolicyCustomerCustomerId(Long customerId, Pageable pageable);
}

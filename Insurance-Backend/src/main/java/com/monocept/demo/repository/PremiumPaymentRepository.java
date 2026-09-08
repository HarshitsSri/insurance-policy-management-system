package com.monocept.demo.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
	// Count successful payments for a policy (used for ONE_TIME enforcement)
		long countByPolicyPolicyIdAndPaymentStatus(Long policyId, PaymentStatus paymentStatus);

		// Count successful payments for a policy within a date range (used for ANNUAL enforcement)
		@Query("SELECT COUNT(p) FROM PremiumPayment p WHERE p.policy.policyId = :policyId " +
			   "AND p.paymentStatus = :status " +
			   "AND p.paymentDate >= :from AND p.paymentDate < :to")
		long countByPolicyAndStatusAndDateRange(
				@Param("policyId") Long policyId,
				@Param("status") PaymentStatus status,
				@Param("from") LocalDateTime from,
				@Param("to") LocalDateTime to);
}

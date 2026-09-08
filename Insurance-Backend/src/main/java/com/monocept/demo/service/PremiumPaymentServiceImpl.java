package com.monocept.demo.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.dto.PremiumPaymentRequestDto;
import com.monocept.demo.dto.PremiumPaymentResponseDto;
import com.monocept.demo.entity.Customer;
import com.monocept.demo.entity.Policy;
import com.monocept.demo.entity.PremiumPayment;
import com.monocept.demo.entity.User;
import com.monocept.demo.enums.PaymentStatus;
import com.monocept.demo.enums.PolicyStatus;
import com.monocept.demo.enums.PremiumFrequency;
import com.monocept.demo.exception.DuplicateResourceException;
import com.monocept.demo.exception.InvalidPolicyStatusException;
import com.monocept.demo.exception.ResourceNotFoundException;
import com.monocept.demo.repository.CustomerRepository;
import com.monocept.demo.repository.PolicyRepository;
import com.monocept.demo.repository.PremiumPaymentRepository;
import com.monocept.demo.repository.UserRepository;
import com.monocept.demo.util.PremiumCalculator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PremiumPaymentServiceImpl implements PremiumPaymentService {

	private final PremiumPaymentRepository paymentRepository;
	private final PolicyRepository policyRepository;
	private final UserRepository userRepository;
	private final CustomerRepository customerRepository;
	private final ModelMapper modelMapper;

	@Override
	public PremiumPaymentResponseDto recordPayment(PremiumPaymentRequestDto dto) {

		if (paymentRepository.existsByTransactionReference(dto.getTransactionReference())) {

			throw new DuplicateResourceException("Transaction reference already exists");
		}

		Policy policy = policyRepository.findById(dto.getPolicyId())
				.orElseThrow(() -> new ResourceNotFoundException("Policy not found"));
		// ── Payment-frequency enforcement ────────────────────────────────────────
		// The frequency was decided by the customer at purchase time (stored on the
		// Policy), not by the Admin on the plan.
		PremiumFrequency premiumFrequency = policy.getPremiumFrequency();
		LocalDateTime now = LocalDateTime.now();

		if (premiumFrequency == PremiumFrequency.ONE_TIME) {
			// ONE_TIME: only a single successful payment is ever allowed
			long successCount = paymentRepository.countByPolicyPolicyIdAndPaymentStatus(policy.getPolicyId(),
					PaymentStatus.SUCCESS);
			if (successCount > 0) {
				throw new InvalidPolicyStatusException(
						"This is a one-time payment plan. A successful payment has already been made for policy "
								+ policy.getPolicyNumber() + ".");
			}

		} else if (premiumFrequency == PremiumFrequency.ANNUAL) {
			// ANNUAL: only one successful payment per calendar year
			int currentYear = now.getYear();
			LocalDateTime periodStart = LocalDateTime.of(currentYear, 1, 1, 0, 0, 0);
			LocalDateTime periodEnd = LocalDateTime.of(currentYear + 1, 1, 1, 0, 0, 0);

			long countThisPeriod = paymentRepository.countByPolicyAndStatusAndDateRange(policy.getPolicyId(),
					PaymentStatus.SUCCESS, periodStart, periodEnd);
			if (countThisPeriod > 0) {
				throw new InvalidPolicyStatusException("A successful premium payment has already been made for policy "
						+ policy.getPolicyNumber() + " this year (" + currentYear
						+ "). Annual payment plans allow only one payment per calendar year.");
			}

		} else if (premiumFrequency == PremiumFrequency.HALF_YEARLY) {
			// HALF_YEARLY: only one successful payment per half (Jan-Jun, Jul-Dec)
			int currentYear = now.getYear();
			boolean firstHalf = now.getMonthValue() <= 6;
			LocalDateTime periodStart = firstHalf ? LocalDateTime.of(currentYear, 1, 1, 0, 0, 0)
					: LocalDateTime.of(currentYear, 7, 1, 0, 0, 0);
			LocalDateTime periodEnd = firstHalf ? LocalDateTime.of(currentYear, 7, 1, 0, 0, 0)
					: LocalDateTime.of(currentYear + 1, 1, 1, 0, 0, 0);

			long countThisPeriod = paymentRepository.countByPolicyAndStatusAndDateRange(policy.getPolicyId(),
					PaymentStatus.SUCCESS, periodStart, periodEnd);
			if (countThisPeriod > 0) {
				throw new InvalidPolicyStatusException("A successful premium payment has already been made for policy "
						+ policy.getPolicyNumber()
						+ " for this half-year. Half-yearly payment plans allow only one payment per half.");
			}

		} else if (premiumFrequency == PremiumFrequency.MONTHLY) {
			// MONTHLY: only one successful payment per calendar month
			int currentYear = now.getYear();
			int currentMonth = now.getMonthValue();
			LocalDateTime periodStart = LocalDateTime.of(currentYear, currentMonth, 1, 0, 0, 0);
			LocalDateTime periodEnd = periodStart.plusMonths(1);

			long countThisPeriod = paymentRepository.countByPolicyAndStatusAndDateRange(policy.getPolicyId(),
					PaymentStatus.SUCCESS, periodStart, periodEnd);
			if (countThisPeriod > 0) {
				throw new InvalidPolicyStatusException("A successful premium payment has already been made for policy "
						+ policy.getPolicyNumber()
						+ " this month. Monthly payment plans allow only one payment per month.");
			}
		}

		// Payment amount validation - must match the installment amount that was
		// calculated at purchase time for the chosen frequency (not the plan's raw
		// annual premium).
		BigDecimal paymentAmount = BigDecimal.valueOf(dto.getAmount());

		if (paymentAmount.compareTo(policy.getInstallmentAmount()) != 0) {
			throw new IllegalArgumentException(
					"Payment amount must be exactly ₹" + policy.getInstallmentAmount() + ".");
		}
		// Business Validation
		if (policy.getPolicyStatus() == PolicyStatus.CANCELLED) {
			throw new IllegalArgumentException("Payment cannot be made because the policy is cancelled.");
		}

		if (policy.getPolicyStatus() == PolicyStatus.EXPIRED) {
			throw new IllegalArgumentException("Payment cannot be made because the policy has expired.");
		}
		PremiumPayment payment = new PremiumPayment();

		payment.setPolicy(policy);

		payment.setAmount(BigDecimal.valueOf(dto.getAmount()));

		payment.setPaymentDate(LocalDateTime.now());

		payment.setPaymentMode(dto.getPaymentMode());

		payment.setTransactionReference(dto.getTransactionReference());

		payment.setPaymentStatus(dto.getPaymentStatus());

		PremiumPayment savedPayment = paymentRepository.save(payment);

		if (dto.getPaymentStatus() == PaymentStatus.SUCCESS) {

			policy.setTotalPremiumPaid(

					policy.getTotalPremiumPaid().add(savedPayment.getAmount()));

			// The policy goes ACTIVE as soon as its first installment succeeds,
			// regardless of frequency (monthly/half-yearly/annual/one-time) -
			// customers on installment plans shouldn't have to pay the full year
			// upfront just to become ACTIVE.
			if (policy.getPolicyStatus() == PolicyStatus.PENDING_PAYMENT) {

				policy.setPolicyStatus(PolicyStatus.ACTIVE);
			}

			policyRepository.save(policy);
		}

		return convertToDto(savedPayment);
	}

	@Override
	public PremiumPaymentResponseDto getPaymentById(Long paymentId) {

		PremiumPayment payment = paymentRepository.findById(paymentId)
				.orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

		return convertToDto(payment);
	}

	@Override
	public PageResponseDto<PremiumPaymentResponseDto> getMyPayments(int page, int size, String sortBy,
			String direction) {

		User user = getCurrentUser();

		Customer customer = customerRepository.findByUserUserId(user.getUserId());

		if (customer == null) {
			throw new RuntimeException("Customer profile not yet created. Please complete your profile first.");
		}

		Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

		Pageable pageable = PageRequest.of(page, size, sort);

		Page<PremiumPayment> paymentPage = paymentRepository.findByPolicyCustomerCustomerId(customer.getCustomerId(),
				pageable);

		List<PremiumPaymentResponseDto> records = paymentPage.getContent().stream().map(this::convertToDto).toList();

		return new PageResponseDto<>(records, paymentPage.getNumber(), paymentPage.getSize(),
				paymentPage.getTotalElements(), paymentPage.getTotalPages(), paymentPage.isLast(), sortBy, direction);
	}

	@Override
	public PageResponseDto<PremiumPaymentResponseDto> getAllPayments(int page, int size, String sortBy,
			String direction, String status) {

		Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

		Pageable pageable = PageRequest.of(page, size, sort);

		Page<PremiumPayment> paymentPage;

		if (status != null) {

			paymentPage = paymentRepository.findByPaymentStatus(PaymentStatus.valueOf(status.toUpperCase()), pageable);

		} else {

			paymentPage = paymentRepository.findAll(pageable);
		}

		List<PremiumPaymentResponseDto> records = paymentPage.getContent().stream().map(this::convertToDto).toList();

		return new PageResponseDto<>(records, paymentPage.getNumber(), paymentPage.getSize(),
				paymentPage.getTotalElements(), paymentPage.getTotalPages(), paymentPage.isLast(), sortBy, direction);
	}

	private PremiumPaymentResponseDto convertToDto(PremiumPayment payment) {

		PremiumPaymentResponseDto dto = modelMapper.map(payment, PremiumPaymentResponseDto.class);

		dto.setPolicyNumber(payment.getPolicy().getPolicyNumber());

		dto.setAmount(payment.getAmount().doubleValue());

		return dto;
	}

	private User getCurrentUser() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		String email = authentication.getName();

		return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

}
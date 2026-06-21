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
import com.monocept.demo.exception.DuplicateResourceException;
import com.monocept.demo.exception.ResourceNotFoundException;
import com.monocept.demo.repository.CustomerRepository;
import com.monocept.demo.repository.PolicyRepository;
import com.monocept.demo.repository.PremiumPaymentRepository;
import com.monocept.demo.repository.UserRepository;

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

			if (policy.getTotalPremiumPaid().compareTo(policy.getPolicyPlan().getPremiumAmount()) >= 0) {

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
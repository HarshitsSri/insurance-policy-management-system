package com.monocept.demo.entity;



import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.monocept.demo.enums.PolicyStatus;
import com.monocept.demo.enums.PremiumFrequency;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "policies")
public class Policy extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long policyId;

    @Column(nullable = false, unique = true)
    private String policyNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private PolicyPlan policyPlan;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyStatus policyStatus;

    /**
     * Chosen by the customer (or Agent/Admin issuing on their behalf) at the
     * time of purchase - NOT set when the Admin creates the plan.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PremiumFrequency premiumFrequency;

    /**
     * The amount actually payable per installment, derived from the plan's
     * annual premium and the chosen premiumFrequency (see PremiumCalculator).
     * For ONE_TIME this is the single full amount covering the whole duration.
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal installmentAmount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPremiumPaid = BigDecimal.ZERO;
    
    @OneToMany(mappedBy = "policy")
    private List<PremiumPayment> payments;
    
    @OneToMany(mappedBy = "policy")
    private List<Claim> claims;
}

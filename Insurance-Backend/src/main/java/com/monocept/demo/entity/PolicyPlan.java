package com.monocept.demo.entity;

import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "policy_plans")
public class PolicyPlan extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long planId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String planName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal coverageAmount;

    /**
     * The base ANNUAL premium set by the Admin when creating/updating the plan.
     * This is a yearly figure only. The actual amount a customer pays per
     * installment is derived from this value at purchase time, based on the
     * payment frequency (monthly / half-yearly / annual / one-time) they choose
     * — see PremiumCalculator and Policy.installmentAmount.
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal premiumAmount;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false, length = 3000)
    private String termsAndConditions;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "policyPlan")
    private List<Policy> policies;
}
package com.monocept.demo.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.monocept.demo.entity.Claim;
import com.monocept.demo.entity.ClaimDocument;
import com.monocept.demo.entity.ClaimStatusHistory;
import com.monocept.demo.entity.Customer;
import com.monocept.demo.entity.Policy;
import com.monocept.demo.entity.PolicyPlan;
import com.monocept.demo.entity.PremiumPayment;
import com.monocept.demo.entity.Product;
import com.monocept.demo.entity.User;
import com.monocept.demo.enums.ClaimStatus;
import com.monocept.demo.enums.PaymentMode;
import com.monocept.demo.enums.PaymentStatus;
import com.monocept.demo.enums.PolicyStatus;
import com.monocept.demo.enums.PremiumFrequency;
import com.monocept.demo.enums.ProductType;
import com.monocept.demo.enums.Role;
import com.monocept.demo.repository.ClaimDocumentRepository;
import com.monocept.demo.repository.ClaimRepository;
import com.monocept.demo.repository.ClaimStatusHistoryRepository;
import com.monocept.demo.repository.CustomerRepository;
import com.monocept.demo.repository.PolicyPlanRepository;
import com.monocept.demo.repository.PolicyRepository;
import com.monocept.demo.repository.PremiumPaymentRepository;
import com.monocept.demo.repository.ProductRepository;
import com.monocept.demo.repository.UserRepository;

/**
 * Seeds the database with realistic demo data (agents, customers, products,
 * plans, policies, payments and claims) so the app looks populated and
 * consistent out of the box. Runs once — every block is guarded by an
 * existence check, so it's safe to restart the app repeatedly without
 * creating duplicates.
 *
 * Demo login credentials (password is the same for every seeded account):
 *   Admin      : admin@insurance.com / Admin@123        (created by DataInitializer)
 *   Agents     : priya.agent@insurance.com / Agent@123
 *                arjun.agent@insurance.com / Agent@123
 *   Customers  : rohan.sharma@example.com / Customer@123
 *                anita.verma@example.com  / Customer@123
 *                vikram.singh@example.com / Customer@123
 *                sneha.iyer@example.com   / Customer@123
 *                karan.malhotra@example.com / Customer@123 (no profile yet — demonstrates the "complete your profile" flow)
 */
@Configuration
public class DummyDataSeeder {

    @Bean
    @Order(2) // run after DataInitializer creates the admin
    CommandLineRunner seedDummyData(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            PolicyPlanRepository planRepository,
            PolicyRepository policyRepository,
            PremiumPaymentRepository paymentRepository,
            ClaimRepository claimRepository,
            ClaimDocumentRepository claimDocumentRepository,
            ClaimStatusHistoryRepository claimStatusHistoryRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if (productRepository.count() > 0) {
                // Already seeded on a previous run — do nothing.
                return;
            }

            // ---------------------------------------------------------------
            // Agents
            // ---------------------------------------------------------------
            User agentPriya = createUser(userRepository, passwordEncoder, "Priya Nair",
                    "priya.agent@insurance.com", "9820011122", Role.AGENT);
            User agentArjun = createUser(userRepository, passwordEncoder, "Arjun Mehta",
                    "arjun.agent@insurance.com", "9820011123", Role.AGENT);

            // ---------------------------------------------------------------
            // Customers (users + profiles)
            // ---------------------------------------------------------------
            User rohanUser = createUser(userRepository, passwordEncoder, "Rohan Sharma",
                    "rohan.sharma@example.com", "9876500001", Role.CUSTOMER);
            Customer rohan = createCustomerProfile(customerRepository, rohanUser,
                    LocalDate.of(1990, 4, 12), "12 MG Road", "Pune", "Maharashtra", "411001",
                    "Meena Sharma", "Mother");

            User anitaUser = createUser(userRepository, passwordEncoder, "Anita Verma",
                    "anita.verma@example.com", "9876500002", Role.CUSTOMER);
            Customer anita = createCustomerProfile(customerRepository, anitaUser,
                    LocalDate.of(1985, 9, 25), "45 Park Street", "Kolkata", "West Bengal", "700016",
                    "Rakesh Verma", "Spouse");

            User vikramUser = createUser(userRepository, passwordEncoder, "Vikram Singh",
                    "vikram.singh@example.com", "9876500003", Role.CUSTOMER);
            Customer vikram = createCustomerProfile(customerRepository, vikramUser,
                    LocalDate.of(1993, 1, 30), "78 Civil Lines", "Kanpur", "Uttar Pradesh", "208001",
                    "Suresh Singh", "Father");

            User snehaUser = createUser(userRepository, passwordEncoder, "Sneha Iyer",
                    "sneha.iyer@example.com", "9876500004", Role.CUSTOMER);
            Customer sneha = createCustomerProfile(customerRepository, snehaUser,
                    LocalDate.of(1997, 6, 18), "9 Anna Salai", "Chennai", "Tamil Nadu", "600002",
                    "Lakshmi Iyer", "Mother");

            // Deliberately left without a customer profile — this account
            // shows off the "complete your profile" banner / disabled
            // purchase-button flow on first login.
            createUser(userRepository, passwordEncoder, "Karan Malhotra",
                    "karan.malhotra@example.com", "9876500005", Role.CUSTOMER);

            // ---------------------------------------------------------------
            // Products + Plans
            // ---------------------------------------------------------------
            Product health = createProduct(productRepository, "HealthGuard",
                    ProductType.HEALTH, "Comprehensive health insurance covering hospitalisation, surgery and critical illness.");
            Product motor = createProduct(productRepository, "MotorShield",
                    ProductType.MOTOR, "Motor insurance covering own-damage and third-party liability for cars and two-wheelers.");
            Product life = createProduct(productRepository, "LifeSecure",
                    ProductType.LIFE, "Term life insurance providing financial protection for your family.");
            Product travel = createProduct(productRepository, "TravelEase",
                    ProductType.TRAVEL, "Travel insurance covering trip cancellation, medical emergencies and lost baggage.");

            PolicyPlan healthBasic = createPlan(planRepository, health, "Health Basic",
                    new BigDecimal("500000"), new BigDecimal("8500"), 1,
                    "Covers hospitalisation up to Rs 5,00,000 per year. Cashless treatment at network hospitals. 30-day waiting period for illness claims.",
                    true);
            PolicyPlan healthPremium = createPlan(planRepository, health, "Health Premium",
                    new BigDecimal("1500000"), new BigDecimal("18000"), 1,
                    "Covers hospitalisation up to Rs 15,00,000 per year, including critical illness cover and annual health check-up.",
                    true);
            PolicyPlan healthFamily = createPlan(planRepository, health, "Health Family Floater",
                    new BigDecimal("1000000"), new BigDecimal("22000"), 1,
                    "Family floater cover for up to 4 members, shared sum insured of Rs 10,00,000 per year.",
                    false); // inactive — verifies inactive plans are hidden from customers

            PolicyPlan motorThirdParty = createPlan(planRepository, motor, "Motor Third-Party",
                    new BigDecimal("750000"), new BigDecimal("2800"), 1,
                    "Statutory third-party liability cover as mandated by the Motor Vehicles Act.",
                    true);
            PolicyPlan motorComprehensive = createPlan(planRepository, motor, "Motor Comprehensive",
                    new BigDecimal("1200000"), new BigDecimal("9500"), 1,
                    "Own-damage plus third-party cover, including zero-depreciation add-on and roadside assistance.",
                    true);

            PolicyPlan lifeTerm10 = createPlan(planRepository, life, "Life Term 10Y",
                    new BigDecimal("5000000"), new BigDecimal("12000"), 10,
                    "Pure term cover of Rs 50,00,000 for 10 years. Payout to nominee on death during the policy term.",
                    true);
            PolicyPlan lifeTerm20 = createPlan(planRepository, life, "Life Term 20Y",
                    new BigDecimal("10000000"), new BigDecimal("21000"), 20,
                    "Pure term cover of Rs 1,00,00,000 for 20 years, with accidental death benefit rider available.",
                    true);

            PolicyPlan travelInternational = createPlan(planRepository, travel, "Travel International",
                    new BigDecimal("2000000"), new BigDecimal("3200"), 1,
                    "Covers international trips up to 30 days: medical emergencies, trip cancellation and lost baggage.",
                    true);

            // ---------------------------------------------------------------
            // Policies + Payments
            // ---------------------------------------------------------------

            // Rohan — active health policy, fully paid for the year
            Policy rohanPolicy = createPolicy(policyRepository, rohan, healthPremium,
                    LocalDate.now().minusMonths(4), PolicyStatus.ACTIVE, PremiumFrequency.ANNUAL,
                    healthPremium.getPremiumAmount(), healthPremium.getPremiumAmount());
            createPayment(paymentRepository, rohanPolicy, healthPremium.getPremiumAmount(),
                    LocalDateTime.now().minusMonths(4), PaymentMode.UPI, PaymentStatus.SUCCESS);

            // Anita — active motor comprehensive policy, paying monthly
            BigDecimal anitaInstallment = motorComprehensive.getPremiumAmount()
                    .divide(new BigDecimal("12"), 2, java.math.RoundingMode.HALF_UP);
            Policy anitaPolicy = createPolicy(policyRepository, anita, motorComprehensive,
                    LocalDate.now().minusMonths(2), PolicyStatus.ACTIVE, PremiumFrequency.MONTHLY,
                    anitaInstallment, anitaInstallment.multiply(new BigDecimal("2")));
            createPayment(paymentRepository, anitaPolicy, anitaInstallment,
                    LocalDateTime.now().minusMonths(2), PaymentMode.NET_BANKING, PaymentStatus.SUCCESS);
            createPayment(paymentRepository, anitaPolicy, anitaInstallment,
                    LocalDateTime.now().minusMonths(1), PaymentMode.NET_BANKING, PaymentStatus.SUCCESS);

            // Vikram — policy purchased but first premium not yet paid
            createPolicy(policyRepository, vikram, lifeTerm10,
                    LocalDate.now().minusDays(5), PolicyStatus.PENDING_PAYMENT, PremiumFrequency.ANNUAL,
                    lifeTerm10.getPremiumAmount(), BigDecimal.ZERO);

            // Sneha — active travel policy for an upcoming trip
            Policy snehaPolicy = createPolicy(policyRepository, sneha, travelInternational,
                    LocalDate.now().minusDays(20), PolicyStatus.ACTIVE, PremiumFrequency.ONE_TIME,
                    travelInternational.getPremiumAmount(), travelInternational.getPremiumAmount());
            createPayment(paymentRepository, snehaPolicy, travelInternational.getPremiumAmount(),
                    LocalDateTime.now().minusDays(20), PaymentMode.CARD, PaymentStatus.SUCCESS);

            // Rohan — an older, expired motor policy (shows renewal / history flows)
            createPolicy(policyRepository, rohan, motorThirdParty,
                    LocalDate.now().minusYears(1).minusMonths(1), PolicyStatus.EXPIRED, PremiumFrequency.ANNUAL,
                    motorThirdParty.getPremiumAmount(), motorThirdParty.getPremiumAmount());

            // ---------------------------------------------------------------
            // Claims (with status history + a supporting document each)
            // ---------------------------------------------------------------

            // Approved claim on Rohan's health policy
            Claim approvedClaim = createClaim(claimRepository, rohanPolicy,
                    new BigDecimal("45000"), "Hospitalisation for dengue fever treatment at City Hospital.",
                    LocalDate.now().minusMonths(2), ClaimStatus.APPROVED,
                    "Documents verified, treatment matches policy coverage.",
                    "Approved for full claimed amount.");
            addClaimDocument(claimDocumentRepository, approvedClaim, "hospital_bill.pdf", "BILL");
            addClaimDocument(claimDocumentRepository, approvedClaim, "discharge_summary.pdf", "DISCHARGE_SUMMARY");
            addClaimHistory(claimStatusHistoryRepository, approvedClaim, ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW,
                    "Claim received and assigned for review.", agentPriya);
            addClaimHistory(claimStatusHistoryRepository, approvedClaim, ClaimStatus.UNDER_REVIEW, ClaimStatus.RECOMMENDED_FOR_APPROVAL,
                    "Documents verified, treatment matches policy coverage.", agentPriya);
            addClaimHistory(claimStatusHistoryRepository, approvedClaim, ClaimStatus.RECOMMENDED_FOR_APPROVAL, ClaimStatus.APPROVED,
                    "Approved for full claimed amount.", userRepository.findByEmail("admin@insurance.com").orElse(agentPriya));

            // Claim under review on Anita's motor policy
            Claim underReviewClaim = createClaim(claimRepository, anitaPolicy,
                    new BigDecimal("32000"), "Front bumper and headlight damage from a minor collision.",
                    LocalDate.now().minusDays(10), ClaimStatus.UNDER_REVIEW,
                    "Awaiting garage repair estimate.", null);
            addClaimDocument(claimDocumentRepository, underReviewClaim, "damage_photos.zip", "PHOTO");
            addClaimDocument(claimDocumentRepository, underReviewClaim, "fir_copy.pdf", "FIR");
            addClaimHistory(claimStatusHistoryRepository, underReviewClaim, ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW,
                    "Awaiting garage repair estimate.", agentArjun);

            // Freshly submitted claim on Sneha's travel policy
            Claim submittedClaim = createClaim(claimRepository, snehaPolicy,
                    new BigDecimal("15000"), "Lost checked-in baggage on connecting flight.",
                    LocalDate.now().minusDays(3), ClaimStatus.SUBMITTED,
                    null, null);
            addClaimDocument(claimDocumentRepository, submittedClaim, "airline_report.pdf", "REPORT");

            // Rejected claim on Rohan's expired motor policy (demonstrates rejection flow)
            Claim rejectedClaim = createClaim(claimRepository, rohanPolicy,
                    new BigDecimal("60000"), "Engine damage claimed due to water logging.",
                    LocalDate.now().minusMonths(3), ClaimStatus.REJECTED,
                    "Root cause found to be pre-existing wear, not covered under policy.",
                    "Rejected — exclusion clause 4.2 applies (consequential damage).");
            addClaimDocument(claimDocumentRepository, rejectedClaim, "garage_estimate.pdf", "ESTIMATE");
            addClaimHistory(claimStatusHistoryRepository, rejectedClaim, ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW,
                    "Inspecting reported engine damage.", agentPriya);
            addClaimHistory(claimStatusHistoryRepository, rejectedClaim, ClaimStatus.UNDER_REVIEW, ClaimStatus.RECOMMENDED_FOR_REJECTION,
                    "Root cause found to be pre-existing wear, not covered under policy.", agentPriya);
            addClaimHistory(claimStatusHistoryRepository, rejectedClaim, ClaimStatus.RECOMMENDED_FOR_REJECTION, ClaimStatus.REJECTED,
                    "Rejected — exclusion clause 4.2 applies (consequential damage).",
                    userRepository.findByEmail("admin@insurance.com").orElse(agentPriya));

            System.out.println("Dummy demo data seeded successfully.");
        };
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    private User createUser(UserRepository userRepository, PasswordEncoder passwordEncoder, String fullName,
            String email, String mobileNumber, Role role) {

        if (userRepository.existsByEmail(email)) {
            return userRepository.findByEmail(email).orElseThrow();
        }

        String password = role == Role.AGENT ? "Agent@123" : "Customer@123";

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setMobileNumber(mobileNumber);
        user.setRole(role);
        user.setActive(true);

        return userRepository.save(user);
    }

    private Customer createCustomerProfile(CustomerRepository customerRepository, User user,
            LocalDate dateOfBirth, String address, String city, String state, String pinCode,
            String nomineeName, String nomineeRelation) {

        Customer existing = customerRepository.findByUserUserId(user.getUserId());
        if (existing != null) {
            return existing;
        }

        Customer customer = new Customer();
        customer.setUser(user);
        customer.setDateOfBirth(dateOfBirth);
        customer.setAddress(address);
        customer.setCity(city);
        customer.setState(state);
        customer.setPinCode(pinCode);
        customer.setNomineeName(nomineeName);
        customer.setNomineeRelation(nomineeRelation);

        return customerRepository.save(customer);
    }

    private Product createProduct(ProductRepository productRepository, String name, ProductType type,
            String description) {

        return productRepository.findAll().stream()
                .filter(p -> p.getProductName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Product product = Product.builder()
                            .productName(name)
                            .productType(type)
                            .description(description)
                            .active(true)
                            .build();
                    return productRepository.save(product);
                });
    }

    private PolicyPlan createPlan(PolicyPlanRepository planRepository, Product product, String planName,
            BigDecimal coverageAmount, BigDecimal premiumAmount, int duration, String terms, boolean active) {

        PolicyPlan plan = new PolicyPlan();
        plan.setProduct(product);
        plan.setPlanName(planName);
        plan.setCoverageAmount(coverageAmount);
        plan.setPremiumAmount(premiumAmount);
        plan.setDuration(duration);
        plan.setTermsAndConditions(terms);
        plan.setActive(active);

        return planRepository.save(plan);
    }

    private Policy createPolicy(PolicyRepository policyRepository, Customer customer, PolicyPlan plan,
            LocalDate startDate, PolicyStatus status, PremiumFrequency frequency,
            BigDecimal installmentAmount, BigDecimal totalPremiumPaid) {

        Policy policy = new Policy();
        policy.setPolicyNumber(generatePolicyNumber());
        policy.setCustomer(customer);
        policy.setPolicyPlan(plan);
        policy.setStartDate(startDate);
        policy.setEndDate(startDate.plusYears(plan.getDuration()));
        policy.setPolicyStatus(status);
        policy.setPremiumFrequency(frequency);
        policy.setInstallmentAmount(installmentAmount);
        policy.setTotalPremiumPaid(totalPremiumPaid);

        return policyRepository.save(policy);
    }

    private PremiumPayment createPayment(PremiumPaymentRepository paymentRepository, Policy policy,
            BigDecimal amount, LocalDateTime paymentDate, PaymentMode mode, PaymentStatus status) {

        PremiumPayment payment = new PremiumPayment();
        payment.setPolicy(policy);
        payment.setAmount(amount);
        payment.setPaymentDate(paymentDate);
        payment.setPaymentMode(mode);
        payment.setTransactionReference("TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());
        payment.setPaymentStatus(status);

        return paymentRepository.save(payment);
    }

    private Claim createClaim(ClaimRepository claimRepository, Policy policy, BigDecimal claimAmount,
            String claimReason, LocalDate incidentDate, ClaimStatus status, String agentRemarks,
            String adminRemarks) {

        Claim claim = new Claim();
        claim.setClaimNumber(generateClaimNumber());
        claim.setPolicy(policy);
        claim.setClaimAmount(claimAmount);
        claim.setClaimReason(claimReason);
        claim.setIncidentDate(incidentDate);
        claim.setClaimStatus(status);
        claim.setAgentRemarks(agentRemarks);
        claim.setAdminRemarks(adminRemarks);

        return claimRepository.save(claim);
    }

    private void addClaimDocument(ClaimDocumentRepository claimDocumentRepository, Claim claim,
            String documentName, String documentType) {

        ClaimDocument document = new ClaimDocument();
        document.setClaim(claim);
        document.setDocumentName(documentName);
        document.setDocumentType(documentType);
        document.setDocumentUrl("https://res.cloudinary.com/demo/raw/upload/" + documentName);
        document.setPublicId("demo/" + UUID.randomUUID());

        claimDocumentRepository.save(document);
    }

    private void addClaimHistory(ClaimStatusHistoryRepository historyRepository, Claim claim,
            ClaimStatus previousStatus, ClaimStatus newStatus, String remarks, User updatedBy) {

        ClaimStatusHistory history = new ClaimStatusHistory();
        history.setClaim(claim);
        history.setPreviousStatus(previousStatus);
        history.setNewStatus(newStatus);
        history.setRemarks(remarks);
        history.setUpdatedBy(updatedBy);

        historyRepository.save(history);
    }

    private String generatePolicyNumber() {
        return "POL-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private String generateClaimNumber() {
        return "CLM-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}

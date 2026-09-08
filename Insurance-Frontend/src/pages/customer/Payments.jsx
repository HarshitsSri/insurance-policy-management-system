import { useEffect, useState } from "react";
import { Receipt, Plus, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/ui/Pagination";
import { Field, Input, Select } from "../../components/ui/FormControls";
import PaymentTable from "../../components/payment/PaymentTable";
import ExportPdfButton from "../../components/ui/ExportPdfButton";

import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";
import { useCustomerProfile } from "../../hooks/useCustomerProfile";
import { getMyPaymentsApi, recordPaymentApi } from "../../api/paymentApi";
import { getMyPoliciesApi } from "../../api/policyApi";
import { getErrorMessage, formatCurrency, formatDateTime } from "../../utils/format";
import { premiumFrequencyLabel, premiumFrequencySuffix } from "../../utils/premium";

const MODES = ["UPI", "CARD", "NET_BANKING", "CASH"];

const PAYMENT_EXPORT_COLUMNS = [
  { header: "Policy", key: "policyNumber" },
  { header: "Amount", accessor: (p) => formatCurrency(p.amount) },
  { header: "Mode", accessor: (p) => p.paymentMode?.replace("_", " ") },
  { header: "Reference", key: "transactionReference" },
  { header: "Date", accessor: (p) => formatDateTime(p.paymentDate) },
  { header: "Status", key: "paymentStatus" },
];

const noopFetcher = () =>
  Promise.resolve({ data: { content: [], totalElements: 0, totalPages: 0 } });

// ── helpers ────────────────────────────────────────────────────────────────


function isPolicyPayable(policy, allPayments) {
  // Only PENDING_PAYMENT or ACTIVE policies can receive payments.
  // CANCELLED / EXPIRED are always excluded by the policy filter below, but
  // guard here for safety.
  if (policy.policyStatus === "CANCELLED" || policy.policyStatus === "EXPIRED") {
    return false;
  }

  const successfulPaymentsForPolicy = allPayments.filter(
    (pay) =>
      pay.policyNumber === policy.policyNumber &&
      pay.paymentStatus === "SUCCESS"
  );

  return successfulPaymentsForPolicy.filter((pay) => isInCurrentPeriod(pay, policy)).length === 0
    ? true
    : false;
}

// Is this successful payment within the "already paid" window for the
// policy's chosen frequency? For ONE_TIME that window is "ever". For the
// others it's the current calendar month / half / year.
function isInCurrentPeriod(payment, policy) {
  const paidAt = new Date(payment.paymentDate);
  const now = new Date();

  if (policy.premiumFrequency === "ONE_TIME") {
    return true; // any successful payment, ever, blocks further payment
  }

  if (policy.premiumFrequency === "ANNUAL") {
    return paidAt.getFullYear() === now.getFullYear();
  }

  if (policy.premiumFrequency === "HALF_YEARLY") {
    const sameYear = paidAt.getFullYear() === now.getFullYear();
    const sameHalf = Math.floor(paidAt.getMonth() / 6) === Math.floor(now.getMonth() / 6);
    return sameYear && sameHalf;
  }

  if (policy.premiumFrequency === "MONTHLY") {
    return paidAt.getFullYear() === now.getFullYear() && paidAt.getMonth() === now.getMonth();
  }

  return false;
}

function payabilityLabel(policy, allPayments) {
  const paidThisPeriod = allPayments.some(
    (pay) =>
      pay.policyNumber === policy.policyNumber &&
      pay.paymentStatus === "SUCCESS" &&
      isInCurrentPeriod(pay, policy)
  );

  if (!paidThisPeriod) return null;

  switch (policy.premiumFrequency) {
    case "ONE_TIME":
      return "Already paid (one-time)";
    case "ANNUAL":
      return `Annual payment already made for ${new Date().getFullYear()}`;
    case "HALF_YEARLY":
      return "Half-yearly payment already made for this half";
    case "MONTHLY":
      return "Monthly payment already made for this month";
    default:
      return null;
  }
}

// ── component ──────────────────────────────────────────────────────────────

export default function CustomerPayments() {
  const [page, setPage] = useState(0);
  const { profileLoading, hasProfile } = useCustomerProfile();

  // Show a toast once we know the profile is missing
  useEffect(() => {
    if (!profileLoading && hasProfile === false) {
      toast.warn(
        "Customer profile not yet created. Please complete your profile first.",
        { toastId: "no-profile-payments" }
      );
    }
  }, [profileLoading, hasProfile]);

  const params = { page, size: 10, sortBy: "paymentId", direction: "desc" };
  const fetcher = hasProfile === true ? getMyPaymentsApi : noopFetcher;
  const { content, totalElements, totalPages, pageSize, loading, reload } =
    usePaginatedFetch(fetcher, params, [page, hasProfile]);

  // ── modal state ──────────────────────────────────────────────────────────
  const [allPolicies, setAllPolicies] = useState([]);   // all eligible policies fetched
  const [allPayments, setAllPayments] = useState([]);   // all payments (for eligibility check)
  const [modalOpen, setModalOpen]     = useState(false);
  const [form, setForm]               = useState({
    policyId: "",
    amount: "",
    paymentMode: "UPI",
    transactionReference: "",
  });
  const [saving, setSaving] = useState(false);

  // When a policy is selected auto-fill the exact premium amount
  const selectedPolicy = allPolicies.find(
    (p) => String(p.policyId) === String(form.policyId)
  );

  const handlePolicyChange = (e) => {
    const pid = e.target.value;
    const pol = allPolicies.find((p) => String(p.policyId) === pid);
    setForm((f) => ({
      ...f,
      policyId: pid,
      // Auto-fill the exact installment amount so the customer cannot under/over pay
      amount: pol ? String(pol.installmentAmount) : "",
    }));
  };

  const openModal = async () => {
    if (!hasProfile) {
      toast.warn("Please complete your profile before making a payment.");
      return;
    }
    setForm({ policyId: "", amount: "", paymentMode: "UPI", transactionReference: "" });
    setModalOpen(true);

    try {
      // Fetch policies (exclude CANCELLED / EXPIRED at source)
      const polRes = await getMyPoliciesApi({ page: 0, size: 100 });
      const policies = (polRes.data.content || []).filter(
        (p) => p.policyStatus !== "CANCELLED" && p.policyStatus !== "EXPIRED"
      );
      setAllPolicies(policies);
    } catch {
      setAllPolicies([]);
    }

    try {
      // Fetch ALL payments so we can evaluate eligibility client-side
      const payRes = await getMyPaymentsApi({ page: 0, size: 1000, sortBy: "paymentId", direction: "desc" });
      setAllPayments(payRes.data.content || []);
    } catch {
      setAllPayments([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: re-check eligibility before submitting
    if (selectedPolicy && !isPolicyPayable(selectedPolicy, allPayments)) {
      toast.error(payabilityLabel(selectedPolicy, allPayments) || "Payment not allowed for this policy.");
      return;
    }

    setSaving(true);
    try {
      await recordPaymentApi({
        policyId: Number(form.policyId),
        amount: Number(form.amount),
        paymentMode: form.paymentMode,
        transactionReference: form.transactionReference,
        paymentStatus: "SUCCESS",
      });
      toast.success("Payment recorded successfully.");
      setModalOpen(false);
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to record payment."));
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) return <Loader fullScreen label="Loading payments…" />;

  // Partition policies into payable / already-paid for display in the dropdown
  const payablePolicies  = allPolicies.filter((p) => isPolicyPayable(p, allPayments));
  const ineligiblePolicies = allPolicies.filter((p) => !isPolicyPayable(p, allPayments));

  return (
    <div>
      <PageHeader
        eyebrow="Ledger"
        title="My payments"
        description="Pay your premium and review your full payment history."
        action={
          <>
            <ExportPdfButton
              title="My payments"
              subtitle="Your full premium payment history."
              columns={PAYMENT_EXPORT_COLUMNS}
              rows={content}
              hasData={totalElements > 0}
              fetchAllRows={async () => {
                if (!hasProfile) return [];
                const res = await getMyPaymentsApi({ ...params, page: 0, size: 10000 });
                return res.data.content ?? [];
              }}
              filename="my-payments"
            />
            <Button icon={Plus} onClick={openModal} disabled={!hasProfile}>
              Pay premium
            </Button>
          </>
        }
      />

      {/* No-profile banner */}
      {!hasProfile && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-900">
            Your customer profile has not been created yet. Please{" "}
            <Link to="/customer/profile" className="underline">
              complete your profile
            </Link>{" "}
            to view and manage payments.
          </p>
          <Link to="/customer/profile">
            <Button size="sm" variant="accent">
              Complete profile
            </Button>
          </Link>
        </div>
      )}

      <Card padded={false} className="overflow-hidden">
        {loading ? (
          <Loader />
        ) : content.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No payments yet"
            description="Your premium payments will be listed here."
          />
        ) : (
          <PaymentTable payments={content} />
        )}

        <div className="px-5 pb-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      </Card>

      {/* ── Pay premium modal ─────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Pay premium"
        subtitle="Choose a policy and confirm your payment details."
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Policy selector */}
          <Field label="Policy" required>
            <Select
              value={form.policyId}
              onChange={handlePolicyChange}
              required
            >
              <option value="">Select a policy</option>

              {payablePolicies.length > 0 && (
                <optgroup label="Eligible for payment">
                  {payablePolicies.map((p) => (
                    <option key={p.policyId} value={p.policyId}>
                      {p.policyNumber} — {p.planName} (
                      {premiumFrequencyLabel(p.premiumFrequency)})
                    </option>
                  ))}
                </optgroup>
              )}

              {ineligiblePolicies.length > 0 && (
                <optgroup label="Payment not due">
                  {ineligiblePolicies.map((p) => (
                    <option key={p.policyId} value={p.policyId} disabled>
                      {p.policyNumber} — {p.planName} ({payabilityLabel(p, allPayments)})
                    </option>
                  ))}
                </optgroup>
              )}
            </Select>
          </Field>

          {/* Selected-policy info panel */}
          {selectedPolicy && (
            <div className="rounded-xl bg-ink-50/80 px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-ink-400">Premium due</span>
                <span className="font-semibold text-ink-900">
                  {formatCurrency(selectedPolicy.installmentAmount)}{" "}
                  <span className="font-normal text-ink-500">
                    {premiumFrequencySuffix(selectedPolicy.premiumFrequency)}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Payment type</span>
                <span className="font-semibold text-ink-700">
                  {selectedPolicy.premiumFrequency === "ONE_TIME"
                    ? "One-time (single payment for entire policy)"
                    : `${premiumFrequencyLabel(selectedPolicy.premiumFrequency)} (once per ${
                        selectedPolicy.premiumFrequency === "MONTHLY"
                          ? "month"
                          : selectedPolicy.premiumFrequency === "HALF_YEARLY"
                          ? "half-year"
                          : "calendar year"
                      })`}
                </span>
              </div>
            </div>
          )}

          {/* Warn when an ineligible policy is somehow selected */}
          {selectedPolicy && !isPolicyPayable(selectedPolicy, allPayments) && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{payabilityLabel(selectedPolicy, allPayments)}</span>
            </div>
          )}

          {/* Amount — read-only, locked to exact premium */}
          <Field
            label="Amount (₹)"
            required
            hint={
              selectedPolicy
                ? "Amount is fixed to the plan's premium and cannot be changed."
                : undefined
            }
          >
            <Input
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              readOnly={!!selectedPolicy}
              required
            />
          </Field>

          <Field label="Payment mode" required>
            <Select
              value={form.paymentMode}
              onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m.replace("_", " ")}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Transaction reference"
            required
            hint="Your UPI / card / bank reference ID."
          >
            <Input
              value={form.transactionReference}
              onChange={(e) =>
                setForm({ ...form, transactionReference: e.target.value })
              }
              placeholder="e.g. UPI-TXN-2026-00451"
              required
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              loading={saving}
              disabled={
                !form.policyId ||
                (selectedPolicy && !isPolicyPayable(selectedPolicy, allPayments))
              }
            >
              Confirm payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import Modal from "../ui/Modal";
import StatusBadge from "../ui/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/format";
import { premiumFrequencyLabel, premiumFrequencySuffix } from "../../utils/premium";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-2.5 last:border-0">
      <span className="text-sm text-ink-400">{label}</span>
      <span className="text-sm font-semibold text-ink-900">{value}</span>
    </div>
  );
}

export default function PolicyDetailModal({ open, onClose, policy }) {
  if (!policy) return null;

  return (
    <Modal open={open} onClose={onClose} title={policy.policyNumber} subtitle="Policy details">
      <div className="mb-4 flex items-center justify-between rounded-xl bg-ink-50/80 px-4 py-3">
        <span className="text-sm font-medium text-ink-500">Status</span>
        <StatusBadge status={policy.policyStatus} />
      </div>

      <Row label="Customer" value={policy.customerName} />
      <Row label="Plan" value={policy.planName} />
      <Row label="Product type" value={policy.productType} />
      <Row label="Coverage amount" value={formatCurrency(policy.coverageAmount)} />
      <Row label="Annual premium" value={`${formatCurrency(policy.annualPremiumAmount)} /year`} />
      <Row label="Payment frequency" value={premiumFrequencyLabel(policy.premiumFrequency)} />
      <Row label="Installment amount" value={`${formatCurrency(policy.installmentAmount)} ${premiumFrequencySuffix(policy.premiumFrequency)}`} />
      <Row label="Total premium paid" value={formatCurrency(policy.totalPremiumPaid)} />
      <Row label="Start date" value={formatDate(policy.startDate)} />
      <Row label="End date" value={formatDate(policy.endDate)} />
    </Modal>
  );
}

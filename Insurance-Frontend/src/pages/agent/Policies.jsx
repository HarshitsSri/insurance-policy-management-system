import { useState } from "react";
import { ShieldPlus, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/ui/Pagination";
import { Field, Input, Select } from "../../components/ui/FormControls";
import PolicyTable from "../../components/policy/PolicyTable";
import PolicyDetailModal from "../../components/policy/PolicyDetailModal";
import CustomerPicker from "../../components/policy/CustomerPicker";
import ExportPdfButton from "../../components/ui/ExportPdfButton";

import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";
import { getAllPoliciesApi, issuePolicyApi, cancelPolicyApi } from "../../api/policyApi";
import { getPlansApi } from "../../api/productApi";
import { getErrorMessage, formatCurrency, formatDate } from "../../utils/format";
import { PREMIUM_FREQUENCIES, premiumFrequencyLabel } from "../../utils/premium";

const POLICY_EXPORT_COLUMNS = [
  { header: "Policy", key: "policyNumber" },
  { header: "Customer", key: "customerName" },
  { header: "Plan", key: "planName" },
  { header: "Installment", accessor: (p) => formatCurrency(p.installmentAmount) },
  { header: "Period", accessor: (p) => `${formatDate(p.startDate)} - ${formatDate(p.endDate)}` },
  { header: "Status", key: "policyStatus" },
];

const STATUSES = ["PENDING_PAYMENT", "ACTIVE", "EXPIRED", "CANCELLED"];

export default function AgentPolicies() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const params = {
    page,
    size: 10,
    sortBy: "policyId",
    direction: "desc",
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const { content, totalElements, totalPages, pageSize, loading, reload } = usePaginatedFetch(
    getAllPoliciesApi,
    params,
    [page, statusFilter]
  );

  const [issueOpen, setIssueOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [issueForm, setIssueForm] = useState({ planId: "", startDate: "", premiumFrequency: "ANNUAL" });
  const [issueErrors, setIssueErrors] = useState({});
  const [plans, setPlans] = useState([]);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);

  const openIssue = async () => {
    setSelectedCustomer(null);
    setIssueForm({ planId: "", startDate: "", premiumFrequency: "ANNUAL" });
    setIssueErrors({});
    setIssueOpen(true);
    try {
      const res = await getPlansApi({ page: 0, size: 100, active: true });
      setPlans(res.data.content ?? []);
    } catch {
      setPlans([]);
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!selectedCustomer) errors.customer = "Select a customer to issue this policy for.";
    if (!issueForm.planId) errors.planId = "Select a plan.";
    if (!issueForm.startDate) errors.startDate = "Choose a start date.";
    setIssueErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);

    try {
      await issuePolicyApi({
        customerId: selectedCustomer.customerId,
        planId: Number(issueForm.planId),
        startDate: issueForm.startDate,
        premiumFrequency: issueForm.premiumFrequency,
      });
      toast.success("Policy issued successfully.");
      setIssueOpen(false);
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to issue policy."));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (policy) => {
    if (!window.confirm(`Cancel policy ${policy.policyNumber}? This cannot be undone.`)) return;

    try {
      await cancelPolicyApi(policy.policyId);
      toast.success("Policy cancelled.");
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to cancel policy."));
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Lifecycle"
        title="Policies"
        description="Issue new policies for customers and keep track of existing coverage."
        action={
          <>
            <ExportPdfButton
              title="Policies"
              subtitle="Policies issued for customers by this insurance officer."
              columns={POLICY_EXPORT_COLUMNS}
              rows={content}
              hasData={totalElements > 0}
              fetchAllRows={() =>
                getAllPoliciesApi({ ...params, page: 0, size: 10000 }).then((res) => res.data.content ?? [])
              }
              filename="agent-policies"
            />
            <Button icon={ShieldPlus} onClick={openIssue}>
              Issue policy
            </Button>
          </>
        }
      />

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className="w-48">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </Select>
        </div>

        {loading ? (
          <Loader />
        ) : content.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No policies found" />
        ) : (
          <PolicyTable policies={content} onView={setDetail} onCancel={handleCancel} canCancel />
        )}

        <div className="px-5 pb-4">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} />
        </div>
      </Card>

      <Modal open={issueOpen} onClose={() => setIssueOpen(false)} title="Issue a policy" subtitle="Issue a policy on behalf of a customer.">
        <form onSubmit={handleIssue} className="space-y-4">
          <Field label="Customer" required error={issueErrors.customer} hint={issueErrors.customer ? undefined : "Search by email or mobile number."}>
            <CustomerPicker value={selectedCustomer} onChange={setSelectedCustomer} error={issueErrors.customer} />
          </Field>

          <Field label="Plan" required error={issueErrors.planId}>
            <Select value={issueForm.planId} onChange={(e) => setIssueForm({ ...issueForm, planId: e.target.value })} required>
              <option value="">Select a plan</option>
              {plans.map((p) => (
                <option key={p.planId} value={p.planId}>{p.planName} — {p.productName}</option>
              ))}
            </Select>
          </Field>

          <Field label="Start date" required error={issueErrors.startDate}>
            <Input type="date" value={issueForm.startDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setIssueForm({ ...issueForm, startDate: e.target.value })} required />
          </Field>

          <Field label="Premium frequency" required hint="How this customer will pay the premium.">
            <Select value={issueForm.premiumFrequency} onChange={(e) => setIssueForm({ ...issueForm, premiumFrequency: e.target.value })}>
              {PREMIUM_FREQUENCIES.map((f) => (
                <option key={f} value={f}>{premiumFrequencyLabel(f)}</option>
              ))}
            </Select>
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Issue policy</Button>
          </div>
        </form>
      </Modal>

      <PolicyDetailModal open={!!detail} onClose={() => setDetail(null)} policy={detail} />
    </div>
  );
}

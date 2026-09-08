import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/ui/Pagination";
import { Select } from "../../components/ui/FormControls";
import PolicyTable from "../../components/policy/PolicyTable";
import PolicyDetailModal from "../../components/policy/PolicyDetailModal";
import ExportPdfButton from "../../components/ui/ExportPdfButton";

import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";
import { getAllPoliciesApi, cancelPolicyApi } from "../../api/policyApi";
import { getErrorMessage, formatCurrency, formatDate } from "../../utils/format";

const POLICY_EXPORT_COLUMNS = [
  { header: "Policy", key: "policyNumber" },
  { header: "Customer", key: "customerName" },
  { header: "Plan", key: "planName" },
  { header: "Installment", accessor: (p) => formatCurrency(p.installmentAmount) },
  { header: "Period", accessor: (p) => `${formatDate(p.startDate)} - ${formatDate(p.endDate)}` },
  { header: "Status", key: "policyStatus" },
];

const STATUSES = ["PENDING_PAYMENT", "ACTIVE", "EXPIRED", "CANCELLED"];

export default function AdminPolicies() {
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

  const [detail, setDetail] = useState(null);

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
        title="All policies"
        description="Every policy issued or purchased across the system."
        action={
          <ExportPdfButton
            title="All policies"
            subtitle="Every policy issued or purchased across the system."
            columns={POLICY_EXPORT_COLUMNS}
            rows={content}
            hasData={totalElements > 0}
            fetchAllRows={() =>
              getAllPoliciesApi({ ...params, page: 0, size: 10000 }).then((res) => res.data.content ?? [])
            }
            filename="all-policies"
          />
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
          <EmptyState icon={ShieldCheck} title="No policies found" description="Issued or purchased policies will appear here." />
        ) : (
          <PolicyTable policies={content} onView={setDetail} onCancel={handleCancel} canCancel />
        )}

        <div className="px-5 pb-4">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} />
        </div>
      </Card>

      <PolicyDetailModal open={!!detail} onClose={() => setDetail(null)} policy={detail} />
    </div>
  );
}

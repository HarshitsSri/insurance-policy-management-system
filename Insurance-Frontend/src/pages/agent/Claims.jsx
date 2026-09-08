import { useState } from "react";
import { FileText } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/ui/Pagination";
import { Select } from "../../components/ui/FormControls";
import ClaimTable from "../../components/claim/ClaimTable";
import ClaimDetailModal from "../../components/claim/ClaimDetailModal";
import ClaimReviewModal from "../../components/claim/ClaimReviewModal";
import ExportPdfButton from "../../components/ui/ExportPdfButton";

import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";
import { getAllClaimsApi } from "../../api/claimApi";
import { formatCurrency, formatDate } from "../../utils/format";

const CLAIM_EXPORT_COLUMNS = [
  { header: "Claim", key: "claimNumber" },
  { header: "Customer", key: "customerName" },
  { header: "Policy", key: "policyNumber" },
  { header: "Amount", accessor: (c) => formatCurrency(c.claimAmount) },
  { header: "Incident date", accessor: (c) => formatDate(c.incidentDate) },
  { header: "Status", key: "claimStatus" },
];

const STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "RECOMMENDED_FOR_APPROVAL",
  "RECOMMENDED_FOR_REJECTION",
  "APPROVED",
  "REJECTED",
];

export default function AgentClaims() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [detail, setDetail] = useState(null);
  const [reviewClaim, setReviewClaim] = useState(null);

  const params = {
    page,
    size: 10,
    sortBy: "createdDate",
    direction: "desc",
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const { content, totalElements, totalPages, pageSize, loading, reload } = usePaginatedFetch(
    getAllClaimsApi,
    params,
    [page, statusFilter]
  );

  return (
    <div>
      <PageHeader
        eyebrow="Lifecycle"
        title="Claims"
        description="Assess submitted claims and recommend an outcome for admin approval."
        action={
          <ExportPdfButton
            title="Claims"
            subtitle="Assess submitted claims and recommend an outcome for admin approval."
            columns={CLAIM_EXPORT_COLUMNS}
            rows={content}
            hasData={totalElements > 0}
            fetchAllRows={() =>
              getAllClaimsApi({ ...params, page: 0, size: 10000 }).then((res) => res.data.content ?? [])
            }
            filename="claims"
          />
        }
      />

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className="w-56">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
            ))}
          </Select>
        </div>

        {loading ? (
          <Loader />
        ) : content.length === 0 ? (
          <EmptyState icon={FileText} title="No claims found" />
        ) : (
          <ClaimTable claims={content} onView={setDetail} onReview={setReviewClaim} />
        )}

        <div className="px-5 pb-4">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} />
        </div>
      </Card>

      <ClaimDetailModal open={!!detail} onClose={() => setDetail(null)} claim={detail} />
      <ClaimReviewModal open={!!reviewClaim} onClose={() => setReviewClaim(null)} claim={reviewClaim} onSuccess={reload} />
    </div>
  );
}

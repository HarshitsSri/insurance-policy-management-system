import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/ui/Pagination";
import { Select } from "../../components/ui/FormControls";
import PolicyTable from "../../components/policy/PolicyTable";
import PolicyDetailModal from "../../components/policy/PolicyDetailModal";
import ExportPdfButton from "../../components/ui/ExportPdfButton";

import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";
import { useCustomerProfile } from "../../hooks/useCustomerProfile";
import { getMyPoliciesApi } from "../../api/policyApi";
import { formatCurrency, formatDate } from "../../utils/format";

const STATUSES = ["PENDING_PAYMENT", "ACTIVE", "EXPIRED", "CANCELLED"];

const POLICY_EXPORT_COLUMNS = [
  { header: "Policy", key: "policyNumber" },
  { header: "Plan", key: "planName" },
  { header: "Installment", accessor: (p) => formatCurrency(p.installmentAmount) },
  { header: "Period", accessor: (p) => `${formatDate(p.startDate)} - ${formatDate(p.endDate)}` },
  { header: "Status", key: "policyStatus" },
];

const noopFetcher = () => Promise.resolve({ data: { content: [], totalElements: 0, totalPages: 0 } });

export default function CustomerPolicies() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [detail, setDetail] = useState(null);
  const { profileLoading, hasProfile } = useCustomerProfile();

  useEffect(() => {
    if (!profileLoading && hasProfile === false) {
      toast.warn("Customer profile not yet created. Please complete your profile first.", {
        toastId: "no-profile-policies",
      });
    }
  }, [profileLoading, hasProfile]);

  const params = {
    page,
    size: 10,
    sortBy: "policyId",
    direction: "desc",
  };

  const fetcher = hasProfile === true ? getMyPoliciesApi : noopFetcher;
  const { content, totalElements, totalPages, pageSize, loading } = usePaginatedFetch(fetcher, params, [page, hasProfile]);

  const filtered = statusFilter ? content.filter((p) => p.policyStatus === statusFilter) : content;

  if (profileLoading) return <Loader fullScreen label="Loading policies…" />;

  return (
    <div>
      <PageHeader
        eyebrow="My coverage"
        title="My policies"
        description="Everything you've purchased, plus what's pending payment."
        action={
          <>
            <ExportPdfButton
              title="My policies"
              subtitle="Everything you've purchased, plus what's pending payment."
              columns={POLICY_EXPORT_COLUMNS}
              rows={filtered}
              hasData={totalElements > 0}
              fetchAllRows={async () => {
                if (!hasProfile) return [];
                const res = await getMyPoliciesApi({ ...params, page: 0, size: 10000 });
                const all = res.data.content ?? [];
                return statusFilter ? all.filter((p) => p.policyStatus === statusFilter) : all;
              }}
              filename="my-policies"
            />
            <Link to="/customer/plans">
              <Button>Browse more plans</Button>
            </Link>
          </>
        }
      />

      {!hasProfile && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-900">
            Your customer profile has not been created yet. Please{" "}
            <Link to="/customer/profile" className="underline">
              complete your profile
            </Link>{" "}
            to view your policies.
          </p>
          <Link to="/customer/profile">
            <Button size="sm" variant="accent">Complete profile</Button>
          </Link>
        </div>
      )}

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-48">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </Select>
        </div>

        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No policies yet"
            description="Purchase a plan to see it appear here."
            action={<Link to="/customer/plans"><Button size="sm">Browse plans</Button></Link>}
          />
        ) : (
          <PolicyTable policies={filtered} onView={setDetail} showCustomer={false} />
        )}

        <div className="px-5 pb-4">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} />
        </div>
      </Card>

      <PolicyDetailModal open={!!detail} onClose={() => setDetail(null)} policy={detail} />
    </div>
  );
}

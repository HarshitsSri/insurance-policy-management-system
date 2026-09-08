import { useState } from "react";
import { Receipt } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/ui/Pagination";
import { Select } from "../../components/ui/FormControls";
import PaymentTable from "../../components/payment/PaymentTable";
import ExportPdfButton from "../../components/ui/ExportPdfButton";

import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";
import { getAllPaymentsApi } from "../../api/paymentApi";
import { formatCurrency, formatDateTime } from "../../utils/format";

const STATUSES = ["SUCCESS", "FAILED", "PENDING"];

const PAYMENT_EXPORT_COLUMNS = [
  { header: "Policy", key: "policyNumber" },
  { header: "Amount", accessor: (p) => formatCurrency(p.amount) },
  { header: "Mode", accessor: (p) => p.paymentMode?.replace("_", " ") },
  { header: "Reference", key: "transactionReference" },
  { header: "Date", accessor: (p) => formatDateTime(p.paymentDate) },
  { header: "Status", key: "paymentStatus" },
];

export default function AgentPayments() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const params = {
    page,
    size: 10,
    sortBy: "paymentId",
    direction: "desc",
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const { content, totalElements, totalPages, pageSize, loading } = usePaginatedFetch(
    getAllPaymentsApi,
    params,
    [page, statusFilter]
  );

  return (
    <div>
      <PageHeader
        eyebrow="Ledger"
        title="Premium payments"
        description="Review the full premium payment ledger across customers."
        action={
          <ExportPdfButton
            title="Premium payments"
            subtitle="Premium payment ledger across customers."
            columns={PAYMENT_EXPORT_COLUMNS}
            rows={content}
            hasData={totalElements > 0}
            fetchAllRows={() =>
              getAllPaymentsApi({ ...params, page: 0, size: 10000 }).then((res) => res.data.content ?? [])
            }
            filename="agent-payments"
          />
        }
      />

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className="w-44">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>

        {loading ? (
          <Loader />
        ) : content.length === 0 ? (
          <EmptyState icon={Receipt} title="No payments found" />
        ) : (
          <PaymentTable payments={content} />
        )}

        <div className="px-5 pb-4">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
}

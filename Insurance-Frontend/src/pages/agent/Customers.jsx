import { useState } from "react";
import { Users as UsersIcon, Search } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/ui/Pagination";
import { Input } from "../../components/ui/FormControls";
import ExportPdfButton from "../../components/ui/ExportPdfButton";

import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { getCustomersApi } from "../../api/userApi";

const CUSTOMER_EXPORT_COLUMNS = [
  { header: "Name", key: "fullName" },
  { header: "Email", key: "email" },
  { header: "Mobile", key: "mobileNumber" },
  { header: "Location", accessor: (c) => [c.city, c.state].filter(Boolean).join(", ") },
  { header: "Nominee", accessor: (c) => (c.nomineeName ? `${c.nomineeName}${c.nomineeRelation ? ` (${c.nomineeRelation})` : ""}` : "") },
];

export default function AgentCustomers() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const params = {
    page,
    size: 10,
    sortBy: "customerId",
    direction: "desc",
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { content, totalElements, totalPages, pageSize, loading } = usePaginatedFetch(
    getCustomersApi,
    params,
    [page, debouncedSearch]
  );

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Customers"
        description="Everyone who holds or has held a policy — search by name, email or mobile number."
        action={
          <ExportPdfButton
            title="Customers"
            subtitle="Everyone who holds or has held a policy."
            columns={CUSTOMER_EXPORT_COLUMNS}
            rows={content}
            hasData={totalElements > 0}
            fetchAllRows={() =>
              getCustomersApi({ ...params, page: 0, size: 10000 }).then((res) => res.data.content ?? [])
            }
            filename="customers"
          />
        }
      />

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
          <Input
            icon={Search}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by name, email or mobile…"
            className="max-w-xs"
          />
        </div>

        {loading ? (
          <Loader />
        ) : content.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No customers found"
            description={debouncedSearch ? "No customers match your search." : "Customers will appear here once they complete their profile."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Nominee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {content.map((c) => (
                  <tr key={c.customerId} className="hover:bg-ink-50/60">
                    <td className="px-5 py-3.5 font-semibold text-ink-900">{c.fullName}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-ink-600">{c.email}</p>
                      <p className="text-xs text-ink-400">{c.mobileNumber}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ink-600">
                      {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-ink-600">
                      {c.nomineeName ? (
                        <>
                          <p>{c.nomineeName}</p>
                          {c.nomineeRelation && <p className="text-xs text-ink-400">{c.nomineeRelation}</p>}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 pb-4">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
import { FileText, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/ui/Pagination";
import { Field, Input, Textarea } from "../../components/ui/FormControls";
import ClaimTable from "../../components/claim/ClaimTable";
import ClaimDetailModal from "../../components/claim/ClaimDetailModal";
import ClaimDocumentUploader from "../../components/claim/ClaimDocumentUploader";
import ExportPdfButton from "../../components/ui/ExportPdfButton";

import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";
import { useCustomerProfile } from "../../hooks/useCustomerProfile";
import { getMyClaimsApi, raiseClaimApi } from "../../api/claimApi";
import { getMyPoliciesApi } from "../../api/policyApi";
import { getErrorMessage, formatCurrency, formatDate } from "../../utils/format";
import { Select } from "../../components/ui/FormControls";

const emptyForm = { policyId: "", claimAmount: "", claimReason: "", incidentDate: "" };

const CLAIM_EXPORT_COLUMNS = [
  { header: "Claim", key: "claimNumber" },
  { header: "Policy", key: "policyNumber" },
  { header: "Amount", accessor: (c) => formatCurrency(c.claimAmount) },
  { header: "Incident date", accessor: (c) => formatDate(c.incidentDate) },
  { header: "Status", key: "claimStatus" },
];

const noopFetcher = () => Promise.resolve({ data: { content: [], totalElements: 0, totalPages: 0 } });

export default function CustomerClaims() {
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState(null);
  const { profileLoading, hasProfile } = useCustomerProfile();

  useEffect(() => {
    if (!profileLoading && hasProfile === false) {
      toast.warn("Customer profile not yet created. Please complete your profile first.", {
        toastId: "no-profile-claims",
      });
    }
  }, [profileLoading, hasProfile]);

  const params = { page, size: 10, sortBy: "createdDate", direction: "desc" };
  const fetcher = hasProfile === true ? getMyClaimsApi : noopFetcher;
  const { content, totalElements, totalPages, pageSize, loading, reload } = usePaginatedFetch(fetcher, params, [page, hasProfile]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [documents, setDocuments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [saving, setSaving] = useState(false);

  const openModal = async () => {
    if (!hasProfile) {
      toast.warn("Please complete your profile before filing a claim.");
      return;
    }
    setForm(emptyForm);
    setDocuments([]);
    setModalOpen(true);
    try {
      const res = await getMyPoliciesApi({ page: 0, size: 50, status: "ACTIVE" });
      setPolicies((res.data.content || []).filter((p) => p.policyStatus === "ACTIVE"));
    } catch {
      setPolicies([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (documents.length === 0) {
      toast.error("Please upload at least one supporting document.");
      return;
    }

    setSaving(true);

    try {
      await raiseClaimApi({
        policyId: Number(form.policyId),
        claimAmount: Number(form.claimAmount),
        claimReason: form.claimReason,
        incidentDate: form.incidentDate,
        documents,
      });
      toast.success("Claim submitted successfully.");
      setModalOpen(false);
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to submit claim."));
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) return <Loader fullScreen label="Loading claims…" />;

  return (
    <div>
      <PageHeader
        eyebrow="Support"
        title="My claims"
        description="File a new claim or track the progress of an existing one."
        action={
          <>
            <ExportPdfButton
              title="My claims"
              subtitle="File a new claim or track the progress of an existing one."
              columns={CLAIM_EXPORT_COLUMNS}
              rows={content}
              hasData={totalElements > 0}
              fetchAllRows={async () => {
                if (!hasProfile) return [];
                const res = await getMyClaimsApi({ ...params, page: 0, size: 10000 });
                return res.data.content ?? [];
              }}
              filename="my-claims"
            />
            <Button icon={Plus} onClick={openModal} disabled={!hasProfile}>
              Raise a claim
            </Button>
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
            to file and track claims.
          </p>
          <Link to="/customer/profile">
            <Button size="sm" variant="accent">Complete profile</Button>
          </Link>
        </div>
      )}

      <Card padded={false} className="overflow-hidden">
        {loading ? (
          <Loader />
        ) : content.length === 0 ? (
          <EmptyState icon={FileText} title="No claims filed" description="When you file a claim, it'll show up here." action={<Button size="sm" icon={Plus} onClick={openModal} disabled={!hasProfile}>Raise a claim</Button>} />
        ) : (
          <ClaimTable claims={content} onView={setDetail} showCustomer={false} />
        )}

        <div className="px-5 pb-4">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} />
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Raise a claim" subtitle="Tell us what happened and attach supporting documents." width="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Policy" required>
            <Select value={form.policyId} onChange={(e) => setForm({ ...form, policyId: e.target.value })} required>
              <option value="">Select an active policy</option>
              {policies.map((p) => (
                <option key={p.policyId} value={p.policyId}>{p.policyNumber} — {p.planName}</option>
              ))}
            </Select>
          </Field>

          <Field label="Claim amount (₹)" required>
            <Input type="number" min="1" value={form.claimAmount} onChange={(e) => setForm({ ...form, claimAmount: e.target.value })} required />
          </Field>

          <Field label="Incident date" required>
            <Input type="date" max={new Date().toISOString().split("T")[0]} value={form.incidentDate} onChange={(e) => setForm({ ...form, incidentDate: e.target.value })} required />
          </Field>

          <Field label="What happened?" required>
            <Textarea value={form.claimReason} onChange={(e) => setForm({ ...form, claimReason: e.target.value })} placeholder="Describe the incident in detail." required />
          </Field>

          <Field label="Supporting documents" required hint="Upload at least one document (bill, report, photo, etc.)">
            <ClaimDocumentUploader documents={documents} onChange={setDocuments} />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Submit claim</Button>
          </div>
        </form>
      </Modal>

      <ClaimDetailModal open={!!detail} onClose={() => setDetail(null)} claim={detail} />
    </div>
  );
}

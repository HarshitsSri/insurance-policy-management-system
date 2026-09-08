import { useState } from "react";
import { FileText, History as HistoryIcon } from "lucide-react";
import Modal from "../ui/Modal";
import StatusBadge from "../ui/StatusBadge";
import ClaimStatusTimeline from "./ClaimStatusTimeline";
import { formatCurrency, formatDate } from "../../utils/format";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-2.5 last:border-0">
      <span className="text-sm text-ink-400">{label}</span>
      <span className="text-sm font-semibold text-ink-900">{value}</span>
    </div>
  );
}

export default function ClaimDetailModal({ open, onClose, claim }) {
  const [tab, setTab] = useState("details");

  if (!claim) return null;

  return (
    <Modal open={open} onClose={onClose} title={claim.claimNumber} subtitle="Claim details" width="max-w-xl">
      <div className="mb-4 flex items-center justify-between rounded-xl bg-ink-50/80 px-4 py-3">
        <span className="text-sm font-medium text-ink-500">Status</span>
        <StatusBadge status={claim.claimStatus} />
      </div>

      <div className="mb-4 flex gap-1 rounded-lg bg-ink-50 p-1">
        <button
          onClick={() => setTab("details")}
          className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition ${tab === "details" ? "bg-white text-ink-900 shadow-card" : "text-ink-400"}`}
        >
          Details
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition ${tab === "history" ? "bg-white text-ink-900 shadow-card" : "text-ink-400"}`}
        >
          History
        </button>
        <button
          onClick={() => setTab("documents")}
          className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition ${tab === "documents" ? "bg-white text-ink-900 shadow-card" : "text-ink-400"}`}
        >
          Documents
        </button>
      </div>

      {tab === "details" && (
        <div>
          <Row label="Customer" value={claim.customerName} />
          <Row label="Policy" value={claim.policyNumber} />
          <Row label="Claim amount" value={formatCurrency(claim.claimAmount)} />
          <Row label="Incident date" value={formatDate(claim.incidentDate)} />
          <Row label="Submitted" value={formatDate(claim.createdDate)} />
          <div className="mt-3 rounded-xl bg-ink-50/70 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Claim reason</p>
            <p className="mt-1.5 text-sm text-ink-700">{claim.claimReason}</p>
          </div>
          {claim.agentRemarks && (
            <div className="mt-3 rounded-xl bg-amber-50 p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Insurance officer remarks</p>
              <p className="mt-1.5 text-sm text-amber-900">{claim.agentRemarks}</p>
            </div>
          )}
          {claim.adminRemarks && (
            <div className="mt-3 rounded-xl bg-ink-900 p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Admin remarks</p>
              <p className="mt-1.5 text-sm text-ink-100">{claim.adminRemarks}</p>
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="px-1">
          <ClaimStatusTimeline claimId={claim.claimId} />
        </div>
      )}

      {tab === "documents" && (
        <div className="space-y-2">
          {(claim.documents ?? []).length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-400">No documents attached.</p>
          ) : (
            claim.documents.map((doc) => (
              <a
                key={doc.documentId}
                href={doc.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-ink-100 px-4 py-3 transition hover:border-ink-300 hover:bg-ink-50/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
                  <FileText size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-semibold text-ink-900">{doc.documentName}</p>
                  <p className="text-xs text-ink-400">{doc.documentType}</p>
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </Modal>
  );
}

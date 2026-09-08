import { Eye, ClipboardCheck, Gavel } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/format";

export default function ClaimTable({ claims, onView, onReview, onDecide, showCustomer = true }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wide text-ink-400">
            <th className="px-5 py-3">Claim</th>
            {showCustomer && <th className="px-5 py-3">Customer</th>}
            <th className="px-5 py-3">Policy</th>
            <th className="px-5 py-3">Amount</th>
            <th className="px-5 py-3">Incident date</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {claims.map((claim) => (
            <tr key={claim.claimId} className="hover:bg-ink-50/60">
              <td className="px-5 py-3.5">
                <p className="font-semibold text-ink-900">{claim.claimNumber}</p>
              </td>
              {showCustomer && <td className="px-5 py-3.5 text-ink-600">{claim.customerName}</td>}
              <td className="px-5 py-3.5 text-ink-600">{claim.policyNumber}</td>
              <td className="px-5 py-3.5 text-ink-700">{formatCurrency(claim.claimAmount)}</td>
              <td className="px-5 py-3.5 text-ink-500">{formatDate(claim.incidentDate)}</td>
              <td className="px-5 py-3.5"><StatusBadge status={claim.claimStatus} /></td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end gap-2">
                  {onView && (
                    <button onClick={() => onView(claim)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="View">
                      <Eye size={15} />
                    </button>
                  )}
                  {onReview && claim.claimStatus === "SUBMITTED" || (onReview && claim.claimStatus === "UNDER_REVIEW") ? (
                    <button onClick={() => onReview(claim)} className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50" title="Review">
                      <ClipboardCheck size={15} />
                    </button>
                  ) : null}
                  {onDecide &&
                    (claim.claimStatus === "RECOMMENDED_FOR_APPROVAL" || claim.claimStatus === "RECOMMENDED_FOR_REJECTION") && (
                      <button onClick={() => onDecide(claim)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-900 hover:bg-ink-100" title="Final decision">
                        <Gavel size={15} />
                      </button>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { Eye, Ban } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/format";
import { premiumFrequencySuffix } from "../../utils/premium";

export default function PolicyTable({ policies, onView, onCancel, showCustomer = true, canCancel = false }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wide text-ink-400">
            <th className="px-5 py-3">Policy</th>
            {showCustomer && <th className="px-5 py-3">Customer</th>}
            <th className="px-5 py-3">Plan</th>
            <th className="px-5 py-3">Premium</th>
            <th className="px-5 py-3">Period</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {policies.map((policy) => (
            <tr key={policy.policyId} className="hover:bg-ink-50/60">
              <td className="px-5 py-3.5">
                <p className="font-semibold text-ink-900">{policy.policyNumber}</p>
                <p className="text-xs text-ink-400">{policy.productType}</p>
              </td>
              {showCustomer && <td className="px-5 py-3.5 text-ink-600">{policy.customerName}</td>}
              <td className="px-5 py-3.5 text-ink-600">{policy.planName}</td>
              <td className="px-5 py-3.5 text-ink-700">
                {formatCurrency(policy.installmentAmount)}
                <span className="ml-1 text-xs text-ink-400">{premiumFrequencySuffix(policy.premiumFrequency)}</span>
              </td>
              <td className="px-5 py-3.5 text-ink-500">
                {formatDate(policy.startDate)} – {formatDate(policy.endDate)}
              </td>
              <td className="px-5 py-3.5"><StatusBadge status={policy.policyStatus} /></td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end gap-2">
                  {onView && (
                    <button onClick={() => onView(policy)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="View">
                      <Eye size={15} />
                    </button>
                  )}
                  {canCancel && onCancel && policy.policyStatus === "ACTIVE" && (
                    <button onClick={() => onCancel(policy)} className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50" title="Cancel policy">
                      <Ban size={15} />
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

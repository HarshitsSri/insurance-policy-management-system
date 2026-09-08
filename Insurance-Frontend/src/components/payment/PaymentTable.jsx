import StatusBadge from "../ui/StatusBadge";
import { formatCurrency, formatDateTime } from "../../utils/format";

export default function PaymentTable({ payments }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wide text-ink-400">
            <th className="px-5 py-3">Policy</th>
            <th className="px-5 py-3">Amount</th>
            <th className="px-5 py-3">Mode</th>
            <th className="px-5 py-3">Reference</th>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {payments.map((payment) => (
            <tr key={payment.paymentId} className="hover:bg-ink-50/60">
              <td className="px-5 py-3.5 font-semibold text-ink-900">{payment.policyNumber}</td>
              <td className="px-5 py-3.5 text-ink-700">{formatCurrency(payment.amount)}</td>
              <td className="px-5 py-3.5 text-ink-600">{payment.paymentMode?.replace("_", " ")}</td>
              <td className="px-5 py-3.5 text-ink-500">{payment.transactionReference}</td>
              <td className="px-5 py-3.5 text-ink-500">{formatDateTime(payment.paymentDate)}</td>
              <td className="px-5 py-3.5"><StatusBadge status={payment.paymentStatus} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

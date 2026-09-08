import { useEffect, useState } from "react";
import { History } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import Loader from "../common/Loader";
import { getClaimHistoryApi } from "../../api/claimApi";
import { formatDateTime } from "../../utils/format";

export default function ClaimStatusTimeline({ claimId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!claimId) return;
    let active = true;

    getClaimHistoryApi(claimId, { page: 0, size: 20, sortBy: "createdDate", direction: "desc" })
      .then((res) => {
        if (active) setHistory(res.data.content ?? []);
      })
      .catch(() => {
        if (active) setHistory([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [claimId]);

  if (loading) return <Loader label="Loading history" />;

  if (history.length === 0) {
    return <p className="py-4 text-center text-sm text-ink-400">No status changes recorded yet.</p>;
  }

  return (
    <div className="space-y-0">
      {history.map((h, idx) => (
        <div key={h.historyId} className="relative flex gap-3 pb-5 pl-1 last:pb-0">
          {idx !== history.length - 1 && (
            <span className="absolute left-[7px] top-5 h-full w-px bg-ink-100" />
          )}
          <div className="relative z-10 mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-ink-900">
            <History size={8} className="text-amber-300" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={h.newStatus} size="sm" />
              <span className="text-xs text-ink-400">{formatDateTime(h.createdDate)}</span>
            </div>
            <p className="mt-1 text-sm text-ink-600">{h.remarks}</p>
            {h.updatedBy && <p className="mt-0.5 text-xs font-medium text-ink-400">by {h.updatedBy}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

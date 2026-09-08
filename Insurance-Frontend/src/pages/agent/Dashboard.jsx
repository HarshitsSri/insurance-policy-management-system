import { useEffect, useState } from "react";
import { ShieldCheck, FileText, Receipt, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import PageHeader from "../../components/ui/PageHeader";
import StatTile from "../../components/ui/StatTile";
import Card, { CardHeader } from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/ui/EmptyState";

import { getAllPoliciesApi } from "../../api/policyApi";
import { getAllClaimsApi } from "../../api/claimApi";
import { getErrorMessage, formatCurrency, formatDateTime } from "../../utils/format";

export default function AgentDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ policies: 0, activePolicies: 0, claimsForReview: 0 });
  const [recentClaims, setRecentClaims] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [policiesRes, activeRes, reviewRes] = await Promise.all([
          getAllPoliciesApi({ page: 0, size: 1, sortBy: "policyId", direction: "desc" }),
          getAllPoliciesApi({ page: 0, size: 1, sortBy: "policyId", direction: "desc", status: "ACTIVE" }),
          getAllClaimsApi({ page: 0, size: 5, status: "SUBMITTED" }),
        ]);

        if (!active) return;

        setStats({
          policies: policiesRes.data.totalElements ?? 0,
          activePolicies: activeRes.data.totalElements ?? 0,
          claimsForReview: reviewRes.data.totalElements ?? 0,
        });
        setRecentClaims(reviewRes.data.content ?? []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load dashboard data."));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loader fullScreen label="Loading dashboard" />;

  return (
    <div>
      <PageHeader eyebrow="Insurance Officer" title="Your workspace" description="Policies you can help manage and claims waiting on your review." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={ShieldCheck} label="Active policies" value={stats.activePolicies} sub={`${stats.policies} total in system`} />
        <StatTile icon={ClipboardCheck} label="Claims to review" value={stats.claimsForReview} tone="amber" sub="Awaiting your recommendation" />
        <StatTile icon={Receipt} label="Record a payment" value="→" sub="Log a customer's premium payment" />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            icon={FileText}
            title="Claims awaiting review"
            subtitle="Submitted claims that need your assessment"
            action={
              <Link to="/agent/claims" className="text-xs font-semibold text-ink-600 hover:text-amber-600">
                Go to claims →
              </Link>
            }
          />
          {recentClaims.length === 0 ? (
            <EmptyState title="All caught up" description="No claims are waiting on your review right now." />
          ) : (
            <div className="space-y-3">
              {recentClaims.map((c) => (
                <div key={c.claimId} className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{c.claimNumber}</p>
                    <p className="text-xs text-ink-400">
                      {c.customerName} · {formatCurrency(c.claimAmount)} · {formatDateTime(c.createdDate)}
                    </p>
                  </div>
                  <StatusBadge status={c.claimStatus} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

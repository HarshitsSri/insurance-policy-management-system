import { useEffect, useState } from "react";
import { ShieldCheck, FileText, Receipt, PackageSearch, ArrowUpRight, UserCog } from "lucide-react";
import { Link } from "react-router-dom";

import PageHeader from "../../components/ui/PageHeader";
import StatTile from "../../components/ui/StatTile";
import Card, { CardHeader } from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

import { getMyPoliciesApi } from "../../api/policyApi";
import { getMyClaimsApi } from "../../api/claimApi";
import { getOwnCustomerProfileApi } from "../../api/userApi";
import { formatCurrency, formatDate } from "../../utils/format";

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(true);
  const [stats, setStats] = useState({ policies: 0, activePolicies: 0, claims: 0 });
  const [recentPolicies, setRecentPolicies] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        await getOwnCustomerProfileApi();
        if (active) setHasProfile(true);
      } catch {
        if (active) setHasProfile(false);
      }

      try {
        const [policiesRes, activeRes, claimsRes] = await Promise.all([
          getMyPoliciesApi({ page: 0, size: 5 }),
          getMyPoliciesApi({ page: 0, size: 1 }),
          getMyClaimsApi({ page: 0, size: 1 }),
        ]);

        if (!active) return;

        const activePolicies = (activeRes.data.content || []).filter((p) => p.policyStatus === "ACTIVE").length;

        setStats({
          policies: policiesRes.data.totalElements ?? 0,
          activePolicies,
          claims: claimsRes.data.totalElements ?? 0,
        });
        setRecentPolicies(policiesRes.data.content ?? []);
      } catch {
        // Non-fatal — likely no profile/policies yet
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loader fullScreen label="Loading your dashboard" />;

  return (
    <div>
      <PageHeader eyebrow="Customer" title="Your coverage at a glance" description="Policies, payments and claims, all in one place." />

      {!hasProfile && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-ink-950">
              <UserCog size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Complete your profile to purchase a policy</p>
              <p className="text-xs text-amber-700">We need your address and nominee details first.</p>
            </div>
          </div>
          <Link to="/customer/profile">
            <Button size="sm" variant="accent">Complete profile</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={ShieldCheck} label="Active policies" value={stats.activePolicies} sub={`${stats.policies} total purchased`} />
        <StatTile icon={FileText} label="Claims filed" value={stats.claims} tone="amber" />
        <StatTile icon={PackageSearch} label="Browse new plans" value="→" sub="Find coverage that fits you" />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            icon={ShieldCheck}
            title="Your policies"
            subtitle="Most recently purchased or issued"
            action={
              <Link to="/customer/policies" className="flex items-center gap-1 text-xs font-semibold text-ink-600 hover:text-amber-600">
                View all <ArrowUpRight size={14} />
              </Link>
            }
          />
          {recentPolicies.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No policies yet"
              description="Browse our plans to find coverage that suits you."
              action={
                <Link to="/customer/plans">
                  <Button size="sm">Browse plans</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentPolicies.map((p) => (
                <div key={p.policyId} className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{p.policyNumber}</p>
                    <p className="text-xs text-ink-400">
                      {p.planName} · {formatCurrency(p.installmentAmount)} · until {formatDate(p.endDate)}
                    </p>
                  </div>
                  <StatusBadge status={p.policyStatus} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Users, ShieldCheck, FileText, Receipt, PackageSearch, ArrowUpRight } from "lucide-react";
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
import { getAllUsersApi } from "../../api/userApi";
import { getProductsApi } from "../../api/productApi";
import { getErrorMessage, formatCurrency, formatDateTime } from "../../utils/format";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    policies: 0,
    activePolicies: 0,
    claims: 0,
    pendingClaims: 0,
    users: 0,
    products: 0,
  });
  const [recentClaims, setRecentClaims] = useState([]);
  const [recentPolicies, setRecentPolicies] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [policiesRes, activeRes, claimsRes, pendingRes, usersRes, productsRes] = await Promise.all([
          getAllPoliciesApi({ page: 0, size: 5, sortBy: "policyId", direction: "desc" }),
          getAllPoliciesApi({ page: 0, size: 1, sortBy: "policyId", direction: "desc", status: "ACTIVE" }),
          getAllClaimsApi({ page: 0, size: 5 }),
          getAllClaimsApi({ page: 0, size: 1, status: "SUBMITTED" }),
          getAllUsersApi({ page: 0, size: 1 }),
          getProductsApi({ page: 0, size: 1 }),
        ]);

        if (!active) return;

        setStats({
          policies: policiesRes.data.totalElements ?? 0,
          activePolicies: activeRes.data.totalElements ?? 0,
          claims: claimsRes.data.totalElements ?? 0,
          pendingClaims: pendingRes.data.totalElements ?? 0,
          users: usersRes.data.totalElements ?? 0,
          products: productsRes.data.totalElements ?? 0,
        });
        setRecentPolicies(policiesRes.data.content ?? []);
        setRecentClaims(claimsRes.data.content ?? []);
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
      <PageHeader
        eyebrow="Admin"
        title="Welcome back"
        description="A snapshot of policies, claims and people across the system."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={ShieldCheck} label="Active policies" value={stats.activePolicies} sub={`${stats.policies} total issued`} />
        <StatTile icon={FileText} label="Claims awaiting review" value={stats.pendingClaims} sub={`${stats.claims} total claims`} tone="amber" />
        <StatTile icon={PackageSearch} label="Insurance products" value={stats.products} sub="Across all categories" />
        <StatTile icon={Users} label="Registered users" value={stats.users} sub="Admins, insurance officers & customers" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            icon={ShieldCheck}
            title="Recent policies"
            subtitle="Latest issued or purchased"
            action={
              <Link to="/admin/policies" className="flex items-center gap-1 text-xs font-semibold text-ink-600 hover:text-amber-600">
                View all <ArrowUpRight size={14} />
              </Link>
            }
          />
          {recentPolicies.length === 0 ? (
            <EmptyState title="No policies yet" description="Issued policies will show up here." />
          ) : (
            <div className="space-y-3">
              {recentPolicies.map((p) => (
                <div key={p.policyId} className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{p.policyNumber}</p>
                    <p className="text-xs text-ink-400">{p.customerName} · {p.planName}</p>
                  </div>
                  <StatusBadge status={p.policyStatus} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            icon={FileText}
            title="Recent claims"
            subtitle="Latest submitted claims"
            action={
              <Link to="/admin/claims" className="flex items-center gap-1 text-xs font-semibold text-ink-600 hover:text-amber-600">
                View all <ArrowUpRight size={14} />
              </Link>
            }
          />
          {recentClaims.length === 0 ? (
            <EmptyState title="No claims yet" description="Submitted claims will show up here." />
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

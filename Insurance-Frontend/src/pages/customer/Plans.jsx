import { useEffect, useState } from "react";
import { PackageSearch, ShieldCheck, CalendarClock, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/ui/Pagination";
import { Field, Input, Select } from "../../components/ui/FormControls";
import { Pill } from "../../components/ui/StatusBadge";

import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";
import { useCustomerProfile } from "../../hooks/useCustomerProfile";
import { getPlansApi } from "../../api/productApi";
import { purchasePolicyApi } from "../../api/policyApi";
import { getErrorMessage, formatCurrency } from "../../utils/format";
import {
  PREMIUM_FREQUENCIES,
  premiumFrequencyLabel,
  premiumFrequencySuffix,
  calculateInstallmentAmount,
} from "../../utils/premium";

const PRODUCT_TONE = { HEALTH: "emerald", MOTOR: "sky", LIFE: "indigo", TRAVEL: "amber" };

export default function CustomerPlans() {
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");
  const { profileLoading, hasProfile } = useCustomerProfile();

  useEffect(() => {
    if (!profileLoading && hasProfile === false) {
      toast.warn("Customer profile not yet created. Please complete your profile first.", {
        toastId: "no-profile-plans",
      });
    }
  }, [profileLoading, hasProfile]);

  const params = {
    page,
    size: 9,
    sortBy: "planId",
    direction: "asc",
    active: true,
  };

  const { content, totalElements, totalPages, pageSize, loading } = usePaginatedFetch(getPlansApi, params, [page]);

  const filtered = typeFilter ? content.filter((p) => p.productType === typeFilter) : content;

  const [purchaseOpen, setPurchaseOpen] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [premiumFrequency, setPremiumFrequency] = useState("ANNUAL");
  const [saving, setSaving] = useState(false);

  const openPurchase = (plan) => {
    if (!hasProfile) {
      toast.warn("Please complete your profile before purchasing a policy.");
      return;
    }
    setPurchaseOpen(plan);
    setStartDate(new Date().toISOString().split("T")[0]);
    setPremiumFrequency("ANNUAL");
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await purchasePolicyApi({ planId: purchaseOpen.planId, startDate, premiumFrequency });
      toast.success("Policy purchased! It's pending your first premium payment.");
      setPurchaseOpen(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to purchase policy. Make sure your profile is complete."));
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) return <Loader fullScreen label="Loading plans…" />;

  return (
    <div>
      <PageHeader
        eyebrow="Explore"
        title="Browse plans"
        description="Compare coverage, premium and tenure across our active insurance plans."
        action={
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-44">
            <option value="">All types</option>
            <option value="HEALTH">Health</option>
            <option value="MOTOR">Motor</option>
            <option value="LIFE">Life</option>
            <option value="TRAVEL">Travel</option>
          </Select>
        }
      />

      {!hasProfile && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-900">
            Your customer profile has not been created yet. Please{" "}
            <Link to="/customer/profile" className="underline">
              complete your profile
            </Link>{" "}
            to purchase a policy.
          </p>
          <Link to="/customer/profile">
            <Button size="sm" variant="accent">Complete profile</Button>
          </Link>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState icon={PackageSearch} title="No plans available" description="Check back soon — new plans are added regularly." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((plan) => (
            <Card key={plan.planId} className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <Pill tone={PRODUCT_TONE[plan.productType] || "indigo"}>{plan.productType}</Pill>
              </div>

              <h3 className="font-display text-lg font-bold text-ink-900">{plan.planName}</h3>
              <p className="text-xs text-ink-400">{plan.productName}</p>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-ink-400"><ShieldCheck size={14} /> Coverage</span>
                  <span className="font-semibold text-ink-900">{formatCurrency(plan.coverageAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-ink-400"><CalendarClock size={14} /> Duration</span>
                  <span className="font-semibold text-ink-900">{plan.duration} {plan.duration === 1 ? "year" : "years"}</span>
                </div>
              </div>

              <p className="mt-4 line-clamp-3 flex-1 text-xs leading-relaxed text-ink-400">{plan.termsAndConditions}</p>

              <div className="mt-5 flex items-baseline justify-between border-t border-ink-100 pt-4">
                <div>
                  <p className="font-display text-xl font-bold text-ink-900">{formatCurrency(plan.premiumAmount)}</p>
                  <p className="flex items-center gap-1 text-xs text-ink-400">
                    /year · <Sparkles size={11} /> from {formatCurrency(calculateInstallmentAmount(plan.premiumAmount, "MONTHLY", plan.duration))}/mo
                  </p>
                </div>
                <Button size="sm" variant="accent" onClick={() => openPurchase(plan)} disabled={!hasProfile}>
                  Purchase
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} />
        </div>
      )}

      <Modal open={!!purchaseOpen} onClose={() => setPurchaseOpen(null)} title={`Purchase ${purchaseOpen?.planName || ""}`} subtitle="Choose when your coverage should begin and how you'd like to pay.">
        <form onSubmit={handlePurchase} className="space-y-4">
          <div className="rounded-xl bg-ink-50/80 p-4 text-sm">
            <div className="flex justify-between border-b border-ink-100 pb-2"><span className="text-ink-400">Coverage</span><span className="font-semibold text-ink-900">{formatCurrency(purchaseOpen?.coverageAmount)}</span></div>
            <div className="flex justify-between border-b border-ink-100 py-2"><span className="text-ink-400">Annual premium</span><span className="font-semibold text-ink-900">{formatCurrency(purchaseOpen?.premiumAmount)} /year</span></div>
            <div className="flex justify-between pt-2">
              <span className="text-ink-400">You'll pay</span>
              <span className="font-semibold text-ink-900">
                {formatCurrency(
                  calculateInstallmentAmount(purchaseOpen?.premiumAmount, premiumFrequency, purchaseOpen?.duration),
                )}{" "}
                <span className="font-normal text-ink-500">{premiumFrequencySuffix(premiumFrequency)}</span>
              </span>
            </div>
          </div>

          <Field label="Pay premium" required hint="You can change how often you pay later — this only sets your first installment.">
            <Select value={premiumFrequency} onChange={(e) => setPremiumFrequency(e.target.value)}>
              {PREMIUM_FREQUENCIES.map((f) => (
                <option key={f} value={f}>{premiumFrequencyLabel(f)}</option>
              ))}
            </Select>
          </Field>

          <Field label="Start date" required>
            <Input type="date" min={new Date().toISOString().split("T")[0]} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setPurchaseOpen(null)}>Cancel</Button>
            <Button type="submit" variant="accent" loading={saving}>Confirm purchase</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
